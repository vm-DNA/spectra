// ============================================================
//  demoData.js — Pre-generated demo lessons for hackathon
//  Load instantly via "Load Demo" button. No AI wait needed.
// ============================================================

const SB = 'https://res.cloudinary.com/dsw7iha3n/image/upload/v1777189928/spectra/spongebob/spongebob-happy.png';
const KRABS = 'https://res.cloudinary.com/dsw7iha3n/image/upload/v1777189928/spectra/spongebob/mrkrabs.png';
const KRABBY = 'https://res.cloudinary.com/dsw7iha3n/image/upload/v1777189932/spectra/spongebob/krabby-patty.png';
const PATRICK = 'https://res.cloudinary.com/dsw7iha3n/image/upload/v1777189933/spectra/spongebob/patrick.png';
const ROCK = 'https://res.cloudinary.com/dsw7iha3n/image/upload/v1777189930/spectra/spongebob/patricks-rock.png';
const KRABS_MONEY = 'https://res.cloudinary.com/dsw7iha3n/image/upload/v1777189929/spectra/spongebob/mrkrabs-money.png';

export const CLOUDINARY_CHARACTERS = {
  spongebob: [SB, KRABS_MONEY, KRABBY, KRABS, ROCK, PATRICK],
  bluey: [],
  pawpatrol: [],
  minecraft: [],
  encanto: [],
};

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

// ─── QUESTIONS (shared across some modes) ──────────────────────
const FRACTION_QUESTIONS = [
  { id: 'dq1', text: '4/5 + 1/3 = ?', options: ['17/15', '5/8', '12/15', '7/15'], correctIndex: 0, hint: 'Common denominator is 15. 4/5 = 12/15, 1/3 = 5/15. Add: 17/15' },
  { id: 'dq2', text: '2/7 + 3/4 = ?', options: ['5/11', '29/28', '23/28', '8/28'], correctIndex: 1, hint: 'Common denominator is 28. 2/7 = 8/28, 3/4 = 21/28. Add: 29/28' },
  { id: 'dq3', text: '1/2 + 2/3 = ?', options: ['3/5', '5/6', '7/6', '4/6'], correctIndex: 2, hint: 'Common denominator is 6. 1/2 = 3/6, 2/3 = 4/6. Add: 7/6' },
  { id: 'dq4', text: '3/8 + 1/4 = ?', options: ['4/12', '5/8', '4/8', '7/8'], correctIndex: 1, hint: 'Common denominator is 8. 1/4 = 2/8. Add: 3+2 = 5/8' },
  { id: 'dq5', text: '5/6 + 1/2 = ?', options: ['6/8', '4/3', '7/6', '8/6'], correctIndex: 3, hint: '1/2 = 3/6, so 5/6 + 3/6 = 8/6' },
];

