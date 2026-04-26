const AI_PROVIDER = (process.env.AI_PROVIDER || 'auto').toLowerCase();
const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY || process.env.GEMINI_API_KEY || '';
const GOOGLE_MODEL = process.env.GOOGLE_MODEL || process.env.GEMINI_MODEL || 'gemma-3-12b-it';
const { generateAndUploadLessonImageSet, generateAndUploadLessonAudio } = require('./media');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = GOOGLE_API_KEY ? new GoogleGenerativeAI(GOOGLE_API_KEY) : null;
const DEBUG_AI = process.env.DEBUG_AI === 'true';

function compactError(err) {
  return {
    name: err?.name || null,
    message: err?.message || null,
    code: err?.code || err?.cause?.code || null,
    cause: err?.cause?.message || null,
  };
}

function logAiDebug(event, payload = {}) {
  if (!DEBUG_AI) return;
  console.log(`[AI DEBUG] ${event}`, payload);
}

function resolveAiRuntime() {
  if (AI_PROVIDER !== 'auto' && AI_PROVIDER !== 'google') {
    return {
      provider: 'google',
      model: GOOGLE_MODEL,
      apiKeyConfigured: Boolean(GOOGLE_API_KEY),
      ready: false,
      error: `Unsupported AI_PROVIDER "${AI_PROVIDER}". Use "google" or "auto".`,
    };
  }

  return {
    provider: 'google',
    model: GOOGLE_MODEL,
    apiKeyConfigured: Boolean(GOOGLE_API_KEY),
    ready: Boolean(genAI),
    mode: AI_PROVIDER,
  };
}

function assertGoogleConfigured() {
  const runtime = resolveAiRuntime();
  if (runtime.error) {
    throw new Error(runtime.error);
  }
  if (!genAI) {
    throw new Error('GOOGLE_API_KEY (or GEMINI_API_KEY) is missing. Ollama fallback is disabled.');
  }
}

function asText(value, fallback = '') {
  if (typeof value === 'string') return value.trim();
  if (value == null) return fallback;
  return String(value).trim();
}

function asNumber(value, fallback = 0) {
  const num = Number(value);
  return Number.isFinite(num) ? num : fallback;
}

function inferModalityPlan(student) {
  const styles = (student.learningStyles || []).map(s => String(s).toLowerCase());
  const modalityPlan = {
    primary: 'chat',
    supports: [],
  };

  if (styles.some(s => s.includes('visual'))) {
    modalityPlan.primary = 'visual';
    modalityPlan.supports.push('image');
  }
  if (styles.some(s => s.includes('auditory'))) {
    if (modalityPlan.primary === 'chat') modalityPlan.primary = 'auditory';
    modalityPlan.supports.push('audio');
  }
  if (styles.some(s => s.includes('read'))) {
    modalityPlan.supports.push('text');
  }
  if (styles.some(s => s.includes('kinesthetic') || s.includes('kinethistic') || s.includes('tactile'))) {
    modalityPlan.supports.push('interactive');
  }

  modalityPlan.supports = [...new Set(modalityPlan.supports)];
  return modalityPlan;
}

function normalizeQuestion(question, index) {
  const safeOptions = Array.isArray(question?.options)
    ? question.options.map(opt => asText(opt)).filter(Boolean)
    : [];

  const options = safeOptions.length >= 2 ? safeOptions.slice(0, 4) : ['A', 'B', 'C'];
  const correctIndex = Math.max(0, Math.min(options.length - 1, asNumber(question?.correctIndex, 0)));

  return {
    id: asText(question?.id, `q${index + 1}`),
    text: asText(question?.text, `Try this question #${index + 1}.`),
    options,
    correctIndex,
    hint: asText(question?.hint, 'Take a deep breath and try one small step at a time.'),
    reframeExplanation: asText(
      question?.reframeExplanation,
      'Let us break the problem into smaller pieces and solve one piece first.'
    ),
  };
}

