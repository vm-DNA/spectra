import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../lib/AuthContext';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';

export default function StudentSignup() {
  const navigate = useNavigate();
  const { signup } = useAuth();
  const [name, setName]           = useState('');
  const [email, setEmail]         = useState('');
  const [password, setPassword]   = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [classCode, setClassCode] = useState('');
  const [grade, setGrade]         = useState('');
  const [error, setError]         = useState('');
  const [busy, setBusy]           = useState(false);

  async function handleSubmit() {
    setError('');
    if (!name || !email || !password || !classCode) {
      setError('Please fill in all required fields.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    if (password !== confirmPw) {
      setError('Passwords do not match.');
      return;
    }
    setBusy(true);
    try {
      const codeUpper = classCode.trim().toUpperCase();
      let teacherUid = '';
      try {
        const codeSnap = await getDoc(doc(db, 'classCodes', codeUpper));
        if (codeSnap.exists()) {
          teacherUid = codeSnap.data().teacherUid || '';
        }
      } catch (e) {
        console.warn('Could not validate class code:', e);
      }

      await signup(email, password, 'student', {
        name,
        grade: grade || '',
        classCode: codeUpper,
        teacherUid,
        characters: [],
        learningStyles: [],
        sensoryPrefs: [],
        frustrationTriggers: [],
      });
      navigate('/student/home');
    } catch (err) {
      const code = err.code || '';
      if (code === 'auth/email-already-in-use') {
        setError('An account with this email already exists.');
      } else if (code === 'auth/invalid-email') {
        setError('Please enter a valid email address.');
      } else if (code === 'auth/weak-password') {
        setError('Password is too weak. Use at least 6 characters.');
      } else {
        setError(err.message || 'Signup failed. Please try again.');
      }
      setBusy(false);
    }
  }

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      background: 'var(--bg)', padding: 24,
    }}>
      <div style={{ width: '100%', maxWidth: 400 }}>

        <div
          style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 20, cursor: 'pointer' }}
          onClick={() => navigate('/student/login')}
        >
          &larr; Back to sign in
        </div>

        <div className="card">
          <div style={{ fontSize: 18, fontWeight: 500, color: 'var(--purple)', marginBottom: 20 }}>
            Create student account
          </div>

          {error && (
            <div style={{
              background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 6,
              padding: '10px 12px', fontSize: 13, color: '#991B1B', marginBottom: 14,
            }}>
              {error}
            </div>
          )}

          <div className="stack" style={{ gap: 14 }}>
            <div>
              <label className="label">Your name</label>
              <input className="input" value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Jamie L." />
            </div>
            <div>
              <label className="label">Email</label>
              <input className="input" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="your.email@example.com" />
            </div>
            <div>
              <label className="label">Password</label>
              <input className="input" type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Min. 6 characters" />
            </div>
            <div>
              <label className="label">Confirm password</label>
              <input className="input" type="password" value={confirmPw} onChange={e => setConfirmPw(e.target.value)} placeholder="Re-enter password" />
            </div>
            <div>
              <label className="label">Class code</label>
              <input className="input" value={classCode} onChange={e => setClassCode(e.target.value)} placeholder="Ask your teacher for the code" />
            </div>
            <div>
              <label className="label">Grade (optional)</label>
              <input className="input" value={grade} onChange={e => setGrade(e.target.value)} placeholder="e.g. Grade 3" />
            </div>

            <button
              className="btn btn-purple btn-full btn-lg"
              style={{ marginTop: 4 }}
              disabled={busy}
              onClick={handleSubmit}
            >
              {busy ? 'Creating account...' : 'Create account'}
            </button>

            <div style={{ textAlign: 'center', fontSize: 12, color: 'var(--text-muted)' }}>
              Already have an account?{' '}
              <span
                style={{ color: 'var(--purple)', cursor: 'pointer' }}
                onClick={() => navigate('/student/login')}
              >
                Sign in
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