// ================================================================
//  AISHA — Visual / SpongeBob
//  Uses Cloudinary SpongeBob images AS teaching objects.
//  Images are resized and placed to illustrate math concepts.
// ================================================================
const AISHA_VISUAL_HTML = `<!DOCTYPE html>
<html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:'Comic Sans MS',cursive,sans-serif;background:linear-gradient(180deg,#87CEEB 0%,#87CEEB 65%,#F4D03F 65%,#F4D03F 100%);min-height:100vh;padding:16px}
.container{max-width:850px;margin:0 auto}
.header{text-align:center;background:rgba(255,255,255,0.95);border-radius:20px;padding:16px 20px;margin-bottom:16px;border:4px solid #FFE135;box-shadow:0 4px 12px rgba(0,0,0,0.1)}
.header h1{color:#8B4513;font-size:26px;margin-bottom:4px}
.header p{color:#666;font-size:13px}
.lesson-card{background:white;border-radius:16px;padding:20px;margin-bottom:16px;border:3px solid #FFE135;box-shadow:0 2px 8px rgba(0,0,0,0.08)}
.lesson-card h2{color:#8B4513;font-size:18px;margin-bottom:12px;text-align:center}
.equation-row{display:flex;align-items:center;justify-content:center;gap:12px;margin:16px 0;flex-wrap:wrap}
.img-group{display:flex;gap:4px;align-items:center;background:#FFF8DC;border-radius:12px;padding:8px 12px;border:2px dashed #F4D03F}
.img-group img{width:48px;height:48px;object-fit:contain;transition:transform 0.3s}
.img-group img:hover{transform:scale(1.2) rotate(5deg)}
.op{font-size:32px;font-weight:bold;color:#8B4513}
.answer-box{min-width:60px;height:50px;border:3px dashed #FF6B35;border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:24px;font-weight:bold;color:#FF6B35;cursor:pointer;transition:all 0.3s;background:#FFF5F0}
.answer-box:hover{background:#FFE0CC;transform:scale(1.05)}
.answer-box.correct{border-color:#4CAF50;background:#E8F5E9;color:#2E7D32}
.answer-box.wrong{border-color:#F44336;background:#FFEBEE;color:#C62828;animation:shake 0.4s}
.fraction-visual{display:flex;gap:6px;justify-content:center;margin:12px 0}
.fraction-piece{width:40px;height:50px;border-radius:6px;border:2px solid #8B4513;display:flex;align-items:center;justify-content:center;overflow:hidden;transition:all 0.3s}
.fraction-piece.filled{background:#FFE135}
.fraction-piece.empty{background:#f5f5f5}
.fraction-piece img{width:100%;height:100%;object-fit:cover;opacity:0.8}
.fraction-label{text-align:center;font-weight:bold;color:#8B4513;font-size:14px;margin-top:4px}
.speech{display:flex;align-items:flex-start;gap:12px;background:#FFF8DC;border-radius:16px;padding:14px;margin-bottom:16px;border:2px solid #FFE135}
.speech img{width:64px;height:64px;object-fit:contain;flex-shrink:0}
.speech-text{flex:1;font-size:14px;line-height:1.5;color:#333}
.speech-text strong{color:#FF6B35}
.problem-section{margin:16px 0;padding:16px;background:#FFFDE7;border-radius:12px;border:2px solid #FFF176}
.problem-title{font-size:16px;font-weight:bold;color:#F57F17;margin-bottom:12px;text-align:center}
.options-row{display:flex;gap:8px;justify-content:center;flex-wrap:wrap;margin-top:10px}
.opt-btn{padding:10px 20px;border-radius:10px;border:2px solid #ccc;background:white;font-size:16px;font-weight:bold;cursor:pointer;font-family:inherit;transition:all 0.2s}
.opt-btn:hover{border-color:#FF6B35;background:#FFF5F0;transform:translateY(-2px)}
.opt-btn.selected-correct{border-color:#4CAF50;background:#E8F5E9;color:#2E7D32}
.opt-btn.selected-wrong{border-color:#F44336;background:#FFEBEE;color:#C62828;animation:shake 0.4s}
.result-msg{text-align:center;padding:10px;margin-top:10px;border-radius:8px;font-weight:bold;font-size:14px}
.result-msg.correct{background:#E8F5E9;color:#2E7D32}
.result-msg.wrong{background:#FFEBEE;color:#C62828}
.progress{display:flex;gap:6px;justify-content:center;margin:12px 0}
.dot{width:14px;height:14px;border-radius:50%;background:#ddd;transition:all 0.3s}
.dot.done{background:#4CAF50}.dot.current{background:#FF6B35;transform:scale(1.3)}
.step-box{background:#E3F2FD;border-radius:10px;padding:12px;margin:8px 0;font-size:13px;border-left:4px solid #2196F3}
.step-box strong{color:#1565C0}
@keyframes shake{0%,100%{transform:translateX(0)}25%{transform:translateX(-6px)}75%{transform:translateX(6px)}}
@keyframes bounce{0%,100%{transform:translateY(0)}50%{transform:translateY(-8px)}}
.bounce{animation:bounce 0.6s ease}
.confetti{position:fixed;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:99}
</style></head><body>
<div class="container">
<div class="header">
<h1>SpongeBob's Krabby Patty Fractions!</h1>
<p>Use SpongeBob characters to learn how to add fractions</p>
<div class="progress" id="progress"></div>
</div>

<div class="speech">
<img src="${SB}" alt="SpongeBob">
<div class="speech-text"><strong>SpongeBob says:</strong> "I'm ready! I'm ready! Let's learn fractions using Krabby Patties! When we add fractions, we need to make sure all the pieces are the <strong>same size</strong> first!"</div>
</div>

<div id="lessonArea"></div>
<div id="confettiBox" class="confetti"></div>
</div>

<script>
const SB='${SB}',KRABS='${KRABS}',KRABBY='${KRABBY}',PATRICK='${PATRICK}',ROCK='${ROCK}',KRABS_MONEY='${KRABS_MONEY}';
const problems=[
{q:'4/5 + 1/3',a:'17/15',opts:['17/15','5/8','12/15','7/15'],n1:4,d1:5,n2:1,d2:3,lcd:15,cn1:12,cn2:5,img1:SB,img2:KRABBY,
explain:'SpongeBob has 4 out of 5 Krabby Patties, and Patrick brings 1 out of 3 more. To add them, cut everything into 15 equal pieces!'},
{q:'2/7 + 3/4',a:'29/28',opts:['5/11','29/28','23/28','8/28'],n1:2,d1:7,n2:3,d2:4,lcd:28,cn1:8,cn2:21,img1:PATRICK,img2:KRABS,
explain:'Patrick has 2 out of 7 jellyfishing nets, and Mr. Krabs has 3 out of 4. Cut into 28 pieces to add!'},
{q:'1/2 + 2/3',a:'7/6',opts:['3/5','5/6','7/6','4/6'],n1:1,d1:2,n2:2,d2:3,lcd:6,cn1:3,cn2:4,img1:SB,img2:PATRICK,
explain:'SpongeBob has half a Krabby Patty, Patrick has 2/3 of one. Cut into 6 equal pieces to combine!'},
{q:'3/8 + 1/4',a:'5/8',opts:['4/12','5/8','4/8','7/8'],n1:3,d1:8,n2:1,d2:4,lcd:8,cn1:3,cn2:2,img1:KRABBY,img2:KRABBY,
explain:'3/8 of a Krabby Patty plus 1/4 of another. Since 4 fits into 8, just convert 1/4 to 2/8!'},
{q:'5/6 + 1/2',a:'8/6',opts:['6/8','4/3','7/6','8/6'],n1:5,d1:6,n2:1,d2:2,lcd:6,cn1:5,cn2:3,img1:KRABS,img2:SB,
explain:'Mr. Krabs has 5/6 of the money, SpongeBob has 1/2. Convert to sixths to add!'}
];
let cur=0,score=0,answered=new Set(),wrongCounts={};

function renderProgress(){
let h='';for(let i=0;i<problems.length;i++){h+='<div class="dot '+(answered.has(i)?'done':i===cur?'current':'')+'"></div>';}
document.getElementById('progress').innerHTML=h;}

function renderProblem(){
if(cur>=problems.length){renderComplete();return;}
const p=problems[cur];
let h='<div class="lesson-card"><h2>Problem '+(cur+1)+': '+p.q+' = ?</h2>';
// Visual explanation with character images
h+='<div class="speech"><img src="'+p.img1+'" alt="character"><div class="speech-text">'+p.explain+'</div></div>';
// Show fraction visually with character images as pieces
h+='<div class="equation-row">';
// First fraction: show n1 filled images out of d1
h+='<div><div class="img-group">';
for(let i=0;i<p.d1;i++){
if(i<p.n1) h+='<img src="'+p.img1+'" alt="filled" style="width:40px;height:40px">';
else h+='<div style="width:40px;height:40px;border:2px dashed #ccc;border-radius:6px;opacity:0.3"></div>';
}
h+='</div><div class="fraction-label">'+p.n1+'/'+p.d1+'</div></div>';
h+='<span class="op">+</span>';
// Second fraction
h+='<div><div class="img-group">';
for(let i=0;i<p.d2;i++){
if(i<p.n2) h+='<img src="'+p.img2+'" alt="filled" style="width:40px;height:40px">';
else h+='<div style="width:40px;height:40px;border:2px dashed #ccc;border-radius:6px;opacity:0.3"></div>';
}
h+='</div><div class="fraction-label">'+p.n2+'/'+p.d2+'</div></div>';
h+='</div>';
// Step-by-step conversion
h+='<div class="step-box"><strong>Step 1:</strong> Find common denominator: LCD of '+p.d1+' and '+p.d2+' = <strong>'+p.lcd+'</strong></div>';
h+='<div class="step-box"><strong>Step 2:</strong> Convert: '+p.n1+'/'+p.d1+' = '+p.cn1+'/'+p.lcd+' and '+p.n2+'/'+p.d2+' = '+p.cn2+'/'+p.lcd+'</div>';
h+='<div class="step-box"><strong>Step 3:</strong> Add numerators: '+p.cn1+' + '+p.cn2+' = <strong>'+(p.cn1+p.cn2)+'</strong></div>';
// Show the converted fractions with images
h+='<div class="equation-row">';
h+='<div><div class="fraction-visual">';
for(let i=0;i<Math.min(p.lcd,10);i++){
h+='<div class="fraction-piece '+(i<p.cn1?'filled':'empty')+'"><img src="'+p.img1+'" alt="" style="opacity:'+(i<p.cn1?'0.9':'0.15')+'"></div>';
}
h+='</div><div class="fraction-label">'+p.cn1+'/'+p.lcd+'</div></div>';
h+='<span class="op" style="font-size:24px">+</span>';
h+='<div><div class="fraction-visual">';
for(let i=0;i<Math.min(p.lcd,10);i++){
h+='<div class="fraction-piece '+(i<p.cn2?'filled':'empty')+'"><img src="'+p.img2+'" alt="" style="opacity:'+(i<p.cn2?'0.9':'0.15')+'"></div>';
}
h+='</div><div class="fraction-label">'+p.cn2+'/'+p.lcd+'</div></div>';
h+='</div>';
// Answer options
h+='<div class="problem-section"><div class="problem-title">What is '+p.q+'?</div><div class="options-row" id="opts">';
p.opts.forEach((o,i)=>{h+='<button class="opt-btn" onclick="checkAns('+i+',\\''+o+'\\',\\''+p.a+'\\')">'+o+'</button>';});
h+='</div><div id="feedback"></div></div></div>';
document.getElementById('lessonArea').innerHTML=h;
}

function checkAns(i,sel,correct){
if(answered.has(cur))return;
const btns=document.querySelectorAll('.opt-btn');
if(sel===correct){
btns[i].classList.add('selected-correct');
document.getElementById('feedback').innerHTML='<div class="result-msg correct">Correct! Great job! 🎉</div>';
score++;answered.add(cur);renderProgress();
setTimeout(()=>{cur++;renderProblem();},1500);
}else{
if(!wrongCounts[cur])wrongCounts[cur]=0;wrongCounts[cur]++;
btns[i].classList.add('selected-wrong');
document.getElementById('feedback').innerHTML='<div class="result-msg wrong">Not quite! Try again!</div>';
window.parent.postMessage({type:'wrongAnswer',questionIndex:cur,wrongCount:wrongCounts[cur],questionText:problems[cur].q},'*');
if(wrongCounts[cur]>=3){window.parent.postMessage({type:'reframeNeeded',questionIndex:cur,questionText:problems[cur].q,wrongCount:wrongCounts[cur]},'*');}
setTimeout(()=>{btns[i].classList.remove('selected-wrong');document.getElementById('feedback').innerHTML='';},1500);
}}

function renderComplete(){
let h='<div class="lesson-card" style="text-align:center"><h2>All Done! 🎉</h2>';
h+='<div style="font-size:48px;margin:16px 0"><img src="'+SB+'" style="width:80px"> <img src="'+PATRICK+'" style="width:80px"> <img src="'+KRABS+'" style="width:80px"></div>';
h+='<div style="font-size:20px;font-weight:bold;color:#4CAF50">Score: '+score+'/'+problems.length+'</div>';
h+='<div style="margin-top:12px;color:#666">SpongeBob and friends are proud of you!</div></div>';
document.getElementById('lessonArea').innerHTML=h;
// confetti
const c=document.getElementById('confettiBox');const colors=['#FFE135','#FF6B35','#4CAF50','#2196F3','#E91E63'];
for(let i=0;i<50;i++){const d=document.createElement('div');d.style.cssText='position:absolute;width:10px;height:10px;background:'+colors[Math.floor(Math.random()*5)]+';left:'+Math.random()*100+'%;animation:fall '+(2+Math.random()*3)+'s linear '+Math.random()*2+'s forwards';c.appendChild(d);}
const style=document.createElement('style');style.textContent='@keyframes fall{0%{top:-10px;transform:rotate(0)}100%{top:100vh;transform:rotate(720deg);opacity:0}}';document.head.appendChild(style);
}

renderProgress();renderProblem();
</script></body></html>`;

