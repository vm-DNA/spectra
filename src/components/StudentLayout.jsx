import React, { useState, useEffect, useRef } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../lib/AuthContext';

export default function StudentLayout() {
  const navigate = useNavigate();
  const { userProfile, logout } = useAuth();
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) setShowMenu(false);
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const studentName = userProfile?.name || 'Student';
  const initials = studentName
    .split(' ')
    .map(w => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: 'var(--bg)' }}>

      {/* Minimal top bar */}
      <nav style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 20px', height: 52, background: 'var(--surface)',
        borderBottom: '0.5px solid var(--border)', flexShrink: 0,
      }}>
        <div
          style={{ fontSize: 15, fontWeight: 500, color: 'var(--purple)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 7 }}
          onClick={() => navigate('/student/home')}
        >
          <div style={{ width: 10, height: 10, borderRadius: '50%', border: '2px solid var(--purple)' }} />
          Spectra
        </div>

        {/* Profile avatar with dropdown */}
        <div ref={menuRef} style={{ position: 'relative' }}>
          <div
            className="avatar"
            style={{
              width: 32, height: 32, background: 'var(--purple-light)',
              color: 'var(--purple-dark)', fontSize: 12, cursor: 'pointer',
            }}
            onClick={() => setShowMenu(v => !v)}
          >
            {initials}
          </div>

          {showMenu && (
            <div style={{
              position: 'absolute', top: '100%', right: 0, marginTop: 6,
              background: 'var(--surface)', border: '1px solid var(--border)',
              borderRadius: 8, boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
              minWidth: 160, zIndex: 1000, overflow: 'hidden',
            }}>
              <div style={{ padding: '12px 14px', borderBottom: '1px solid var(--border)' }}>
                <div style={{ fontSize: 13, fontWeight: 500 }}>{studentName}</div>
              </div>
              <div
                style={{ padding: '10px 14px', fontSize: 13, cursor: 'pointer', transition: 'background 0.1s' }}
                onClick={() => { setShowMenu(false); navigate('/student/settings'); }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--bg)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                Settings
              </div>
              <div
                style={{ padding: '10px 14px', fontSize: 13, color: '#DC2626', cursor: 'pointer', transition: 'background 0.1s' }}
                onClick={logout}
                onMouseEnter={e => e.currentTarget.style.background = '#FEF2F2'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                Log out
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Page content */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '20px 16px' }}>
        <div style={{ width: '100%', maxWidth: 400 }}>
          <Outlet />
        </div>
      </main>

    </div>
  );
}
