const cloudinary = require('cloudinary').v2;

const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY || '';
const ELEVENLABS_VOICE_ID = process.env.ELEVENLABS_VOICE_ID || '21m00Tcm4TlvDq8ikWAM';

const CLOUDINARY_CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME || '';
const CLOUDINARY_API_KEY = process.env.CLOUDINARY_API_KEY || '';
const CLOUDINARY_API_SECRET = process.env.CLOUDINARY_API_SECRET || '';

const isCloudinaryConfigured =
  Boolean(CLOUDINARY_CLOUD_NAME) && Boolean(CLOUDINARY_API_KEY) && Boolean(CLOUDINARY_API_SECRET);

if (isCloudinaryConfigured) {
  cloudinary.config({
    cloud_name: CLOUDINARY_CLOUD_NAME,
    api_key: CLOUDINARY_API_KEY,
    api_secret: CLOUDINARY_API_SECRET,
    secure: true,
  });
}

function slugify(value, fallback = 'item') {
  const slug = String(value || fallback)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
  return slug || fallback;
}

function escapeXml(value) {
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function wrapText(text, lineLength = 40) {
  const words = String(text || '').split(/\s+/).filter(Boolean);
  const lines = [];
  let current = [];
  let currentLength = 0;

  for (const word of words) {
    if (currentLength + word.length + 1 > lineLength && current.length) {
      lines.push(current.join(' '));
      current = [word];
      currentLength = word.length;
    } else {
      current.push(word);
      currentLength += word.length + 1;
    }
  }
  if (current.length) lines.push(current.join(' '));
  return lines.slice(0, 5);
}

function buildPromptSvg(prompt, studentName, subject, mood = 'neutral') {
  const lines = wrapText(prompt, 42);
  const title = `${studentName || 'Student'} • ${subject || 'Lesson'}`;
  const subtitle = lines.length > 0 ? lines : ['Personalized visual support'];
  const moodLabel =
    mood === 'happy' ? 'Great job! Keep going.' :
    mood === 'supportive' ? 'You can do this. One step at a time.' :
    'Focus mode';
  const moodColor =
    mood === 'happy' ? '#14532d' :
    mood === 'supportive' ? '#7c2d12' :
    '#1e3a8a';

  const textLines = subtitle
    .map((line, idx) => `<text x="40" y="${150 + idx * 42}" fill="#1f2937" font-size="28">${escapeXml(line)}</text>`)
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="1280" height="720" viewBox="0 0 1280 720" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#e0f2fe" />
      <stop offset="100%" stop-color="#f5f3ff" />
    </linearGradient>
  </defs>
  <rect width="1280" height="720" fill="url(#bg)" />
  <rect x="30" y="30" width="1220" height="660" rx="32" fill="#ffffff" stroke="#cbd5e1" />
  <text x="40" y="95" fill="#0f172a" font-size="40" font-weight="600">${escapeXml(title)}</text>
  <text x="980" y="95" fill="${moodColor}" font-size="24" font-weight="600">${escapeXml(moodLabel)}</text>
  ${textLines}
</svg>`;
}

function uploadBufferToCloudinary(buffer, options = {}) {
  if (!isCloudinaryConfigured) {
    return Promise.resolve({ skipped: true, reason: 'cloudinary_not_configured' });
  }

  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(options, (error, result) => {
      if (error) return reject(error);
      resolve(result);
    });
    stream.end(buffer);
  });
}

async function generateAndUploadLessonImageSet({ prompt, studentId, studentName, subject }) {
  if (!prompt) return { skipped: true, reason: 'missing_prompt' };
  const moods = ['neutral', 'happy', 'supportive'];
  const urls = {};

  for (const mood of moods) {
    const svg = buildPromptSvg(prompt, studentName, subject, mood);
    const buffer = Buffer.from(svg, 'utf8');
    const publicId = `spectra/lessons/${slugify(subject, 'general')}/${slugify(studentId, 'student')}/visual-${mood}`;

    try {
      const uploaded = await uploadBufferToCloudinary(buffer, {
        public_id: publicId,
        resource_type: 'image',
        overwrite: true,
        format: 'png',
      });

      if (uploaded.skipped) {
        urls[mood] = `data:image/svg+xml;base64,${buffer.toString('base64')}`;
      } else {
        urls[mood] = uploaded.secure_url;
      }
    } catch {
      urls[mood] = `data:image/svg+xml;base64,${buffer.toString('base64')}`;
    }
  }

  return { urls };
}

async function synthesizeElevenLabsAudio(text) {
  if (!ELEVENLABS_API_KEY) {
    return { skipped: true, reason: 'elevenlabs_not_configured' };
  }
  if (!text) {
    return { skipped: true, reason: 'missing_text' };
  }

  const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${ELEVENLABS_VOICE_ID}`, {
    method: 'POST',
    headers: {
      'xi-api-key': ELEVENLABS_API_KEY,
      'Content-Type': 'application/json',
      Accept: 'audio/mpeg',
    },
    body: JSON.stringify({
      text,
      model_id: 'eleven_multilingual_v2',
      output_format: 'mp3_44100_128',
      voice_settings: {
        stability: 0.45,
        similarity_boost: 0.8,
      },
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`ElevenLabs error (${res.status}): ${body}`);
  }

  const audioBuffer = Buffer.from(await res.arrayBuffer());
  return { buffer: audioBuffer, contentType: 'audio/mpeg' };
}

async function generateAndUploadLessonAudio({ script, studentId, subject }) {
  const tts = await synthesizeElevenLabsAudio(script);
  if (tts.skipped) return tts;

  const audioDataUrl = `data:${tts.contentType};base64,${tts.buffer.toString('base64')}`;
  const publicId = `spectra/lessons/${slugify(subject, 'general')}/${slugify(studentId, 'student')}/audio`;

  try {
    const uploaded = await uploadBufferToCloudinary(tts.buffer, {
      public_id: publicId,
      resource_type: 'video',
      overwrite: true,
      format: 'mp3',
    });

    if (uploaded.skipped) {
      return { audioDataUrl };
    }
    return { url: uploaded.secure_url, publicId: uploaded.public_id };
  } catch {
    return { audioDataUrl };
  }
}

/**
 * Search Cloudinary for character images by tag.
 * Users should upload images tagged with character names (e.g., 'spongebob', 'bluey').
 */
async function searchCloudinaryByTag(tag) {
  if (!isCloudinaryConfigured) return [];
  try {
    const result = await cloudinary.api.resources_by_tag(tag.toLowerCase(), {
      max_results: 20,
      resource_type: 'image',
    });
    return (result.resources || []).map(r => ({
      url: r.secure_url,
      publicId: r.public_id,
      width: r.width,
      height: r.height,
      format: r.format,
    }));
  } catch (e) {
    console.error('Cloudinary tag search failed:', e.message);
    return [];
  }
}

/**
 * List all tags in the Cloudinary account (for browsing available characters).
 */
async function listCloudinaryTags() {
  if (!isCloudinaryConfigured) return [];
  try {
    const result = await cloudinary.api.tags({ max_results: 100 });
    return result.tags || [];
  } catch (e) {
    console.error('Cloudinary tags list failed:', e.message);
    return [];
  }
}

/**
 * Generate visual lesson HTML that overlays character images from Cloudinary.
 * Falls back to SVG text card if no character images are found.
 */
async function generateVisualLessonWithCloudinary({ prompt, studentId, studentName, subject, character }) {
  const tag = (character || '').toLowerCase().replace(/[^a-z0-9]/g, '');
  const images = tag ? await searchCloudinaryByTag(tag) : [];

  if (images.length === 0) {
    // Fallback to SVG text card upload
    return generateAndUploadLessonImageSet({ prompt, studentId, studentName, subject });
  }

  // Return the character images for Gemma to compose into HTML
  return {
    characterImages: images.map(i => i.url),
    characterTag: tag,
    urls: { neutral: images[0].url, happy: images[1]?.url || images[0].url, supportive: images[2]?.url || images[0].url },
  };
}

module.exports = {
  generateAndUploadLessonImageSet,
  generateAndUploadLessonAudio,
  synthesizeElevenLabsAudio,
  searchCloudinaryByTag,
  listCloudinaryTags,
  generateVisualLessonWithCloudinary,
};
