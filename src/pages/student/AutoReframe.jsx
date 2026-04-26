import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { getStudent } from '../../lib/mockData';
import { Alert } from '../../components/UI';
import { getReframe, tutorChat } from '../../lib/gemmaApi';

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
  const { question, studentProfile, wrongAttempts } = state || {};

  const [selected, setSelected]       = useState(null);
  const [reframeData, setReframeData] = useState(null);
  const [loading, setLoading]         = useState(false);
  const [error, setError]             = useState(null);
  const [tutorInput, setTutorInput]   = useState('');
  const [tutorReply, setTutorReply]   = useState('');
  const [chatLoading, setChatLoading] = useState(false);

  const profile = studentProfile || {
    name: STUDENT.name,
    grade: STUDENT.grade,
    characters: STUDENT.characters,
    learningStyles: STUDENT.learningStyles,
    frustrationTriggers: STUDENT.frustrationTriggers,
  };

  useEffect(() => {
    if (!question) return;

    let cancelled = false;
    setLoading(true);
    setError(null);

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

  const handleTutorAsk = async () => {
    if (!tutorInput.trim()) return;
    setChatLoading(true);
    try {
      const response = await tutorChat({
        message: tutorInput.trim(),
        question: simplified,
        studentProfile: profile,
      });
      setTutorReply(response.reply || '');
    } catch (err) {
      setTutorReply(err.message || 'Could not reach tutor right now.');
    } finally {
      setChatLoading(false);
    }
  };

  const character = profile.characters?.[0] || STUDENT.characters[0];

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
            {character} has a trick to make this easier.
          </div>
        </div>
      </div>

      {loading && (
        <div className="card" style={{ textAlign: 'center', padding: '2rem' }}>
          <div style={{ fontSize: 24, marginBottom: 8 }}>⏳</div>
          <div style={{ color: 'var(--text-muted)' }}>
            {character} is thinking of a simpler way to explain this...
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
          <div className="char-bubble">{character} is here to help! 💙</div>

          {/* Cloudinary visual scaffold */}
          <div style={{
            background: 'var(--teal-light)', borderRadius: 'var(--radius-sm)',
            padding: 12, fontSize: 12, color: 'var(--teal-dark)', marginBottom: 14,
          }}>
            {data.imageUrl ? (
              <img
                src={data.imageUrl}
                alt={`${character} reframe visual`}
                style={{ width: '100%', borderRadius: 8, border: '1px solid var(--border-md)' }}
              />
            ) : (
              <div style={{ textAlign: 'center', padding: 8 }}>
                <div style={{ fontSize: 24, marginBottom: 4 }}>🎨</div>
                {character} visual — step-by-step breakdown
              </div>
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

      {/* ElevenLabs audio support */}
      <div style={{
        background: 'var(--blue-light)', borderRadius: 'var(--radius-sm)',
        padding: 12, fontSize: 12, color: 'var(--blue-dark)',
      }}>
        {data.audioUrl ? (
          <audio controls autoPlay src={data.audioUrl} style={{ width: '100%' }}>
            Your browser does not support audio playback.
          </audio>
        ) : (
          <div style={{ textAlign: 'center', marginBottom: 8 }}>
            🔊 ElevenLabs — reading the steps aloud to support auditory processing
          </div>
        )}
        <div style={{ marginTop: 8, borderTop: '1px solid var(--border-md)', paddingTop: 8 }}>
          <div style={{ fontWeight: 600, marginBottom: 6 }}>💬 Need more help? Ask {character}</div>
          <div style={{ display: 'flex', gap: 8 }}>
            <input
              className="input"
              value={tutorInput}
              onChange={e => setTutorInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleTutorAsk()}
              placeholder={`Ask ${character} to explain differently...`}
            />
            <button className="btn btn-primary btn-sm" onClick={handleTutorAsk} disabled={chatLoading}>
              {chatLoading ? '...' : 'Ask'}
            </button>
          </div>
          {tutorReply && (
            <div style={{ marginTop: 8, padding: 8, background: 'rgba(255,255,255,0.5)', borderRadius: 6, fontSize: 13 }}>
              <strong>{character}:</strong> {tutorReply}
            </div>
          )}
        </div>
      </div>

    </div>
  );
}
