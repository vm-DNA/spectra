// ============================================================
//  mockData.js
//  Central source of truth for all prototype/demo data.
//  Replace these with real API calls / Gemma responses later.
// ============================================================

export const STUDENTS = [
  {
    id: 'jamie',
    name: 'Jamie L.',
    initials: 'JL',
    grade: 'Grade 3',
    avatarColor: { bg: '#E1F5EE', text: '#085041' },
    learningStyles: ['Visual'],
    allStyles: ['Visual', 'Auditory', 'Reading', 'Kinesthetic'],
    characters: ['Bluey', 'Bingo'],
    allCharacters: ['Bluey', 'Bingo', 'Paw Patrol', 'SpongeBob', 'Minecraft Steve', 'Mirabel (Encanto)'],
    sensoryPrefs: ['Avoids loud sounds', 'Minimal text'],
    frustrationTriggers: ['Too many words', 'Time pressure'],
    engagementPct: 78,
    frustrationLevel: 'low',   // low | moderate | high
    frustrationScore: 20,
    status: 'calm',            // calm | alert | stress | offline
    sessionActive: true,
    frustrationHistory: [20, 45, 70, 30, 48, 22, 35], // Mon–Sun
    currentAssignment: 'fractions',
  },
  {
    id: 'maya',
    name: 'Maya K.',
    initials: 'MK',
    grade: 'Grade 3',
    avatarColor: { bg: '#FAEEDA', text: '#633806' },
    learningStyles: ['Auditory'],
    allStyles: ['Visual', 'Auditory', 'Reading', 'Kinesthetic'],
    characters: ['Paw Patrol'],
    allCharacters: ['Bluey', 'Bingo', 'Paw Patrol', 'SpongeBob', 'Minecraft Steve', 'Mirabel (Encanto)'],
    sensoryPrefs: ['High contrast'],
    frustrationTriggers: ['Ambiguous instructions'],
    engagementPct: 55,
    frustrationLevel: 'moderate',
    frustrationScore: 48,
    status: 'alert',
    sessionActive: true,
    frustrationHistory: [30, 40, 50, 55, 60, 48, 52],
    currentAssignment: 'fractions',
  },
  {
    id: 'eli',
    name: 'Eli R.',
    initials: 'ER',
    grade: 'Grade 3',
    avatarColor: { bg: '#FAECE7', text: '#4A1B0C' },
    learningStyles: ['Kinesthetic', 'Visual'],
    allStyles: ['Visual', 'Auditory', 'Reading', 'Kinesthetic'],
    characters: ['Minecraft Steve'],
    allCharacters: ['Bluey', 'Bingo', 'Paw Patrol', 'SpongeBob', 'Minecraft Steve', 'Mirabel (Encanto)'],
    sensoryPrefs: ['Prefers minimal text'],
    frustrationTriggers: ['Multiple steps', 'Time pressure'],
    engagementPct: 32,
    frustrationLevel: 'high',
    frustrationScore: 82,
    status: 'stress',
    sessionActive: true,
    frustrationHistory: [60, 70, 80, 90, 75, 82, 85],
    currentAssignment: 'fractions',
  },
  {
    id: 'sofia',
    name: 'Sofia B.',
    initials: 'SB',
    grade: 'Grade 3',
    avatarColor: { bg: '#EEEDFE', text: '#26215C' },
    learningStyles: ['Reading', 'Visual'],
    allStyles: ['Visual', 'Auditory', 'Reading', 'Kinesthetic'],
    characters: ['Mirabel (Encanto)'],
    allCharacters: ['Bluey', 'Bingo', 'Paw Patrol', 'SpongeBob', 'Minecraft Steve', 'Mirabel (Encanto)'],
    sensoryPrefs: ['High contrast', 'Needs visual anchors'],
    frustrationTriggers: ['Ambiguous instructions'],
    engagementPct: 90,
    frustrationLevel: 'low',
    frustrationScore: 12,
    status: 'offline',
    sessionActive: false,
    frustrationHistory: [15, 10, 20, 8, 12, 10, 5],
    currentAssignment: null,
  },
  {
    id: 'aisha',
    name: 'Aisha R.',
    initials: 'AR',
    grade: 'Grade 3',
    avatarColor: { bg: '#E6F1FB', text: '#042C53' },
    learningStyles: ['Visual'],
    allStyles: ['Visual', 'Auditory', 'Reading', 'Kinesthetic'],
    characters: ['SpongeBob'],
    allCharacters: ['Bluey', 'Bingo', 'Paw Patrol', 'SpongeBob', 'Minecraft Steve', 'Mirabel (Encanto)'],
    sensoryPrefs: ['Color coding', 'Clear fonts'],
    frustrationTriggers: ['Long passages'],
    engagementPct: 72,
    frustrationLevel: 'low',
    frustrationScore: 18,
    status: 'calm',
    sessionActive: true,
    frustrationHistory: [15, 20, 18, 22, 16, 18, 12],
    currentAssignment: 'fractions',
  },
];