function fallbackAdaptation(student, subject, reason) {
  const character = asText(student?.characters?.[0], 'your favorite character');
  const name = asText(student?.name, 'Student');
  const modalityPlan = inferModalityPlan(student || {});

  return {
    schemaVersion: '2',
    status: 'fallback',
    error: asText(reason, 'Gemma returned an invalid response.'),
    adaptedText: `${name}, let us practice ${subject} with ${character}. We will go one step at a time.`,
    formula: null,
    hint: `Use one small step with ${character}, then check your answer.`,
    cloudinaryPrompt: `${character} helping with a ${subject} worksheet in a calm classroom`,
    elevenLabsScript: `${name}, we can do this together. Let us solve this one step at a time.`,
    modalityPlan,
    confidence: 0.3,
    interactivePlan: [
      { step: 'tap_to_start', instruction: 'Tap start to begin the first mini-step.' },
      { step: 'solve_one_piece', instruction: 'Answer one small piece at a time.' },
      { step: 'celebrate', instruction: 'Celebrate progress and continue.' },
    ],
    interactiveHtml: `<!DOCTYPE html><html><head><style>body{font-family:sans-serif;text-align:center;padding:20px;background:#f0fdf4}h2{color:#166534}.btn{padding:12px 24px;margin:8px;border:none;border-radius:8px;font-size:16px;cursor:pointer;background:#1D9E75;color:white}.btn:hover{opacity:0.9}#result{margin-top:16px;font-size:18px;font-weight:bold}</style></head><body><h2>${character} wants to practice ${subject}!</h2><p>Click the correct answer:</p><div id="options"></div><div id="result"></div><script>var q={text:"What is 1 + 1?",options:["1","2","3"],correct:1};document.querySelector("h2").textContent="${character} wants to practice ${subject}!";var el=document.getElementById("options");q.options.forEach(function(opt,i){var b=document.createElement("button");b.className="btn";b.textContent=opt;b.onclick=function(){document.getElementById("result").textContent=i===q.correct?"Correct! Great job!":"Try again!";document.getElementById("result").style.color=i===q.correct?"#166534":"#dc2626"};el.appendChild(b)})</script></body></html>`,
    chatContext: `This lesson covers ${subject}. We are practicing basic concepts one step at a time with ${character}.`,
    questions: [
      normalizeQuestion(
        {
          id: 'q1',
          text: `Warm-up ${subject} question with ${character}.`,
          options: ['Option A', 'Option B', 'Option C'],
          correctIndex: 0,
        },
        0
      ),
    ],
  };
}

function parseGemmaJson(responseText) {
  const text = asText(responseText);
  if (!text) throw new Error('Gemma response text is empty.');

  try {
    return JSON.parse(text);
  } catch {
    // Try markdown code block first
    const fenceMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
    if (fenceMatch?.[1]) {
      return JSON.parse(fenceMatch[1].trim());
    }

    // Try first JSON object span
    const objectMatch = text.match(/\{[\s\S]*\}/);
    if (objectMatch?.[0]) {
      return JSON.parse(objectMatch[0]);
    }
  }

  throw new Error('Failed to parse JSON from Gemma response.');
}

/**
 * Call key-based Google AI API (Gemma/Gemini model).
 */
async function callGemma(prompt) {
  assertGoogleConfigured();
  const startedAt = Date.now();
  const model = genAI.getGenerativeModel({ model: GOOGLE_MODEL });

  try {
    logAiDebug('generate_start', {
      model: GOOGLE_MODEL,
      promptChars: String(prompt || '').length,
    });

    const result = await model.generateContent(prompt);
    const responseText = result?.response?.text?.() || '';
    const parsed = parseGemmaJson(responseText);

    logAiDebug('generate_success', {
      model: GOOGLE_MODEL,
      elapsedMs: Date.now() - startedAt,
      responseChars: responseText.length,
    });
    return parsed;
  } catch (err) {
    logAiDebug('generate_failure', {
      model: GOOGLE_MODEL,
      elapsedMs: Date.now() - startedAt,
      error: compactError(err),
    });
    throw err;
  }
}

