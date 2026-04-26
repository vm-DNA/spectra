import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { getStudent } from '../../lib/mockData';
import { Alert } from '../../components/UI';
import { getReframe } from '../../lib/gemmaApi';
import { useLessonContext } from '../../lib/LessonContext';

const STUDENT = getStudent('jamie');

const FALLBACK = {
  steps: [
    { label: 'Step 1 — look at the bottom numbers', content: '³⁄₈ + ²⁄₈ — are the bottom numbers the same? Yes!' },
    { label: 'Step 2 — just add the top numbers', content: '3 + 2 = ?' },
  ],
  simplifiedQuestion: {
    text: '3 + 2 = ?',
    options: ['5 → so the answer is ⁵⁄₈', '6 → so the answer is ⁶⁄₈', '4 → so the answer is ⁴⁄₈'],
    correctIndex: 0,
  },
  encouragement: 'You got it! Way to go! 🌟',
};

export default function AutoReframe() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const { question, studentProfile, wrongAttempts, assignmentId, qIndex, studentId } = state || {};
  const { getAdaptedVersion } = useLessonContext();

  const [selected, setSelected]   = useState(null);
  const [reframeData, setReframeData] = useState(null);
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState(null);

  // Load adapted lesson media from context or localStorage
  const [adaptedMedia, setAdaptedMedia] = useState(null);
  useEffect(() => {
    const sid = studentId || STUDENT.id;
    const fromContext = assignmentId ? getAdaptedVersion(assignmentId, sid) : null;
    if (fromContext) {
      setAdaptedMedia(fromContext);
      return;
    }
    try {
      const stored = localStorage.getItem('spectra_adapted_lesson');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed[sid]) setAdaptedMedia(parsed[sid]);
      }
    } catch { /* ignore */ }
  }, [assignmentId, studentId, getAdaptedVersion]);

  useEffect(() => {
    if (!question) return;

    let cancelled = false;
    setLoading(true);
    setError(null);

    const profile = studentProfile || {
      name: STUDENT.name,
      grade: STUDENT.grade,
      characters: STUDENT.characters,
      learningStyles: STUDENT.learningStyles,
      frustrationTriggers: STUDENT.frustrationTriggers,
    };

    getReframe({ question, studentProfile: profile, wrongAttempts: wrongAttempts || 2 })
      .then(data => {
        if (!cancelled) setReframeData(data);
      })
      .catch(err => {
        console.error('Reframe error:', err);
        if (!cancelled) {
          setError(err.message);
          setReframeData(FALLBACK);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
  }, [question]);

  // Use Gemma data if available, otherwise fallback
  const data = reframeData || FALLBACK;
  const steps = data.steps || FALLBACK.steps;
  const simplified = data.simplifiedQuestion || FALLBACK.simplifiedQuestion;
  const encouragement = data.encouragement || FALLBACK.encouragement;

  const handleAnswer = (idx) => {
    setSelected(idx);
    if (idx === simplified.correctIndex) {
      setTimeout(() => navigate('/student/complete'), 1200);
    }
  };

  return (
    <div className="stack" style={{ gap: 14 }}>

      {/* Warm reframe bridge */}
      <div style={{
        background: 'var(--purple-light)', border: '0.5px solid var(--purple)',
        borderRadius: 'var(--radius)', padding: '14px 16px',
        display: 'flex', alignItems: 'center', gap: 12,
      }}>
        <span style={{ fontSize: 24 }}>⭐</span>
        <div>
          <div style={{ fontWeight: 500, fontSize: 15, color: 'var(--purple-dark)' }}>
            Let's try it a different way!
          </div>
          <div style={{ fontSize: 12, color: 'var(--purple-dark)', opacity: 0.8, marginTop: 2 }}>
            {STUDENT.characters[0]} has a trick to make this easier.
          </div>
        </div>
      </div>

      {loading && (
        <div className="card" style={{ textAlign: 'center', padding: '2rem' }}>
          <div style={{ fontSize: 24, marginBottom: 8 }}>⏳</div>
          <div style={{ color: 'var(--text-muted)' }}>
            {STUDENT.characters[0]} is thinking of a simpler way to explain this...
          </div>
        </div>
      )}

      {error && (
        <Alert variant="coral">
          Could not reach Gemma — using built-in explanation instead.
        </Alert>
      )}

      {!loading && (
        <div className="card">
          <div className="char-bubble">{STUDENT.characters[0]} is here to help! 💙</div>

          {/* Visual scaffold — show real Cloudinary image when available */}
          <div style={{
            background: 'var(--teal-light)', borderRadius: 'var(--radius-sm)',
            padding: 12, fontSize: 12, color: 'var(--teal-dark)', marginBottom: 14,
            textAlign: 'center',
          }}>
            {adaptedMedia?.imageUrl ? (
              <img
                src={adaptedMedia.imageUrls?.supportive || adaptedMedia.imageUrl}
                alt={`${(studentProfile || STUDENT).characters?.[0] || 'Character'} reframe visual`}
                style={{ width: '100%', borderRadius: 8, border: '1px solid var(--border-md)' }}
              />
            ) : (
              <>📷 Cloudinary — step-by-step visual with pizza slices (simpler version)</>
            )}
          </div>

          {/* Steps */}
          {steps.map((step, i) => (
            <div key={i} style={{ marginBottom: i < steps.length - 1 ? 10 : 14 }}>
              <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-muted)', marginBottom: 4 }}>
                {step.label}
              </div>
              <div style={{
                background: i === steps.length - 1 ? 'var(--purple-light)' : 'var(--bg)',
                borderRadius: i === steps.length - 1 ? 8 : 6,
                padding: i === steps.length - 1 ? 14 : '8px 12px',
                textAlign: i === steps.length - 1 ? 'center' : undefined,
                fontSize: i === steps.length - 1 ? 22 : 15,
                fontWeight: i === steps.length - 1 ? 500 : undefined,
                color: i === steps.length - 1 ? 'var(--purple-dark)' : undefined,
              }}>
                {step.content}
              </div>
            </div>
          ))}

          {/* Simplified answer options */}
          {simplified.options.map((opt, idx) => (
            <div
              key={idx}
              className={`ans-opt${selected === idx ? (idx === simplified.correctIndex ? ' correct' : ' wrong') : ''}`}
              onClick={() => selected === null && handleAnswer(idx)}
              style={{ cursor: selected !== null ? 'default' : 'pointer' }}
            >
              <span style={{ color: 'var(--text-muted)', fontWeight: 500 }}>{String.fromCharCode(65 + idx)}.</span>
              <span style={{ fontSize: 14 }}>{opt}</span>
            </div>
          ))}

          {selected === simplified.correctIndex && (
            <div style={{
              marginTop: 10, padding: 10, borderRadius: 6,
              background: 'var(--teal-light)', color: 'var(--teal-dark)', fontSize: 13,
            }}>
              {encouragement}
            </div>
          )}
        </div>
      )}

      {/* Teacher notification */}
      <Alert variant="info">
        Ms. Rivera has been quietly notified and may check in soon. Keep going — you're doing great!
      </Alert>

      {/* ElevenLabs audio — play real narration when available */}
      <div style={{
        background: 'var(--blue-light)', borderRadius: 'var(--radius-sm)',
        padding: 10, fontSize: 12, color: 'var(--blue-dark)',
      }}>
        {adaptedMedia?.audioUrl ? (
          <div>
            <div style={{ marginBottom: 6 }}>🔊 ElevenLabs — reading the steps aloud</div>
            <audio controls src={adaptedMedia.audioUrl} style={{ width: '100%' }}>
              Your browser does not support audio playback.
            </audio>
          </div>
        ) : (
          <>🔊 ElevenLabs — reading the steps aloud now to support auditory processing</>
        )}
      </div>

    </div>
  );
}
