import React, { useState, useRef, useCallback, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getAssignment, getStudent } from '../../lib/mockData';
import { useFrustration } from '../../lib/useFrustration';
import { useAuth } from '../../lib/AuthContext';
import { useLessonContext } from '../../lib/LessonContext';
import { tutorChat } from '../../lib/gemmaApi';

const MODE_META = {
  Visual:   { label: 'Visual', color: 'var(--purple)',      bg: 'var(--purple-light)', dotColor: 'var(--purple)' },
  Auditory: { label: 'Listen', color: 'var(--teal)',         bg: 'var(--teal-light)',   dotColor: 'var(--teal)' },
  Reading:  { label: 'Read',   color: 'var(--amber-dark)',   bg: '#FFF8E7',             dotColor: 'var(--amber)' },
  Kinesthetic: { label: 'Kinesthetic', color: 'var(--coral)', bg: 'var(--coral-light)', dotColor: 'var(--coral)' },
};

function renderBoldText(text) {
  const parts = text.split(/(\*\*.*?\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={i}>{part.slice(2, -2)}</strong>;
    }
    return <span key={i}>{part}</span>;
  });
}

export default function CuratedLesson() {
  const { assignmentId } = useParams();
  const navigate         = useNavigate();
  const { userProfile }  = useAuth();
  const assignment       = getAssignment(assignmentId);
  const { getAdaptedVersion } = useLessonContext();

  const studentProfile = userProfile || getStudent('jamie');
  const studentName    = (studentProfile.name || 'Student').split(' ')[0];
  const learningStyle  = (studentProfile.learningStyles || ['Visual'])[0] || 'Visual';
  const character      = (studentProfile.characters && studentProfile.characters.length > 0)
    ? studentProfile.characters[0]
    : (assignment.character || 'SpongeBob');

  // Load Gemma-generated content from LessonContext or localStorage
  const contextVersion = getAdaptedVersion(assignmentId, studentProfile.id || 'jamie');
  const [gemmaLesson, setGemmaLesson] = useState(null);

  useEffect(() => {
    const stored = localStorage.getItem('spectra_adapted_lesson');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        const sid = studentProfile.id || studentProfile.uid || 'jamie';
        const studentLesson = parsed[sid];
        if (studentLesson) setGemmaLesson(studentLesson);
      } catch (e) {
        console.error('Failed to parse stored lesson:', e);
      }
    }
  }, [studentProfile]);

  const adaptedVersion = contextVersion || gemmaLesson;
  const questions = adaptedVersion?.questions?.length
    ? adaptedVersion.questions
    : (assignment.questions || []);

  const modeKey = learningStyle === 'Auditory' ? 'Auditory'
    : learningStyle === 'Reading' ? 'Reading'
    : learningStyle === 'Kinesthetic' ? 'Kinesthetic' : 'Visual';

  const [mode, setMode]             = useState(modeKey);
  const [qIndex, setQIndex]         = useState(0);
  const [selected, setSelected]     = useState(null);
  const [feedback, setFeedback]     = useState(null);
  const [showHintBox, setShowHintBox] = useState(false);
  const [narrating, setNarrating]   = useState(false);
  const [tutorInput, setTutorInput] = useState('');
  const [tutorReply, setTutorReply] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const wrongRef = useRef(0);

  const question = questions[qIndex];
  const meta     = MODE_META[mode] || MODE_META.Visual;

  const onFrustrationTriggered = useCallback((score) => {
    navigate('/student/reframe', {
      state: {
        question,
        studentProfile,
        wrongAttempts: wrongRef.current,
        assignmentId,
        qIndex,
        studentId: studentProfile.id || 'student',
      },
    });
  }, [navigate, question, studentProfile, assignmentId, qIndex]);

  const frustration = useFrustration({ onFrustrationTriggered });

  if (!question) {
    return (
      <div className="stack" style={{ gap: 12, textAlign: 'center', paddingTop: 40 }}>
        <div style={{ fontSize: 40 }}>📝</div>
        <div style={{ fontSize: 16, fontWeight: 500 }}>No questions yet</div>
        <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>
          Your teacher is still setting up this assignment. Check back soon!
        </div>
        <button className="btn btn-primary btn-sm" onClick={() => navigate('/student/home')}>
          Back to home
        </button>
      </div>
    );
  }

  const handleAnswer = (idx) => {
    frustration.recordClick();
    setSelected(idx);
    if (idx === question.correctIndex) {
      setFeedback({ correct: true, text: 'Correct! Great job!' });
      frustration.recordCorrectAnswer();
    } else {
      frustration.recordWrongAnswer();
      wrongRef.current += 1;
      const showHint = wrongRef.current >= 2;
      if (showHint) setShowHintBox(true);
      setFeedback({ correct: false, text: showHint ? (question.hint || 'Try again!') : 'Not quite — try again!' });
      setSelected(null);
      if (wrongRef.current >= 3) {
        setTimeout(() => {
          navigate('/student/reframe', {
            state: { question, studentProfile, wrongAttempts: wrongRef.current, assignmentId, qIndex, studentId: studentProfile.id || 'student' },
          });
        }, 1500);
      }
    }
  };

  const handleIdk = () => {
    frustration.recordIdkClick();
    setShowHintBox(true);
  };

  const handleNext = () => {
    if (qIndex < questions.length - 1) {
      setQIndex(q => q + 1);
      setSelected(null);
      setFeedback(null);
      setShowHintBox(false);
      wrongRef.current = 0;
      frustration.reset();
    } else {
      navigate('/student/complete');
    }
  };

  const handleReplay = () => {
    setNarrating(true);
    if (adaptedVersion?.audioUrl) {
      const audio = new Audio(adaptedVersion.audioUrl);
      audio.play().catch(() => {});
      audio.onended = () => setNarrating(false);
    } else {
      setTimeout(() => setNarrating(false), 3000);
    }
  };

  const handleTutorSend = async () => {
    if (!tutorInput.trim() || chatLoading) return;
    setChatLoading(true);
    try {
      const reply = await tutorChat(
        tutorInput,
        adaptedVersion?.chatContext || question.text,
        character,
        studentName
      );
      setTutorReply(reply.reply || reply.message || 'I\'m here to help!');
    } catch {
      setTutorReply('Sorry, I couldn\'t connect. Try again!');
    } finally {
      setChatLoading(false);
      setTutorInput('');
    }
  };

  const dotColor = (i) => {
    if (i <= qIndex) return meta.dotColor;
    return 'var(--border-md)';
  };
  const dotOpacity = (i) => i <= qIndex ? 1 : 0.4;

  // Gemma-generated images
  const imageMap = adaptedVersion?.imageUrls || {};
  const visualImage = imageMap.neutral || adaptedVersion?.imageUrl || null;

  return (
    <div className="stack" style={{ gap: 12 }}>

      {/* Mode badge + progress dots */}
      <div className="card" style={{ padding: '12px 16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{
            display: 'inline-block', padding: '4px 14px', borderRadius: 6,
            fontSize: 13, fontWeight: 500, color: meta.color,
            border: `1.5px solid ${meta.color}`, background: 'transparent',
          }}>
            {meta.label}
          </span>
          <div style={{ display: 'flex', gap: 6 }}>
            {questions.map((_, i) => (
              <div key={i} style={{
                width: 10, height: 10, borderRadius: '50%',
                background: dotColor(i), opacity: dotOpacity(i),
              }} />
            ))}
          </div>
        </div>
      </div>

      {/* Gemma adapted text banner */}
      {adaptedVersion?.adaptedText && (
        <div className="card" style={{ background: meta.bg, padding: '12px 16px', fontSize: 14 }}>
          <strong>{character} says:</strong> {adaptedVersion.adaptedText.slice(0, 200)}{adaptedVersion.adaptedText.length > 200 ? '...' : ''}
        </div>
      )}

      {/* ---- VISUAL MODE ---- */}
      {mode === 'Visual' && (
        <div className="card">
          <div style={{
            background: meta.bg, borderRadius: 8, padding: '10px 14px',
            fontSize: 14, fontWeight: 500, color: meta.color, marginBottom: 14,
          }}>
            {character} says: {question.visual?.characterSays || 'count with me!'}
          </div>

          {visualImage ? (
            <div style={{
              background: '#F5F3FF', borderRadius: 10, padding: 16,
              textAlign: 'center', marginBottom: 14,
            }}>
              <img src={visualImage} alt="Lesson visual" style={{ maxWidth: '100%', borderRadius: 8 }} />
            </div>
          ) : question.visual?.images ? (
            <div style={{
              background: '#F5F3FF', borderRadius: 10, padding: 16,
              textAlign: 'center', marginBottom: 14,
            }}>
              <div style={{ fontSize: 32, letterSpacing: 4 }}>{question.visual.images[0]}</div>
              <div style={{ fontSize: 20, margin: '8px 0', color: 'var(--text-muted)' }}>+</div>
              <div style={{ fontSize: 32, letterSpacing: 4 }}>{question.visual.images[1]}</div>
              <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 10 }}>
                {question.visual.imageCaption}
              </div>
            </div>
          ) : null}

          <div style={{
            fontSize: 24, fontWeight: 600, textAlign: 'center',
            color: 'var(--coral)', marginBottom: 16,
          }}>
            {question.text}
          </div>

          <AnswerGrid question={question} selected={selected} onAnswer={handleAnswer} />
          {feedback && <FeedbackBanner feedback={feedback} onNext={handleNext} isLast={qIndex >= questions.length - 1} />}
          <IdkButton onClick={handleIdk} />
        </div>
      )}

      {/* ---- AUDITORY MODE ---- */}
      {mode === 'Auditory' && (
        <div className="card">
          <div style={{
            background: meta.bg, borderRadius: 8, padding: '10px 14px',
            fontSize: 14, fontWeight: 500, color: meta.color, marginBottom: 14,
          }}>
            {character} says: {question.auditory?.characterSays || 'listen carefully!'}
          </div>

          <div style={{
            background: meta.bg, borderRadius: 10, padding: 20,
            textAlign: 'center', marginBottom: 14,
          }}>
            {adaptedVersion?.audioUrl ? (
              <audio controls src={adaptedVersion.audioUrl} style={{ width: '100%', marginBottom: 8 }} />
            ) : (
              <>
                <div style={{ fontSize: 32, marginBottom: 8 }}>🔊</div>
                <div style={{ fontSize: 24, letterSpacing: 2, color: meta.color, marginBottom: 8 }}>
                  {Array(7).fill(0).map((_, i) => (
                    <span key={i} style={{
                      display: 'inline-block', width: 4, height: 12 + Math.random() * 16,
                      background: meta.color, borderRadius: 2, margin: '0 2px',
                      opacity: narrating ? 1 : 0.4,
                    }} />
                  ))}
                </div>
              </>
            )}
            <div style={{ fontSize: 14, fontWeight: 500, marginBottom: 6 }}>
              {narrating ? 'Playing narration...' : 'Tap replay to listen'}
            </div>
            <div style={{ fontSize: 13, fontStyle: 'italic', color: meta.color, marginBottom: 12 }}>
              "{adaptedVersion?.elevenLabsScript || question.auditory?.narrationText || question.text}"
            </div>
            <button
              className="btn btn-secondary"
              style={{ padding: '8px 24px', fontSize: 14 }}
              onClick={handleReplay}
            >
              Replay
            </button>
          </div>

          <div style={{ fontSize: 14, fontWeight: 500, textAlign: 'center', marginBottom: 10 }}>
            Tap your answer
          </div>

          <AnswerGrid question={question} selected={selected} onAnswer={handleAnswer} />
          {feedback && <FeedbackBanner feedback={feedback} onNext={handleNext} isLast={qIndex >= questions.length - 1} />}
          <IdkButton onClick={handleIdk} />

          {/* Tutor chat for auditory mode */}
          <TutorChat
            character={character}
            studentName={studentName}
            tutorInput={tutorInput}
            setTutorInput={setTutorInput}
            tutorReply={tutorReply}
            chatLoading={chatLoading}
            onSend={handleTutorSend}
          />
        </div>
      )}

      {/* ---- READING MODE ---- */}
      {mode === 'Reading' && (
        <div className="card">
          {adaptedVersion?.chatContext && (
            <div style={{
              background: '#FFF8E7', border: '1px solid #F0DFA0', borderRadius: 8,
              padding: '12px 16px', marginBottom: 16, fontSize: 14, lineHeight: 1.6,
            }}>
              <div style={{ fontWeight: 600, marginBottom: 4 }}>Key Concepts</div>
              {adaptedVersion.chatContext}
            </div>
          )}

          <div style={{ fontSize: 18, fontWeight: 500, lineHeight: 1.7, marginBottom: 16 }}>
            {(question.reading?.fullText || question.text).split('\n').map((line, i) => (
              <div key={i} style={{ marginBottom: line === '' ? 12 : 4 }}>
                {renderBoldText(line)}
              </div>
            ))}
          </div>

          {showHintBox && question.hint && (
            <div style={{
              background: '#FFF8E7', border: '1px solid #F0DFA0', borderRadius: 8,
              padding: '12px 16px', marginBottom: 16,
            }}>
              <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 4 }}>Hint</div>
              <div style={{ fontSize: 14, lineHeight: 1.5 }}>{question.hint}</div>
            </div>
          )}

          <div style={{ fontSize: 15, fontWeight: 500, marginBottom: 10 }}>
            Choose the correct answer:
          </div>

          <AnswerGrid question={question} selected={selected} onAnswer={handleAnswer} />
          {feedback && <FeedbackBanner feedback={feedback} onNext={handleNext} isLast={qIndex >= questions.length - 1} />}
          <IdkButton onClick={handleIdk} />

          {/* Tutor chat for reading mode */}
          <TutorChat
            character={character}
            studentName={studentName}
            tutorInput={tutorInput}
            setTutorInput={setTutorInput}
            tutorReply={tutorReply}
            chatLoading={chatLoading}
            onSend={handleTutorSend}
          />
        </div>
      )}

      {/* ---- KINESTHETIC MODE ---- */}
      {mode === 'Kinesthetic' && (
        <div className="card">
          <div style={{
            background: meta.bg, borderRadius: 8, padding: '10px 14px',
            fontSize: 14, fontWeight: 500, color: meta.color, marginBottom: 14,
          }}>
            {character} says: let's try it hands-on!
          </div>

          {adaptedVersion?.interactiveHtml ? (
            <iframe
              title="Interactive lesson"
              srcDoc={adaptedVersion.interactiveHtml}
              sandbox="allow-scripts"
              style={{
                width: '100%', minHeight: 350, border: '2px solid var(--border-md)',
                borderRadius: 10, marginBottom: 14, background: '#fff',
              }}
            />
          ) : adaptedVersion?.interactivePlan?.length ? (
            <div style={{ marginBottom: 14 }}>
              {adaptedVersion.interactivePlan.map((step, i) => (
                <div key={i} style={{
                  padding: '10px 14px', background: i % 2 === 0 ? meta.bg : 'var(--bg)',
                  borderRadius: 8, marginBottom: 6, fontSize: 14,
                }}>
                  <strong>Step {i + 1}:</strong> {step.instruction}
                </div>
              ))}
            </div>
          ) : (
            <div style={{ padding: 20, textAlign: 'center', color: 'var(--text-muted)' }}>
              Interactive activity loading...
            </div>
          )}

          <AnswerGrid question={question} selected={selected} onAnswer={handleAnswer} />
          {feedback && <FeedbackBanner feedback={feedback} onNext={handleNext} isLast={qIndex >= questions.length - 1} />}
          <IdkButton onClick={handleIdk} />
        </div>
      )}

    </div>
  );
}