// ================================================================
//  MAYA — Auditory / Paw Patrol
//  Shows audio player with narration script + voice chat
// ================================================================
const MAYA_AUDITORY_HTML = `<!DOCTYPE html>
<html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:'Segoe UI',sans-serif;background:#f0f4f8;min-height:100vh;padding:20px}
.container{max-width:480px;width:100%;margin:0 auto}
.header{text-align:center;margin-bottom:24px}
.header h1{color:#1565C0;font-size:22px;font-weight:600;margin-bottom:6px}
.header p{color:#78909C;font-size:13px}
.player{background:white;border-radius:24px;padding:32px 28px;text-align:center;box-shadow:0 2px 16px rgba(0,0,0,0.06);margin-bottom:24px}
.play-btn{width:72px;height:72px;border-radius:50%;background:#1565C0;border:none;color:white;font-size:26px;cursor:pointer;transition:all 0.2s;margin:0 auto 16px;display:block}
.play-btn:hover{background:#0D47A1;transform:scale(1.05)}
.play-btn.playing{background:#2E7D32;animation:pulse-play 1.5s infinite}
.play-btn:disabled{opacity:0.7;cursor:wait}
@keyframes pulse-play{0%,100%{box-shadow:0 0 0 0 rgba(46,125,50,0.3)}50%{box-shadow:0 0 0 18px rgba(46,125,50,0)}}
.waveform{display:flex;align-items:center;justify-content:center;gap:3px;height:40px;margin:12px 0}
.wave-bar{width:4px;background:#90CAF9;border-radius:2px;transition:height 0.15s}
.status{font-size:13px;color:#546E7F;margin-bottom:12px;font-weight:500}
.speed-controls{display:flex;gap:8px;justify-content:center;margin-top:16px}
.speed-btn{padding:5px 14px;border-radius:14px;border:1.5px solid #B0BEC5;background:white;color:#546E7F;cursor:pointer;font-size:12px;font-weight:500;transition:all 0.15s}
.speed-btn:hover{border-color:#1565C0;color:#1565C0}
.speed-btn.active{background:#1565C0;color:white;border-color:#1565C0}
.topic{margin-top:16px;padding:12px 16px;background:#F5F7FA;border-radius:12px;text-align:left}
.topic-label{font-size:10px;text-transform:uppercase;letter-spacing:1px;color:#90A4AE;font-weight:600;margin-bottom:4px}
.topic-text{font-size:13px;color:#37474F;line-height:1.5}
.badge{display:inline-block;padding:3px 10px;border-radius:10px;font-size:11px;font-weight:600;background:#E8F5E9;color:#2E7D32;margin-top:12px}
.quiz-section{background:white;border-radius:24px;padding:28px;box-shadow:0 2px 16px rgba(0,0,0,0.06)}
.quiz-header{text-align:center;margin-bottom:20px}
.quiz-header h2{color:#1565C0;font-size:18px;font-weight:600;margin-bottom:4px}
.quiz-header p{color:#78909C;font-size:12px}
.quiz-progress{display:flex;gap:6px;justify-content:center;margin-bottom:20px}
.q-dot{width:28px;height:28px;border-radius:50%;border:2px solid #B0BEC5;display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:600;color:#78909C;transition:all 0.3s}
.q-dot.active{border-color:#1565C0;color:#1565C0;background:#E3F2FD}
.q-dot.correct{border-color:#2E7D32;color:white;background:#2E7D32}
.q-dot.wrong{border-color:#C62828;color:white;background:#C62828}
.question-card{background:#F5F7FA;border-radius:16px;padding:24px;text-align:center;margin-bottom:20px}
.question-text{font-size:18px;font-weight:600;color:#1A237E;margin-bottom:8px}
.question-hint{font-size:12px;color:#78909C}
.mic-area{text-align:center;margin:20px 0}
.mic-btn{width:72px;height:72px;border-radius:50%;border:none;font-size:28px;cursor:pointer;transition:all 0.2s;margin:0 auto;display:block}
.mic-btn.ready{background:#1565C0;color:white;box-shadow:0 4px 12px rgba(21,101,194,0.3)}
.mic-btn.ready:hover{background:#0D47A1;transform:scale(1.05)}
.mic-btn.listening{background:#C62828;color:white;animation:pulse-mic 1s infinite}
.mic-btn.disabled{background:#B0BEC5;color:white;cursor:not-allowed}
@keyframes pulse-mic{0%,100%{box-shadow:0 0 0 0 rgba(198,40,40,0.3)}50%{box-shadow:0 0 0 16px rgba(198,40,40,0)}}
.mic-label{font-size:12px;color:#78909C;margin-top:8px;font-weight:500}
.transcript-bubble{background:#E3F2FD;border-radius:12px;padding:12px 16px;margin:12px auto;max-width:300px;font-size:14px;color:#1A237E;font-weight:500}
.feedback{border-radius:14px;padding:16px 20px;margin:16px 0;text-align:center;font-size:14px;font-weight:600;animation:fadeIn 0.3s}
.feedback.correct{background:#E8F5E9;color:#2E7D32;border:2px solid #A5D6A7}
.feedback.wrong{background:#FFF3E0;color:#E65100;border:2px solid #FFE0B2}
.feedback.speaking{background:#E3F2FD;color:#1565C0;border:2px solid #90CAF9}
@keyframes fadeIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
.score-display{text-align:center;padding:20px;margin-top:12px}
.score-display .score{font-size:36px;font-weight:700;color:#1565C0}
.score-display .score-label{font-size:13px;color:#78909C;margin-top:4px}
.next-btn{display:block;margin:16px auto 0;padding:10px 28px;border-radius:20px;border:none;background:#1565C0;color:white;font-size:14px;font-weight:600;cursor:pointer;transition:all 0.2s}
.next-btn:hover{background:#0D47A1;transform:scale(1.03)}
</style></head><body>
<div class="container">
<div class="header">
<h1>Adding Fractions</h1>
<p>Listen to Ryder explain the lesson, then answer with your voice!</p>
</div>

<div class="player">
<button class="play-btn" id="playBtn" onclick="togglePlay()">▶</button>
<div class="waveform" id="waveform"></div>
<div class="status" id="statusText">Tap to play the lesson</div>
<div class="speed-controls">
<button class="speed-btn" onclick="setSpeed(0.8)">0.8x</button>
<button class="speed-btn active" onclick="setSpeed(1)">1x</button>
<button class="speed-btn" onclick="setSpeed(1.2)">1.2x</button>
</div>
<div class="topic">
<div class="topic-label">Today's Topic</div>
<div class="topic-text">Adding fractions with different denominators — finding common denominators, converting, and adding numerators.</div>
</div>
<div class="badge">ElevenLabs Voice: Ryder</div>
</div>

<div class="quiz-section" id="quizSection">
<div class="quiz-header">
<h2>Voice Quiz Time!</h2>
<p>Ryder will ask you a question — answer by speaking!</p>
</div>
<div class="quiz-progress" id="quizProgress"></div>
<div class="question-card" id="questionCard">
<div class="question-text" id="questionText">Loading question...</div>
<div class="question-hint" id="questionHint"></div>
</div>
<div id="feedbackArea"></div>
<div class="mic-area">
<button class="mic-btn ready" id="micBtn" onclick="handleMic()">🎤</button>
<div class="mic-label" id="micLabel">Tap to answer with your voice</div>
</div>
<div id="transcriptArea"></div>
<div class="score-display" id="scoreDisplay" style="display:none">
<div class="score" id="scoreValue">0/5</div>
<div class="score-label">Questions Answered</div>
</div>
</div>
</div>

<script>
let playing=false,waveInterval,audioEl=null,audioLoaded=false;
const wf=document.getElementById('waveform');
for(let i=0;i<50;i++){const b=document.createElement('div');b.className='wave-bar';b.style.height='6px';wf.appendChild(b);}
const bars=document.querySelectorAll('.wave-bar');

const narrationScript="Hey Maya! It's Ryder from Paw Patrol here! Today we're going to learn about adding fractions together, and the pups are going to help us! Imagine Chase and Marshall are sharing dog treats. If Chase has 4 out of 5 treats in one bowl, that's four fifths. And if Marshall has 1 out of 3 treats in another bowl, that's one third. To add these fractions together, we need to make sure the pieces are the same size. We call this finding a common denominator. For 5 and 3, both go into 15. So four fifths becomes twelve fifteenths, and one third becomes five fifteenths. Now we can add them: 12 fifteenths plus 5 fifteenths equals 17 fifteenths! That's more than one whole! No job is too big, no pup is too small! You've got this, Maya!";

async function togglePlay(){
const btn=document.getElementById('playBtn');
const status=document.getElementById('statusText');
if(playing&&audioEl){audioEl.pause();playing=false;btn.textContent='\\u25b6';btn.classList.remove('playing');status.textContent='Paused';clearInterval(waveInterval);bars.forEach(b=>b.style.height='6px');return;}
if(!audioLoaded){
btn.textContent='...';btn.disabled=true;status.textContent='Loading audio...';
try{
const res=await fetch('/api/tts',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({text:narrationScript})});
if(res.ok){const blob=await res.blob();audioEl=new Audio(URL.createObjectURL(blob));audioLoaded=true;
audioEl.onended=()=>{playing=false;btn.textContent='\\u25b6';btn.classList.remove('playing');status.textContent='Finished! Now try the voice quiz below \\u2b07\\ufe0f';clearInterval(waveInterval);bars.forEach(b=>b.style.height='6px');};
}else{throw new Error('TTS failed');}
}catch(e){console.error(e);btn.textContent='\\u25b6';btn.disabled=false;status.textContent='Could not load audio';return;}
btn.disabled=false;
}
audioEl.play();playing=true;btn.textContent='\\u23f8';btn.classList.add('playing');status.textContent='Playing...';animateWave();
}
function animateWave(){
waveInterval=setInterval(()=>{bars.forEach(b=>{b.style.height=(4+Math.random()*36)+'px';b.style.background=playing?'#1565C0':'#90CAF9';});},120);
}
function setSpeed(s){
document.querySelectorAll('.speed-btn').forEach(b=>{b.classList.remove('active');if(b.textContent===s+'x')b.classList.add('active');});
if(audioEl)audioEl.playbackRate=s;
}

// ─── VOICE QUIZ ───
const questions=[
{text:'What is 4/5 + 1/3?',spoken:'Maya, what is four fifths plus one third?',answer:'17/15',spokenAnswer:'seventeen fifteenths',acceptAlt:['17 over 15','17/15','1 and 2/15','one and two fifteenths','seventeen over fifteen','seventeen fifteenths'],hint:'Find common denominator: 15'},
{text:'What is 2/7 + 3/4?',spoken:'What is two sevenths plus three fourths?',answer:'29/28',spokenAnswer:'twenty-nine twenty-eighths',acceptAlt:['29 over 28','29/28','1 and 1/28','one and one twenty-eighth','twenty nine over twenty eight','twenty nine twenty eighths'],hint:'Common denominator is 28'},
{text:'What is 1/2 + 2/3?',spoken:'What is one half plus two thirds?',answer:'7/6',spokenAnswer:'seven sixths',acceptAlt:['7 over 6','7/6','1 and 1/6','one and one sixth','seven over six','seven sixths'],hint:'Common denominator is 6'},
{text:'What is 3/8 + 1/4?',spoken:'What is three eighths plus one fourth?',answer:'5/8',spokenAnswer:'five eighths',acceptAlt:['5 over 8','5/8','five over eight','five eighths'],hint:'1/4 = 2/8, so 3+2=5'},
{text:'What is 5/6 + 1/2?',spoken:'Last one! What is five sixths plus one half?',answer:'8/6',spokenAnswer:'eight sixths, or four thirds',acceptAlt:['8 over 6','8/6','4/3','four thirds','1 and 1/3','one and one third','eight over six','eight sixths','four over three'],hint:'1/2 = 3/6, so 5+3=8'},
];
let currentQ=0,score=0,wrongCounts=[0,0,0,0,0],listening=false,recognition=null;

function initQuiz(){
const prog=document.getElementById('quizProgress');
prog.innerHTML='';
questions.forEach((_,i)=>{const d=document.createElement('div');d.className='q-dot'+(i===0?' active':'');d.textContent=i+1;d.id='qdot'+i;prog.appendChild(d);});
showQuestion();
}

function showQuestion(){
if(currentQ>=questions.length){showFinalScore();return;}
const q=questions[currentQ];
document.getElementById('questionText').textContent=q.text;
document.getElementById('questionHint').textContent='Hint: '+q.hint;
document.getElementById('feedbackArea').innerHTML='';
document.getElementById('transcriptArea').innerHTML='';
document.getElementById('micBtn').className='mic-btn ready';
document.getElementById('micLabel').textContent='Tap to answer with your voice';
document.getElementById('scoreDisplay').style.display='block';
document.getElementById('scoreValue').textContent=score+'/'+questions.length;
speakQuestion(q.spoken);
}

async function speakQuestion(text){
const fb=document.getElementById('feedbackArea');
fb.innerHTML='<div class="feedback speaking">\\ud83d\\udd0a Ryder is reading the question...</div>';
document.getElementById('micBtn').className='mic-btn disabled';
try{
const res=await fetch('/api/tts',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({text:text})});
if(res.ok){const blob=await res.blob();const a=new Audio(URL.createObjectURL(blob));
a.onended=()=>{fb.innerHTML='';document.getElementById('micBtn').className='mic-btn ready';document.getElementById('micLabel').textContent='Now tap to answer!';};
a.play();}else{fb.innerHTML='';document.getElementById('micBtn').className='mic-btn ready';}
}catch(e){fb.innerHTML='';document.getElementById('micBtn').className='mic-btn ready';}
}

function handleMic(){
const btn=document.getElementById('micBtn');
if(btn.classList.contains('disabled'))return;
if(listening&&recognition){recognition.stop();return;}
const SR=window.SpeechRecognition||window.webkitSpeechRecognition;
if(!SR){document.getElementById('transcriptArea').innerHTML='<div class="transcript-bubble">Voice not supported in this browser</div>';return;}
recognition=new SR();recognition.continuous=false;recognition.interimResults=false;recognition.lang='en-US';
recognition.onstart=()=>{listening=true;btn.className='mic-btn listening';document.getElementById('micLabel').textContent='Listening... speak your answer';};
recognition.onend=()=>{listening=false;btn.className='mic-btn ready';document.getElementById('micLabel').textContent='Tap to answer again';};
recognition.onresult=(e)=>{
const transcript=e.results[0][0].transcript;
document.getElementById('transcriptArea').innerHTML='<div class="transcript-bubble">You said: "'+transcript+'"</div>';
evaluateAnswer(transcript);
};
recognition.onerror=()=>{listening=false;btn.className='mic-btn ready';document.getElementById('micLabel').textContent='Tap to try again';};
recognition.start();
}

function evaluateAnswer(transcript){
const q=questions[currentQ];
const t=transcript.toLowerCase().replace(/[^a-z0-9/ ]/g,'').trim();
const isCorrect=q.acceptAlt.some(a=>t.includes(a.toLowerCase()))||t.includes(q.answer.toLowerCase());
const fb=document.getElementById('feedbackArea');
if(isCorrect){
score++;
document.getElementById('scoreValue').textContent=score+'/'+questions.length;
document.getElementById('qdot'+currentQ).className='q-dot correct';
fb.innerHTML='<div class="feedback correct">\\u2705 Correct! The answer is '+q.answer+' ('+q.spokenAnswer+')</div>';
speakFeedback('That\\'s right! Great job Maya! The answer is '+q.spokenAnswer+'!');
setTimeout(()=>{currentQ++;showQuestion();},4000);
}else{
wrongCounts[currentQ]++;
document.getElementById('qdot'+currentQ).className='q-dot wrong';
if(wrongCounts[currentQ]>=3){
fb.innerHTML='<div class="feedback wrong">The answer is '+q.answer+'. '+q.hint+'</div>';
speakFeedback('That\\'s okay Maya! The answer is '+q.spokenAnswer+'. '+q.hint+'. Let\\'s try the next one!');
window.parent.postMessage({type:'wrongAnswer',questionText:q.text,wrongCount:wrongCounts[currentQ]},'*');
window.parent.postMessage({type:'reframeNeeded',questionText:q.text},'*');
setTimeout(()=>{currentQ++;showQuestion();},5000);
}else{
fb.innerHTML='<div class="feedback wrong">Not quite! Try again. '+q.hint+'</div>';
speakFeedback('Not quite! Here\\'s a hint: '+q.hint+'. Try again!');
window.parent.postMessage({type:'wrongAnswer',questionText:q.text,wrongCount:wrongCounts[currentQ]},'*');
setTimeout(()=>{document.getElementById('qdot'+currentQ).className='q-dot active';document.getElementById('micBtn').className='mic-btn ready';document.getElementById('micLabel').textContent='Tap to try again';},3000);
}
}
}

async function speakFeedback(text){
try{
const res=await fetch('/api/tts',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({text:text})});
if(res.ok){const blob=await res.blob();new Audio(URL.createObjectURL(blob)).play();}
}catch(e){}
}

function showFinalScore(){
document.getElementById('questionCard').innerHTML='<div class="question-text">Quiz Complete!</div><div class="question-hint">Great job, Maya!</div>';
document.getElementById('micBtn').style.display='none';
document.getElementById('micLabel').style.display='none';
document.getElementById('scoreValue').textContent=score+'/'+questions.length;
const pct=Math.round(score/questions.length*100);
speakFeedback('Amazing Maya! You got '+score+' out of '+questions.length+' correct! That\\'s '+pct+' percent! No job is too big, no pup is too small!');
}

initQuiz();
</script></body></html>`;