export const ASSIGNMENTS = [
  {
    id: 'fractions',
    subject: 'Math',
    title: 'Fractions — adding with like denominators',
    dueDate: 'Apr 26, 2026',
    status: 'new', // new | in-progress | done
    rawContent: `Solve the following fraction problems. Show your work for each step. 
Use pictures or diagrams if it helps you think. 
Remember: when the bottom numbers are the same, just add the top numbers!`,
    adaptedVersions: {
      jamie: {
        character: 'Bluey',
        mode: 'visual',
        content: `Bluey and Bingo are sharing a pizza with 8 slices (that's the bottom number!). 
Bluey takes 3 slices. Bingo takes 2 slices. How many slices do they have together?`,
        formula: '³⁄₈ + ²⁄₈ = ?',
        hint: 'Just add the top numbers! 3 + 2 = 5, so the answer is ⁵⁄₈.',
        cloudinaryImage: 'https://res.cloudinary.com/demo/image/upload/sample.jpg', // replace with real Cloudinary URL
        elevenLabsAudio: null, // replace with ElevenLabs audio URL
      },
    },
    questions: [
      {
        id: 'q1',
        text: 'What is ³⁄₈ + ²⁄₈?',
        options: ['⁴⁄₈', '⁵⁄₈', '⁶⁄₈'],
        correctIndex: 1,
      },
      {
        id: 'q2',
        text: 'What is ²⁄₆ + ³⁄₆?',
        options: ['⁴⁄₆', '⁵⁄₆', '⁶⁄₆'],
        correctIndex: 1,
      },
      {
        id: 'q3',
        text: 'What is ¹⁄₄ + ²⁄₄?',
        options: ['²⁄₄', '³⁄₄', '⁴⁄₄'],
        correctIndex: 1,
      },
    ],
  },
  {
    id: 'sightwords',
    subject: 'Reading',
    title: 'Sight words — set 4',
    dueDate: 'Apr 20, 2026',
    status: 'done',
    rawContent: 'Practice reading and writing this week\'s sight words.',
    questions: [],
  },
  {
    id: 'community',
    subject: 'Social Skills',
    title: 'My community helpers',
    dueDate: 'Apr 28, 2026',
    status: 'new',
    rawContent: 'Learn about people who help us in our community.',
    questions: [
      { id: 'cq1', text: 'Who helps put out fires?', options: ['Teacher', 'Firefighter', 'Chef', 'Pilot'], correctIndex: 1, hint: 'Think about the person who drives a big red truck.' },
    ],
  },
  {
    id: 'addition-basic',
    subject: 'Math',
    title: 'Addition — Krabby Patty counting',
    dueDate: 'Apr 30, 2026',
    status: 'new',
    character: 'SpongeBob',
    rawContent: 'Practice basic addition by counting Krabby Patties with SpongeBob!',
    questions: [
      {
        id: 'ab1',
        text: '3 + 4 = ?',
        options: [5, 7, 6, 8],
        correctIndex: 1,
        hint: 'Start by counting the first group. Then add the second group together.',
        visual: {
          characterSays: 'count with me!',
          images: ['🍔🍔🍔', '🍔🍔🍔🍔'],
          imageCaption: '3 patties + 4 patties = ?',
        },
        auditory: {
          characterSays: 'listen carefully!',
          narrationText: 'I have 3 patties. Patrick gives me 4 more. How many total?',
        },
        reading: {
          fullText: 'SpongeBob has **3** Krabby Patties.\nPatrick gives him **4** more.\n\nHow many Krabby Patties does SpongeBob have in total?',
        },
      },
      {
        id: 'ab2',
        text: '2 + 5 = ?',
        options: [6, 8, 7, 5],
        correctIndex: 2,
        hint: 'Count two patties, then count five more after them.',
        visual: {
          characterSays: 'let\'s count together!',
          images: ['🍔🍔', '🍔🍔🍔🍔🍔'],
          imageCaption: '2 patties + 5 patties = ?',
        },
        auditory: {
          characterSays: 'listen to the story!',
          narrationText: 'SpongeBob made 2 patties in the morning and 5 more at lunch. How many did he make today?',
        },
        reading: {
          fullText: 'SpongeBob made **2** Krabby Patties in the morning.\nThen he made **5** more at lunch.\n\nHow many Krabby Patties did SpongeBob make today?',
        },
      },
      {
        id: 'ab3',
        text: '6 + 2 = ?',
        options: [7, 9, 6, 8],
        correctIndex: 3,
        hint: 'You have 6 already. Just add 2 more to that number.',
        visual: {
          characterSays: 'look at the patties!',
          images: ['🍔🍔🍔🍔🍔🍔', '🍔🍔'],
          imageCaption: '6 patties + 2 patties = ?',
        },
        auditory: {
          characterSays: 'listen up!',
          narrationText: 'Patrick already has 6 patties on his plate. SpongeBob gives him 2 more. How many now?',
        },
        reading: {
          fullText: 'Patrick has **6** Krabby Patties on his plate.\nSpongeBob gives him **2** more.\n\nHow many Krabby Patties does Patrick have now?',
        },
      },
      {
        id: 'ab4',
        text: '4 + 3 = ?',
        options: [8, 6, 5, 7],
        correctIndex: 3,
        hint: 'Start at 4 and count up 3 more: 5, 6, 7.',
        visual: {
          characterSays: 'count with me!',
          images: ['🍔🍔🍔🍔', '🍔🍔🍔'],
          imageCaption: '4 patties + 3 patties = ?',
        },
        auditory: {
          characterSays: 'listen to this one!',
          narrationText: 'There are 4 patties on the grill. SpongeBob adds 3 more. How many are cooking?',
        },
        reading: {
          fullText: 'There are **4** Krabby Patties on the grill.\nSpongeBob adds **3** more.\n\nHow many Krabby Patties are cooking now?',
        },
      },
      {
        id: 'ab5',
        text: '5 + 1 = ?',
        options: [4, 7, 6, 5],
        correctIndex: 2,
        hint: 'You have 5. Adding 1 more makes it just one number higher.',
        visual: {
          characterSays: 'almost done!',
          images: ['🍔🍔🍔🍔🍔', '🍔'],
          imageCaption: '5 patties + 1 patty = ?',
        },
        auditory: {
          characterSays: 'last one! listen!',
          narrationText: 'Squidward ordered 5 patties but wants 1 more. How many patties total?',
        },
        reading: {
          fullText: 'Squidward ordered **5** Krabby Patties.\nThen he asked for **1** more.\n\nHow many Krabby Patties did Squidward order in total?',
        },
      },
    ],
  },
];

