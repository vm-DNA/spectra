import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../lib/AuthContext';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';

function generateClassCode() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 6; i++) code += chars[Math.floor(Math.random() * chars.length)];
  return code;
}

export default function TeacherSignup() {
  const navigate = useNavigate();
  const { signup } = useAuth();
  const [name, setName]               = useState('');
  const [email, setEmail]             = useState('');
  const [password, setPassword]       = useState('');
  const [confirmPw, setConfirmPw]     = useState('');
  const [school, setSchool]           = useState('');
  const [room, setRoom]               = useState('');
  const [error, setError]             = useState('');
  const [busy, setBusy]               = useState(false);

  async function handleSubmit() {
    setError('');
    if (!name || !email || !password || !school || !room) {
      setError('Please fill in all fields.');
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
      const classCode = generateClassCode();
      const profile = await signup(email, password, 'teacher', {
        name,
        school,
        room,
        classes: [{ id: classCode, name: `${name} - ${room}`, room, code: classCode }],
      });
      await setDoc(doc(db, 'classCodes', classCode), {
        teacherUid: profile.uid,
        className: `${name} - ${room}`,
        room,
        createdAt: new Date().toISOString(),
      });
      navigate('/teacher/dashboard');
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
          onClick={() => navigate('/teacher/login')}
        >
          &larr; Back to sign in
        </div>

        <div className="card">
          <div style={{ fontSize: 18, fontWeight: 500, marginBottom: 20 }}>Create teacher account</div>

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
              <label className="label">Full name</label>
              <input className="input" value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Ms. Rivera" />
            </div>
            <div>
              <label className="label">School email</label>
              <input className="input" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@school.edu" />
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
              <label className="label">School name</label>
              <input className="input" value={school} onChange={e => setSchool(e.target.value)} placeholder="e.g. Sunview Elementary" />
            </div>
            <div>
              <label className="label">Room number</label>
              <input className="input" value={room} onChange={e => setRoom(e.target.value)} placeholder="e.g. Room 4B" />
            </div>

            <button
              className="btn btn-primary btn-full btn-lg"
              style={{ marginTop: 4 }}
              disabled={busy}
              onClick={handleSubmit}
            >
              {busy ? 'Creating account...' : 'Create account'}
            </button>

            <div style={{ textAlign: 'center', fontSize: 12, color: 'var(--text-muted)' }}>
              Already have an account?{' '}
              <span
                style={{ color: 'var(--teal)', cursor: 'pointer' }}
                onClick={() => navigate('/teacher/login')}
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