function normalizeAdaptation(raw, student, subject) {
  if (!raw || typeof raw !== 'object') {
    return fallbackAdaptation(student, subject, 'Gemma output was not a JSON object.');
  }

  const questions = Array.isArray(raw.questions) ? raw.questions : [];
  const normalizedQuestions = questions.slice(0, 8).map(normalizeQuestion).filter(Boolean);

  return {
    schemaVersion: '2',
    status: 'ok',
    adaptedText: asText(
      raw.adaptedText,
      `${asText(student?.name, 'Student')}, here is your personalized ${subject} practice lesson.`
    ),
    formula: raw.formula == null ? null : asText(raw.formula),
    hint: asText(raw.hint, 'You can do this. Let us solve one small step first.'),
    cloudinaryPrompt: asText(
      raw.cloudinaryPrompt,
      `${asText(student?.characters?.[0], 'favorite character')} helping with ${subject}`
    ),
    elevenLabsScript: asText(
      raw.elevenLabsScript,
      `${asText(student?.name, 'Student')}, let us solve this together one step at a time.`
    ),
    modalityPlan: {
      ...inferModalityPlan(student || {}),
      ...(raw.modalityPlan && typeof raw.modalityPlan === 'object' ? raw.modalityPlan : {}),
    },
    confidence: Math.max(0, Math.min(1, asNumber(raw.confidence, 0.75))),
    interactivePlan: Array.isArray(raw.interactivePlan)
      ? raw.interactivePlan.slice(0, 6).map((step, idx) => ({
          step: asText(step?.step, `step_${idx + 1}`),
          instruction: asText(step?.instruction, 'Complete this mini-step before moving on.'),
        }))
      : [],
    interactiveHtml: asText(raw.interactiveHtml, ''),
    chatContext: asText(
      raw.chatContext,
      `This lesson covers ${subject}. The key concept is explained step by step using examples the student loves.`
    ),
    questions:
      normalizedQuestions.length > 0
        ? normalizedQuestions
        : [normalizeQuestion({ id: 'q1', text: `Practice ${subject} question`, options: ['A', 'B', 'C'] }, 0)],
  };
}

async function attachMedia(adaptation, student, subject) {
  const withMedia = { ...adaptation };

  try {
    const imageSet = await generateAndUploadLessonImageSet({
      prompt: adaptation.cloudinaryPrompt,
      studentId: student?.id,
      studentName: student?.name,
      subject,
    });
    if (imageSet?.urls) {
      withMedia.imageUrl = imageSet.urls.neutral;
      withMedia.imageUrls = imageSet.urls;
      logAiDebug('cloudinary_image_success', {
        studentId: student?.id || null,
        subject,
      });
    } else if (imageSet?.reason) {
      withMedia.imageStatus = imageSet.reason;
      logAiDebug('cloudinary_image_skipped', {
        studentId: student?.id || null,
        reason: imageSet.reason,
      });
    }
  } catch (err) {
    withMedia.imageStatus = `image_generation_failed: ${err.message}`;
    logAiDebug('cloudinary_image_failure', {
      studentId: student?.id || null,
      error: compactError(err),
    });
  }

  try {
    const audio = await generateAndUploadLessonAudio({
      script: adaptation.elevenLabsScript,
      studentId: student?.id,
      subject,
    });
    if (audio?.url) {
      withMedia.audioUrl = audio.url;
      logAiDebug('audio_success', {
        studentId: student?.id || null,
        subject,
      });
    } else if (audio?.audioDataUrl) {
      withMedia.audioUrl = audio.audioDataUrl;
      withMedia.audioStatus = 'inline_data_url';
      logAiDebug('audio_inline_data_url', {
        studentId: student?.id || null,
      });
    } else if (audio?.reason) {
      withMedia.audioStatus = audio.reason;
      logAiDebug('audio_skipped', {
        studentId: student?.id || null,
        reason: audio.reason,
      });
    }
  } catch (err) {
    withMedia.audioStatus = `audio_generation_failed: ${err.message}`;
    logAiDebug('audio_failure', {
      studentId: student?.id || null,
      error: compactError(err),
    });
  }

  return withMedia;
}

