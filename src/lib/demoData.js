// ============================================================
//  demoData.js
//  Pre-generated lesson data for demo/hackathon presentations.
//  These are pre-approved lessons that load instantly without
//  waiting for AI generation. Each student gets their modality-
//  specific content themed to their character.
// ============================================================

export const DEMO_WORKSHEET = {
  title: 'Adding Fractions Worksheet',
  subject: 'Math',
  rawContent: `Adding Fractions — Show your work!

Problem 1: 4/5 + 1/3 = ?
Problem 2: 2/7 + 3/4 = ?
Problem 3: 1/2 + 2/3 = ?
Problem 4: 3/8 + 1/4 = ?
Problem 5: 5/6 + 1/2 = ?

Remember: When adding fractions with different denominators,
find the common denominator first!`,
};

// Pre-generated adapted lessons for each student
export const DEMO_ADAPTED_LESSONS = {
  // ─── AISHA (Visual / SpongeBob) ─────────────────────────────────────
  aisha: {
    adaptedText: "SpongeBob is making Krabby Patty fractions at the Krusty Krab! Look at the pictures to see how fractions combine!",
    character: 'SpongeBob',
    mode: 'Visual',
    cloudinaryPrompt: 'SpongeBob SquarePants in the Krusty Krab kitchen dividing Krabby Patties into fraction pieces',
    questions: [
      {
        id: 'dq1', text: '4/5 + 1/3 = ?',
        options: ['17/15', '5/8', '12/15', '7/15'],
        correctIndex: 0,
        hint: 'Find the common denominator (15). 4/5 = 12/15, 1/3 = 5/15. Add: 12+5 = 17/15',
      },
      {
        id: 'dq2', text: '2/7 + 3/4 = ?',
        options: ['5/11', '29/28', '23/28', '8/28'],
        correctIndex: 1,
        hint: 'Common denominator is 28. 2/7 = 8/28, 3/4 = 21/28. Add: 8+21 = 29/28',
      },
      {
        id: 'dq3', text: '1/2 + 2/3 = ?',
        options: ['3/5', '5/6', '7/6', '4/6'],
        correctIndex: 2,
        hint: 'Common denominator is 6. 1/2 = 3/6, 2/3 = 4/6. Add: 3+4 = 7/6',
      },
      {
        id: 'dq4', text: '3/8 + 1/4 = ?',
        options: ['4/12', '5/8', '4/8', '7/8'],
        correctIndex: 1,
        hint: 'Common denominator is 8. 1/4 = 2/8. Add: 3+2 = 5/8',
      },
      {
        id: 'dq5', text: '5/6 + 1/2 = ?',
        options: ['6/8', '4/3', '7/6', '8/6'],
        correctIndex: 2,
        hint: 'Common denominator is 6. 1/2 = 3/6. Add: 5+3 = 8/6... wait, that is 8/6! But simplified: 4/3',
      },
    ],
    interactiveHtml: `<!DOCTYPE html>
<html><head><style>
* { margin: 0; padding: 0; box-sizing: border-box; }
body { font-family: 'Comic Sans MS', cursive; background: linear-gradient(135deg, #FFE135 0%, #87CEEB 100%); min-height: 100vh; padding: 20px; }
.container { max-width: 800px; margin: 0 auto; }
.header { text-align: center; margin-bottom: 20px; }
.header h1 { color: #8B4513; font-size: 28px; text-shadow: 2px 2px 0 #FFE135; }
.character-area { display: flex; align-items: center; gap: 16px; background: rgba(255,255,255,0.9); border-radius: 20px; padding: 20px; margin-bottom: 20px; border: 3px solid #FFE135; }
.character-area img { width: 120px; height: 120px; object-fit: contain; border-radius: 50%; background: #87CEEB; }
.speech-bubble { background: white; border-radius: 20px; padding: 16px; position: relative; border: 2px solid #FFE135; flex: 1; }
.speech-bubble::before { content: ''; position: absolute; left: -12px; top: 20px; border: 6px solid transparent; border-right-color: #FFE135; }
.fraction-visual { display: flex; gap: 20px; justify-content: center; align-items: center; margin: 20px 0; }
.fraction-bar { width: 200px; height: 40px; border-radius: 8px; overflow: hidden; display: flex; border: 2px solid #333; }
.fraction-bar .filled { background: #FF6B35; }
.fraction-bar .empty { background: #f0f0f0; }
.problem-card { background: white; border-radius: 16px; padding: 20px; margin-bottom: 16px; border: 3px solid #87CEEB; }
.problem-card h3 { color: #8B4513; margin-bottom: 12px; }
.step { padding: 8px 12px; margin: 4px 0; background: #FFF8E7; border-radius: 8px; font-size: 14px; }
.step strong { color: #FF6B35; }
</style></head><body>
<div class="container">
  <div class="header"><h1>SpongeBob's Fraction Kitchen!</h1></div>
  <div class="character-area">
    <img id="character-image" src="CHARACTER_IMAGE_PLACEHOLDER" alt="SpongeBob" onerror="this.style.display='none'" />
    <div class="speech-bubble">
      <strong>SpongeBob says:</strong> "I'm ready! I'm ready! Let's learn about adding fractions by cutting Krabby Patties into equal pieces!"
    </div>
  </div>
  <div class="problem-card">
    <h3>How to Add Fractions</h3>
    <div class="step"><strong>Step 1:</strong> Look at the bottom numbers (denominators)</div>
    <div class="step"><strong>Step 2:</strong> Find a common denominator</div>
    <div class="step"><strong>Step 3:</strong> Convert each fraction</div>
    <div class="step"><strong>Step 4:</strong> Add the top numbers (numerators)</div>
    <div class="step"><strong>Step 5:</strong> Keep the bottom number the same!</div>
  </div>
  <div class="problem-card">
    <h3>Example: 4/5 + 1/3</h3>
    <div class="fraction-visual">
      <div><div class="fraction-bar"><div class="filled" style="width:80%"></div><div class="empty" style="width:20%"></div></div><div style="text-align:center;margin-top:4px">4/5</div></div>
      <span style="font-size:24px;font-weight:bold">+</span>
      <div><div class="fraction-bar"><div class="filled" style="width:33%"></div><div class="empty" style="width:67%"></div></div><div style="text-align:center;margin-top:4px">1/3</div></div>
      <span style="font-size:24px;font-weight:bold">=</span>
      <div><div class="fraction-bar"><div class="filled" style="width:100%"></div></div><div style="text-align:center;margin-top:4px">17/15</div></div>
    </div>
    <div class="step">Common denominator: 15</div>
    <div class="step">4/5 = 12/15 and 1/3 = 5/15</div>
    <div class="step"><strong>12/15 + 5/15 = 17/15</strong></div>
  </div>
</div>
</body></html>`,
    elevenLabsScript: '',
    chatContext: 'SpongeBob-themed fraction addition help for visual learner',
  },

  // ─── JAMIE (Visual / Bluey) ─────────────────────────────────────
  jamie: {
    adaptedText: "Bluey and Bingo are sharing treats! Help them figure out fractions by looking at the pictures!",
    character: 'Bluey',
    mode: 'Visual',
    cloudinaryPrompt: 'Bluey the cartoon dog sharing treats equally with Bingo showing fraction concepts',
    questions: [
      {
        id: 'dq1', text: '4/5 + 1/3 = ?',
        options: ['17/15', '5/8', '12/15', '7/15'],
        correctIndex: 0,
        hint: 'Bluey says: Find the common denominator! 5 and 3 both go into 15.',
      },
      {
        id: 'dq2', text: '2/7 + 3/4 = ?',
        options: ['5/11', '29/28', '23/28', '8/28'],
        correctIndex: 1,
        hint: 'Bingo says: 7 and 4 both go into 28!',
      },
      {
        id: 'dq3', text: '1/2 + 2/3 = ?',
        options: ['3/5', '5/6', '7/6', '4/6'],
        correctIndex: 2,
        hint: 'Common denominator is 6. 3/6 + 4/6 = 7/6!',
      },
      {
        id: 'dq4', text: '3/8 + 1/4 = ?',
        options: ['4/12', '5/8', '4/8', '7/8'],
        correctIndex: 1,
        hint: '1/4 is the same as 2/8. Then 3/8 + 2/8 = 5/8!',
      },
      {
        id: 'dq5', text: '5/6 + 1/2 = ?',
        options: ['6/8', '4/3', '7/6', '8/6'],
        correctIndex: 2,
        hint: '1/2 is the same as 3/6. Then 5/6 + 3/6 = 8/6!',
      },
    ],
    interactiveHtml: `<!DOCTYPE html>
<html><head><style>
* { margin: 0; padding: 0; box-sizing: border-box; }
body { font-family: 'Comic Sans MS', cursive; background: linear-gradient(135deg, #5B9BD5 0%, #A8D8EA 50%, #FFD93D 100%); min-height: 100vh; padding: 20px; }
.container { max-width: 800px; margin: 0 auto; }
.header { text-align: center; background: rgba(255,255,255,0.95); border-radius: 24px; padding: 20px; margin-bottom: 20px; border: 4px solid #5B9BD5; }
.header h1 { color: #2C5F8A; font-size: 28px; }
.character-area { display: flex; align-items: center; gap: 16px; background: rgba(255,255,255,0.9); border-radius: 20px; padding: 20px; margin-bottom: 20px; border: 3px solid #5B9BD5; }
.character-area img { width: 120px; height: 120px; object-fit: contain; }
.speech { background: #E8F4FD; border-radius: 20px; padding: 16px; flex: 1; border: 2px solid #5B9BD5; font-size: 15px; }
.card { background: white; border-radius: 16px; padding: 20px; margin-bottom: 16px; border: 3px solid #A8D8EA; }
.card h3 { color: #2C5F8A; margin-bottom: 12px; }
.pie-container { display: flex; gap: 24px; justify-content: center; margin: 16px 0; }
.pie { width: 100px; height: 100px; border-radius: 50%; border: 3px solid #333; position: relative; overflow: hidden; }
.step { padding: 8px 12px; margin: 4px 0; background: #E8F4FD; border-radius: 8px; font-size: 14px; }
</style></head><body>
<div class="container">
  <div class="header"><h1>Bluey's Fraction Fun!</h1></div>
  <div class="character-area">
    <img id="character-image" src="CHARACTER_IMAGE_PLACEHOLDER" alt="Bluey" onerror="this.style.display='none'" />
    <div class="speech"><strong>Bluey says:</strong> "Wackadoo! Let's learn fractions by sharing treats with Bingo! When we share, we use fractions!"</div>
  </div>
  <div class="card">
    <h3>Sharing Treats Equally</h3>
    <div class="step">When Bluey and Bingo share treats, they need to cut them into equal pieces.</div>
    <div class="step">The <strong>bottom number</strong> tells us how many pieces total.</div>
    <div class="step">The <strong>top number</strong> tells us how many pieces we have.</div>
    <div class="step">To add fractions, make the pieces the <strong>same size</strong> first!</div>
  </div>
  <div class="card">
    <h3>Example: 4/5 + 1/3</h3>
    <div class="step">Both fractions need pieces of the same size (common denominator = 15)</div>
    <div class="step">4/5 becomes 12/15 (multiply top and bottom by 3)</div>
    <div class="step">1/3 becomes 5/15 (multiply top and bottom by 5)</div>
    <div class="step"><strong>12/15 + 5/15 = 17/15!</strong> That's more than one whole treat!</div>
  </div>
</div>
</body></html>`,
    elevenLabsScript: '',
    chatContext: 'Bluey-themed fraction addition help for visual learner',
  },

  // ─── MAYA (Auditory / Paw Patrol) ─────────────────────────────────
  maya: {
    adaptedText: "Listen to Ryder explain how fractions work! The Paw Patrol pups will help you understand!",
    character: 'Paw Patrol',
    mode: 'Auditory',
    cloudinaryPrompt: '',
    elevenLabsScript: `Hey Maya! It's Ryder from Paw Patrol here! Today we're going to learn about adding fractions together, and the pups are going to help us!

Imagine Chase and Marshall are sharing dog treats. If Chase has 4 out of 5 treats in one bowl, that's four-fifths. And if Marshall has 1 out of 3 treats in another bowl, that's one-third.

To add these fractions together, we need to make sure the pieces are the same size. We call this finding a common denominator. For 5 and 3, both go into 15.

So four-fifths becomes twelve-fifteenths, because we multiply both top and bottom by 3. And one-third becomes five-fifteenths, because we multiply both top and bottom by 5.

Now we can add them: twelve-fifteenths plus five-fifteenths equals seventeen-fifteenths! That's more than one whole, which means Chase and Marshall have more than enough treats to share!

Let's try more problems together. Remember, whenever the bottom numbers are different, find that common denominator first. You've got this, Maya! No job is too big, no pup is too small!`,
    chatContext: 'Paw Patrol Ryder-themed fraction tutoring for auditory learner. Use encouraging language and sound references.',
    questions: [
      {
        id: 'dq1', text: '4/5 + 1/3 = ?',
        options: ['17/15', '5/8', '12/15', '7/15'],
        correctIndex: 0,
        hint: 'Ryder says: Remember, find the common denominator first! 5 and 3 both go into 15.',
      },
      {
        id: 'dq2', text: '2/7 + 3/4 = ?',
        options: ['5/11', '29/28', '23/28', '8/28'],
        correctIndex: 1,
        hint: 'Chase says: 7 times 4 is 28. That is your common denominator!',
      },
      {
        id: 'dq3', text: '1/2 + 2/3 = ?',
        options: ['3/5', '5/6', '7/6', '4/6'],
        correctIndex: 2,
        hint: 'Marshall says: 2 and 3 both go into 6!',
      },
      {
        id: 'dq4', text: '3/8 + 1/4 = ?',
        options: ['4/12', '5/8', '4/8', '7/8'],
        correctIndex: 1,
        hint: 'Skye says: 4 goes into 8! So 1/4 = 2/8!',
      },
      {
        id: 'dq5', text: '5/6 + 1/2 = ?',
        options: ['6/8', '4/3', '7/6', '8/6'],
        correctIndex: 2,
        hint: 'Rubble says: 1/2 is the same as 3/6!',
      },
    ],
    interactiveHtml: '',
  },

  // ─── ELI (Kinesthetic / Minecraft Steve) ─────────────────────────────
  eli: {
    adaptedText: "Steve is building fraction blocks in Minecraft! Click, drag, and interact to learn fractions!",
    character: 'Minecraft Steve',
    mode: 'Kinesthetic',
    cloudinaryPrompt: '',
    elevenLabsScript: '',
    chatContext: 'Minecraft-themed fraction help for kinesthetic learner. Use building/crafting metaphors.',
    questions: [
      {
        id: 'dq1', text: '4/5 + 1/3 = ?',
        options: ['17/15', '5/8', '12/15', '7/15'],
        correctIndex: 0,
        hint: 'Steve says: Build 12 blocks out of 15 for the first fraction, then add 5 more!',
      },
      {
        id: 'dq2', text: '2/7 + 3/4 = ?',
        options: ['5/11', '29/28', '23/28', '8/28'],
        correctIndex: 1,
        hint: 'Craft a 28-block wall. Fill 8 blocks for 2/7 and 21 blocks for 3/4!',
      },
      {
        id: 'dq3', text: '1/2 + 2/3 = ?',
        options: ['3/5', '5/6', '7/6', '4/6'],
        correctIndex: 2,
        hint: 'Build a row of 6 blocks. Fill 3 for 1/2 and 4 for 2/3!',
      },
      {
        id: 'dq4', text: '3/8 + 1/4 = ?',
        options: ['4/12', '5/8', '4/8', '7/8'],
        correctIndex: 1,
        hint: '1/4 is the same as 2/8 blocks. So 3+2 = 5 out of 8!',
      },
      {
        id: 'dq5', text: '5/6 + 1/2 = ?',
        options: ['6/8', '4/3', '7/6', '8/6'],
        correctIndex: 2,
        hint: '1/2 = 3/6, so 5+3 = 8... wait, that gives 8/6!',
      },
    ],
    // Claude would normally generate this, using a pre-built version for demo
    interactiveHtml: `<!DOCTYPE html>
<html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Steve's Fraction Workshop</title>
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:'Courier New',monospace;background:linear-gradient(180deg,#87CEEB 0%,#87CEEB 60%,#228B22 60%,#228B22 100%);min-height:100vh;color:#333}
.container{max-width:900px;margin:0 auto;padding:20px}
.header{background:#5D4037;border:4px solid #3E2723;padding:16px 24px;text-align:center;margin-bottom:20px;image-rendering:pixelated}
.header h1{color:#8BC34A;font-size:26px;text-shadow:2px 2px #2E7D32;letter-spacing:2px}
.progress-bar{width:100%;height:24px;background:#795548;border:3px solid #3E2723;margin:12px 0;position:relative}
.progress-fill{height:100%;background:#8BC34A;transition:width 0.5s;position:relative}
.progress-fill::after{content:'';position:absolute;right:0;top:0;bottom:0;width:4px;background:#689F38}
.progress-text{position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);color:white;font-weight:bold;font-size:12px;z-index:1}
.tabs{display:flex;gap:4px;margin-bottom:16px}
.tab{flex:1;padding:12px;background:#795548;color:white;border:3px solid #3E2723;cursor:pointer;text-align:center;font-weight:bold;font-family:'Courier New',monospace;font-size:14px}
.tab.active{background:#8BC34A;color:#1B5E20}
.tab:hover{opacity:0.9}
.panel{background:rgba(255,255,255,0.95);border:4px solid #5D4037;padding:24px;min-height:400px}
.speech-bubble{background:#E8F5E9;border:3px solid #4CAF50;border-radius:0;padding:16px;margin-bottom:20px;position:relative}
.speech-bubble::before{content:'Steve:';font-weight:bold;color:#2E7D32;display:block;margin-bottom:4px}
.fraction-display{display:flex;align-items:center;justify-content:center;gap:24px;margin:24px 0;flex-wrap:wrap}
.block-grid{display:grid;gap:3px;padding:4px;background:#5D4037;border:3px solid #3E2723}
.block{width:36px;height:36px;border:2px solid rgba(0,0,0,0.2);transition:all 0.3s}
.block.filled{background:#8BC34A;box-shadow:inset -2px -2px 0 #689F38,inset 2px 2px 0 #AED581}
.block.empty{background:#BCAAA4;box-shadow:inset -2px -2px 0 #8D6E63,inset 2px 2px 0 #D7CCC8}
.block.highlight{animation:pulse 0.6s ease-in-out infinite alternate}
@keyframes pulse{0%{transform:scale(1)}100%{transform:scale(1.1);box-shadow:0 0 12px #FFEB3B}}
.operator{font-size:36px;font-weight:bold;color:#5D4037}
.slider-area{margin:20px 0;text-align:center}
.slider-area input[type=range]{width:80%;height:24px;-webkit-appearance:none;background:#795548;border:3px solid #3E2723;outline:none}
.slider-area input[type=range]::-webkit-slider-thumb{-webkit-appearance:none;width:28px;height:28px;background:#8BC34A;border:3px solid #2E7D32;cursor:pointer}
.slider-label{font-size:20px;font-weight:bold;color:#5D4037;margin-top:8px}
.btn{padding:12px 24px;font-family:'Courier New',monospace;font-size:16px;font-weight:bold;border:3px solid #3E2723;cursor:pointer;margin:4px}
.btn-primary{background:#8BC34A;color:#1B5E20}.btn-primary:hover{background:#AED581}
.btn-check{background:#2196F3;color:white}.btn-check:hover{background:#64B5F6}
.btn-next{background:#FF9800;color:white}.btn-next:hover{background:#FFB74D}
.result{padding:16px;margin:12px 0;font-weight:bold;text-align:center;font-size:18px;border:3px solid}
.result.correct{background:#E8F5E9;border-color:#4CAF50;color:#2E7D32}
.result.wrong{background:#FFEBEE;border-color:#F44336;color:#C62828;animation:shake 0.4s}
@keyframes shake{0%,100%{transform:translateX(0)}25%{transform:translateX(-8px)}75%{transform:translateX(8px)}}
.confetti-container{position:fixed;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:999}
.confetti{position:absolute;width:10px;height:10px;animation:fall linear forwards}
@keyframes fall{0%{transform:translateY(-10px) rotate(0deg);opacity:1}100%{transform:translateY(100vh) rotate(720deg);opacity:0}}
.score{background:#5D4037;color:#8BC34A;padding:8px 16px;display:inline-block;font-weight:bold;border:3px solid #3E2723;margin-bottom:16px}
</style></head><body>
<div class="container">
<div class="header">
<h1>Steve's Fraction Workshop</h1>
<div class="progress-bar"><div class="progress-fill" id="progressFill" style="width:0%"></div><div class="progress-text" id="progressText">0 / 5</div></div>
</div>
<div class="tabs">
<div class="tab active" onclick="showTab('learn')" id="tabLearn">Learn</div>
<div class="tab" onclick="showTab('explore')" id="tabExplore">Explore</div>
<div class="tab" onclick="showTab('practice')" id="tabPractice">Practice</div>
</div>
<div class="panel" id="panelLearn">
<div class="speech-bubble">Welcome to my fraction workshop! In Minecraft, everything is made of blocks. Fractions work the same way - they tell us how many blocks out of the total are filled in!</div>
<h3 style="color:#5D4037;margin:16px 0 12px">Adding Fractions: Step by Step</h3>
<div class="speech-bubble">Let's add 4/5 + 1/3. First, we need blocks of the same size. Both 5 and 3 fit into 15!</div>
<div class="fraction-display">
<div>
<div class="block-grid" style="grid-template-columns:repeat(5,1fr)"><div class="block filled"></div><div class="block filled"></div><div class="block filled"></div><div class="block filled"></div><div class="block empty"></div></div>
<div style="text-align:center;margin-top:8px;font-weight:bold">4/5</div></div>
<div class="operator">+</div>
<div>
<div class="block-grid" style="grid-template-columns:repeat(3,1fr)"><div class="block filled"></div><div class="block empty"></div><div class="block empty"></div></div>
<div style="text-align:center;margin-top:8px;font-weight:bold">1/3</div></div>
</div>
<div class="speech-bubble">Now convert to fifteenths: 4/5 = 12/15 and 1/3 = 5/15</div>
<div class="fraction-display">
<div>
<div class="block-grid" style="grid-template-columns:repeat(5,1fr)"><div class="block filled"></div><div class="block filled"></div><div class="block filled"></div><div class="block filled"></div><div class="block filled"></div><div class="block filled"></div><div class="block filled"></div><div class="block filled"></div><div class="block filled"></div><div class="block filled"></div><div class="block filled"></div><div class="block filled"></div><div class="block empty"></div><div class="block empty"></div><div class="block empty"></div></div>
<div style="text-align:center;margin-top:8px;font-weight:bold">12/15</div></div>
<div class="operator">+</div>
<div>
<div class="block-grid" style="grid-template-columns:repeat(5,1fr)"><div class="block filled"></div><div class="block filled"></div><div class="block filled"></div><div class="block filled"></div><div class="block filled"></div><div class="block empty"></div><div class="block empty"></div><div class="block empty"></div><div class="block empty"></div><div class="block empty"></div><div class="block empty"></div><div class="block empty"></div><div class="block empty"></div><div class="block empty"></div><div class="block empty"></div></div>
<div style="text-align:center;margin-top:8px;font-weight:bold">5/15</div></div>
<div class="operator">=</div>
<div>
<div class="block-grid" style="grid-template-columns:repeat(5,1fr)"><div class="block filled"></div><div class="block filled"></div><div class="block filled"></div><div class="block filled"></div><div class="block filled"></div><div class="block filled"></div><div class="block filled"></div><div class="block filled"></div><div class="block filled"></div><div class="block filled"></div><div class="block filled"></div><div class="block filled"></div><div class="block filled"></div><div class="block filled"></div><div class="block filled"></div></div>
<div style="text-align:center;margin-top:8px;font-weight:bold;color:#2E7D32">17/15!</div></div>
</div>
<button class="btn btn-next" onclick="showTab('explore')">Next: Try the Slider! &rarr;</button>
</div>
<div class="panel" id="panelExplore" style="display:none">
<div class="speech-bubble">Use the sliders to build your own fractions! Watch the blocks fill in as you change the numbers.</div>
<div class="slider-area">
<label>Numerator: <span id="numVal">1</span></label><br>
<input type="range" min="0" max="15" value="1" oninput="updateSlider()"><br><br>
<label>Denominator: <span id="denVal">4</span></label><br>
<input type="range" min="1" max="15" value="4" oninput="updateSlider()">
</div>
<div class="slider-label" id="fractionLabel">1/4</div>
<div id="sliderBlocks" style="display:flex;justify-content:center;margin:16px 0"></div>
<button class="btn btn-next" onclick="showTab('practice')">Ready to Practice! &rarr;</button>
</div>
<div class="panel" id="panelPractice" style="display:none">
<div class="score">Score: <span id="score">0</span> / 5</div>
<div id="practiceArea"></div>
<div id="confettiContainer" class="confetti-container"></div>
</div>
</div>
<script>
const problems=[{q:'4/5 + 1/3',a:'17/15',opts:['17/15','5/8','12/15','7/15']},{q:'2/7 + 3/4',a:'29/28',opts:['5/11','29/28','23/28','8/28']},{q:'1/2 + 2/3',a:'7/6',opts:['3/5','5/6','7/6','4/6']},{q:'3/8 + 1/4',a:'5/8',opts:['4/12','5/8','4/8','7/8']},{q:'5/6 + 1/2',a:'8/6',opts:['6/8','4/3','7/6','8/6']}];
let current=0,score=0,answered=new Set();
function showTab(t){document.querySelectorAll('.panel').forEach(p=>p.style.display='none');document.querySelectorAll('.tab').forEach(b=>b.classList.remove('active'));document.getElementById('panel'+t.charAt(0).toUpperCase()+t.slice(1)).style.display='block';document.getElementById('tab'+t.charAt(0).toUpperCase()+t.slice(1)).classList.add('active');if(t==='practice'&&!answered.size)renderProblem();}
function updateSlider(){const s=document.querySelectorAll('input[type=range]');const n=parseInt(s[0].value),d=parseInt(s[1].value);document.getElementById('numVal').textContent=n;document.getElementById('denVal').textContent=d;document.getElementById('fractionLabel').textContent=n+'/'+d;let html='<div class="block-grid" style="grid-template-columns:repeat('+Math.min(d,10)+',1fr)">';for(let i=0;i<d;i++){html+='<div class="block '+(i<n?'filled':'empty')+'"></div>';}html+='</div>';document.getElementById('sliderBlocks').innerHTML=html;}
function renderProblem(){if(current>=problems.length){document.getElementById('practiceArea').innerHTML='<div class="result correct" style="font-size:24px">All Done! Score: '+score+'/5</div>';celebrate();return;}
const p=problems[current];let html='<div class="speech-bubble">Problem '+(current+1)+': What is '+p.q+'?</div><div style="display:flex;flex-wrap:wrap;gap:8px;margin:16px 0">';
p.opts.forEach((o,i)=>{html+='<button class="btn btn-check" onclick="checkAnswer('+i+',\''+o+'\',\''+p.a+'\')">'+o+'</button>';});
html+='</div><div id="feedback"></div>';document.getElementById('practiceArea').innerHTML=html;}
function checkAnswer(i,selected,correct){if(answered.has(current))return;const ok=selected===correct;document.getElementById('feedback').innerHTML='<div class="result '+(ok?'correct':'wrong')+'">'+(ok?'Correct! Great building, Steve!':'Not quite... Try thinking about the common denominator!')+'</div>';
if(ok){score++;answered.add(current);document.getElementById('score').textContent=score;const pct=((answered.size)/5*100);document.getElementById('progressFill').style.width=pct+'%';document.getElementById('progressText').textContent=answered.size+' / 5';
setTimeout(()=>{current++;renderProblem();},1500);}else{setTimeout(()=>{document.getElementById('feedback').innerHTML='';},2000);}}
function celebrate(){const c=document.getElementById('confettiContainer');const colors=['#8BC34A','#FF9800','#2196F3','#F44336','#FFEB3B','#9C27B0'];for(let i=0;i<60;i++){const d=document.createElement('div');d.className='confetti';d.style.left=Math.random()*100+'%';d.style.background=colors[Math.floor(Math.random()*colors.length)];d.style.animationDuration=(2+Math.random()*3)+'s';d.style.animationDelay=Math.random()*2+'s';c.appendChild(d);}}
updateSlider();
</script></body></html>`,
  },

  // ─── SOFIA (Reading / Encanto) ─────────────────────────────────────
  sofia: {
    adaptedText: `Mirabel's Fraction Adventure!

Hola, Sofia! Mirabel from Encanto needs your help with some magic fraction problems!

In the Casita, the Madrigal family is preparing for a big celebration. They need to combine different amounts of ingredients. But the ingredients come in different-sized portions - that means fractions with different denominators!

**How to Add Fractions with Different Denominators:**

When the bottom numbers (denominators) are different, we need to find a common size first. It's like when Luisa needs to stack blocks of different sizes - she arranges them so they all fit together!

**Step 1:** Look at the denominators (bottom numbers)
**Step 2:** Find the Least Common Denominator (LCD) - the smallest number both denominators divide into
**Step 3:** Convert each fraction to use the LCD
**Step 4:** Add the numerators (top numbers)
**Step 5:** Keep the denominator the same

**Example: 4/5 + 1/3**
- LCD of 5 and 3 = 15
- 4/5 = 12/15 (multiply top and bottom by 3)
- 1/3 = 5/15 (multiply top and bottom by 5)
- 12/15 + 5/15 = **17/15** (or 1 and 2/15)

Mirabel says: "We don't talk about different denominators... we just find the common one!" Now try the problems below!`,
    character: 'Mirabel (Encanto)',
    mode: 'Reading',
    cloudinaryPrompt: '',
    elevenLabsScript: '',
    chatContext: `You are a friendly math tutor helping Sofia learn about adding fractions. Sofia is a Reading learner who loves Encanto and Mirabel. Use Encanto references and metaphors. Explain step by step and be encouraging. Sofia's frustration triggers include ambiguous instructions, so always be clear and specific.`,
    questions: [
      {
        id: 'dq1', text: '4/5 + 1/3 = ?',
        options: ['17/15', '5/8', '12/15', '7/15'],
        correctIndex: 0,
        hint: 'Mirabel says: Find the LCD! 5 and 3 both go into 15. Then convert: 12/15 + 5/15 = ?',
      },
      {
        id: 'dq2', text: '2/7 + 3/4 = ?',
        options: ['5/11', '29/28', '23/28', '8/28'],
        correctIndex: 1,
        hint: 'Luisa says: Build a stack of 28! 2/7 = 8/28 and 3/4 = 21/28.',
      },
      {
        id: 'dq3', text: '1/2 + 2/3 = ?',
        options: ['3/5', '5/6', '7/6', '4/6'],
        correctIndex: 2,
        hint: 'Isabela says: The LCD of 2 and 3 is 6. Convert: 3/6 + 4/6 = 7/6!',
      },
      {
        id: 'dq4', text: '3/8 + 1/4 = ?',
        options: ['4/12', '5/8', '4/8', '7/8'],
        correctIndex: 1,
        hint: 'Bruno says: I see the future... 1/4 = 2/8, so 3/8 + 2/8 = 5/8!',
      },
      {
        id: 'dq5', text: '5/6 + 1/2 = ?',
        options: ['6/8', '4/3', '7/6', '8/6'],
        correctIndex: 2,
        hint: 'The Casita rumbles with excitement! 1/2 = 3/6, so 5/6 + 3/6 = 8/6!',
      },
    ],
    interactiveHtml: '',
  },
};

