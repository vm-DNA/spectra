import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getStudent } from '../../lib/mockData';
import { Alert } from '../../components/UI';
import { useAuth } from '../../lib/AuthContext';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';

const STUDENT = getStudent('jamie');

export default function CompletionScreen() {
  const navigate = useNavigate();
  const { userProfile } = useAuth();
  const [teacherName, setTeacherName] = useState('Your teacher');

  useEffect(() => {
    if (!userProfile?.teacherUid) return;
    getDoc(doc(db, 'users', userProfile.teacherUid))
      .then(snap => { if (snap.exists()) setTeacherName(snap.data().name || 'Your teacher'); })
      .catch(() => {});
  }, [userProfile?.teacherUid]);

  const score      = 4;
  const total      = 5;
  const struggled  = score < total;

  return (
    <div className="stack" style={{ gap: 14, textAlign: 'center' }}>

      {/* Celebration */}
      <div style={{ padding: '16px 0' }}>
        <div style={{ fontSize: 52, marginBottom: 8 }}>🏆</div>
        <div style={{ fontSize: 24, fontWeight: 500, color: 'var(--teal)' }}>
          You did it!
        </div>
        <div style={{ fontSize: 14, color: 'var(--text-muted)', marginTop: 4 }}>
          Great work today, {STUDENT.name.split(' ')[0]}!
        </div>
      </div>

      {/* Stars */}
      <div style={{ fontSize: 32, letterSpacing: 6 }}>
        {'★'.repeat(score)}{'☆'.repeat(total - score)}
      </div>

      {/* Score summary */}
      <div className="card" style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 32, fontWeight: 500, color: 'var(--teal)', marginBottom: 4 }}>
          {score} / {total}
        </div>
        <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>questions answered correctly</div>
      </div>

      {/* Encouraging message */}
      <Alert variant={struggled ? 'warn' : 'info'}>
        {struggled
          ? `Amazing effort today! Getting ${score} out of ${total} is something to be proud of. Keep it up! 💪`
          : `Perfect run! You crushed it today. ${STUDENT.characters[0]} would be proud! ⭐`}
      </Alert>

      {/* Teacher data note */}
      <div style={{
        background: 'var(--green-light)', border: '0.5px solid var(--teal)',
        borderRadius: 'var(--radius-sm)', padding: '10px 14px',
        display: 'flex', gap: 8, alignItems: 'flex-start', textAlign: 'left',
      }}>
        <span style={{ fontSize: 16 }}>📊</span>
        <div>
          <div style={{ fontSize: 12, fontWeight: 500, color: 'var(--green-dark)' }}>
            Sent to {teacherName}
          </div>
          <div style={{ fontSize: 12, color: 'var(--green-dark)', opacity: 0.8, marginTop: 2 }}>
            Your completion status, engagement score, and session data have been shared automatically.
          </div>
        </div>
      </div>

      {/* Stars earned */}
      <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>
        You earned <strong style={{ color: 'var(--amber)' }}>+{score} stars</strong> this session! ⭐
      </div>

      <button
        className="btn btn-purple btn-full btn-lg"
        onClick={() => navigate('/student/home')}
      >
        Back to home
      </button>

    </div>
  );
}
