import React, { useState, useCallback, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getAssignment, getStudent } from '../../lib/mockData';
import { useFrustration } from '../../lib/useFrustration';
import { FrustrationBar, SigRow, TlItem, Alert } from '../../components/UI';
import { useLessonContext } from '../../lib/LessonContext';
import { tutorChat } from '../../lib/gemmaApi';

const STUDENT = getStudent('jamie');
const MODES   = ['Visual', 'Listen', 'Read', 'Kinesthetic'];

export default function CuratedLesson() {
  const { assignmentId } = useParams();
  const navigate         = useNavigate();
  const assignment       = getAssignment(assignmentId);
  const { getAdaptedVersion } = useLessonContext();

  // Load Gemma-generated content from LessonContext or localStorage
  const contextVersion = getAdaptedVersion(assignmentId, STUDENT.id);
  const [gemmaLesson, setGemmaLesson] = useState(null);

  useEffect(() => {
    const stored = localStorage.getItem('spectra_adapted_lesson');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        const studentLesson = parsed[STUDENT?.id || 'jamie'];
        if (studentLesson) setGemmaLesson(studentLesson);
      } catch (e) {
        console.error('Failed to parse stored lesson:', e);
      }
    }
  }, []);

  const adaptedVersion = contextVersion || gemmaLesson;
  const questions = adaptedVersion?.questions?.length
    ? adaptedVersion.questions
    : assignment.questions;

  const [mode, setMode]         = useState('Visual');
  const [qIndex, setQIndex]     = useState(0);
  const [selected, setSelected] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [visualMood, setVisualMood] = useState('neutral');
  const [tutorInput, setTutorInput] = useState('');
  const [tutorReply, setTutorReply] = useState('');
  const [highlightTerms, setHighlightTerms] = useState([]);
  const [chatLoading, setChatLoading] = useState(false);
  const [adaptLog, setAdaptLog] = useState([
    { text: `${STUDENT.characters[0]} visual mode loaded per profile`, time: '9:02 AM', color: 'var(--teal)' },
  ]);

  const question = questions[qIndex];

  const onFrustrationTriggered = useCallback((score) => {
    console.log('Frustration threshold crossed:', score);
    navigate('/student/reframe', {
      state: {
        question,
        studentProfile: STUDENT,
        wrongAttempts: frustration.wrongAttempts,
        assignmentId,
        qIndex,
        studentId: STUDENT.id,
      },
    });
  }, [navigate, question, assignmentId, qIndex, frustration.wrongAttempts]);

  const frustration = useFrustration({ onFrustrationTriggered });

  const imageMap = adaptedVersion?.imageUrls || {};
  const visualImage =
    imageMap[visualMood] ||
    adaptedVersion?.imageUrl ||
    imageMap.neutral ||
    null;

  const highlightText = (text) => {
    if (!text) return null;
    const terms = (highlightTerms || []).filter(Boolean);
    if (!terms.length) return text;

    const escaped = terms.map(t => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
    const pattern = new RegExp(`(${escaped.join('|')})`, 'ig');
    const parts = String(text).split(pattern);

    return parts.map((part, idx) => {
      const matched = terms.some(t => t.toLowerCase() === part.toLowerCase());
      return matched ? <mark key={idx}>{part}</mark> : <span key={idx}>{part}</span>;
    });
  };

  const handleAnswer = (idx) => {
    frustration.recordClick();
    setSelected(idx);

    if (idx === question.correctIndex) {
      setFeedback({ correct: true, text: 'Correct! Great job! 🎉' });
      setVisualMood('happy');
      frustration.recordCorrectAnswer();
      setAdaptLog(prev => [
        { text: 'Correct answer — encouragement shown', time: 'Now', color: 'var(--teal)' },
        ...prev,
      ]);
    } else {
      frustration.recordWrongAnswer();
      setVisualMood('supportive');
      const wrongCount = frustration.wrongAttempts + 1;

      // Use Gemma-generated hint if available
      const gemmaHint = question?.hint;
      const defaultHint = `Hint: add just the top numbers — what is ${question.text.match(/\d/g)?.[0] || '?'} + ${question.text.match(/\d/g)?.[1] || '?'}?`;
      const showHint = wrongCount >= 2;

      let feedbackText = 'Not quite — try again!';
      if (showHint) {
        feedbackText = gemmaHint || defaultHint;
      }

      setFeedback({ correct: false, text: feedbackText });
      setAdaptLog(prev => [
        { text: `Wrong attempt ${wrongCount} — ${showHint ? 'hint shown' : 'encouraging message'}`, time: 'Now', color: 'var(--amber)' },
        ...prev,
      ]);

      // After 3+ wrong attempts, navigate to reframe
      if (wrongCount >= 3) {
        setTimeout(() => {
          navigate('/student/reframe', {
            state: {
              question,
              studentProfile: STUDENT,
              wrongAttempts: wrongCount,
              assignmentId,
              qIndex,
              studentId: STUDENT.id,
            },
          });
        }, 1500);
      }
    }
  };

  const handleIdk = () => {
    frustration.recordIdkClick();
    setAdaptLog(prev => [
      { text: '"I don\'t understand" clicked — language simplified', time: 'Now', color: 'var(--amber)' },
      ...prev,
    ]);
  };

  const handleNext = () => {
    if (qIndex < questions.length - 1) {
      setQIndex(q => q + 1);
      setSelected(null);
      setFeedback(null);
      setVisualMood('neutral');
      setTutorReply('');
      frustration.reset();
    } else {
      navigate('/student/complete');
    }
  };

  const handleTutorAsk = async () => {
    if (!tutorInput.trim()) return;
    setChatLoading(true);
    try {
      const response = await tutorChat({
        message: tutorInput.trim(),
        question,
        studentProfile: STUDENT,
      });
      setTutorReply(response.reply || '');
      setHighlightTerms(Array.isArray(response.highlightTerms) ? response.highlightTerms : []);
    } catch (err) {
      setTutorReply(err.message || 'Could not reach tutor right now.');
      setHighlightTerms([]);
    } finally {
      setChatLoading(false);
    }
  };

  return (
    <div className="stack" style={{ gap: 12 }}>

      {/* Mode switcher + progress */}
      <div className="card-sm">
        <div className="row" style={{ gap: 6, flexWrap: 'wrap', marginBottom: 8 }}>
          {MODES.map(m => (
            <span
              key={m}
              className={`badge ${mode === m ? 'badge-purple' : 'badge-gray'}`}
              style={{ cursor: 'pointer', fontSize: 12, padding: '4px 12px' }}
              onClick={() => setMode(m)}
            >
              {m}
            </span>
          ))}
          <span style={{ marginLeft: 'auto', fontSize: 12, color: 'var(--text-muted)' }}>
            {qIndex + 1} of {questions.length}
          </span>
        </div>
        {/* Progress dots */}
        <div className="row" style={{ gap: 6 }}>
          {questions.map((_, i) => (
            <div key={i} style={{
              width: 8, height: 8, borderRadius: '50%',
              background: i < qIndex ? 'var(--teal)' : i === qIndex ? 'var(--purple)' : 'var(--border-md)',
            }} />
          ))}
        </div>
      </div>

      {/* Lesson card */}
      <div className="card">
        <div className="char-bubble">{STUDENT.characters[0]} says: Let's do this! ⭐</div>

        {/* Adapted text from Gemma */}
        {adaptedVersion?.adaptedText && (
          <p style={{ fontSize: 13, marginBottom: 12, lineHeight: 1.7 }}>
            {mode === 'Read' ? highlightText(adaptedVersion.adaptedText) : adaptedVersion.adaptedText}
          </p>
        )}

        {/* ── VISUAL MODE: Cloudinary themed images ── */}
        {mode === 'Visual' && (
          <div style={{
            background: 'var(--purple-light)', borderRadius: 'var(--radius-sm)',
            padding: 12, textAlign: 'center', fontSize: 12, color: 'var(--purple-dark)',
            marginBottom: 12,
          }}>
            {visualImage ? (
              <img
                src={visualImage}
                alt={`${STUDENT.characters[0]} themed lesson visual`}
                style={{ width: '100%', borderRadius: 8, border: '1px solid var(--border-md)' }}
              />
            ) : (
              <div style={{ padding: 24 }}>
                <div style={{ fontSize: 48, marginBottom: 8 }}>🎨</div>
                <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 4 }}>Visual Learning Mode</div>
                <div>{STUDENT.characters[0]} themed illustration</div>
                {adaptedVersion?.cloudinaryPrompt && (
                  <div style={{ marginTop: 8, fontStyle: 'italic', opacity: 0.8 }}>
                    {adaptedVersion.cloudinaryPrompt}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ── LISTEN MODE: ElevenLabs audio + voice interaction ── */}
        {mode === 'Listen' && (
          <div style={{
            background: 'var(--blue-light)', borderRadius: 'var(--radius-sm)',
            padding: 12, fontSize: 12, color: 'var(--blue-dark)',
            marginBottom: 12,
          }}>
            <div style={{ textAlign: 'center', marginBottom: 10 }}>
              <div style={{ fontSize: 32, marginBottom: 4 }}>🔊</div>
              <div style={{ fontWeight: 600, fontSize: 14 }}>Auditory Learning Mode</div>
            </div>
            {adaptedVersion?.audioUrl ? (
              <audio controls autoPlay src={adaptedVersion.audioUrl} style={{ width: '100%' }}>
                Your browser does not support audio playback.
              </audio>
            ) : adaptedVersion?.elevenLabsScript ? (
              <div style={{ padding: 8, background: 'rgba(255,255,255,0.5)', borderRadius: 6, fontSize: 13, lineHeight: 1.6 }}>
                <div style={{ fontWeight: 600, marginBottom: 4 }}>📝 Narration script:</div>
                {adaptedVersion.elevenLabsScript}
              </div>
            ) : (
              <div style={{ textAlign: 'center' }}>Narration audio will play here when ElevenLabs is configured</div>
            )}
            <div style={{ marginTop: 12, textAlign: 'left', borderTop: '1px solid var(--border-md)', paddingTop: 10 }}>
              <div style={{ fontWeight: 600, marginBottom: 6 }}>💬 Talk to {STUDENT.characters[0]} tutor</div>
              <div style={{ display: 'flex', gap: 8 }}>
                <input
                  className="input"
                  value={tutorInput}
                  onChange={e => setTutorInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleTutorAsk()}
                  placeholder="Ask for help in your own words..."
                />
                <button className="btn btn-primary btn-sm" onClick={handleTutorAsk} disabled={chatLoading}>
                  {chatLoading ? '...' : 'Ask'}
                </button>
              </div>
              {tutorReply && (
                <div style={{ marginTop: 8, padding: 8, background: 'rgba(255,255,255,0.5)', borderRadius: 6, fontSize: 13 }}>
                  <strong>{STUDENT.characters[0]}:</strong> {tutorReply}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── READ MODE: Rich text + chat with LLM tutor ── */}
        {mode === 'Read' && (
          <div style={{
            background: 'var(--bg)', borderRadius: 'var(--radius-sm)',
            padding: 12, marginBottom: 12,
          }}>
            <div style={{ fontSize: 14, marginBottom: 8 }}>
              <span style={{ fontSize: 20, marginRight: 6 }}>📖</span>
              <strong>Reading Mode</strong>
            </div>
            {adaptedVersion?.chatContext && (
              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 8, padding: 8, background: 'var(--purple-light)', borderRadius: 6 }}>
                <strong>Key concepts:</strong> {adaptedVersion.chatContext}
              </div>
            )}
            <div style={{ marginTop: 10, borderTop: '1px solid var(--border-md)', paddingTop: 10 }}>
              <div style={{ fontWeight: 600, marginBottom: 6, fontSize: 13 }}>💬 Chat with {STUDENT.characters[0]} — ask anything about this lesson</div>
              <div style={{ display: 'flex', gap: 8 }}>
                <input
                  className="input"
                  value={tutorInput}
                  onChange={e => setTutorInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleTutorAsk()}
                  placeholder={`Ask ${STUDENT.characters[0]} to explain...`}
                />
                <button className="btn btn-primary btn-sm" onClick={handleTutorAsk} disabled={chatLoading}>
                  {chatLoading ? '...' : 'Ask'}
                </button>
              </div>
              {tutorReply && (
                <div style={{ marginTop: 8, padding: 10, background: 'var(--teal-light)', borderRadius: 6, fontSize: 13, lineHeight: 1.6 }}>
                  <strong>{STUDENT.characters[0]}:</strong> {tutorReply}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── KINESTHETIC MODE: Interactive HTML lesson ── */}
        {mode === 'Kinesthetic' && (
          <div style={{ marginBottom: 12 }}>
            <div style={{ fontSize: 14, marginBottom: 8 }}>
              <span style={{ fontSize: 20, marginRight: 6 }}>🖐️</span>
              <strong>Interactive Mode</strong> — click and interact to learn!
            </div>
            {adaptedVersion?.interactiveHtml ? (
              <iframe
                title="Interactive lesson"
                srcDoc={adaptedVersion.interactiveHtml}
                sandbox="allow-scripts"
                style={{
                  width: '100%',
                  minHeight: 320,
                  border: '2px solid var(--purple)',
                  borderRadius: 'var(--radius-sm)',
                  background: 'white',
                }}
              />
            ) : adaptedVersion?.interactivePlan?.length > 0 ? (
              <div style={{
                background: 'var(--teal-light)', borderRadius: 'var(--radius-sm)',
                padding: 12, fontSize: 12, color: 'var(--teal-dark)',
              }}>
                <div style={{ fontWeight: 600, marginBottom: 6 }}>Interactive mini-steps</div>
                {adaptedVersion.interactivePlan.map((step, idx) => (
                  <div key={step.step || idx} style={{ marginBottom: 4 }}>
                    {idx + 1}. {step.instruction}
                  </div>
                ))}
              </div>
            ) : (
              <div style={{
                background: 'var(--teal-light)', borderRadius: 'var(--radius-sm)',
                padding: 24, textAlign: 'center', fontSize: 13, color: 'var(--teal-dark)',
              }}>
                <div style={{ fontSize: 32, marginBottom: 8 }}>🎮</div>
                Interactive content will appear here when Gemma generates it
              </div>
            )}
          </div>
        )}

        {/* Question text */}
        <div style={{ fontSize: 15, fontWeight: 500, marginBottom: 12 }}>
          {question?.text}
        </div>

        {/* Formula display */}
        {(adaptedVersion?.formula || assignment.adaptedVersions?.jamie?.formula) && (
          <div style={{
            background: 'var(--purple-light)', borderRadius: 8, padding: 12,
            textAlign: 'center', fontSize: 20, fontWeight: 500,
            color: 'var(--purple-dark)', marginBottom: 14,
          }}>
            {adaptedVersion?.formula || assignment.adaptedVersions.jamie.formula}
          </div>
        )}

        {/* Answer options */}
        {question?.options.map((opt, idx) => (
          <div
            key={idx}
            className={`ans-opt${selected === idx ? (idx === question.correctIndex ? ' correct' : ' wrong') : ''}`}
            onClick={() => selected === null && handleAnswer(idx)}
            style={{ cursor: selected !== null ? 'default' : 'pointer' }}
          >
            <span style={{ color: 'var(--text-muted)', fontWeight: 500 }}>
              {String.fromCharCode(65 + idx)}.
            </span>
            <span style={{ fontSize: 15 }}>{opt}</span>
          </div>
        ))}

        {/* Feedback */}
        {feedback && (
          <div style={{
            marginTop: 10, padding: '8px 12px', borderRadius: 'var(--radius-sm)', fontSize: 13,
            background: feedback.correct ? 'var(--teal-light)' : 'var(--coral-light)',
            color:      feedback.correct ? 'var(--teal-dark)'  : 'var(--coral-dark)',
          }}>
            {feedback.text}
          </div>
        )}

        {/* Action buttons */}
        <div className="row-between" style={{ marginTop: 14 }}>
          <button className="btn btn-danger btn-sm" onClick={handleIdk}>
            I don't understand
          </button>
          {feedback?.correct && (
            <button className="btn btn-primary btn-sm" onClick={handleNext}>
              {qIndex < questions.length - 1 ? 'Next question →' : 'Finish!'}
            </button>
          )}
        </div>
      </div>

      {/* Live signal sidebar — hidden from student, shown for demo/teacher context */}
      <details style={{ fontSize: 12 }}>
        <summary style={{ color: 'var(--text-muted)', cursor: 'pointer', marginBottom: 6 }}>
          Live signals (teacher view)
        </summary>
        <div className="card-sm">
          <SigRow label="Rapid clicks"              value={`${frustration.rapidClickCount} recent`} valueColor={frustration.rapidClickCount >= 3 ? 'var(--amber-dark)' : undefined} />
          <SigRow label="Wrong attempts"            value={`${frustration.wrongAttempts}`}          valueColor={frustration.wrongAttempts >= 2 ? 'var(--coral)' : undefined} />
          <SigRow label='"I don&apos;t understand"' value={`${frustration.idkClicks}×`}             valueColor={frustration.idkClicks >= 2 ? 'var(--amber-dark)' : undefined} />
          <SigRow label="Flagged phrases"           value={`${frustration.flaggedPhrases.length}`} />
          <div style={{ marginTop: 10 }}>
            <FrustrationBar score={frustration.frustrationScore} />
          </div>
          <div style={{ marginTop: 10 }}>
            <div className="card-title">Adaptation log</div>
            {adaptLog.slice(0, 4).map((ev, i) => (
              <TlItem key={i} text={ev.text} time={ev.time} color={ev.color} />
            ))}
          </div>
        </div>
      </details>

    </div>
  );
}
