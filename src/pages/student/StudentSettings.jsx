import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../lib/AuthContext';
import { doc, getDoc, updateDoc, deleteField, collection, query, where, getDocs, setDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';

export default function StudentSettings() {
  const navigate = useNavigate();
  const { userProfile, refreshProfile, logout } = useAuth();

  const [joinCode, setJoinCode] = useState('');
  const [joinBusy, setJoinBusy] = useState(false);
  const [joinMsg, setJoinMsg] = useState('');
  const [leaveBusy, setLeaveBusy] = useState(false);
  const [leaveMsg, setLeaveMsg] = useState('');
  const [className, setClassName] = useState('');

  const currentCode = userProfile?.classCode || '';

  useEffect(() => {
    if (!currentCode) { setClassName(''); return; }
    async function fetchClassName() {
      try {
        const snap = await getDoc(doc(db, 'classCodes', currentCode));
        if (snap.exists()) {
          setClassName(snap.data().className || snap.data().room || currentCode);
          return;
        }
        // Fallback: look up teacher's classes array
        if (userProfile?.teacherUid) {
          const tSnap = await getDoc(doc(db, 'users', userProfile.teacherUid));
          if (tSnap.exists()) {
            const match = (tSnap.data().classes || []).find(c => c.code === currentCode || c.id === currentCode);
            if (match) { setClassName(match.name || match.room || currentCode); return; }
          }
        }
        setClassName(currentCode);
      } catch {
        setClassName(currentCode);
      }
    }
    fetchClassName();
  }, [currentCode, userProfile?.teacherUid]);

  async function handleJoinClass(e) {
    e.preventDefault();
    setJoinMsg('');
    const code = joinCode.trim().toUpperCase();
    if (!code) { setJoinMsg('Please enter a class code.'); return; }
    if (code === currentCode) { setJoinMsg('You are already in this class.'); return; }

    setJoinBusy(true);
    try {
      let teacherUid = '';
      let cName = '';

      // Primary lookup: classCodes collection
      const codeSnap = await getDoc(doc(db, 'classCodes', code));
      if (codeSnap.exists()) {
        teacherUid = codeSnap.data().teacherUid || '';
        cName = codeSnap.data().className || '';
      } else {
        // Fallback: search teacher users for matching class code
        const q = query(collection(db, 'users'), where('role', '==', 'teacher'));
        const snap = await getDocs(q);
        let found = false;
        snap.forEach(d => {
          if (found) return;
          const classes = d.data().classes || [];
          const match = classes.find(c => c.code === code || c.id === code);
          if (match) {
            teacherUid = d.id;
            cName = match.name || match.room || '';
            found = true;
            // Repair: create the missing classCodes document
            setDoc(doc(db, 'classCodes', code), {
              teacherUid: d.id,
              className: match.name || '',
              room: match.room || '',
              createdAt: new Date().toISOString(),
            }).catch(() => {});
          }
        });
        if (!found) {
          setJoinMsg('Invalid class code. Please check with your teacher.');
          setJoinBusy(false);
          return;
        }
      }

      await updateDoc(doc(db, 'users', userProfile.uid), {
        classCode: code,
        teacherUid: teacherUid,
      });
      await refreshProfile();
      setJoinCode('');
      setJoinMsg(`Joined ${cName || 'class'} successfully!`);
      setLeaveMsg('');
    } catch (err) {
      setJoinMsg('Failed to join — ' + (err.message || 'please try again.'));
    }
    setJoinBusy(false);
  }

  async function handleLeaveClass() {
    if (!currentCode) return;
    if (!window.confirm('Are you sure you want to leave this class? You can rejoin later with the class code.')) return;

    setLeaveBusy(true);
    setLeaveMsg('');
    try {
      await updateDoc(doc(db, 'users', userProfile.uid), {
        classCode: deleteField(),
        teacherUid: deleteField(),
      });
      await refreshProfile();
      setLeaveMsg('You have left the class.');
      setJoinMsg('');
    } catch (err) {
      setLeaveMsg('Failed to leave — ' + (err.message || 'please try again.'));
    }
    setLeaveBusy(false);
  }

  return (
    <div className="stack" style={{ gap: 16 }}>

      <div
        style={{ fontSize: 13, color: 'var(--text-muted)', cursor: 'pointer' }}
        onClick={() => navigate('/student/home')}
      >
        &larr; Back to home
      </div>

      <div style={{ fontSize: 18, fontWeight: 500 }}>Settings</div>

      {/* Current class */}
      <div className="card">
        <div style={{ fontSize: 14, fontWeight: 500, marginBottom: 8 }}>Your Class</div>
        {leaveMsg && !currentCode && (
          <div style={{
            fontSize: 13, marginBottom: 8,
            color: leaveMsg.startsWith('Failed') ? '#991B1B' : 'var(--teal)',
          }}>
            {leaveMsg}
          </div>
        )}
        {currentCode ? (
          <>
            <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 4 }}>
              You are currently in:
            </div>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '10px 14px', background: 'var(--purple-light)',
              borderRadius: 8, marginBottom: 12,
            }}>
              <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--purple-dark)' }}>
                {className || currentCode}
              </div>
              <div style={{
                fontSize: 11, fontWeight: 600, padding: '2px 8px',
                background: 'var(--purple)', color: '#fff', borderRadius: 4,
              }}>
                {currentCode}
              </div>
            </div>
            {leaveMsg && (
              <div style={{
                fontSize: 13, marginBottom: 8,
                color: leaveMsg.startsWith('Failed') ? '#991B1B' : 'var(--teal)',
              }}>
                {leaveMsg}
              </div>
            )}
            <button
              className="btn btn-full"
              style={{
                background: 'transparent', border: '1px solid #DC2626',
                color: '#DC2626', cursor: 'pointer', padding: '8px 0',
                borderRadius: 8, fontSize: 13, fontWeight: 500,
              }}
              disabled={leaveBusy}
              onClick={handleLeaveClass}
            >
              {leaveBusy ? 'Leaving…' : 'Leave this class'}
            </button>
          </>
        ) : (
          <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>
            You are not in any class right now. Join one below!
          </div>
        )}
      </div>

      {/* Join a class */}
      <div className="card">
        <div style={{ fontSize: 14, fontWeight: 500, marginBottom: 4 }}>
          {currentCode ? 'Switch to a different class' : 'Join a class'}
        </div>
        <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 12 }}>
          Enter the class code your teacher gave you
        </div>
        <form onSubmit={handleJoinClass}>
          <input
            className="input"
            value={joinCode}
            onChange={e => setJoinCode(e.target.value)}
            placeholder="e.g. ABC123"
            style={{ marginBottom: 8, textTransform: 'uppercase', letterSpacing: 2, fontWeight: 600, textAlign: 'center' }}
          />
          {joinMsg && (
            <div style={{
              fontSize: 13, marginBottom: 8,
              color: joinMsg.includes('successfully') ? 'var(--teal)' : '#991B1B',
            }}>
              {joinMsg}
            </div>
          )}
          <button
            className="btn btn-purple btn-full"
            type="submit"
            disabled={joinBusy}
            style={{ padding: '8px 0', fontSize: 13, fontWeight: 500 }}
          >
            {joinBusy ? 'Joining…' : 'Join class'}
          </button>
        </form>
      </div>

      {/* Log out */}
      <button
        className="btn btn-full"
        style={{
          background: 'transparent', border: '1px solid #DC2626',
          color: '#DC2626', cursor: 'pointer', padding: '10px 0',
          borderRadius: 8, fontSize: 14, fontWeight: 500, marginTop: 8,
        }}
        onClick={logout}
      >
        Log out
      </button>

    </div>
  );
}