// ================================================================
//  ELI — Kinesthetic / Minecraft Steve
//  Fully interactive: drag blocks, sliders, animated fraction bars
// ================================================================
const ELI_KINESTHETIC_HTML = `<!DOCTYPE html>
<html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:'Courier New',monospace;background:linear-gradient(180deg,#87CEEB 0%,#87CEEB 55%,#228B22 55%,#228B22 100%);min-height:100vh;color:#333;padding:16px}
.container{max-width:900px;margin:0 auto}
.header{background:#5D4037;border:4px solid #3E2723;padding:14px;text-align:center;margin-bottom:16px}
.header h1{color:#8BC34A;font-size:24px;text-shadow:2px 2px #2E7D32;letter-spacing:2px}
.progress{display:flex;gap:4px;justify-content:center;margin-top:8px}
.p-dot{width:16px;height:16px;background:#795548;border:2px solid #3E2723}.p-dot.done{background:#8BC34A}.p-dot.cur{background:#FF9800}
.tabs{display:flex;gap:3px;margin-bottom:12px}
.tab{flex:1;padding:10px;background:#795548;color:white;border:3px solid #3E2723;cursor:pointer;text-align:center;font-weight:bold;font-family:inherit;font-size:13px}
.tab.active{background:#8BC34A;color:#1B5E20}
.panel{background:rgba(255,255,255,0.96);border:4px solid #5D4037;padding:20px;min-height:400px;display:none}
.panel.active{display:block}
.mc-card{background:#EFEBE9;border:3px solid #5D4037;padding:16px;margin-bottom:12px}
.mc-card h3{color:#3E2723;margin-bottom:10px}
.block-row{display:flex;gap:3px;flex-wrap:wrap;margin:8px 0}
.block{width:40px;height:40px;border:2px solid rgba(0,0,0,0.3);cursor:pointer;transition:all 0.2s;display:flex;align-items:center;justify-content:center;font-size:10px;font-weight:bold}
.block.filled{background:#8BC34A;box-shadow:inset -2px -2px 0 #689F38,inset 2px 2px 0 #AED581}
.block.empty{background:#BCAAA4;box-shadow:inset -2px -2px 0 #8D6E63,inset 2px 2px 0 #D7CCC8}
.block:hover{transform:scale(1.15);z-index:1}
.slider-group{margin:16px 0;text-align:center}
.slider-group input[type=range]{width:90%;height:20px;-webkit-appearance:none;background:#795548;border:3px solid #3E2723}
.slider-group input[type=range]::-webkit-slider-thumb{-webkit-appearance:none;width:24px;height:24px;background:#8BC34A;border:3px solid #2E7D32;cursor:grab}
.slider-label{font-size:22px;font-weight:bold;color:#5D4037;margin:8px 0}
.btn{padding:10px 20px;font-family:inherit;font-size:14px;font-weight:bold;border:3px solid #3E2723;cursor:pointer;margin:4px}
.btn-green{background:#8BC34A;color:#1B5E20}.btn-green:hover{background:#AED581}
.btn-blue{background:#2196F3;color:white}.btn-blue:hover{background:#64B5F6}
.btn-orange{background:#FF9800;color:white}.btn-orange:hover{background:#FFB74D}
.drag-zone{min-height:60px;border:3px dashed #795548;border-radius:8px;padding:8px;display:flex;gap:4px;flex-wrap:wrap;align-items:center;transition:background 0.2s}
.drag-zone.over{background:#E8F5E9;border-color:#4CAF50}
.draggable{cursor:grab;user-select:none}
.draggable:active{cursor:grabbing}
.result{padding:12px;margin:8px 0;font-weight:bold;text-align:center;font-size:16px;border:3px solid}
.result.correct{background:#E8F5E9;border-color:#4CAF50;color:#2E7D32}
.result.wrong{background:#FFEBEE;border-color:#F44336;color:#C62828;animation:shake 0.4s}
@keyframes shake{0%,100%{transform:translateX(0)}25%{transform:translateX(-8px)}75%{transform:translateX(8px)}}
.score-bar{background:#5D4037;color:#8BC34A;padding:6px 14px;display:inline-block;font-weight:bold;border:3px solid #3E2723}
.confetti-box{position:fixed;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:999}
</style></head><body>
<div class="container">
<div class="header">
<h1>⛏ Steve's Fraction Workshop ⛏</h1>
<div class="progress" id="progress"></div>
</div>
<div class="tabs">
<div class="tab active" id="t0" onclick="showTab(0)">🔨 Learn</div>
<div class="tab" id="t1" onclick="showTab(1)">🎮 Explore</div>
<div class="tab" id="t2" onclick="showTab(2)">⚔ Practice</div>
</div>

<!-- LEARN TAB -->
<div class="panel active" id="p0">
<div class="mc-card">
<h3>How Fraction Blocks Work</h3>
<p style="margin-bottom:10px;font-size:13px">In Minecraft, everything is blocks. Fractions work the same way! The <strong>denominator</strong> (bottom) tells us how many blocks total. The <strong>numerator</strong> (top) tells us how many are filled.</p>
<p style="font-size:13px;margin-bottom:8px"><strong>Click the blocks below to fill or empty them!</strong></p>
<div class="block-row" id="learnBlocks"></div>
<div class="slider-label" id="learnLabel">0/8</div>
</div>
<div class="mc-card">
<h3>Adding Fractions: 4/5 + 1/3</h3>
<p style="font-size:13px;margin-bottom:8px">Step 1: Make blocks the same size (find LCD = 15)</p>
<div style="display:flex;gap:16px;align-items:center;flex-wrap:wrap;justify-content:center">
<div><div class="block-row" id="frac1"></div><div style="text-align:center;font-weight:bold">4/5 = 12/15</div></div>
<span style="font-size:28px;font-weight:bold">+</span>
<div><div class="block-row" id="frac2"></div><div style="text-align:center;font-weight:bold">1/3 = 5/15</div></div>
<span style="font-size:28px;font-weight:bold">=</span>
<div><div class="block-row" id="fracResult"></div><div style="text-align:center;font-weight:bold;color:#2E7D32">17/15!</div></div>
</div>
<button class="btn btn-orange" onclick="showTab(1)" style="margin-top:12px">Next: Explore →</button>
</div>
</div>

<!-- EXPLORE TAB -->
<div class="panel" id="p1">
<div class="mc-card">
<h3>🎮 Build Your Own Fractions</h3>
<p style="font-size:13px">Drag the sliders to build fractions and see the blocks change!</p>
<div class="slider-group">
<label>Numerator: <strong id="numVal">1</strong></label><br>
<input type="range" min="0" max="12" value="1" id="numSlider" oninput="updateExplorer()">
</div>
<div class="slider-group">
<label>Denominator: <strong id="denVal">4</strong></label><br>
<input type="range" min="1" max="12" value="4" id="denSlider" oninput="updateExplorer()">
</div>
<div class="slider-label" id="exploreLabel">1/4</div>
<div class="block-row" id="exploreBlocks" style="justify-content:center"></div>
<div style="margin-top:12px;padding:10px;background:#E8F5E9;border-radius:8px;text-align:center;font-size:13px" id="exploreInfo">That's 25% of the blocks!</div>
</div>
<div class="mc-card">
<h3>🧱 Drag & Drop Challenge</h3>
<p style="font-size:13px;margin-bottom:8px">Drag the green blocks into the drop zone to make 3/5:</p>
<div class="block-row" id="dragSource" style="margin-bottom:8px"></div>
<div class="drag-zone" id="dropZone"><span style="color:#999;font-size:12px">Drop blocks here to make 3/5</span></div>
<div id="dragFeedback"></div>
</div>
<button class="btn btn-orange" onclick="showTab(2)" style="margin-top:8px">Ready to Practice! →</button>
</div>

<!-- PRACTICE TAB -->
<div class="panel" id="p2">
<div class="score-bar">Score: <span id="score">0</span> / 5</div>
<div id="practiceArea"></div>
<div id="confettiBox" class="confetti-box"></div>
</div>
</div>

<script>
// LEARN TAB: clickable blocks
(function(){
const c=document.getElementById('learnBlocks');
for(let i=0;i<8;i++){const b=document.createElement('div');b.className='block empty';b.onclick=function(){this.classList.toggle('filled');this.classList.toggle('empty');updateLearnLabel();};c.appendChild(b);}
})();
function updateLearnLabel(){const f=document.querySelectorAll('#learnBlocks .filled').length;document.getElementById('learnLabel').textContent=f+'/8';}

// LEARN: fraction visualization
function buildFracBlocks(el,filled,total){const c=document.getElementById(el);c.innerHTML='';for(let i=0;i<total;i++){const b=document.createElement('div');b.className='block '+(i<filled?'filled':'empty');b.style.width='24px';b.style.height='24px';c.appendChild(b);}}
buildFracBlocks('frac1',12,15);buildFracBlocks('frac2',5,15);buildFracBlocks('fracResult',15,15);

// EXPLORE TAB
function updateExplorer(){
const n=parseInt(document.getElementById('numSlider').value),d=parseInt(document.getElementById('denSlider').value);
document.getElementById('numVal').textContent=n;document.getElementById('denVal').textContent=d;
document.getElementById('exploreLabel').textContent=n+'/'+d;
const c=document.getElementById('exploreBlocks');c.innerHTML='';
for(let i=0;i<d;i++){const b=document.createElement('div');b.className='block '+(i<n?'filled':'empty');c.appendChild(b);}
const pct=d>0?Math.round(n/d*100):0;
document.getElementById('exploreInfo').textContent=pct+'% of the blocks!'+(n>d?' That\\'s more than one whole!':'');
}
updateExplorer();

// DRAG & DROP
let dragCount=0;
(function(){
const src=document.getElementById('dragSource');
for(let i=0;i<5;i++){const b=document.createElement('div');b.className='block filled draggable';b.draggable=true;b.ondragstart=function(e){e.dataTransfer.setData('text','block');};src.appendChild(b);}
const dz=document.getElementById('dropZone');
dz.ondragover=function(e){e.preventDefault();this.classList.add('over');};
dz.ondragleave=function(){this.classList.remove('over');};
dz.ondrop=function(e){e.preventDefault();this.classList.remove('over');dragCount++;
if(dragCount<=3){const b=document.createElement('div');b.className='block filled';b.style.width='40px';b.style.height='40px';this.appendChild(b);}
if(dragCount===3){document.getElementById('dragFeedback').innerHTML='<div class="result correct">You made 3/5! Great building!</div>';}
if(dragCount>3){document.getElementById('dragFeedback').innerHTML='<div class="result wrong">Too many blocks! That\\'s more than 3/5.</div>';}
};
})();

// TABS
function showTab(i){document.querySelectorAll('.panel').forEach((p,j)=>{p.classList.toggle('active',j===i);});document.querySelectorAll('.tab').forEach((t,j)=>{t.classList.toggle('active',j===i);});if(i===2&&!practiceStarted)startPractice();}

// PRACTICE
const problems=[{q:'4/5 + 1/3',a:'17/15',opts:['17/15','5/8','12/15','7/15']},{q:'2/7 + 3/4',a:'29/28',opts:['5/11','29/28','23/28','8/28']},{q:'1/2 + 2/3',a:'7/6',opts:['3/5','5/6','7/6','4/6']},{q:'3/8 + 1/4',a:'5/8',opts:['4/12','5/8','4/8','7/8']},{q:'5/6 + 1/2',a:'8/6',opts:['6/8','4/3','7/6','8/6']}];
let cur=0,score=0,answered=new Set(),practiceStarted=false,wrongCounts={};

function renderProgress(){let h='';for(let i=0;i<5;i++){h+='<div class="p-dot '+(answered.has(i)?'done':i===cur?'cur':'')+'"></div>';}document.getElementById('progress').innerHTML=h;}

function startPractice(){practiceStarted=true;renderProgress();renderQ();}

function renderQ(){
if(cur>=5){document.getElementById('practiceArea').innerHTML='<div class="result correct" style="font-size:20px;margin-top:16px">All Done! Score: '+score+'/5 — Great crafting!</div>';celebrate();return;}
const p=problems[cur];
let h='<div class="mc-card"><h3>Problem '+(cur+1)+': '+p.q+' = ?</h3><div style="display:flex;gap:8px;flex-wrap:wrap;margin:12px 0">';
p.opts.forEach((o,i)=>{h+='<button class="btn btn-blue" onclick="checkA('+i+',\\''+o+'\\',\\''+p.a+'\\')">'+o+'</button>';});
h+='</div><div id="fb"></div></div>';
document.getElementById('practiceArea').innerHTML=h;
}

function checkA(i,sel,ans){
if(answered.has(cur))return;
if(sel===ans){score++;answered.add(cur);document.getElementById('score').textContent=score;document.getElementById('fb').innerHTML='<div class="result correct">Correct!</div>';renderProgress();setTimeout(()=>{cur++;renderQ();},1200);}
else{if(!wrongCounts[cur])wrongCounts[cur]=0;wrongCounts[cur]++;
document.getElementById('fb').innerHTML='<div class="result wrong">Try again!</div>';
window.parent.postMessage({type:'wrongAnswer',questionIndex:cur,wrongCount:wrongCounts[cur],questionText:problems[cur].q},'*');
if(wrongCounts[cur]>=3){window.parent.postMessage({type:'reframeNeeded',questionIndex:cur,questionText:problems[cur].q,wrongCount:wrongCounts[cur]},'*');}
setTimeout(()=>{document.getElementById('fb').innerHTML='';},1200);}
}

function celebrate(){const c=document.getElementById('confettiBox');const colors=['#8BC34A','#FF9800','#2196F3','#F44336','#FFEB3B'];for(let i=0;i<50;i++){const d=document.createElement('div');d.style.cssText='position:absolute;width:10px;height:10px;background:'+colors[Math.floor(Math.random()*5)]+';left:'+Math.random()*100+'%;top:-10px;animation:cfall '+(2+Math.random()*3)+'s linear '+Math.random()*2+'s forwards';c.appendChild(d);}
const s=document.createElement('style');s.textContent='@keyframes cfall{0%{transform:translateY(0) rotate(0)}100%{transform:translateY(100vh) rotate(720deg);opacity:0}}';document.head.appendChild(s);}

renderProgress();
</script></body></html>`;

