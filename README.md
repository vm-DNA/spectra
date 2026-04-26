# Luminary — AI-Powered Special Education Platform

> Hackathon project: adaptive learning tool for special education teachers and students with autism.
> Built with React + React Router. AI stack: Gemma (lesson adaptation), Cloudinary (images), ElevenLabs (audio).

---

## Quick start

```bash
npm install
npm start          # starts both React (port 3000) + Express API (port 3001)
```

Open http://localhost:3000

### Running Gemma (Ollama)

The backend calls Gemma via Ollama for AI lesson adaptation. To set it up:

```bash
# Install Ollama — https://ollama.com/download
ollama pull gemma2       # or gemma2:2b for faster responses
ollama serve             # starts Ollama on localhost:11434
```

The app gracefully falls back to mock data if Ollama is not running.

### Individual server commands

```bash
npm run start:client     # React dev server only (port 3000)
npm run start:server     # Express API only (port 3001)
```

### API endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/adapt-lesson` | Upload a worksheet (multipart) + student profiles → get adapted lessons per student |
| POST | `/api/reframe` | Send a question + student profile → get simplified step-by-step breakdown |
| GET | `/api/health` | Server health check |

---

## Project structure

```
server/
  index.js                      # Express API server (port 3001)
  gemma.js                      # Gemma/Ollama client — lesson adaptation + reframe
  parseFile.js                  # PDF/image file parser
  uploads/                      # Temporary file upload directory
src/
  App.js                        # Routing — all 13 screens wired + LessonProvider
  index.css                     # Global design tokens + utility classes
  lib/
    mockData.js                 # All demo data: students, assignments, config
    useFrustration.js           # Frustration detection hook
    gemmaApi.js                 # Frontend API helpers for Gemma endpoints
    LessonContext.jsx            # React context for storing adapted lessons
  components/
    UI.jsx                      # Shared UI primitives (Badge, Avatar, etc.)
    TeacherLayout.jsx            # Teacher nav wrapper
    StudentLayout.jsx            # Student minimal wrapper
  pages/
    Landing.jsx                 # Screen 0 — role selection
    teacher/
      TeacherLogin.jsx           # T1 — Login
      TeacherDashboard.jsx       # T2 — Dashboard with student grid + alerts
      UploadAssignment.jsx       # T3 — Homework input + Gemma adaptation
      StudentProfile.jsx         # T4 — Profile editor + frustration history
      LiveMonitor.jsx            # T5 — Real-time signal monitor
      TeacherReports.jsx         # T6 — Analytics + AI recommendations
    student/
      StudentLogin.jsx           # S1 — Name picker (no password)
      StudentHome.jsx            # S2 — Greeting + mood + homework list
      SelectAssignment.jsx       # S3 — Assignment cards
      CuratedLesson.jsx          # S4 — Adapted lesson + frustration detection
      AutoReframe.jsx            # S5 — Triggered reframe screen
      CompletionScreen.jsx       # S6 — Stars + score + teacher notification
```

---

## Integration TODOs for Claude Code

### 1. Gemma (lesson adaptation)
**File:** `src/pages/teacher/UploadAssignment.jsx`
**Where:** `handleSubmit()` function — replace the `setTimeout` mock with a real API call.

```js
// TODO: Replace mock with real Gemma call
const response = await fetch('/api/adapt-lesson', {
  method: 'POST',
  body: JSON.stringify({
    rawContent: content,
    students: STUDENTS.map(s => ({
      id: s.id,
      learningStyles: s.learningStyles,
      characters: s.characters,
      frustrationTriggers: s.frustrationTriggers,
    })),
  }),
});
const adapted = await response.json();
// Store adapted versions per student and update state
```

**Gemma prompt template (suggested):**
```
You are adapting a lesson for a student with autism who prefers [learningStyle] learning
and loves [characters]. Their frustration triggers are: [triggers].

Rewrite this lesson content so it:
- Uses the student's favorite character(s) as the main examples
- Breaks concepts into one step at a time
- Uses simple, clear language (Grade [level] reading level)
- Includes a visual description placeholder for Cloudinary
- Is encouraging and warm in tone

Original lesson:
[rawContent]

Return JSON: { adaptedText, formula, hint, cloudinaryPrompt, elevenLabsScript }
```