// ─── Frustration demo scenarios ─────────────────────────────────────
// Simulated events for the demo showing frustration detection → auto-reframe
export const DEMO_FRUSTRATION_EVENTS = [
  {
    id: 'frust-1',
    studentId: 'eli',
    studentName: 'Eli R.',
    timestamp: new Date(Date.now() - 300000).toISOString(), // 5 min ago
    trigger: '3 consecutive wrong answers on Q3',
    triggerType: 'wrong_attempts',
    frustrationScore: 82,
    question: 'Q3: 1/2 + 2/3 = ?',
    beforeState: 'Kinesthetic mode — standard fraction blocks',
    afterState: 'Regenerated with step-by-step guided walkthrough + simplified blocks',
    status: 'auto-reframed',
    severity: 'high',
    resolution: 'Auto-regenerated interactive lesson with smaller steps. Student completed after reframe.',
  },
  {
    id: 'frust-2',
    studentId: 'maya',
    studentName: 'Maya K.',
    timestamp: new Date(Date.now() - 600000).toISOString(), // 10 min ago
    trigger: 'Rapid clicking detected (5 clicks in 4 seconds)',
    triggerType: 'rapid_clicks',
    frustrationScore: 58,
    question: 'Q2: 2/7 + 3/4 = ?',
    beforeState: 'Auditory narration — standard pacing',
    afterState: 'Re-read narration at slower pace with additional hints',
    status: 'auto-reframed',
    severity: 'moderate',
    resolution: 'Audio narration replayed at 0.8x speed with extra step breakdown.',
  },
  {
    id: 'frust-3',
    studentId: 'eli',
    studentName: 'Eli R.',
    timestamp: new Date(Date.now() - 180000).toISOString(), // 3 min ago
    trigger: 'Typed "this is too hard" in chat',
    triggerType: 'keyword',
    frustrationScore: 90,
    question: 'Q4: 3/8 + 1/4 = ?',
    beforeState: 'Standard kinesthetic interaction',
    afterState: 'Simplified to 2-step problem with visual hints + encouragement message',
    status: 'teacher-notified',
    severity: 'high',
    resolution: 'Teacher notification sent. Break prompt shown to student.',
  },
];

// ─── Approved assignment history ─────────────────────────────────────
export const DEMO_APPROVED_HISTORY = [
  {
    id: 'approved-fractions-1',
    assignmentTitle: 'Adding Fractions Worksheet',
    subject: 'Math',
    approvedAt: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
    approvedBy: 'alysonga@usc.edu',
    studentCount: 5,
    students: ['jamie', 'maya', 'eli', 'sofia', 'aisha'],
    frustrationEvents: 3,
    avgScore: null, // not yet completed
    status: 'active',
  },
  {
    id: 'approved-addition-1',
    assignmentTitle: 'Addition — Krabby Patty counting',
    subject: 'Math',
    approvedAt: new Date(Date.now() - 86400000).toISOString(), // yesterday
    approvedBy: 'alysonga@usc.edu',
    studentCount: 5,
    students: ['jamie', 'maya', 'eli', 'sofia', 'aisha'],
    frustrationEvents: 6,
    avgScore: 64,
    status: 'completed',
  },
];

export function getDemoLesson(studentId) {
  return DEMO_ADAPTED_LESSONS[studentId] || null;
}

export function isDemoDataAvailable() {
  return true;
}
