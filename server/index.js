require('dotenv').config();

const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { parseFile } = require('./parseFile');
const { adaptLesson, generateReframe, tutorChat, resolveAiRuntime } = require('./gemma');

const app = express();
const PORT = process.env.PORT || 3001;
const DEBUG_AI = process.env.DEBUG_AI === 'true';

function makeRequestId() {
  return `req_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

function compactError(err) {
  return {
    name: err?.name || null,
    message: err?.message || null,
    code: err?.code || err?.cause?.code || null,
    cause: err?.cause?.message || null,
  };
}

// Middleware
app.use(cors({ origin: 'http://localhost:3000' }));
app.use(express.json());

// Multer config for file uploads
const upload = multer({
  dest: path.join(__dirname, 'uploads'),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
  fileFilter: (_req, file, cb) => {
    const allowed = [
      'application/pdf',
      'image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'image/webp',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`Unsupported file type: ${file.mimetype}`));
    }
  },
});

// ─── POST /api/adapt-lesson ────────────────────────────────────────────
app.post('/api/adapt-lesson', upload.single('file'), async (req, res) => {
  let extractedText = '';
  const uploadedFile = req.file;
  const requestId = makeRequestId();

  try {
    // 1. Parse uploaded file if present
    if (uploadedFile) {
      const parsed = await parseFile(uploadedFile.path, uploadedFile.mimetype);
      extractedText = parsed.text || '';
    }

    // 2. Combine with raw text content from the form
    const rawContent = req.body.rawContent || '';
    const combinedText = [extractedText, rawContent].filter(Boolean).join('\n\n');

    if (!combinedText.trim()) {
      return res.status(400).json({ error: 'No content provided — upload a file or paste lesson text.' });
    }

    const subject = req.body.subject || 'General';
    let students = [];
    try {
      students = JSON.parse(req.body.students || '[]');
    } catch {
      return res.status(400).json({ error: 'Invalid students JSON.' });
    }

    if (students.length === 0) {
      return res.status(400).json({ error: 'At least one student profile is required.' });
    }

    // 3. Call Gemma to adapt the lesson
    const adapted = await adaptLesson(combinedText, subject, students);
    const studentCount = Object.keys(adapted || {}).length;

    return res.json({
      schemaVersion: '2',
      requestId,
      subject,
      studentCount,
      results: adapted,
    });
  } catch (err) {
    const runtime = resolveAiRuntime();
    const errorPayload = {
      requestId,
      error: 'Failed to adapt lesson. Check GOOGLE_API_KEY and GOOGLE_MODEL configuration.',
      provider: runtime.provider,
      model: runtime.model,
    };

    if (DEBUG_AI) {
      errorPayload.debug = compactError(err);
    }

    console.error(`[${requestId}] adapt-lesson error:`, {
      ...compactError(err),
      provider: runtime.provider,
      model: runtime.model,
    });

    return res.status(500).json(errorPayload);
  } finally {
    // 4. Clean up uploaded file
    if (uploadedFile && fs.existsSync(uploadedFile.path)) {
      fs.unlinkSync(uploadedFile.path);
    }
  }
});

// ─── POST /api/reframe ─────────────────────────────────────────────────
app.post('/api/reframe', async (req, res) => {
  try {
    const { question, studentProfile, wrongAttempts } = req.body;

    if (!question || !studentProfile) {
      return res.status(400).json({ error: 'question and studentProfile are required.' });
    }

    const reframed = await generateReframe(question, studentProfile, wrongAttempts || 1);
    return res.json(reframed);
  } catch (err) {
    console.error('reframe error:', err);
    return res.status(500).json({ error: 'Failed to generate reframe. Check Google AI configuration.' });
  }
});

// ─── POST /api/tutor-chat ───────────────────────────────────────────────
app.post('/api/tutor-chat', async (req, res) => {
  try {
    const { message, question, studentProfile } = req.body;
    if (!message || !question || !studentProfile) {
      return res.status(400).json({ error: 'message, question, and studentProfile are required.' });
    }

    const response = await tutorChat({ message, question, studentProfile });
    return res.json(response);
  } catch (err) {
    console.error('tutor-chat error:', err);
    return res.status(500).json({ error: 'Failed to generate tutor response.' });
  }
});

// ─── Health check ───────────────────────────────────────────────────────
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.get('/api/health/ai', (_req, res) => {
  const runtime = resolveAiRuntime();
  res.json({
    status: runtime.ready ? 'ok' : 'not_ready',
    provider: runtime.provider,
    model: runtime.model,
    mode: runtime.mode || 'explicit',
    baseUrl: runtime.baseUrl || null,
    apiKeyConfigured: Boolean(runtime.apiKeyConfigured),
  });
});

// Temporary diagnostics endpoint for outbound API connectivity.
app.get('/api/debug/network', async (_req, res) => {
  const startedAt = Date.now();
  const check = async (url) => {
    try {
      const result = await fetch(url, { method: 'HEAD' });
      return { ok: true, status: result.status };
    } catch (err) {
      return { ok: false, ...compactError(err) };
    }
  };

  const [google, cloudinary, elevenLabs] = await Promise.all([
    check('https://generativelanguage.googleapis.com'),
    check('https://api.cloudinary.com'),
    check('https://api.elevenlabs.io'),
  ]);

  res.json({
    elapsedMs: Date.now() - startedAt,
    google,
    cloudinary,
    elevenLabs,
  });
});

app.listen(PORT, () => {
  if (DEBUG_AI) {
    const runtime = resolveAiRuntime();
    console.log('[AI DEBUG] startup', {
      provider: runtime.provider,
      model: runtime.model,
      ready: runtime.ready,
      apiKeyConfigured: runtime.apiKeyConfigured,
      hasCloudinary:
        Boolean(process.env.CLOUDINARY_CLOUD_NAME) &&
        Boolean(process.env.CLOUDINARY_API_KEY) &&
        Boolean(process.env.CLOUDINARY_API_SECRET),
      hasElevenLabs: Boolean(process.env.ELEVENLABS_API_KEY),
    });
  }
  console.log(`Spectra API server running on http://localhost:${PORT}`);
});