// ================================================================
//  SOFIA — Reading / Encanto
// ================================================================
const SOFIA_READING_TEXT = `**Mirabel's Fraction Adventure!**

Hola, Sofia! Mirabel from Encanto needs your help with some magic fraction problems!

In the Casita, the Madrigal family is preparing for a big celebration. They need to combine different amounts of ingredients. But the ingredients come in different-sized portions — that means fractions with different denominators!

**How to Add Fractions with Different Denominators:**

When the bottom numbers (denominators) are different, we need to find a common size first. It's like when Luisa needs to stack blocks of different sizes — she arranges them so they all fit together!

**Step 1:** Look at the denominators (bottom numbers)
**Step 2:** Find the Least Common Denominator (LCD) — the smallest number both denominators divide into
**Step 3:** Convert each fraction to use the LCD
**Step 4:** Add the numerators (top numbers)
**Step 5:** Keep the denominator the same

**Example: 4/5 + 1/3**
• LCD of 5 and 3 = 15
• 4/5 = 12/15 (multiply top and bottom by 3)
• 1/3 = 5/15 (multiply top and bottom by 5)
• 12/15 + 5/15 = **17/15** (or 1 and 2/15)

Mirabel says: "We don't talk about different denominators... we just find the common one!" Now try the problems below!`;

