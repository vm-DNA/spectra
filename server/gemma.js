const AI_PROVIDER = (process.env.AI_PROVIDER || 'auto').toLowerCase();
const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY || process.env.GEMINI_API_KEY || '';
const GOOGLE_MODEL = process.env.GOOGLE_MODEL || process.env.GEMINI_MODEL || 'gemma-3-12b-it';
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY || '';
const { generateAndUploadLessonImageSet, generateAndUploadLessonAudio, generateVisualLessonWithCloudinary } = require('./media');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const Anthropic = ANTHROPIC_API_KEY ? require('@anthropic-ai/sdk') : null;

const genAI = GOOGLE_API_KEY ? new GoogleGenerativeAI(GOOGLE_API_KEY) : null;
const anthropicClient = (Anthropic && ANTHROPIC_API_KEY) ? new Anthropic({ apiKey: ANTHROPIC_API_KEY }) : null;
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
    hasClaude: Boolean(anthropicClient),
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
  const styles = (student?.learningStyles || []).map(s => String(s).toLowerCase());
  const needsImages = styles.some(s => s.includes('visual'));
  const needsAudio = styles.some(s => s.includes('auditory'));

  // Only generate images for Visual learners
  if (needsImages) {
    const character = (student?.characters || [])[0] || '';
    try {
      // Try to find character images on Cloudinary first
      const visualResult = await generateVisualLessonWithCloudinary({
        prompt: adaptation.cloudinaryPrompt,
        studentId: student?.id,
        studentName: student?.name,
        subject,
        character,
      });
      if (visualResult?.characterImages) {
        withMedia.characterImages = visualResult.characterImages;
        withMedia.imageUrl = visualResult.urls.neutral;
        withMedia.imageUrls = visualResult.urls;
        logAiDebug('cloudinary_character_images_found', { studentId: student?.id || null, character, count: visualResult.characterImages.length });
      } else if (visualResult?.urls) {
        withMedia.imageUrl = visualResult.urls.neutral;
        withMedia.imageUrls = visualResult.urls;
        logAiDebug('cloudinary_image_success', { studentId: student?.id || null, subject });
      } else if (visualResult?.reason) {
        withMedia.imageStatus = visualResult.reason;
      }
    } catch (err) {
      withMedia.imageStatus = `image_generation_failed: ${err.message}`;
      logAiDebug('cloudinary_image_failure', { studentId: student?.id || null, error: compactError(err) });
    }
  }

  // Only generate audio for Auditory learners
  if (needsAudio) {
    try {
      const audio = await generateAndUploadLessonAudio({
        script: adaptation.elevenLabsScript,
        studentId: student?.id,
        subject,
      });
      if (audio?.url) {
        withMedia.audioUrl = audio.url;
        logAiDebug('audio_success', { studentId: student?.id || null, subject });
      } else if (audio?.audioDataUrl) {
        withMedia.audioUrl = audio.audioDataUrl;
        withMedia.audioStatus = 'inline_data_url';
      } else if (audio?.reason) {
        withMedia.audioStatus = audio.reason;
      }
    } catch (err) {
      withMedia.audioStatus = `audio_generation_failed: ${err.message}`;
      logAiDebug('audio_failure', { studentId: student?.id || null, error: compactError(err) });
    }
  }

  return withMedia;
}