---

### 2. Cloudinary (themed images)
**File:** `src/pages/student/CuratedLesson.jsx` and `AutoReframe.jsx`
**Where:** Replace the placeholder divs labeled `📷 Cloudinary...`

```js
// Install: npm install cloudinary
import { Cloudinary } from '@cloudinary/url-gen';

const cld = new Cloudinary({ cloud: { cloudName: 'YOUR_CLOUD_NAME' } });

// Generate a themed image URL using Cloudinary AI transformation or stored assets
const imageUrl = cld.image(`spectra/${character.toLowerCase()}_${subject.toLowerCase()}`).toURL();

// In JSX:
<img src={imageUrl} alt={`${character} fraction problem`} style={{ width: '100%', borderRadius: 8 }} />
```

For AI-generated images, use Cloudinary's generative fill / AI background:
```js
// Cloudinary URL with generative AI
const prompt = `${character} sharing pizza, cartoon style, educational, friendly`;
// Use Cloudinary's gen_fill or external AI + upload to Cloudinary
```

---

### 3. ElevenLabs (audio narration)
**File:** `src/pages/student/CuratedLesson.jsx` and `AutoReframe.jsx`
**Where:** Replace the placeholder divs labeled `🔊 ElevenLabs...`

```js
// Install: npm install elevenlabs-node (or use fetch directly)
const playNarration = async (text, voiceId = 'YOUR_VOICE_ID') => {
  const response = await fetch('https://api.elevenlabs.io/v1/text-to-speech/' + voiceId, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'xi-api-key': process.env.REACT_APP_ELEVENLABS_KEY,
    },
    body: JSON.stringify({ text, model_id: 'eleven_monolingual_v1' }),
  });
  const blob    = await response.blob();
  const url     = URL.createObjectURL(blob);
  const audio   = new Audio(url);
  audio.play();
};

// Call when mode === 'Listen' or when reframe triggers:
useEffect(() => {
  if (mode === 'Listen') {
    playNarration(question.text);
  }
}, [mode, question]);
```

---

### 4. Real-time teacher alerts (frustration → teacher)
**File:** `src/lib/useFrustration.js`
**Where:** `onFrustrationTriggered` callback

Suggested: Supabase Realtime or Firebase for live push to teacher's monitor.

```js
// In useFrustration.js — inside maybeFireTrigger():
supabase.from('frustration_events').insert({
  student_id: currentStudentId,
  score,
  timestamp: new Date().toISOString(),
  signals: { rapidClicks, wrongAttempts, idkClicks, flaggedPhrases },
});
```

---

### 5. Environment variables
Create `.env` in project root:
```
REACT_APP_CLOUDINARY_CLOUD_NAME=your_cloud_name
REACT_APP_ELEVENLABS_KEY=your_key
REACT_APP_SUPABASE_URL=your_url
REACT_APP_SUPABASE_ANON_KEY=your_key
REACT_APP_GEMMA_API_URL=http://localhost:11434  # or hosted endpoint
```

---

## Frustration detection logic

See `src/lib/useFrustration.js`. The hook tracks:

| Signal | Threshold | Weight |
|--------|-----------|--------|
| Rapid clicks | 3+ in 8 seconds | +25 pts |
| Wrong answers | 3+ consecutive | +30 pts |
| "I don't understand" | 2+ presses | +20 pts |
| Flagged language | any keyword match | +25 pts |

When score ≥ 70, `onFrustrationTriggered()` fires → navigate to `/student/reframe`.

Tune thresholds in `src/lib/mockData.js` → `FRUSTRATION_CONFIG`.

---

## Design system

All colors, spacing, and typography live in `src/index.css` as CSS custom properties.
Primary brand color: `--teal` (#1D9E75).
Student accent: `--purple` (#534AB7).
Frustration scale: teal (calm) → amber (moderate) → coral (high).