// ────────────────────────────────────────────────────────────────
// ASSEMBLED EXPORTS
// ────────────────────────────────────────────────────────────────
export const DEMO_ADAPTED_LESSONS = {
  // NOTE: Jamie removed from demo per user request

  aisha: {
    adaptedText: "SpongeBob is making Krabby Patty fractions at the Krusty Krab! Look at the pictures to see how fractions combine!",
    character: 'SpongeBob',
    mode: 'Visual',
    cloudinaryPrompt: 'SpongeBob counting Krabby Patties to learn fractions',
    imageUrl: SB,
    imageUrls: { neutral: SB, happy: KRABBY, supportive: KRABS },
    characterImages: [SB, KRABS_MONEY, KRABBY, KRABS, ROCK, PATRICK],
    questions: FRACTION_QUESTIONS,
    interactiveHtml: AISHA_VISUAL_HTML,
    elevenLabsScript: '',
    chatContext: 'SpongeBob-themed fraction addition help for visual learner',
  },

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

No job is too big, no pup is too small! You've got this, Maya!`,
    chatContext: 'Paw Patrol Ryder-themed fraction tutoring for auditory learner. Use encouraging language.',
    questions: FRACTION_QUESTIONS,
    interactiveHtml: MAYA_AUDITORY_HTML,
    audioUrl: '', // Would be generated by ElevenLabs
  },

  eli: {
    adaptedText: "Steve is building fraction blocks in Minecraft! Click, drag, and interact to learn fractions!",
    character: 'Minecraft Steve',
    mode: 'Kinesthetic',
    cloudinaryPrompt: '',
    elevenLabsScript: '',
    chatContext: 'Minecraft-themed fraction help for kinesthetic learner. Use building/crafting metaphors.',
    questions: FRACTION_QUESTIONS,
    interactiveHtml: ELI_KINESTHETIC_HTML,
  },

  sofia: {
    adaptedText: SOFIA_READING_TEXT,
    character: 'Mirabel (Encanto)',
    mode: 'Reading',
    cloudinaryPrompt: '',
    elevenLabsScript: '',
    chatContext: 'You are a friendly math tutor helping Sofia learn fractions. She loves Encanto and Mirabel. Use Encanto references. Be clear and specific — ambiguous instructions frustrate her.',
    questions: FRACTION_QUESTIONS,
    interactiveHtml: '',
  },
};