function getModalityInstructions(primaryStyle, student) {
  const character = (student.characters || ['the character'])[0];
  switch (primaryStyle) {
    case 'Visual':
      return `VISUAL LEARNER INSTRUCTIONS:
- Focus on generating a rich cloudinaryPrompt for Cloudinary image generation
- The cloudinaryPrompt should describe a detailed, colorful scene of ${character} demonstrating the math concepts from the worksheet
- Keep adaptedText SHORT — visual learners need minimal text
- Generate questions with clear, visual-friendly answer options
- IMPORTANT: Generate interactiveHtml that creates a visually rich HTML/CSS lesson layout with:
  * A large header area where a character image (provided via Cloudinary URL) will be displayed
  * Visual fraction diagrams using SVG or CSS (pie charts, bar models, etc.)
  * Colorful, ${character}-themed styling (colors, borders, backgrounds)
  * The HTML should have an <img> tag with id="character-image" and src="CHARACTER_IMAGE_PLACEHOLDER" that will be replaced with the actual Cloudinary URL
  * The layout should look like a visual learning worksheet with the character guiding the lesson
  * Include CSS animations for engaging visual presentation`;
    case 'Auditory':
      return `AUDITORY LEARNER INSTRUCTIONS:
- Focus on generating a FULL, detailed elevenLabsScript for text-to-speech
- The elevenLabsScript should be a warm, conversational narration as if ${character} is talking directly to the student
- Include ALL worksheet content and explanations in the narration — this is the PRIMARY learning channel
- The narration should walk through each problem step by step
- Make the narration 3-4 paragraphs, covering the full lesson
- The student will listen and respond back via chat
- Keep the adaptedText brief since they learn by listening`;
    case 'Reading':
      return `READING LEARNER INSTRUCTIONS:
- Focus on generating rich, detailed adaptedText with the full lesson explanation
- Use ${character} as the narrator/guide throughout the text
- Include step-by-step explanations of the concepts
- Generate a comprehensive chatContext so the student can ask the tutor questions
- Keep interactiveHtml and elevenLabsScript minimal
- The student reads the text and selects answers to questions`;
    case 'Kinesthetic':
      return `KINESTHETIC LEARNER INSTRUCTIONS:
- The interactiveHtml is the PRIMARY learning channel. It must TEACH the concept, not just quiz.
- Generate a COMPLETE standalone HTML document (300+ lines) with inline CSS and JS. NO external dependencies.
- The interactive lesson MUST include these teaching elements:
  1. ANIMATED PIE CHARTS / FRACTION BARS: Show fractions visually using SVG or CSS shapes. For example, draw two circles divided into slices, color the numerator slices, then animate them merging together to show the sum. The student should SEE the fractions being added.
  2. INTERACTIVE SLIDERS: Let the student drag a slider to set numerator/denominator values and watch the fraction visualization update in real time. For example: a slider from 0 to 10 that fills a bar chart proportionally.
  3. DRAG-AND-DROP: Let students drag fraction pieces (pie slices, bar segments, blocks) from one area to another to combine them. Use HTML5 drag events or click-to-move.
  4. STEP-BY-STEP GUIDED WALKTHROUGH: Before any problems, walk through one example step by step with animations. Show "Step 1: Look at the denominators", "Step 2: Find common denominator", "Step 3: Add numerators" with visual transitions.
  5. INTERACTIVE PRACTICE: After the teaching section, present the worksheet problems as interactive exercises where the student manipulates visual elements (not just clicks an answer button).
- Theme everything with ${character}. Use ${character}'s colors and visual style.
- Include score tracking, progress bar, and celebration animation (confetti or character animation) on completion.
- Use CSS animations and transitions for smooth, engaging interactions.
- The HTML must work standalone in an iframe sandbox with allow-scripts.
- Keep elevenLabsScript minimal (no audio needed for kinesthetic learner)
- Keep adaptedText brief — this learner interacts, not reads
- DO NOT just create multiple-choice buttons. The whole point is HANDS-ON manipulation of visual fraction representations.`;
    default:
      return '';
  }
}

/**
 * Use Claude to generate rich interactive HTML for kinesthetic learners.
 * Claude is much better than Gemma at generating complex interactive HTML/CSS/JS.
 */
