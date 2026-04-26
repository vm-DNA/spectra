import React, { useState, useRef, useEffect, useCallback } from 'react';
import { STUDENTS } from '../../lib/mockData';
import { DEMO_ADAPTED_LESSONS, DEMO_FRUSTRATION_EVENTS } from '../../lib/demoData';

// Only students that have demo lessons
const DEMO_STUDENTS = STUDENTS.filter(s => DEMO_ADAPTED_LESSONS[s.id]);

const MODE_COLORS = {
  Visual:      { color: '#7C3AED', bg: '#F3F0FF', border: '#C4B5FD' },
  Auditory:    { color: '#0D9488', bg: '#E6FFFA', border: '#5EEAD4' },
  Reading:     { color: '#B45309', bg: '#FFF8E7', border: '#FCD34D' },
  Kinesthetic: { color: '#DC2626', bg: '#FFF1F0', border: '#FCA5A5' },
};

const FRUSTRATION_KEYWORDS = ['hard', 'difficult', 'confused', 'don\'t understand', 'help', 'stuck', 'hate', 'stupid', 'can\'t', 'quit', 'give up'];

export default function DemoStudentView() {
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const [frustrationScore, setFrustrationScore] = useState(0);
  const [frustrationEvents, setFrustrationEvents] = useState([]);
  const [reframeTriggered, setReframeTriggered] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const chatEndRef = useRef(null);
  const clickTimestamps = useRef([]);
  const recognitionRef = useRef(null);

  const student = DEMO_STUDENTS.find(s => s.id === selectedStudent);
  const lesson = selectedStudent ? DEMO_ADAPTED_LESSONS[selectedStudent] : null;
  const mode = student?.learningStyles?.[0] || 'Visual';
  const modeStyle = MODE_COLORS[mode] || MODE_COLORS.Visual;
  const character = lesson?.character || student?.characters?.[0] || 'Tutor';

  // Scroll chat to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  // Init chat when student selected
  useEffect(() => {
    if (selectedStudent && lesson) {
      setChatMessages([{
        role: 'ai',
        text: `Hi! I'm ${character}! I'm here to help you with fractions. Ask me anything or tell me if you're stuck!`,
      }]);
      setFrustrationScore(0);
      setFrustrationEvents([]);
      setReframeTriggered(false);
      clickTimestamps.current = [];
    }
  }, [selectedStudent, lesson, character]);

  // Frustration detection: rapid clicks
  const recordClick = useCallback(() => {
    const now = Date.now();
    clickTimestamps.current.push(now);
    // Check for 5+ clicks in 4 seconds
    const recent = clickTimestamps.current.filter(t => now - t < 4000);
    clickTimestamps.current = recent;
    if (recent.length >= 5) {
      const newScore = Math.min(frustrationScore + 15, 100);
      setFrustrationScore(newScore);
      setFrustrationEvents(prev => [...prev, {
        id: `frust-live-${Date.now()}`,
        studentName: student?.name,
        trigger: `Rapid clicking detected (${recent.length} clicks in 4s)`,
        triggerType: 'rapid_clicks',
        frustrationScore: newScore,
        severity: newScore >= 70 ? 'high' : 'moderate',
        timestamp: new Date().toISOString(),
        status: newScore >= 70 ? 'auto-reframed' : 'monitoring',
      }]);
      clickTimestamps.current = [];
    }
  }, [frustrationScore, student]);

  // Check for frustration keywords in chat
  const checkFrustration = useCallback((msg) => {
    const lower = msg.toLowerCase();
    const found = FRUSTRATION_KEYWORDS.filter(k => lower.includes(k));
    if (found.length > 0) {
      const boost = found.length * 20;
      const newScore = Math.min(frustrationScore + boost, 100);
      setFrustrationScore(newScore);
      setFrustrationEvents(prev => [...prev, {
        id: `frust-live-${Date.now()}`,
        studentName: student?.name,
        trigger: `Typed frustration keyword: "${found.join('", "')}"`,
        triggerType: 'keyword',
        frustrationScore: newScore,
        severity: newScore >= 70 ? 'high' : 'moderate',
        timestamp: new Date().toISOString(),
        status: newScore >= 70 ? 'teacher-notified' : 'monitoring',
      }]);
      if (newScore >= 70 && !reframeTriggered) {
        setReframeTriggered(true);
      }
    }
  }, [frustrationScore, student, reframeTriggered]);

  // Persist frustration events to localStorage for teacher dashboard
  useEffect(() => {
    if (frustrationEvents.length > 0) {
      localStorage.setItem('spectra_live_frustration', JSON.stringify(frustrationEvents));
    }
  }, [frustrationEvents]);

  // Voice input via Web Speech API
  const startListening = useCallback(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setChatMessages(prev => [...prev, { role: 'ai', text: 'Voice input is not supported in this browser. Please type your question!' }]);
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';
    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setChatInput(transcript);
    };
    recognition.onerror = () => setIsListening(false);
    recognitionRef.current = recognition;
    recognition.start();
  }, []);

  // Speak AI response via ElevenLabs TTS
  const speakResponse = useCallback(async (text) => {
    setIsSpeaking(true);
    try {
      const res = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: text.slice(0, 500) }),
      });
      if (res.ok) {
        const blob = await res.blob();
        const audio = new Audio(URL.createObjectURL(blob));
        audio.onended = () => setIsSpeaking(false);
        audio.play();
      } else {
        setIsSpeaking(false);
      }
    } catch {
      setIsSpeaking(false);
    }
  }, []);

  const handleSendChat = async () => {
    if (!chatInput.trim() || chatLoading) return;
    const msg = chatInput.trim();
    setChatInput('');
    setChatMessages(prev => [...prev, { role: 'user', text: msg }]);
    checkFrustration(msg);
    recordClick();

    setChatLoading(true);
    try {
      const res = await fetch('/api/tutor-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: msg,
          question: 'Adding fractions with different denominators',
          studentProfile: {
            name: student?.name,
            id: student?.id,
            characters: student?.characters,
            learningStyles: student?.learningStyles,
          },
        }),
      });
      if (res.ok) {
        const data = await res.json();
        const replyText = data.reply || data.message || `That's a great question! When adding fractions, remember to find the common denominator first. Would you like me to walk through an example?`;
        setChatMessages(prev => [...prev, { role: 'ai', text: replyText }]);
        if (mode === 'Auditory') speakResponse(replyText);
      } else {
        throw new Error('API error');
      }
    } catch {
      // Fallback: use client-side responses
      const lower = msg.toLowerCase();
      let reply;
      if (lower.includes('help') || lower.includes('hard') || lower.includes('don\'t understand')) {
        reply = `I understand this can be tricky! Let me break it down simply: when adding fractions like 1/2 + 1/3, we need to make the bottom numbers (denominators) the same. The smallest number both 2 and 3 go into is 6. So 1/2 becomes 3/6 and 1/3 becomes 2/6. Now just add the tops: 3+2 = 5/6! Want me to try another example?`;
      } else if (lower.includes('denominator') || lower.includes('common')) {
        reply = `Great question about denominators! The common denominator is the smallest number that both denominators divide into evenly. For example, for 1/4 + 1/6, the LCD is 12 because both 4 and 6 go into 12. Then convert: 1/4 = 3/12 and 1/6 = 2/12. Add the tops: 3+2 = 5/12!`;
      } else if (lower.includes('numerator') || lower.includes('top')) {
        reply = `The numerator is the top number in a fraction — it tells you how many pieces you have. When adding fractions with the same denominator, you just add the numerators and keep the denominator. For example: 3/8 + 2/8 = 5/8!`;
      } else {
        reply = `That's a good question! In fractions, the key steps are: (1) Find the common denominator, (2) Convert both fractions, (3) Add the numerators. Would you like me to show you a step-by-step example?`;
      }
      setChatMessages(prev => [...prev, { role: 'ai', text: reply }]);
      if (mode === 'Auditory') speakResponse(reply);
    } finally {
      setChatLoading(false);
    }
  };

  // ─── AVATAR PICKER ───
  if (!selectedStudent) {
    return (
      <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', padding: 20 }}>
        <div style={{ maxWidth: 700, margin: '0 auto', textAlign: 'center' }}>
          <h1 style={{ color: 'white', fontSize: 28, marginBottom: 8, fontWeight: 700 }}>
            Spectra Demo — Student View
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: 14, marginBottom: 24 }}>
            Pick a student to see their personalized lesson
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
            {DEMO_STUDENTS.map(s => {
              const sMode = s.learningStyles?.[0] || 'Visual';
              const sColor = MODE_COLORS[sMode] || MODE_COLORS.Visual;
              const sLesson = DEMO_ADAPTED_LESSONS[s.id];
              return (
                <div
                  key={s.id}
                  onClick={() => setSelectedStudent(s.id)}
                  style={{
                    background: 'white', borderRadius: 16, padding: 20,
                    cursor: 'pointer', transition: 'all 0.2s',
                    border: `3px solid transparent`,
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.borderColor = sColor.color; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.borderColor = 'transparent'; }}
                >
                  <div style={{
                    width: 64, height: 64, borderRadius: '50%',
                    background: s.avatarColor.bg, color: s.avatarColor.text,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 22, fontWeight: 700, margin: '0 auto 10px',
                  }}>
                    {s.initials}
                  </div>
                  <div style={{ fontWeight: 600, fontSize: 16, marginBottom: 4 }}>{s.name}</div>
                  <div style={{
                    display: 'inline-block', padding: '3px 10px', borderRadius: 8,
                    background: sColor.bg, color: sColor.color,
                    fontSize: 12, fontWeight: 600, marginBottom: 6,
                  }}>
                    {sMode}
                  </div>
                  <div style={{ fontSize: 12, color: '#666' }}>
                    {sLesson?.character} themed
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // ─── LESSON VIEW ───
  return (
    <div style={{ minHeight: '100vh', background: '#f5f5f5' }}>
      {/* Top bar */}
      <div style={{
        background: 'white', borderBottom: `3px solid ${modeStyle.color}`,
        padding: '10px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        position: 'sticky', top: 0, zIndex: 10,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <button
            onClick={() => setSelectedStudent(null)}
            style={{
              background: 'none', border: 'none', fontSize: 20, cursor: 'pointer',
              padding: '2px 8px', borderRadius: 6,
            }}
          >
            ←
          </button>
          <div style={{
            width: 36, height: 36, borderRadius: '50%',
            background: student?.avatarColor?.bg, color: student?.avatarColor?.text,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 14, fontWeight: 700,
          }}>
            {student?.initials}
          </div>
          <div>
            <div style={{ fontWeight: 600, fontSize: 14 }}>{student?.name}</div>
            <div style={{ fontSize: 11, color: modeStyle.color }}>{mode} Mode · {character}</div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {/* Frustration meter */}
          <div style={{ textAlign: 'right' }}>
            <div style={{
              fontSize: 10, color: frustrationScore >= 70 ? '#DC2626' : frustrationScore >= 40 ? '#F59E0B' : '#10B981',
              fontWeight: 600,
            }}>
              Frustration: {frustrationScore}
            </div>
            <div style={{
              width: 80, height: 6, background: '#e5e7eb', borderRadius: 3, overflow: 'hidden',
            }}>
              <div style={{
                width: `${frustrationScore}%`, height: '100%', borderRadius: 3,
                background: frustrationScore >= 70 ? '#DC2626' : frustrationScore >= 40 ? '#F59E0B' : '#10B981',
                transition: 'all 0.3s',
              }} />
            </div>
          </div>
        </div>
      </div>

      {/* Reframe banner */}
      {reframeTriggered && (
        <div style={{
          background: '#FEF2F2', borderBottom: '2px solid #FECACA',
          padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 10,
        }}>
          <span style={{ fontSize: 20 }}>⚠️</span>
          <div>
            <div style={{ fontWeight: 600, fontSize: 13, color: '#991B1B' }}>
              Frustration Detected — Auto-Reframe Triggered
            </div>
            <div style={{ fontSize: 12, color: '#B91C1C' }}>
              The lesson has been simplified. Teacher has been notified.
            </div>
          </div>
        </div>
      )}

      {/* Main content: lesson + chat side by side */}
      <div style={{ display: 'flex', height: 'calc(100vh - 56px)', overflow: 'hidden' }}>

        {/* Lesson area */}
        <div style={{ flex: 1, overflow: 'auto', padding: 12 }}>
          {lesson?.interactiveHtml ? (
            <iframe
              title="Student lesson"
              srcDoc={lesson.interactiveHtml}
              sandbox="allow-scripts allow-same-origin"
              style={{
                width: '100%', height: '100%', minHeight: 600,
                border: `2px solid ${modeStyle.border}`,
                borderRadius: 12, background: 'white',
              }}
            />
          ) : mode === 'Reading' ? (
            <div style={{
              background: 'white', borderRadius: 12, padding: 24,
              fontSize: 15, lineHeight: 1.8, maxWidth: 700,
            }}>
              {(lesson?.adaptedText || '').split('\n').map((line, i) => {
                if (line.startsWith('**') && line.endsWith('**')) {
                  return <h3 key={i} style={{ marginTop: 16, marginBottom: 4, color: '#92400E' }}>{line.replace(/\*\*/g, '')}</h3>;
                }
                if (line.startsWith('**')) {
                  return <p key={i} style={{ marginBottom: 4 }}><strong>{line.replace(/\*\*/g, '')}</strong></p>;
                }
                return <p key={i} style={{ marginBottom: line === '' ? 12 : 4 }}>{line}</p>;
              })}
            </div>
          ) : (
            <div style={{
              background: 'white', borderRadius: 12, padding: 24,
              textAlign: 'center', color: '#666',
            }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>📝</div>
              <div>Lesson content loading...</div>
            </div>
          )}
        </div>

        {/* Chat panel */}
        <div style={{
          width: 320, flexShrink: 0, borderLeft: '1px solid #e5e7eb',
          display: 'flex', flexDirection: 'column', background: 'white',
        }}>
          <div style={{
            padding: '12px 16px', borderBottom: '1px solid #e5e7eb',
            fontWeight: 600, fontSize: 14, color: modeStyle.color,
          }}>
            {mode === 'Auditory' ? '🎙️' : '💬'} {mode === 'Auditory' ? `Talk to ${character}` : `Chat with ${character}`}
            {frustrationEvents.length > 0 && (
              <span style={{
                marginLeft: 8, padding: '2px 6px', borderRadius: 8,
                background: '#FEF2F2', color: '#DC2626', fontSize: 10, fontWeight: 700,
              }}>
                {frustrationEvents.length} alert{frustrationEvents.length > 1 ? 's' : ''}
              </span>
            )}
          </div>

          {/* Chat messages */}
          <div style={{ flex: 1, overflowY: 'auto', padding: 12 }}>
            {chatMessages.length === 0 && mode === 'Auditory' && (
              <div style={{
                textAlign: 'center', color: '#78909C', fontSize: 13,
                padding: '24px 12px', lineHeight: 1.6,
              }}>
                <div style={{ fontSize: 32, marginBottom: 8 }}>🎙️</div>
                Tap the mic button below to ask {character} a question using your voice
              </div>
            )}
            {chatMessages.map((msg, i) => (
              <div key={i} style={{
                marginBottom: 10,
                display: 'flex',
                justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
              }}>
                <div style={{
                  maxWidth: '85%', padding: '8px 12px', borderRadius: 12,
                  fontSize: 13, lineHeight: 1.5,
                  background: msg.role === 'user' ? '#EEF2FF' : modeStyle.bg,
                  color: msg.role === 'user' ? '#3730A3' : modeStyle.color,
                  borderBottomRightRadius: msg.role === 'user' ? 4 : 12,
                  borderBottomLeftRadius: msg.role === 'ai' ? 4 : 12,
                }}>
                  {msg.text}
                </div>
              </div>
            ))}
            {chatLoading && (
              <div style={{
                padding: '8px 12px', borderRadius: 12, background: modeStyle.bg,
                color: modeStyle.color, fontSize: 13, display: 'inline-block',
              }}>
                {character} is {mode === 'Auditory' ? 'thinking...' : 'typing...'}
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Frustration events log */}
          {frustrationEvents.length > 0 && (
            <div style={{
              borderTop: '1px solid #e5e7eb', padding: 8, maxHeight: 120, overflowY: 'auto',
              background: '#FEF2F2',
            }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: '#991B1B', marginBottom: 4 }}>
                FRUSTRATION LOG
              </div>
              {frustrationEvents.map((evt, i) => (
                <div key={i} style={{ fontSize: 10, color: '#B91C1C', marginBottom: 2 }}>
                  • {evt.trigger} (score: {evt.frustrationScore})
                </div>
              ))}
            </div>
          )}

          {/* Speaking indicator */}
          {isSpeaking && (
            <div style={{
              padding: '4px 12px', background: '#E6FFFA', textAlign: 'center',
              fontSize: 11, color: '#0D9488', fontWeight: 600,
              borderTop: '1px solid #e5e7eb',
            }}>
              🔊 {character} is speaking...
            </div>
          )}

          {/* Chat input — Auditory: speech-to-text mic, Others: text input */}
          {mode === 'Auditory' ? (
            <div style={{
              padding: '12px', borderTop: '1px solid #e5e7eb',
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
            }}>
              <button
                onClick={() => { if (isListening) { recognitionRef.current?.stop(); } else { startListening(); } }}
                style={{
                  width: 56, height: 56, borderRadius: '50%', border: 'none',
                  background: isListening ? '#DC2626' : modeStyle.color,
                  color: 'white', fontSize: 24, cursor: 'pointer',
                  boxShadow: isListening ? '0 0 0 4px rgba(220,38,38,0.2)' : '0 2px 8px rgba(0,0,0,0.1)',
                  transition: 'all 0.2s',
                }}
              >
                {isListening ? '⏹' : '🎤'}
              </button>
              <div style={{ fontSize: 11, color: isListening ? '#DC2626' : '#9CA3AF', fontWeight: 500 }}>
                {isListening ? 'Listening... tap to stop' : 'Tap to speak'}
              </div>
              {chatInput && (
                <div style={{
                  display: 'flex', gap: 6, width: '100%', alignItems: 'center',
                }}>
                  <div style={{
                    flex: 1, padding: '8px 12px', borderRadius: 12,
                    background: '#f3f4f6', fontSize: 13, color: '#374151',
                  }}>
                    {chatInput}
                  </div>
                  <button
                    onClick={handleSendChat}
                    disabled={chatLoading}
                    style={{
                      padding: '8px 16px', borderRadius: 16, border: 'none',
                      background: modeStyle.color, color: 'white', fontSize: 13,
                      fontWeight: 600, cursor: 'pointer',
                    }}
                  >
                    Send
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div style={{
              padding: '8px 12px', borderTop: '1px solid #e5e7eb',
              display: 'flex', gap: 6,
            }}>
              <button
                onClick={startListening}
                disabled={isListening}
                title="Voice input"
                style={{
                  width: 36, height: 36, borderRadius: '50%', border: 'none',
                  background: isListening ? '#DC2626' : '#f3f4f6',
                  color: isListening ? 'white' : '#666',
                  fontSize: 16, cursor: 'pointer', flexShrink: 0,
                  animation: isListening ? 'pulse 1s infinite' : 'none',
                }}
              >
                🎤
              </button>
              <input
                value={chatInput}
                onChange={e => setChatInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSendChat()}
                placeholder={isListening ? 'Listening...' : `Ask ${character}...`}
                style={{
                  flex: 1, padding: '8px 12px', borderRadius: 20,
                  border: `1.5px solid ${isListening ? '#DC2626' : '#e5e7eb'}`,
                  fontSize: 13, outline: 'none',
                }}
              />
              <button
                onClick={handleSendChat}
                disabled={chatLoading}
                style={{
                  padding: '8px 16px', borderRadius: 20, border: 'none',
                  background: modeStyle.color, color: 'white', fontSize: 13,
                  fontWeight: 600, cursor: 'pointer',
                }}
              >
                Send
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