// Published assignments (actively assigned, with due dates and per-student info)
export const PUBLISHED_ASSIGNMENTS = [
  {
    id: 'fractions',
    subject: 'Math',
    title: 'Fractions — adding with like denominators',
    publishedDate: 'Apr 22, 2026',
    dueDate: 'Apr 26, 2026',
    assignedTo: ['jamie', 'maya', 'eli', 'sofia'],
    studentStatus: {
      jamie: { status: 'in-progress', adaptedMode: 'Visual + Bluey theme' },
      maya:  { status: 'in-progress', adaptedMode: 'Auditory + Paw Patrol theme' },
      eli:   { status: 'not-started', adaptedMode: 'Kinesthetic + Minecraft theme' },
      sofia: { status: 'completed',   adaptedMode: 'Reading + Encanto theme' },
    },
  },
  {
    id: 'community',
    subject: 'Social Skills',
    title: 'My community helpers',
    publishedDate: 'Apr 24, 2026',
    dueDate: 'Apr 28, 2026',
    assignedTo: ['jamie', 'maya', 'eli', 'sofia'],
    studentStatus: {
      jamie: { status: 'not-started', adaptedMode: 'Visual + Bluey theme' },
      maya:  { status: 'not-started', adaptedMode: 'Auditory + Paw Patrol theme' },
      eli:   { status: 'not-started', adaptedMode: 'Kinesthetic + Minecraft theme' },
      sofia: { status: 'not-started', adaptedMode: 'Reading + Encanto theme' },
    },
  },
];

// Past assignments (completed/graded, with per-student results)
export const PAST_ASSIGNMENTS = [
  {
    id: 'sightwords',
    subject: 'Reading',
    title: 'Sight words — set 4',
    assignedDate: 'Apr 14, 2026',
    dueDate: 'Apr 20, 2026',
    completedDate: 'Apr 20, 2026',
    studentResults: {
      jamie: { score: 90, questionsCorrect: 9, questionsTotal: 10, reframes: 0, timeSpent: '12 min', adaptedMode: 'Visual + Bluey' },
      maya:  { score: 75, questionsCorrect: 6, questionsTotal: 8, reframes: 1, timeSpent: '18 min', adaptedMode: 'Auditory + Paw Patrol' },
      eli:   { score: 60, questionsCorrect: 6, questionsTotal: 10, reframes: 3, timeSpent: '25 min', adaptedMode: 'Kinesthetic + Minecraft' },
      sofia: { score: 95, questionsCorrect: 19, questionsTotal: 20, reframes: 0, timeSpent: '10 min', adaptedMode: 'Reading + Encanto' },
    },
  },
  {
    id: 'shapes',
    subject: 'Math',
    title: 'Identifying 2D shapes',
    assignedDate: 'Apr 7, 2026',
    dueDate: 'Apr 13, 2026',
    completedDate: 'Apr 13, 2026',
    studentResults: {
      jamie: { score: 85, questionsCorrect: 17, questionsTotal: 20, reframes: 1, timeSpent: '14 min', adaptedMode: 'Visual + Bluey' },
      maya:  { score: 70, questionsCorrect: 7, questionsTotal: 10, reframes: 2, timeSpent: '20 min', adaptedMode: 'Auditory + Paw Patrol' },
      eli:   { score: 55, questionsCorrect: 11, questionsTotal: 20, reframes: 4, timeSpent: '30 min', adaptedMode: 'Kinesthetic + Minecraft' },
      sofia: { score: 100, questionsCorrect: 10, questionsTotal: 10, reframes: 0, timeSpent: '8 min', adaptedMode: 'Reading + Encanto' },
    },
  },
  {
    id: 'weather',
    subject: 'Science',
    title: 'Weather patterns & seasons',
    assignedDate: 'Apr 1, 2026',
    dueDate: 'Apr 6, 2026',
    completedDate: 'Apr 6, 2026',
    studentResults: {
      jamie: { score: 82, questionsCorrect: 9, questionsTotal: 11, reframes: 1, timeSpent: '15 min', adaptedMode: 'Visual + Bluey' },
      maya:  { score: 88, questionsCorrect: 7, questionsTotal: 8, reframes: 0, timeSpent: '13 min', adaptedMode: 'Auditory + Paw Patrol' },
      eli:   { score: 45, questionsCorrect: 5, questionsTotal: 11, reframes: 5, timeSpent: '35 min', adaptedMode: 'Kinesthetic + Minecraft' },
      sofia: { score: 92, questionsCorrect: 11, questionsTotal: 12, reframes: 0, timeSpent: '9 min', adaptedMode: 'Reading + Encanto' },
    },
  },
];

// Frustration signal thresholds — used by the detection engine
export const FRUSTRATION_CONFIG = {
  rapidClickWindow:     8,    // seconds
  rapidClickThreshold:  3,    // clicks within window
  wrongAttemptsThreshold: 3,  // consecutive wrong answers
  idkButtonThreshold:   2,    // "I don't understand" presses
  frustrationScoreThreshold: 70, // 0–100 score that triggers auto-reframe
  keywordsToFlag: [
    "i don't get it", "i dont get it", "i don't understand",
    "this is too hard", "i hate this", "i can't do this",
    "too hard", "i give up", "this is stupid",
  ],
};

// Reframe event log (simulated)
export const REFRAME_EVENTS = [
  {
    studentId: 'eli',
    timestamp: '9:14 AM',
    trigger: 'High frustration',
    before: 'Text mode — standard fractions lesson',
    after: 'Minecraft visual mode — ElevenLabs narration enabled',
    color: '#D85A30',
  },
  {
    studentId: 'maya',
    timestamp: '9:08 AM',
    trigger: 'Moderate signals',
    before: 'Visual mode — Paw Patrol theme',
    after: 'Added ElevenLabs audio narration layer',
    color: '#EF9F27',
  },
  {
    studentId: 'jamie',
    timestamp: '9:02 AM',
    trigger: 'Profile-based load',
    before: '—',
    after: 'Visual mode + Bluey theme loaded per profile',
    color: '#1D9E75',
  },
];

// Teacher info (fallback when no Firebase profile is loaded)
export const TEACHER = {
  name: 'Teacher',
  room: 'Room 4B',
  school: 'Sunview Elementary',
  email: '',
};