async function generateKinestheticHtmlWithClaude(rawText, subject, student) {
  if (!anthropicClient) {
    logAiDebug('claude_skip', { reason: 'no_anthropic_key' });
    return null;
  }

  const character = (student.characters || ['the character'])[0];
  const prompt = `You are building an interactive learning lesson for a special education student with autism.

Student: ${student.name}, Grade: ${student.grade}
Favorite character: ${character}
Subject: ${subject}
Sensory preferences: ${(student.sensoryPrefs || []).join(', ')}
Frustration triggers: ${(student.frustrationTriggers || []).join(', ')}

WORKSHEET CONTENT TO TEACH:
${rawText}

Build a COMPLETE, standalone HTML document that TEACHES the student how to solve these problems through hands-on interaction. This is for a kinesthetic learner — they learn by DOING, not reading.

REQUIREMENTS:
1. VISUAL TEACHING SECTION (comes first):
   - Animated fraction bar visualizations using SVG or CSS that show fractions being added
   - For example: two bars side by side, colored segments representing numerator/denominator, then an animation showing them combining
   - Step-by-step walkthrough of ONE example problem with animated transitions between steps
   - Each step should have a "Next" button and smooth CSS transitions

2. INTERACTIVE SLIDERS:
   - Range sliders that let the student set numerator and denominator values
   - As the student drags, a fraction bar or pie chart updates in real-time
   - Labels showing the current fraction value

3. DRAG-AND-DROP PRACTICE:
   - For each worksheet problem, show fraction pieces that the student can click/drag to combine
   - Visual feedback when pieces are combined (color change, animation)
   - Check answer button with immediate visual feedback (green glow for correct, gentle shake for incorrect)

4. SCORE TRACKING & PROGRESS:
   - Progress bar at the top showing how many problems completed
   - Score counter
   - Celebration animation (confetti particles using CSS/JS) when all problems are completed
   - Encouraging messages themed to ${character}

5. CHARACTER THEMING:
   - Use ${character}'s color scheme and visual style throughout
   - Character speech bubbles with encouraging messages at key moments
   - ${character}-themed backgrounds and decorations

TECHNICAL REQUIREMENTS:
- MUST be a complete HTML document with <!DOCTYPE html>, <html>, <head>, <body>
- ALL CSS must be inline in a <style> tag (no external stylesheets)
- ALL JavaScript must be inline in a <script> tag (no external libraries)
- Must work inside an iframe with sandbox="allow-scripts"
- Use CSS animations and transitions for smooth, engaging interactions
- Mobile-friendly layout (flexbox/grid)
- Minimum 400 lines of code — this should be a RICH, full interactive lesson
- Use modern CSS (gradients, shadows, animations, transitions)
- Make it colorful, engaging, and fun for a child

Return ONLY the complete HTML document. No markdown, no code fences, no explanation — just the raw HTML starting with <!DOCTYPE html>.`;

  try {
    logAiDebug('claude_kinesthetic_start', { studentId: student.id, character });
    const message = await anthropicClient.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 16000,
      messages: [{ role: 'user', content: prompt }],
    });

    const html = message.content[0]?.text || '';
    if (html.includes('<!DOCTYPE') || html.includes('<html') || html.includes('<div')) {
      logAiDebug('claude_kinesthetic_success', { studentId: student.id, htmlLength: html.length });
      return html;
    }
    logAiDebug('claude_kinesthetic_no_html', { studentId: student.id, responseLength: html.length });
    return null;
  } catch (err) {
    logAiDebug('claude_kinesthetic_error', { studentId: student.id, error: compactError(err) });
    console.error('Claude kinesthetic generation failed:', err.message);
    return null;
  }
}

/**
 * Generate adapted lesson content for each student from worksheet text.
 */
