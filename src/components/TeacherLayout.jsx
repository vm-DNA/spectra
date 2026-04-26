import React, { useState, useEffect, useRef } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../lib/AuthContext';
import { TEACHER } from '../lib/mockData';
import { doc, updateDoc, setDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';

const NAV_ITEMS = [
  { label: 'Dashboard',   path: '/teacher/dashboard' },
  { label: 'Assignments', path: '/teacher/upload' },
  { label: 'Reports',     path: '/teacher/reports' },
  { label: 'Settings',    path: '/teacher/settings' },
];

export default function TeacherLayout() {
  const navigate  = useNavigate();
  const location  = useLocation();
  const { userProfile, logout, refreshProfile } = useAuth();

  const teacher = userProfile || TEACHER;
  const classes = teacher.classes || [];
  const [activeClassIdx, setActiveClassIdx] = useState(0);
  const activeClass = classes[activeClassIdx] || null;

  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showClassMenu, setShowClassMenu]     = useState(false);
  const [showNewClass, setShowNewClass]       = useState(false);
  const [newClassName, setNewClassName]       = useState('');
  const [newClassRoom, setNewClassRoom]       = useState('');
  const [classError, setClassError]           = useState('');

  const profileRef = useRef(null);
  const classRef   = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (profileRef.current && !profileRef.current.contains(e.target)) setShowProfileMenu(false);
      if (classRef.current && !classRef.current.contains(e.target)) {
        setShowClassMenu(false);
        setShowNewClass(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const initials = (teacher.name || 'T')
    .split(' ')
    .map(w => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  const badgeText = activeClass
    ? `${teacher.name} · ${activeClass.room || activeClass.name}`
    : teacher.name || TEACHER.name;

  async function handleAddClass() {
    if (!newClassName.trim()) return;
    setClassError('');
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 6; i++) code += chars[Math.floor(Math.random() * chars.length)];
    const newClass = { id: code, name: newClassName.trim(), room: newClassRoom.trim(), code };
    const updated = [...classes, newClass];

    if (userProfile?.uid) {
      try {
        await updateDoc(doc(db, 'users', userProfile.uid), { classes: updated });
        await setDoc(doc(db, 'classCodes', code), {
          teacherUid: userProfile.uid,
          className: newClassName.trim(),
          room: newClassRoom.trim(),
          createdAt: new Date().toISOString(),
        });
        await refreshProfile();
      } catch {
        setClassError('Failed to save class. Please try again.');
        return;
      }
    }
    setActiveClassIdx(updated.length - 1);
    setNewClassName('');
    setNewClassRoom('');
    setShowNewClass(false);
  }

  const dropdownStyle = {
    position: 'absolute', top: '100%', right: 0, marginTop: 6,
    background: 'var(--surface)', border: '1px solid var(--border)',
    borderRadius: 8, boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
    minWidth: 180, zIndex: 1000, overflow: 'hidden',
  };

  const menuItemStyle = {
    padding: '10px 14px', fontSize: 13, cursor: 'pointer',
    transition: 'background 0.1s',
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>

      {/* Top nav */}
      <nav className="topnav">
        <div className="topnav-logo" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
          <div className="topnav-logo-ring" />
          Spectra
        </div>
        <div className="topnav-tabs">
          {NAV_ITEMS.map(item => (
            <div
              key={item.path}
              className={`topnav-tab${location.pathname === item.path ? ' active' : ''}`}
              onClick={() => navigate(item.path)}
            >
              {item.label}
            </div>
          ))}
        </div>
        <div className="topnav-right" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>

          {/* Class switcher */}
          <div ref={classRef} style={{ position: 'relative' }}>
            <span
              className="badge badge-teal"
              style={{ cursor: 'pointer' }}
              onClick={() => setShowClassMenu(v => !v)}
            >
              {badgeText}
              <span style={{ marginLeft: 4, fontSize: 10 }}>&#9662;</span>
            </span>

            {showClassMenu && (
              <div style={{ ...dropdownStyle, right: 0, minWidth: 220, maxWidth: 'calc(100vw - 40px)' }}>
                {classes.map((cls, idx) => (
                  <div
                    key={cls.id || idx}
                    style={{
                      ...menuItemStyle,
                      background: idx === activeClassIdx ? 'var(--teal-light)' : 'transparent',
                      fontWeight: idx === activeClassIdx ? 500 : 400,
                    }}
                    onClick={() => { setActiveClassIdx(idx); setShowClassMenu(false); }}
                    onMouseEnter={e => { if (idx !== activeClassIdx) e.currentTarget.style.background = 'var(--bg)'; }}
                    onMouseLeave={e => { if (idx !== activeClassIdx) e.currentTarget.style.background = 'transparent'; }}
                  >
                    {cls.name || `${cls.room}`}
                    {cls.code && <span style={{ float: 'right', fontSize: 11, color: 'var(--text-muted)' }}>{cls.code}</span>}
                  </div>
                ))}
                {classes.length > 0 && <div style={{ borderTop: '1px solid var(--border)' }} />}

                {!showNewClass ? (
                  <div
                    style={{ ...menuItemStyle, color: 'var(--teal)', fontWeight: 500 }}
                    onClick={() => setShowNewClass(true)}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--bg)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    + New class
                  </div>
                ) : (
                  <div style={{ padding: 12 }}>
                    {classError && (
                      <div style={{ fontSize: 11, color: '#991B1B', marginBottom: 8 }}>{classError}</div>
                    )}
                    <input
                      className="input"
                      placeholder="Class name"
                      value={newClassName}
                      onChange={e => setNewClassName(e.target.value)}
                      style={{ marginBottom: 8, fontSize: 12 }}
                    />
                    <input
                      className="input"
                      placeholder="Room (optional)"
                      value={newClassRoom}
                      onChange={e => setNewClassRoom(e.target.value)}
                      style={{ marginBottom: 8, fontSize: 12 }}
                    />
                    <button
                      className="btn btn-primary btn-sm btn-full"
                      onClick={handleAddClass}
                    >
                      Add class
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Profile avatar */}
          <div ref={profileRef} style={{ position: 'relative' }}>
            <div
              className="avatar"
              style={{
                width: 32, height: 32, background: 'var(--purple-light)',
                color: 'var(--purple-dark)', fontSize: 12, cursor: 'pointer',
              }}
              onClick={() => setShowProfileMenu(v => !v)}
            >
              {initials}
            </div>

            {showProfileMenu && (
              <div style={dropdownStyle}>
                <div style={{ padding: '12px 14px', borderBottom: '1px solid var(--border)' }}>
                  <div style={{ fontSize: 13, fontWeight: 500 }}>{teacher.name}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{teacher.email || ''}</div>
                </div>
                <div
                  style={menuItemStyle}
                  onClick={() => { setShowProfileMenu(false); navigate('/teacher/settings'); }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--bg)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  Profile
                </div>
                <div
                  style={{ ...menuItemStyle, color: '#DC2626' }}
                  onClick={logout}
                  onMouseEnter={e => e.currentTarget.style.background = '#FEF2F2'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  Log out
                </div>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Page content */}
      <main style={{ flex: 1 }}>
        <Outlet />
      </main>

    </div>
  );
}
