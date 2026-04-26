import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { getStudent } from '../../lib/mockData';
import { Alert } from '../../components/UI';
import { getReframe, tutorChat } from '../../lib/gemmaApi';
import { useAuth } from '../../lib/AuthContext';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';

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
  const { userProfile } = useAuth();

  const [selected, setSelected]     = useState(null);
  const [reframeData, setReframeData] = useState(null);
  const [loading, setLoading]       = useState(false);
  const [error, setError]           = useState(null);
  const [teacherName, setTeacherName] = useState('Your teacher');
  const [tutorInput, setTutorInput] = useState('');
  const [tutorReply, setTutorReply] = useState('');
  const [chatLoading, setChatLoading] = useState(false);

  const profile = studentProfile || userProfile || STUDENT;
  const character = (profile.characters && profile.characters.length > 0)
    ? profile.characters[0] : 'SpongeBob';
  const studentName = (profile.name || 'Student').split(' ')[0];

  useEffect(() => {
    if (!userProfile?.teacherUid) return;
    getDoc(doc(db, 'users', userProfile.teacherUid))
      .then(snap => { if (snap.exists()) setTeacherName(snap.data().name || 'Your teacher'); })
      .catch(() => {});
  }, [userProfile?.teacherUid]);

  useEffect(() => {
    if (!question) return;

    let cancelled = false;
    setLoading(true);
    setError(null);

    const reframeProfile = {
      name: profile.name || STUDENT.name,
      grade: profile.grade || STUDENT.grade,
      characters: profile.characters || STUDENT.characters,
      learningStyles: profile.learningStyles || STUDENT.learningStyles,
      frustrationTriggers: profile.frustrationTriggers || STUDENT.frustrationTriggers,
      sensoryPrefs: profile.sensoryPrefs || [],
    };

    getReframe(question, reframeProfile, wrongAttempts || 2)
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

  const handleTutorSend = async () => {
    if (!tutorInput.trim() || chatLoading) return;
    setChatLoading(true);
    try {
      const reply = await tutorChat(
        tutorInput,
        question?.text || 'Help me understand this problem',
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
          {reframeData?.imageUrls?.neutral ? (
            <div style={{ textAlign: 'center', marginBottom: 14 }}>
              <img src={reframeData.imageUrls.neutral} alt="Visual scaffold" style={{ maxWidth: '100%', borderRadius: 8 }} />
            </div>
          ) : (
            <div style={{
              background: 'var(--teal-light)', borderRadius: 'var(--radius-sm)',
              padding: 12, fontSize: 12, color: 'var(--teal-dark)', marginBottom: 14,
            }}>
              📷 Cloudinary — step-by-step visual with pizza slices (simpler version)
            </div>
          )}

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
        {teacherName} has been quietly notified and may check in soon. Keep going — you're doing great!
      </Alert>

      {/* ElevenLabs audio */}
      {reframeData?.audioUrl ? (
        <div style={{
          background: 'var(--blue-light)', borderRadius: 'var(--radius-sm)',
          padding: 12, fontSize: 12, color: 'var(--blue-dark)',
        }}>
          <audio controls src={reframeData.audioUrl} style={{ width: '100%' }} />
          <div style={{ marginTop: 4 }}>🔊 ElevenLabs narration</div>
        </div>
      ) : (
        <div style={{
          background: 'var(--blue-light)', borderRadius: 'var(--radius-sm)',
          padding: 10, fontSize: 12, color: 'var(--blue-dark)',
        }}>
          🔊 ElevenLabs — reading the steps aloud now to support auditory processing
        </div>
      )}

      {/* Tutor chat */}
      <div className="card" style={{ padding: '12px 16px' }}>
        <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 8 }}>
          Need more help? Ask {character}!
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
            onKeyDown={e => e.key === 'Enter' && handleTutorSend()}
          />
          <button className="btn btn-primary btn-sm" onClick={handleTutorSend} disabled={chatLoading}>
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

    </div>
  );
}