/**
 * Generate adapted lesson content for each student from worksheet text.
 */
async function adaptLesson(rawText, subject, students) {
  const results = {};

  for (const student of students) {
    const prompt = `You are an AI tutor adapting a worksheet for a special education student with autism.

Student profile:
- Name: ${student.name}
- Grade: ${student.grade}
- Learning styles: ${(student.learningStyles || []).join(', ')}
- Favorite characters: ${(student.characters || []).join(', ')}
- Sensory preferences: ${(student.sensoryPrefs || []).join(', ')}
- Frustration triggers: ${(student.frustrationTriggers || []).join(', ')}

Original worksheet content:
${rawText}

Subject: ${subject}

Generate a personalized lesson from this worksheet. Return valid JSON with this exact structure:
{
  "schemaVersion": "2",
  "adaptedText": "The lesson content rewritten using the student's favorite characters and appropriate reading level",
  "formula": "The key formula or concept displayed prominently (if applicable, otherwise null)",
  "hint": "A helpful hint using the student's character theme",
  "cloudinaryPrompt": "A description for generating a themed illustration featuring the student's favorite character doing the lesson activity",
  "elevenLabsScript": "The text that should be read aloud for auditory learners — warm, conversational narration using character references",
  "modalityPlan": {
    "primary": "visual|auditory|chat",
    "supports": ["image", "audio", "text", "interactive"]
  },
  "interactivePlan": [
    { "step": "tap_to_start", "instruction": "short instruction for a low-stimulation interactive step" }
  ],
  "interactiveHtml": "A self-contained HTML snippet (with inline CSS and JS) that creates a simple interactive lesson. Use the student's favorite character. The HTML should let the student click, drag, or tap to solve problems. Keep it accessible and low-stimulation. Must be a single string of valid HTML that can be rendered in an iframe. Include inline styles, no external dependencies. Example: clickable buttons that count items, drag-and-drop matching, or interactive number lines.",
  "chatContext": "A short paragraph of context about the lesson that a chat tutor can reference when the student asks questions in Read mode. Include key vocabulary terms, the main concept being taught, and how to explain it simply.",
  "confidence": 0.84,
  "questions": [
    {
      "id": "q1",
      "text": "Question text using character theme",
      "options": ["option A", "option B", "option C"],
      "correctIndex": 0,
      "hint": "A simpler hint if they get it wrong",
      "reframeExplanation": "A step-by-step breakdown if the student is really struggling"
    }
  ]
}

Rules:
- Use the student's favorite characters as examples in problems
- Break concepts into small, clear steps
- Use simple language appropriate for their grade level
- Avoid their frustration triggers (e.g., if "too many words" is a trigger, keep text minimal)
- Respect their sensory preferences (e.g., if "Avoids loud sounds" minimize audio cues, if "Minimal text" keep text very short)
- Generate 3-5 questions based on the worksheet content
- Make it encouraging and warm in tone
- Theme EVERYTHING to the student's favorite character(s) — the character should appear in the story, questions, hints, interactive elements, and narration
- Respect modality intent based on learning style:
  - visual: generate a detailed cloudinaryPrompt describing a colorful, static image of the character doing the lesson activity. Keep text minimal. Focus on imagery.
  - auditory: generate a warm, friendly elevenLabsScript as if the character is talking directly to the student. Conversational tone. Include all lesson content in the narration.
  - reading: generate rich adaptedText with the full lesson. Include a chatContext paragraph with vocabulary and key concepts. Use clear paragraph structure.
  - kinesthetic: generate interactiveHtml — a self-contained HTML/CSS/JS snippet where the student can click buttons, drag items, or interact to solve the problem. Theme it to the character. Keep it simple and accessible. Also generate interactivePlan steps.
- The interactiveHtml MUST be a complete, self-contained HTML document fragment with inline styles. It should work when inserted into an iframe with no external dependencies.
- Return only valid JSON, with no markdown code block`;

    try {
      const adapted = await callGemma(prompt);
      results[student.id] = await attachMedia(normalizeAdaptation(adapted, student, subject), student, subject);
    } catch (err) {
      try {
        const repairPrompt = `${prompt}

Your previous output could not be parsed/validated.
Return ONLY strict JSON and ensure all required fields exist with correct types.`;
        const repaired = await callGemma(repairPrompt);
        results[student.id] = await attachMedia(normalizeAdaptation(repaired, student, subject), student, subject);
      } catch (retryErr) {
        console.error(`Failed to adapt for student ${student.id}:`, retryErr.message);
        results[student.id] = await attachMedia(fallbackAdaptation(student, subject, retryErr.message), student, subject);
      }
    }
  }

  return results;
}