async function adaptLesson(rawText, subject, students) {
  const results = {};

  for (const student of students) {
    const primaryStyle = (student.learningStyles || ['Visual'])[0];
    const modalityInstructions = getModalityInstructions(primaryStyle, student);

    const prompt = `You are an AI tutor adapting a real worksheet for a special education student with autism.

Student profile:
- Name: ${student.name}
- Grade: ${student.grade}
- PRIMARY learning style: ${primaryStyle}
- Favorite characters: ${(student.characters || []).join(', ')}
- Sensory preferences: ${(student.sensoryPrefs || []).join(', ')}
- Frustration triggers: ${(student.frustrationTriggers || []).join(', ')}

ACTUAL WORKSHEET CONTENT (adapt the REAL problems from this worksheet):
${rawText}

Subject: ${subject}

IMPORTANT: You must adapt the ACTUAL problems from the worksheet above. Do NOT make up new problems. Each question should be a character-themed version of a real problem from the worksheet.

${modalityInstructions}

Return valid JSON with this exact structure:
{
  "schemaVersion": "2",
  "adaptedText": "The lesson content rewritten using the student's favorite characters. For ${primaryStyle} mode, this should ${primaryStyle === 'Visual' ? 'be minimal — focus on the visual' : primaryStyle === 'Auditory' ? 'be the narration script overview' : primaryStyle === 'Reading' ? 'be the FULL detailed lesson text with explanations' : 'be a brief intro to the interactive activity'}",
  "formula": "The key formula or concept (if applicable, otherwise null)",
  "hint": "A helpful hint using the student's character theme",
  "cloudinaryPrompt": "${primaryStyle === 'Visual' ? 'A DETAILED description for generating a themed illustration featuring the character doing the specific worksheet activity. Be very specific about what to show.' : 'Brief description for illustration'}",
  "elevenLabsScript": "${primaryStyle === 'Auditory' ? 'A FULL warm conversational narration as if the character is talking to the student. Include ALL worksheet content in the narration. This will be read aloud by ElevenLabs TTS. Make it 2-3 paragraphs long.' : 'Brief narration summary'}",
  "modalityPlan": {
    "primary": "${primaryStyle.toLowerCase()}",
    "supports": []
  },
  "interactivePlan": [
    { "step": "step_name", "instruction": "instruction for interactive step" }
  ],
  "interactiveHtml": "${primaryStyle === 'Kinesthetic' ? 'A COMPLETE self-contained HTML document (300+ lines) with inline CSS and JS. MUST include: (1) Animated SVG pie charts or fraction bar visualizations that TEACH fractions visually, (2) Interactive sliders where the student drags to set numerator/denominator and watches the visualization update, (3) A step-by-step guided walkthrough of one example problem with animated transitions, (4) Interactive practice problems where students manipulate visual elements (drag pie slices, fill fraction bars) — NOT just click answer buttons. (5) Score tracking, progress bar, celebration confetti animation on completion. Theme with the character colors and style. Must work in an iframe sandbox with allow-scripts. NO external dependencies.' : 'null'}",
  "chatContext": "Context paragraph about the lesson for the chat tutor to reference",
  "confidence": 0.84,
  "questions": [
    {
      "id": "q1",
      "text": "A character-themed version of an ACTUAL problem from the worksheet",
      "options": ["answer A", "answer B", "answer C", "answer D"],
      "correctIndex": 0,
      "hint": "A simpler hint if they get it wrong",
      "reframeExplanation": "Step-by-step breakdown for struggling students"
    }
  ]
}

Rules:
- ADAPT THE REAL WORKSHEET PROBLEMS — do not invent new ones
- Use ${(student.characters || ['the character'])[0]} as the character in ALL content
- Generate 5-8 questions based on the actual worksheet problems
- Each question must have 4 answer options with one correct answer
- Theme EVERYTHING to the student's favorite character
- Keep language at ${student.grade} reading level
- Avoid frustration triggers: ${(student.frustrationTriggers || []).join(', ')}
- Respect sensory preferences: ${(student.sensoryPrefs || []).join(', ')}
- Return only valid JSON, no markdown code fences`;

    try {
      const adapted = await callGemma(prompt);
      let normalized = normalizeAdaptation(adapted, student, subject);

      // For kinesthetic learners, use Claude to generate rich interactive HTML
      if (primaryStyle === 'Kinesthetic') {
        const claudeHtml = await generateKinestheticHtmlWithClaude(rawText, subject, student);
        if (claudeHtml) {
          normalized.interactiveHtml = claudeHtml;
          logAiDebug('claude_html_replaced', { studentId: student.id, htmlLength: claudeHtml.length });
        }
      }

      const withMedia = await attachMedia(normalized, student, subject);

      // For Visual learners: replace CHARACTER_IMAGE_PLACEHOLDER with actual Cloudinary URLs
      if (primaryStyle === 'Visual' && withMedia.characterImages && withMedia.interactiveHtml) {
        withMedia.interactiveHtml = withMedia.interactiveHtml.replace(
          /CHARACTER_IMAGE_PLACEHOLDER/g,
          withMedia.characterImages[0]
        );
      }

      results[student.id] = withMedia;
    } catch (err) {
      try {
        const repairPrompt = `${prompt}

Your previous output could not be parsed/validated.
Return ONLY strict JSON and ensure all required fields exist with correct types.`;
        const repaired = await callGemma(repairPrompt);
        let normalized = normalizeAdaptation(repaired, student, subject);

        if (primaryStyle === 'Kinesthetic') {
          const claudeHtml = await generateKinestheticHtmlWithClaude(rawText, subject, student);
          if (claudeHtml) {
            normalized.interactiveHtml = claudeHtml;
          }
        }

        const withMedia = await attachMedia(normalized, student, subject);
        if (primaryStyle === 'Visual' && withMedia.characterImages && withMedia.interactiveHtml) {
          withMedia.interactiveHtml = withMedia.interactiveHtml.replace(
            /CHARACTER_IMAGE_PLACEHOLDER/g,
            withMedia.characterImages[0]
          );
        }
        results[student.id] = withMedia;
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