function AnswerGrid({ question, selected, onAnswer }) {
  const opts = question.options || [];
  return (
    <div style={{
      display: 'grid', gridTemplateColumns: '1fr 1fr',
      gap: 10, marginBottom: 10,
    }}>
      {opts.map((opt, idx) => {
        const isCorrect = selected === idx && idx === question.correctIndex;
        const isWrong   = selected === idx && idx !== question.correctIndex;
        const isSelected = selected === idx;
        let borderColor = 'var(--border-md)';
        let bg = 'transparent';
        if (isCorrect) { borderColor = 'var(--teal)'; bg = 'var(--teal-light)'; }
        if (isWrong) { borderColor = 'var(--coral)'; bg = 'var(--coral-light)'; }
        if (isSelected && !isWrong) { borderColor = 'var(--teal)'; bg = 'var(--teal-light)'; }

        return (
          <div
            key={idx}
            onClick={() => selected === null && onAnswer(idx)}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              padding: '14px 0', borderRadius: 10,
              border: `2px solid ${borderColor}`, background: bg,
              fontSize: 20, fontWeight: 600, cursor: selected !== null ? 'default' : 'pointer',
              transition: 'all 0.15s',
            }}
          >
            {String(opt)}
          </div>
        );
      })}
    </div>
  );
}