async function tutorChat({ message, question, studentProfile }) {
  const prompt = `You are a patient lesson assistant for a student.

Student profile:
- Name: ${studentProfile?.name || 'Student'}
- Grade: ${studentProfile?.grade || 'Unknown'}
- Learning styles: ${(studentProfile?.learningStyles || []).join(', ')}
- Favorite characters: ${(studentProfile?.characters || []).join(', ')}
- Frustration triggers: ${(studentProfile?.frustrationTriggers || []).join(', ')}

Current lesson question:
- Text: ${question?.text || ''}
- Options: ${(question?.options || []).join(', ')}

Student message:
${message}

Return valid JSON:
{
  "reply": "short encouraging answer with one actionable next step",
  "highlightTerms": ["term one", "term two"]
}

Rules:
- Keep response short and calm
- Use one favorite character reference when appropriate
- Avoid overwhelm and avoid long paragraphs
- Return JSON only`;

  const raw = await callGemma(prompt);
  return {
    reply: asText(raw?.reply, 'Let us try one small step together.'),
    highlightTerms: Array.isArray(raw?.highlightTerms)
      ? raw.highlightTerms.map(term => asText(term)).filter(Boolean).slice(0, 6)
      : [],
  };
}

/**
 * Generate a reframed/simplified version of a question for a struggling student.
 */
async function generateReframe(question, studentProfile, wrongAttempts) {
  const prompt = `You are an AI tutor helping a special education student with autism who is struggling with a question.

Student profile:
- Name: ${studentProfile.name}
- Grade: ${studentProfile.grade}
- Favorite characters: ${(studentProfile.characters || []).join(', ')}
- Learning styles: ${(studentProfile.learningStyles || []).join(', ')}
- Frustration triggers: ${(studentProfile.frustrationTriggers || []).join(', ')}

The student has gotten this question wrong ${wrongAttempts} time(s):
Question: ${question.text}
Options: ${(question.options || []).join(', ')}
Correct answer index: ${question.correctIndex}

Create a simpler, step-by-step breakdown to help them understand. Return valid JSON:
{
  "steps": [
    { "label": "Step 1 — short label", "content": "Detailed step explanation using their favorite characters" }
  ],
  "simplifiedQuestion": {
    "text": "A much simpler version of the same question",
    "options": ["option A", "option B", "option C"],
    "correctIndex": 0
  },
  "encouragement": "A warm, personalized encouragement message using their favorite character"
}

Rules:
- Use ${(studentProfile.characters || ['their favorite character'])[0]} in the explanation
- Break it down into 2-3 simple steps maximum
- Use visual/concrete examples (like pizza slices, toys, etc.)
- Keep language simple and encouraging
- Avoid frustration triggers: ${(studentProfile.frustrationTriggers || []).join(', ')}`;

  return callGemma(prompt);
}

module.exports = { adaptLesson, generateReframe, tutorChat, resolveAiRuntime };
