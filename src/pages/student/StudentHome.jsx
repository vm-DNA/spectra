import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ASSIGNMENTS } from '../../lib/mockData';
import { Badge } from '../../components/UI';
import { useAuth } from '../../lib/AuthContext';

export default function StudentHome() {
  const navigate = useNavigate();
  const { userProfile } = useAuth();
  const [mood, setMood] = useState(null);

  const studentName = userProfile?.name?.split(' ')[0] || 'Student';
  const characters = userProfile?.characters || [];
  const charName = characters[0] || 'your character';

  const newAssignments  = ASSIGNMENTS.filter(a => a.status === 'new');
  const doneAssignments = ASSIGNMENTS.filter(a => a.status === 'done');

  const moodFaceStyle = (m) => ({
    width: 60, height: 60, borderRadius: '50%',
    border: `2px solid ${mood === m ? (m === 'sad' ? 'var(--coral)' : 'var(--purple)') : 'var(--border-md)'}`,
    background: mood === m ? (m === 'sad' ? 'var(--coral-light)' : 'var(--purple-light)') : 'var(--bg)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    cursor: 'pointer', fontSize: 26, transition: 'all 0.15s', userSelect: 'none',
  });

  return (
    <div className="stack" style={{ gap: 14 }}>

      <div style={{
        background: 'var(--purple-light)', borderRadius: 'var(--radius)',
        padding: '14px 16px',
      }}>
        <div style={{ fontSize: 16, fontWeight: 500, color: 'var(--purple-dark)' }}>
          Hi, {studentName}!
        </div>
        <div style={{ fontSize: 13, color: 'var(--purple-dark)', opacity: 0.8, marginTop: 2 }}>
          {characters.length > 0 ? `Ready to learn with ${charName} today?` : 'Ready to learn today?'}
        </div>
      </div>

      {!mood && (
        <div className="card">
          <div style={{ fontSize: 14, fontWeight: 500, marginBottom: 12, textAlign: 'center' }}>
            How are you feeling right now?
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 20 }}>
            {[
              { key: 'happy', emoji: '😊', label: 'Happy' },
              { key: 'ok',    emoji: '😐', label: 'Okay'  },
              { key: 'sad',   emoji: '😢', label: 'Sad'   },
            ].map(m => (
              <div key={m.key} style={{ textAlign: 'center' }}>
                <div style={moodFaceStyle(m.key)} onClick={() => setMood(m.key)}>{m.emoji}</div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>{m.label}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {mood && (
        <div className="alert alert-info" style={{ fontSize: 13 }}>
          Thanks for sharing! {mood === 'sad' ? "It's okay to have a tough day. Let's take it slow." : "Let's get started!"}
        </div>
      )}

      <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-muted)', marginBottom: -6 }}>
        Today's homework
      </div>
      {newAssignments.map(a => (
        <div
          key={a.id}
          className="card"
          style={{
            border: '2px solid var(--purple)', cursor: 'pointer', transition: 'all 0.15s',
            borderRadius: 'var(--radius)',
          }}
          onClick={() => navigate(`/student/lesson/${a.id}`)}
        >
          <div className="row-between">
            <div>
              <div style={{ fontWeight: 500, fontSize: 14 }}>{a.title}</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
                {a.subject} · Due {a.dueDate}
              </div>
            </div>
            <Badge variant="purple">New</Badge>
          </div>
          <div style={{ fontSize: 12, color: 'var(--purple)', marginTop: 8, fontWeight: 500 }}>
            Tap to start
          </div>
        </div>
      ))}

      {doneAssignments.length > 0 && (
        <>
          <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-muted)', marginBottom: -6 }}>
            Completed
          </div>
          {doneAssignments.map(a => (
            <div key={a.id} className="card" style={{ opacity: 0.65, cursor: 'pointer' }} onClick={() => navigate(`/student/lesson/${a.id}`)}>
              <div className="row-between">
                <div style={{ fontSize: 13 }}>{a.title}</div>
                <Badge variant="green">Done</Badge>
              </div>
            </div>
          ))}
        </>
      )}

      <div className="row" style={{ gap: 4, marginTop: 4 }}>
        {'★★★'.split('').map((s, i) => (
          <span key={i} style={{ color: 'var(--amber)', fontSize: 20 }}>★</span>
        ))}
        {'☆☆'.split('').map((s, i) => (
          <span key={i} style={{ color: 'var(--gray)', fontSize: 18 }}>☆</span>
        ))}
        <span style={{ fontSize: 12, color: 'var(--text-muted)', marginLeft: 6 }}>3 stars this week!</span>
      </div>

    </div>
  );
}