function FeedbackBanner({ feedback, onNext, isLast }) {
  return (
    <div style={{
      padding: '10px 14px', borderRadius: 8, fontSize: 14, fontWeight: 500,
      background: feedback.correct ? 'var(--teal-light)' : 'var(--coral-light)',
      color: feedback.correct ? 'var(--teal-dark)' : 'var(--coral-dark)',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      marginBottom: 8,
    }}>
      <span>{feedback.text}</span>
      {feedback.correct && (
        <button className="btn btn-primary btn-sm" style={{ marginLeft: 12 }} onClick={onNext}>
          {isLast ? 'Finish!' : 'Next'}
        </button>
      )}
    </div>
  );
}

function IdkButton({ onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        width: '100%', padding: '12px 0', borderRadius: 10,
        border: '1.5px solid var(--border-md)', background: 'transparent',
        fontSize: 15, fontWeight: 500, cursor: 'pointer',
        color: 'var(--text)', marginTop: 4,
      }}
    >
      I don't understand
    </button>
  );
}

function TutorChat({ character, studentName, tutorInput, setTutorInput, tutorReply, chatLoading, onSend }) {
  return (
    <div style={{ marginTop: 16, borderTop: '1px solid var(--border)', paddingTop: 12 }}>
      <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 8 }}>
        Ask {character} for help
      </div>
      <div style={{ display: 'flex', gap: 8 }}>
        <input
          style={{
            flex: 1, padding: '8px 12px', borderRadius: 8,
            border: '1.5px solid var(--border-md)', fontSize: 14,
          }}
          placeholder={`Ask ${character} a question...`}
          value={tutorInput}
          onChange={e => setTutorInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && onSend()}
        />
        <button
          className="btn btn-primary btn-sm"
          onClick={onSend}
          disabled={chatLoading}
        >
          {chatLoading ? '...' : 'Ask'}
        </button>
      </div>
      {tutorReply && (
        <div style={{
          marginTop: 8, padding: '10px 14px', borderRadius: 8,
          background: 'var(--teal-light)', fontSize: 14, lineHeight: 1.5,
        }}>
          <strong>{character}:</strong> {tutorReply}
        </div>
      )}
    </div>
  );
}