// ─── Frustration demo scenarios ─────────────────────────────────
export const DEMO_FRUSTRATION_EVENTS = [
  {
    id: 'frust-1',
    studentId: 'eli',
    studentName: 'Eli R.',
    timestamp: new Date(Date.now() - 300000).toISOString(),
    trigger: '3 consecutive wrong answers on Q3',
    triggerType: 'wrong_attempts',
    frustrationScore: 82,
    question: 'Q3: 1/2 + 2/3 = ?',
    beforeState: 'Kinesthetic mode — standard fraction blocks',
    afterState: 'Regenerated with step-by-step guided walkthrough + simplified blocks',
    status: 'auto-reframed',
    severity: 'high',
    resolution: 'Auto-regenerated interactive lesson with smaller steps.',
  },
  {
    id: 'frust-2',
    studentId: 'maya',
    studentName: 'Maya K.',
    timestamp: new Date(Date.now() - 600000).toISOString(),
    trigger: 'Rapid clicking detected (5 clicks in 4 seconds)',
    triggerType: 'rapid_clicks',
    frustrationScore: 58,
    question: 'Q2: 2/7 + 3/4 = ?',
    beforeState: 'Auditory narration — standard pacing',
    afterState: 'Re-read narration at slower pace with additional hints',
    status: 'auto-reframed',
    severity: 'moderate',
    resolution: 'Audio narration replayed at 0.8x speed.',
  },
  {
    id: 'frust-3',
    studentId: 'eli',
    studentName: 'Eli R.',
    timestamp: new Date(Date.now() - 180000).toISOString(),
    trigger: 'Typed "this is too hard" in chat',
    triggerType: 'keyword',
    frustrationScore: 90,
    question: 'Q4: 3/8 + 1/4 = ?',
    beforeState: 'Standard kinesthetic interaction',
    afterState: 'Simplified to 2-step problem with visual hints + encouragement',
    status: 'teacher-notified',
    severity: 'high',
    resolution: 'Teacher notification sent. Break prompt shown.',
  },
];

