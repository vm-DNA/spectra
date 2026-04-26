import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      background: 'var(--bg)', padding: 24,
    }}>

      {/* Logo */}
      <div style={{ textAlign: 'center', marginBottom: 40 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, marginBottom: 10 }}>
          <div style={{ width: 14, height: 14, borderRadius: '50%', border: '2.5px solid var(--teal)' }} />
          <span style={{ fontSize: 28, fontWeight: 500, color: 'var(--teal)', letterSpacing: '-0.5px' }}>Spectra</span>
        </div>
        <p style={{ fontSize: 14, color: 'var(--text-muted)' }}>Personalized learning for every student</p>
      </div>

      {/* Role cards */}
      <div className="grid-2" style={{ maxWidth: 600, width: '100%', gap: 16 }}>

        {/* Teacher card */}
        <div
          className="card"
          style={{ textAlign: 'center', padding: 32, cursor: 'pointer', transition: 'border-color 0.15s' }}
          onClick={() => navigate('/teacher/login')}
          onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--teal)'}
          onMouseLeave={e => e.currentTarget.style.borderColor = ''}
        >
          <div style={{
            width: 56, height: 56, borderRadius: '50%', background: 'var(--teal-light)',
            margin: '0 auto 16px', display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--teal-dark)" strokeWidth="1.8">
              <rect x="2" y="3" width="20" height="14" rx="2"/>
              <path d="M8 21h8M12 17v4"/>
            </svg>
          </div>
          <div style={{ fontSize: 16, fontWeight: 500, marginBottom: 8 }}>I'm a teacher</div>
          <div style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: 20 }}>
            Upload lessons, manage your class, and view AI-powered engagement reports
          </div>
          <button className="btn btn-primary btn-full">Enter teacher view</button>
        </div>

        {/* Student card */}
        <div
          className="card"
          style={{ textAlign: 'center', padding: 32, cursor: 'pointer', transition: 'border-color 0.15s' }}
          onClick={() => navigate('/student/login')}
          onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--purple)'}
          onMouseLeave={e => e.currentTarget.style.borderColor = ''}
        >
          <div style={{
            width: 56, height: 56, borderRadius: '50%', background: 'var(--purple-light)',
            margin: '0 auto 16px', display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--purple-dark)" strokeWidth="1.8">
              <circle cx="12" cy="7" r="4"/>
              <path d="M3 21c0-4 4-7 9-7s9 3 9 7"/>
            </svg>
          </div>
          <div style={{ fontSize: 16, fontWeight: 500, marginBottom: 8 }}>I'm a student</div>
          <div style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: 20 }}>
            See your homework, learn with your favorite characters, get help when you need it
          </div>
          <button className="btn btn-purple btn-full">Enter student view</button>
        </div>

      </div>

      {/* Create new account section */}
      <div style={{
        marginTop: 32, textAlign: 'center', padding: '24px 32px',
        background: 'var(--surface)', borderRadius: 'var(--radius)',
        border: '1px solid var(--border)', maxWidth: 600, width: '100%',
      }}>
        <div style={{ fontSize: 15, fontWeight: 500, marginBottom: 12 }}>New to Spectra?</div>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
          <button
            className="btn btn-primary"
            onClick={() => navigate('/teacher/signup')}
          >
            Create teacher account
          </button>
          <button
            className="btn btn-purple"
            onClick={() => navigate('/student/signup')}
          >
            Create student account
          </button>
        </div>
      </div>

    </div>
  );
}