// Subject metadata for reports sidebar
export const REPORT_SUBJECT_META = {
  Mathematics:    { icon: '➕', color: 'var(--teal)' },
  Reading:        { icon: '📖', color: 'var(--purple-dark)' },
  Science:        { icon: '🌱', color: 'var(--teal)' },
  'Social Skills': { icon: '🤝', color: 'var(--amber)' },
};

// Rich report data for the tabbed reports page
export const REPORT_ASSIGNMENTS = [
  {
    id: 'addition',
    subject: 'Mathematics',
    title: 'Addition (Q1–Q5)',
    date: 'Apr 24',
    dot: 'coral',
    studentCount: 5,
    questionCount: 5,
    totalReframes: 6,
    overview: {
      avgScore: { value: 64, sub: 'across 5 students' },
      completion: { value: '80%', sub: '4 of 5 finished' },
      aiReframes: { value: 6, sub: '3 students triggered' },
      avgEngagement: { value: '74%', sub: '↑8% vs last assign' },
      scoreByStyle: [
        { style: 'Visual', pct: 82, color: 'var(--purple)' },
        { style: 'Auditory', pct: 48, color: 'var(--coral)' },
        { style: 'Reading', pct: 71, color: 'var(--amber)' },
      ],
      styleInsight: 'Auditory learners struggled most — narration may need to be clearer for math concepts.',
      reframesByStrategy: [
        { strategy: 'Simplify', count: 3, color: 'var(--coral)' },
        { strategy: 'Switch mode', count: 2, color: 'var(--amber)' },
        { strategy: 'Add hint', count: 1, color: 'var(--teal)' },
      ],
      strategyInsight: 'Most reframes required full simplification — questions may be above current class level.',
      heatmap: [
        { label: 'Q1', pct: 92, reframes: 0 },
        { label: 'Q2', pct: 80, reframes: 1 },
        { label: 'Q3', pct: 38, reframes: 3, flagged: true },
        { label: 'Q4', pct: 61, reframes: 2 },
        { label: 'Q5', pct: 58, reframes: 0 },
      ],
    },
    students: [
      { studentId: 'sofia', mode: 'Auditory', score: 42, engagement: 58, reframes: 3, pattern: 'Spiral: Q3 fraction confusion' },
      { studentId: 'eli', mode: 'Visual', score: 68, engagement: 71, reframes: 2, pattern: 'Attention fade after Q2' },
      { studentId: 'jamie', mode: 'Visual', score: 90, engagement: 91, reframes: 0, pattern: 'None' },
      { studentId: 'aisha', mode: 'Visual', score: 75, engagement: 79, reframes: 0, pattern: 'None' },
      { studentId: 'maya', mode: 'Auditory', score: 55, engagement: 66, reframes: 1, pattern: 'Concept confusion on Q4' },
    ],
    reframeLog: [
      { studentId: 'sofia', question: 'Q3', description: 'Rapid clicks + 3 wrong → full simplify, step split into 2 parts, switched to visual mode', severity: 'High' },
      { studentId: 'sofia', question: 'Q1', description: 'IDK ×2 → auditory narration re-read, encouragement message added', severity: 'Moderate' },
      { studentId: 'eli', question: 'Q2', description: 'Attention fade detected → break prompt shown, Minecraft theme activated', severity: 'Mild' },
    ],
    questions: [
      { label: 'Q1', text: 'What is 2 + 3?', successPct: 92, reframes: 0, description: 'All 5 students answered correctly on first attempt. Well calibrated for class level.', flagged: false },
      { label: 'Q2', text: 'What is 5 + 4?', successPct: 80, reframes: 1, description: '1 student needed reframe. Marcus K. showed attention fade — unrelated to question difficulty.', flagged: false },
      { label: 'Q3', text: 'What is 7 + 6 with carrying?', successPct: 38, reframes: 3, description: '3 of 5 students triggered reframes. This concept (carrying) has not been taught yet — question is above class level. Recommend removing or replacing before next session.', flagged: true },
      { label: 'Q4', text: 'What is 4 + 4 + 2?', successPct: 61, reframes: 2, description: 'Three-number addition is challenging. Jamie P. and Sofia J. needed reframes. Consider splitting into two steps.', flagged: false },
      { label: 'Q5', text: 'Word problem: SpongeBob has 3 + 5', successPct: 58, reframes: 0, description: 'Low score but no reframes — students attempted without triggering frustration signals. Word problem format may need simplification.', flagged: false },
    ],
    insights: [
      { type: 'warning', text: '**Q3 needs to be removed or rewritten.** It introduced carrying which hasn\'t been taught. 3 of 5 students hit frustration threshold on this question alone. Before the next session replace it with a simpler two-digit addition without carrying.' },
      { type: 'amber', text: '**Auditory learners scored 34% lower than visual learners** on this assignment. The ElevenLabs narration for math may need to be slower and include counting sounds. Consider adding audio cues like counting beeps alongside the narration.' },
      { type: 'amber', text: '**Sofia J. has now struggled with addition across 2 consecutive assignments.** This is a pattern, not a one-off. Recommend a 1:1 check-in and consider dropping her back to single-digit addition before moving forward.' },
      { type: 'info', text: '**The SpongeBob and Minecraft themes drove the highest engagement scores** (Liam 91%, Marcus 71% after reframe). For the next math assignment consider applying character themes to auditory learners as well — currently only visual mode uses them.' },
      { type: 'positive', text: '**Q1 and Q2 are well calibrated.** 80–92% success with minimal reframes. Use the same question structure and difficulty level as a baseline for the next assignment\'s opening questions.' },
      { type: 'positive', text: '**Liam M. is ready to advance.** 90% score, 91% engagement, zero reframes. He can move to two-digit addition without carrying in the next session.' },
    ],
  },
  {
    id: 'subtraction',
    subject: 'Mathematics',
    title: 'Subtraction',
    date: 'Apr 18',
    dot: 'teal',
    studentCount: 5,
    questionCount: 4,
    totalReframes: 2,
    overview: {
      avgScore: { value: 78, sub: 'across 5 students' },
      completion: { value: '100%', sub: '5 of 5 finished' },
      aiReframes: { value: 2, sub: '1 student triggered' },
      avgEngagement: { value: '81%', sub: '↑3% vs last assign' },
      scoreByStyle: [
        { style: 'Visual', pct: 85, color: 'var(--purple)' },
        { style: 'Auditory', pct: 65, color: 'var(--amber)' },
        { style: 'Reading', pct: 80, color: 'var(--amber)' },
      ],
      styleInsight: 'Visual learners performed best. Auditory mode may benefit from additional narration cues.',
      reframesByStrategy: [
        { strategy: 'Simplify', count: 1, color: 'var(--coral)' },
        { strategy: 'Add hint', count: 1, color: 'var(--teal)' },
      ],
      strategyInsight: 'Low reframe count indicates good question calibration for this topic.',
      heatmap: [
        { label: 'Q1', pct: 95, reframes: 0 },
        { label: 'Q2', pct: 80, reframes: 1 },
        { label: 'Q3', pct: 72, reframes: 1 },
        { label: 'Q4', pct: 65, reframes: 0 },
      ],
    },
    students: [
      { studentId: 'jamie', mode: 'Visual', score: 88, engagement: 85, reframes: 0, pattern: 'None' },
      { studentId: 'maya', mode: 'Auditory', score: 65, engagement: 72, reframes: 2, pattern: 'Needed audio re-read on Q3' },
      { studentId: 'eli', mode: 'Visual', score: 72, engagement: 78, reframes: 0, pattern: 'None' },
      { studentId: 'sofia', mode: 'Reading', score: 85, engagement: 88, reframes: 0, pattern: 'None' },
      { studentId: 'aisha', mode: 'Visual', score: 80, engagement: 82, reframes: 0, pattern: 'None' },
    ],
    reframeLog: [
      { studentId: 'maya', question: 'Q2', description: 'IDK pressed → auditory re-read with slower pacing', severity: 'Moderate' },
      { studentId: 'maya', question: 'Q3', description: '2 wrong attempts → hint added with visual support', severity: 'Mild' },
    ],
    questions: [
      { label: 'Q1', text: 'What is 8 − 3?', successPct: 95, reframes: 0, description: 'Well calibrated opener. All students answered within 30 seconds.', flagged: false },
      { label: 'Q2', text: 'What is 12 − 5?', successPct: 80, reframes: 1, description: 'One reframe needed. Crossing the 10 barrier was challenging for auditory mode.', flagged: false },
      { label: 'Q3', text: 'What is 15 − 7?', successPct: 72, reframes: 1, description: 'Moderate difficulty. Consider adding a visual number line for support.', flagged: false },
      { label: 'Q4', text: 'Word problem: 9 apples minus 4', successPct: 65, reframes: 0, description: 'Lower score but no frustration triggered. Word problem format is familiar.', flagged: false },
    ],
    insights: [
      { type: 'positive', text: '**Overall well-calibrated assignment.** 78% average with only 2 reframes shows good difficulty matching for the class.' },
      { type: 'amber', text: '**Maya K. continues to need extra support** with auditory mode for math. Consider switching her to visual mode with audio supplement.' },
      { type: 'positive', text: '**All students completed the assignment.** 100% completion rate is the best this month.' },
    ],
  },
  {
    id: 'counting20',
    subject: 'Mathematics',
    title: 'Counting to 20',
    date: 'Apr 10',
    dot: 'teal',
    studentCount: 5,
    questionCount: 4,
    totalReframes: 0,
    overview: {
      avgScore: { value: 92, sub: 'across 5 students' },
      completion: { value: '100%', sub: '5 of 5 finished' },
      aiReframes: { value: 0, sub: 'No reframes needed' },
      avgEngagement: { value: '88%', sub: '↑12% vs last assign' },
      scoreByStyle: [
        { style: 'Visual', pct: 94, color: 'var(--teal)' },
        { style: 'Auditory', pct: 88, color: 'var(--teal)' },
        { style: 'Reading', pct: 92, color: 'var(--teal)' },
      ],
      styleInsight: 'Consistent performance across all learning styles. Counting is well-understood.',
      reframesByStrategy: [],
      strategyInsight: 'No reframes were needed for this assignment.',
      heatmap: [
        { label: 'Q1', pct: 100, reframes: 0 },
        { label: 'Q2', pct: 95, reframes: 0 },
        { label: 'Q3', pct: 88, reframes: 0 },
        { label: 'Q4', pct: 85, reframes: 0 },
      ],
    },
    students: [
      { studentId: 'jamie', mode: 'Visual', score: 95, engagement: 90, reframes: 0, pattern: 'None' },
      { studentId: 'maya', mode: 'Auditory', score: 88, engagement: 85, reframes: 0, pattern: 'None' },
      { studentId: 'eli', mode: 'Visual', score: 85, engagement: 82, reframes: 0, pattern: 'None' },
      { studentId: 'sofia', mode: 'Reading', score: 98, engagement: 92, reframes: 0, pattern: 'None' },
      { studentId: 'aisha', mode: 'Visual', score: 94, engagement: 91, reframes: 0, pattern: 'None' },
    ],
    reframeLog: [],
    questions: [
      { label: 'Q1', text: 'Count from 1 to 10', successPct: 100, reframes: 0, description: 'Perfect score across all students.', flagged: false },
      { label: 'Q2', text: 'Count from 10 to 20', successPct: 95, reframes: 0, description: 'Near-perfect. One student self-corrected.', flagged: false },
      { label: 'Q3', text: 'What comes after 14?', successPct: 88, reframes: 0, description: 'Good comprehension of number sequencing.', flagged: false },
      { label: 'Q4', text: 'Fill in: 16, __, 18', successPct: 85, reframes: 0, description: 'Slightly harder pattern recognition, but well within ability.', flagged: false },
    ],
    insights: [
      { type: 'positive', text: '**Excellent results.** This topic is fully mastered. Ready to progress to counting beyond 20.' },
      { type: 'positive', text: '**Zero reframes needed.** The best-performing assignment this month.' },
    ],
  },
  {
    id: 'animals-story',
    subject: 'Reading',
    title: 'Animals story',
    date: 'Apr 23',
    dot: 'teal',
    studentCount: 5,
    questionCount: 5,
    totalReframes: 1,
    overview: {
      avgScore: { value: 82, sub: 'across 5 students' },
      completion: { value: '100%', sub: '5 of 5 finished' },
      aiReframes: { value: 1, sub: '1 student triggered' },
      avgEngagement: { value: '79%', sub: '↑2% vs last assign' },
      scoreByStyle: [
        { style: 'Visual', pct: 78, color: 'var(--amber)' },
        { style: 'Auditory', pct: 85, color: 'var(--teal)' },
        { style: 'Reading', pct: 88, color: 'var(--teal)' },
      ],
      styleInsight: 'Reading and auditory learners excelled. Visual learners may benefit from more illustrations.',
      reframesByStrategy: [
        { strategy: 'Simplify', count: 1, color: 'var(--coral)' },
      ],
      strategyInsight: 'Only one reframe needed — text simplification for a vocabulary question.',
      heatmap: [
        { label: 'Q1', pct: 95, reframes: 0 },
        { label: 'Q2', pct: 88, reframes: 0 },
        { label: 'Q3', pct: 78, reframes: 1 },
        { label: 'Q4', pct: 82, reframes: 0 },
        { label: 'Q5', pct: 70, reframes: 0 },
      ],
    },
    students: [
      { studentId: 'jamie', mode: 'Visual', score: 80, engagement: 75, reframes: 0, pattern: 'None' },
      { studentId: 'maya', mode: 'Auditory', score: 85, engagement: 82, reframes: 0, pattern: 'None' },
      { studentId: 'eli', mode: 'Visual', score: 70, engagement: 68, reframes: 1, pattern: 'Vocabulary Q3 challenge' },
      { studentId: 'sofia', mode: 'Reading', score: 92, engagement: 88, reframes: 0, pattern: 'None' },
      { studentId: 'aisha', mode: 'Visual', score: 83, engagement: 82, reframes: 0, pattern: 'None' },
    ],
    reframeLog: [
      { studentId: 'eli', question: 'Q3', description: 'Vocabulary word unfamiliar → text simplified, image hint added', severity: 'Mild' },
    ],
    questions: [
      { label: 'Q1', text: 'What animal is the story about?', successPct: 95, reframes: 0, description: 'Straightforward comprehension question.', flagged: false },
      { label: 'Q2', text: 'Where does the animal live?', successPct: 88, reframes: 0, description: 'Good recall from the text.', flagged: false },
      { label: 'Q3', text: 'What does "habitat" mean?', successPct: 78, reframes: 1, description: 'Vocabulary challenge for one student. Consider pre-teaching key words.', flagged: false },
      { label: 'Q4', text: 'What does the animal eat?', successPct: 82, reframes: 0, description: 'Students needed to find info in paragraph 2.', flagged: false },
      { label: 'Q5', text: 'Why is the animal important?', successPct: 70, reframes: 0, description: 'Open-ended inference question. Lower scores expected.', flagged: false },
    ],
    insights: [
      { type: 'positive', text: '**Strong reading comprehension overall.** 82% average shows the class is on track for grade-level reading.' },
      { type: 'amber', text: '**Eli R. struggled with vocabulary.** Consider adding a pre-reading vocabulary preview for future assignments.' },
    ],
  },
  {
    id: 'weather-words',
    subject: 'Reading',
    title: 'Weather words',
    date: 'Apr 15',
    dot: 'teal',
    studentCount: 5,
    questionCount: 4,
    totalReframes: 2,
    overview: {
      avgScore: { value: 76, sub: 'across 5 students' },
      completion: { value: '100%', sub: '5 of 5 finished' },
      aiReframes: { value: 2, sub: '2 students triggered' },
      avgEngagement: { value: '73%', sub: '' },
      scoreByStyle: [
        { style: 'Visual', pct: 80, color: 'var(--purple)' },
        { style: 'Auditory', pct: 70, color: 'var(--amber)' },
        { style: 'Reading', pct: 78, color: 'var(--amber)' },
      ],
      styleInsight: 'Visual aids like weather icons helped visual learners the most.',
      reframesByStrategy: [
        { strategy: 'Simplify', count: 1, color: 'var(--coral)' },
        { strategy: 'Add hint', count: 1, color: 'var(--teal)' },
      ],
      strategyInsight: 'Reframes were effective — both students improved after intervention.',
      heatmap: [
        { label: 'Q1', pct: 90, reframes: 0 },
        { label: 'Q2', pct: 78, reframes: 1 },
        { label: 'Q3', pct: 70, reframes: 1 },
        { label: 'Q4', pct: 65, reframes: 0 },
      ],
    },
    students: [
      { studentId: 'jamie', mode: 'Visual', score: 82, engagement: 78, reframes: 0, pattern: 'None' },
      { studentId: 'maya', mode: 'Auditory', score: 68, engagement: 65, reframes: 1, pattern: 'Needed re-read on Q2' },
      { studentId: 'eli', mode: 'Visual', score: 62, engagement: 64, reframes: 1, pattern: 'Spelling challenge' },
      { studentId: 'sofia', mode: 'Reading', score: 88, engagement: 82, reframes: 0, pattern: 'None' },
      { studentId: 'aisha', mode: 'Visual', score: 80, engagement: 76, reframes: 0, pattern: 'None' },
    ],
    reframeLog: [
      { studentId: 'maya', question: 'Q2', description: 'Audio re-read triggered after 2 wrong attempts', severity: 'Moderate' },
      { studentId: 'eli', question: 'Q3', description: 'Spelling hint provided after frustration signal', severity: 'Mild' },
    ],
    questions: [
      { label: 'Q1', text: 'Match the weather word to the picture', successPct: 90, reframes: 0, description: 'Visual matching worked well across all modes.', flagged: false },
      { label: 'Q2', text: 'What is "precipitation"?', successPct: 78, reframes: 1, description: 'Advanced vocabulary. One reframe needed.', flagged: false },
      { label: 'Q3', text: 'Spell the word for rain + snow', successPct: 70, reframes: 1, description: 'Spelling challenge. Consider offering word bank option.', flagged: false },
      { label: 'Q4', text: 'Which season has the most rain?', successPct: 65, reframes: 0, description: 'Requires prior knowledge. Consider adding context clues.', flagged: false },
    ],
    insights: [
      { type: 'positive', text: '**Good overall engagement with weather vocabulary.** Students showed interest in the topic.' },
      { type: 'amber', text: '**Spelling questions are consistently harder.** Consider offering word banks or multiple choice for spelling-focused questions.' },
    ],
  },
  {
    id: 'plants-lifecycle',
    subject: 'Science',
    title: 'Plants lifecycle',
    date: 'Apr 22',
    dot: 'amber',
    studentCount: 5,
    questionCount: 5,
    totalReframes: 4,
    overview: {
      avgScore: { value: 68, sub: 'across 5 students' },
      completion: { value: '80%', sub: '4 of 5 finished' },
      aiReframes: { value: 4, sub: '2 students triggered' },
      avgEngagement: { value: '65%', sub: '↓5% vs last assign' },
      scoreByStyle: [
        { style: 'Visual', pct: 75, color: 'var(--amber)' },
        { style: 'Auditory', pct: 55, color: 'var(--coral)' },
        { style: 'Reading', pct: 72, color: 'var(--amber)' },
      ],
      styleInsight: 'Auditory learners found science vocabulary challenging without visual support.',
      reframesByStrategy: [
        { strategy: 'Simplify', count: 2, color: 'var(--coral)' },
        { strategy: 'Switch mode', count: 1, color: 'var(--amber)' },
        { strategy: 'Add hint', count: 1, color: 'var(--teal)' },
      ],
      strategyInsight: 'Multiple strategies needed — topic may need scaffolding before next attempt.',
      heatmap: [
        { label: 'Q1', pct: 85, reframes: 0 },
        { label: 'Q2', pct: 72, reframes: 1 },
        { label: 'Q3', pct: 55, reframes: 2, flagged: true },
        { label: 'Q4', pct: 62, reframes: 1 },
        { label: 'Q5', pct: 68, reframes: 0 },
      ],
    },
    students: [
      { studentId: 'jamie', mode: 'Visual', score: 78, engagement: 72, reframes: 0, pattern: 'None' },
      { studentId: 'maya', mode: 'Auditory', score: 52, engagement: 55, reframes: 2, pattern: 'Vocabulary barrier' },
      { studentId: 'eli', mode: 'Visual', score: 58, engagement: 52, reframes: 2, pattern: 'Sequencing difficulty' },
      { studentId: 'sofia', mode: 'Reading', score: 82, engagement: 78, reframes: 0, pattern: 'None' },
      { studentId: 'aisha', mode: 'Visual', score: 70, engagement: 68, reframes: 0, pattern: 'None' },
    ],
    reframeLog: [
      { studentId: 'maya', question: 'Q3', description: 'Vocabulary "germination" unfamiliar → simplified to "seed growing"', severity: 'Moderate' },
      { studentId: 'maya', question: 'Q4', description: 'Continued struggle → switched to visual mode with diagram', severity: 'High' },
      { studentId: 'eli', question: 'Q3', description: 'Wrong sequence order ×3 → simplified to 3 steps instead of 5', severity: 'Moderate' },
      { studentId: 'eli', question: 'Q2', description: 'Hint added: visual lifecycle diagram shown', severity: 'Mild' },
    ],
    questions: [
      { label: 'Q1', text: 'What does a seed need to grow?', successPct: 85, reframes: 0, description: 'Good foundational question.', flagged: false },
      { label: 'Q2', text: 'Put the lifecycle stages in order', successPct: 72, reframes: 1, description: 'Sequencing is harder for some students.', flagged: false },
      { label: 'Q3', text: 'What is germination?', successPct: 55, reframes: 2, description: 'Science vocabulary challenge. Pre-teach terminology next time.', flagged: true },
      { label: 'Q4', text: 'What part of the plant makes food?', successPct: 62, reframes: 1, description: 'Requires recall of photosynthesis concept.', flagged: false },
      { label: 'Q5', text: 'Draw a plant and label its parts', successPct: 68, reframes: 0, description: 'Creative question — students enjoyed this but accuracy varied.', flagged: false },
    ],
    insights: [
      { type: 'warning', text: '**Science vocabulary is a significant barrier.** Consider adding a pre-lesson vocabulary activity before the next science assignment.' },
      { type: 'amber', text: '**Maya K. and Eli R. both struggled significantly.** This is a harder topic — consider creating a scaffolded version with simpler language.' },
      { type: 'info', text: '**The drawing question (Q5) had the highest engagement** despite not having the highest score. Consider using more creative formats.' },
    ],
  },
  {
    id: 'animal-habitats',
    subject: 'Science',
    title: 'Animal habitats',
    date: 'Apr 14',
    dot: 'teal',
    studentCount: 5,
    questionCount: 4,
    totalReframes: 1,
    overview: {
      avgScore: { value: 84, sub: 'across 5 students' },
      completion: { value: '100%', sub: '5 of 5 finished' },
      aiReframes: { value: 1, sub: '1 student triggered' },
      avgEngagement: { value: '80%', sub: '↑4% vs last assign' },
      scoreByStyle: [
        { style: 'Visual', pct: 88, color: 'var(--teal)' },
        { style: 'Auditory', pct: 78, color: 'var(--amber)' },
        { style: 'Reading', pct: 85, color: 'var(--teal)' },
      ],
      styleInsight: 'Animal topics engage all learning styles well. Visual aids were particularly effective.',
      reframesByStrategy: [
        { strategy: 'Add hint', count: 1, color: 'var(--teal)' },
      ],
      strategyInsight: 'Minimal intervention needed. Students were engaged with the topic.',
      heatmap: [
        { label: 'Q1', pct: 95, reframes: 0 },
        { label: 'Q2', pct: 85, reframes: 0 },
        { label: 'Q3', pct: 78, reframes: 1 },
        { label: 'Q4', pct: 80, reframes: 0 },
      ],
    },
    students: [
      { studentId: 'jamie', mode: 'Visual', score: 90, engagement: 85, reframes: 0, pattern: 'None' },
      { studentId: 'maya', mode: 'Auditory', score: 78, engagement: 75, reframes: 0, pattern: 'None' },
      { studentId: 'eli', mode: 'Visual', score: 72, engagement: 70, reframes: 1, pattern: 'Needed hint on Q3' },
      { studentId: 'sofia', mode: 'Reading', score: 92, engagement: 88, reframes: 0, pattern: 'None' },
      { studentId: 'aisha', mode: 'Visual', score: 88, engagement: 82, reframes: 0, pattern: 'None' },
    ],
    reframeLog: [
      { studentId: 'eli', question: 'Q3', description: 'Hint provided: image of arctic habitat shown', severity: 'Mild' },
    ],
    questions: [
      { label: 'Q1', text: 'Where do fish live?', successPct: 95, reframes: 0, description: 'Easy opener — strong confidence builder.', flagged: false },
      { label: 'Q2', text: 'Match animals to their habitats', successPct: 85, reframes: 0, description: 'Good engagement with matching format.', flagged: false },
      { label: 'Q3', text: 'What animals live in the arctic?', successPct: 78, reframes: 1, description: 'One student needed visual hint. Arctic is less familiar.', flagged: false },
      { label: 'Q4', text: 'Why do birds build nests?', successPct: 80, reframes: 0, description: 'Good inference question.', flagged: false },
    ],
    insights: [
      { type: 'positive', text: '**Strong results across the board.** Animal habitats is a high-engagement topic for this class.' },
      { type: 'positive', text: '**Eli R. performed better than average** on this assignment. Animal topics appear to be a strength.' },
    ],
  },
  {
    id: 'sharing-turns',
    subject: 'Social Skills',
    title: 'Sharing & taking turns',
    date: 'Apr 20',
    dot: 'teal',
    studentCount: 5,
    questionCount: 4,
    totalReframes: 0,
    overview: {
      avgScore: { value: 88, sub: 'across 5 students' },
      completion: { value: '100%', sub: '5 of 5 finished' },
      aiReframes: { value: 0, sub: 'No reframes needed' },
      avgEngagement: { value: '85%', sub: '↑6% vs last assign' },
      scoreByStyle: [
        { style: 'Visual', pct: 90, color: 'var(--teal)' },
        { style: 'Auditory', pct: 85, color: 'var(--teal)' },
        { style: 'Reading', pct: 88, color: 'var(--teal)' },
      ],
      styleInsight: 'Social skills topics perform consistently well across all learning styles.',
      reframesByStrategy: [],
      strategyInsight: 'No reframes needed — the interactive format kept students engaged.',
      heatmap: [
        { label: 'Q1', pct: 95, reframes: 0 },
        { label: 'Q2', pct: 90, reframes: 0 },
        { label: 'Q3', pct: 85, reframes: 0 },
        { label: 'Q4', pct: 82, reframes: 0 },
      ],
    },
    students: [
      { studentId: 'jamie', mode: 'Visual', score: 92, engagement: 88, reframes: 0, pattern: 'None' },
      { studentId: 'maya', mode: 'Auditory', score: 85, engagement: 82, reframes: 0, pattern: 'None' },
      { studentId: 'eli', mode: 'Visual', score: 80, engagement: 78, reframes: 0, pattern: 'None' },
      { studentId: 'sofia', mode: 'Reading', score: 95, engagement: 92, reframes: 0, pattern: 'None' },
      { studentId: 'aisha', mode: 'Visual', score: 88, engagement: 85, reframes: 0, pattern: 'None' },
    ],
    reframeLog: [],
    questions: [
      { label: 'Q1', text: 'When should you share?', successPct: 95, reframes: 0, description: 'Good understanding of sharing situations.', flagged: false },
      { label: 'Q2', text: 'How do you take turns?', successPct: 90, reframes: 0, description: 'Students demonstrated clear understanding.', flagged: false },
      { label: 'Q3', text: 'What if someone won\'t share?', successPct: 85, reframes: 0, description: 'Good problem-solving responses.', flagged: false },
      { label: 'Q4', text: 'Role play: sharing a toy', successPct: 82, reframes: 0, description: 'Interactive scenario was well-received.', flagged: false },
    ],
    insights: [
      { type: 'positive', text: '**Excellent results.** Social skills topics consistently have the highest engagement and completion rates.' },
      { type: 'positive', text: '**Zero reframes needed.** The class demonstrated strong social awareness.' },
    ],
  },
];

// ---- Helpers ----

export function getStudent(id) {
  return STUDENTS.find(s => s.id === id) || STUDENTS[0];
}

export function getAssignment(id) {
  return ASSIGNMENTS.find(a => a.id === id) || ASSIGNMENTS[0];
}

export function frustrationColor(level) {
  if (level === 'high')     return 'var(--coral)';
  if (level === 'moderate') return 'var(--amber)';
  return 'var(--teal)';
}

export function statusBadgeClass(status) {
  if (status === 'stress')  return 'badge-coral';
  if (status === 'alert')   return 'badge-amber';
  if (status === 'offline') return 'badge-gray';
  return 'badge-teal';
}

export function statusLabel(status) {
  if (status === 'stress')  return 'Struggling';
  if (status === 'alert')   return 'Alert';
  if (status === 'offline') return 'Offline';
  return 'Calm';
}