export const DEMO_APPROVED_HISTORY = [
  {
    id: 'approved-fractions-1',
    assignmentTitle: 'Adding Fractions Worksheet',
    subject: 'Math',
    approvedAt: new Date(Date.now() - 3600000).toISOString(),
    approvedBy: 'alysonga@usc.edu',
    studentCount: 4,
    students: ['maya', 'eli', 'sofia', 'aisha'],
    frustrationEvents: 3,
    avgScore: null,
    status: 'active',
  },
  {
    id: 'approved-addition-1',
    assignmentTitle: 'Addition — Krabby Patty counting',
    subject: 'Math',
    approvedAt: new Date(Date.now() - 86400000).toISOString(),
    approvedBy: 'alysonga@usc.edu',
    studentCount: 4,
    students: ['maya', 'eli', 'sofia', 'aisha'],
    frustrationEvents: 6,
    avgScore: 64,
    status: 'completed',
  },
];

// ─── PRE-GENERATED REFRAME CONTENT ─────────────────────────────────────
// Loads instantly when a student gets a question wrong 3+ times.
// Keyed by question text.
export const DEMO_REFRAMES = {
  '4/5 + 1/3': {
    steps: [
      { label: 'Step 1 — Same-size pieces', content: 'Imagine SpongeBob cuts a pizza into 15 equal slices. That\'s our common denominator!' },
      { label: 'Step 2 — Convert', content: '4/5 means 12 slices out of 15. And 1/3 means 5 slices out of 15.' },
      { label: 'Step 3 — Add the slices', content: '12 slices + 5 slices = 17 slices. So 4/5 + 1/3 = 17/15!' },
    ],
    simplifiedQuestion: { text: 'If SpongeBob has 12 pizza slices and Patrick brings 5 more, how many slices total?', options: ['15', '17', '7'], correctIndex: 1 },
    encouragement: 'You\'re doing awesome! Even SpongeBob needed practice with fractions!',
  },
  '2/7 + 3/4': {
    steps: [
      { label: 'Step 1 — Find the LCD', content: 'Mr. Krabs wants to split things into 28 equal parts — that\'s the smallest number 7 and 4 both fit into.' },
      { label: 'Step 2 — Convert each fraction', content: '2/7 = 8/28 (multiply by 4), and 3/4 = 21/28 (multiply by 7).' },
      { label: 'Step 3 — Add', content: '8 + 21 = 29. So 2/7 + 3/4 = 29/28!' },
    ],
    simplifiedQuestion: { text: 'Mr. Krabs has 8 coins and finds 21 more. How many coins total?', options: ['28', '29', '13'], correctIndex: 1 },
    encouragement: 'Mr. Krabs believes in you — and he doesn\'t believe in anything that doesn\'t make money!',
  },
  '1/2 + 2/3': {
    steps: [
      { label: 'Step 1 — Common denominator', content: 'Patrick and SpongeBob split a Krabby Patty into 6 pieces — both 2 and 3 go into 6.' },
      { label: 'Step 2 — Convert', content: '1/2 = 3/6 (3 pieces for Patrick), and 2/3 = 4/6 (4 pieces for SpongeBob).' },
      { label: 'Step 3 — Add', content: '3 + 4 = 7 pieces. So 1/2 + 2/3 = 7/6!' },
    ],
    simplifiedQuestion: { text: 'Patrick eats 3 pieces and SpongeBob eats 4 pieces. How many pieces eaten?', options: ['6', '7', '1'], correctIndex: 1 },
    encouragement: 'Patrick is so proud of you! He says this is even better than his rock!',
  },
  '3/8 + 1/4': {
    steps: [
      { label: 'Step 1 — Lucky break!', content: '4 already fits into 8, so the common denominator is just 8. Easy!' },
      { label: 'Step 2 — Convert only one', content: '1/4 = 2/8. The 3/8 stays the same.' },
      { label: 'Step 3 — Add', content: '3 + 2 = 5. So 3/8 + 1/4 = 5/8!' },
    ],
    simplifiedQuestion: { text: 'SpongeBob has 3 Krabby Patties and gets 2 more. How many total?', options: ['4', '5', '6'], correctIndex: 1 },
    encouragement: 'Great job! SpongeBob says "I\'m ready!" and so are you!',
  },
  '5/6 + 1/2': {
    steps: [
      { label: 'Step 1 — Common denominator', content: '2 goes into 6, so the LCD is 6. Mr. Krabs loves easy math!' },
      { label: 'Step 2 — Convert', content: '1/2 = 3/6. The 5/6 stays the same.' },
      { label: 'Step 3 — Add', content: '5 + 3 = 8. So 5/6 + 1/2 = 8/6!' },
    ],
    simplifiedQuestion: { text: 'If Mr. Krabs has 5 dollar bills and finds 3 more, how many does he have?', options: ['7', '8', '9'], correctIndex: 1 },
    encouragement: 'Mr. Krabs says every penny counts — and so does every fraction you learn!',
  },
};

export function getDemoLesson(studentId) {
  return DEMO_ADAPTED_LESSONS[studentId] || null;
}

export function isDemoDataAvailable() {
  return true;
}
