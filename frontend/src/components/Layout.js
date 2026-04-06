import React from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    toast.success('Logged out');
    navigate('/login');
  };

  const navItems = [
    { to: '/', icon: '⬡', label: 'Dashboard', exact: true },
    { to: '/composer', icon: '✦', label: 'AI Composer' },
    { to: '/campaigns', icon: '⚡', label: 'Campaigns' },
    { to: '/queue', icon: '⏱', label: 'Queue' },
    { to: '/logs', icon: '◈', label: 'Reply Logs' },
    { to: '/accounts', icon: '⊕', label: 'Accounts' },
  ];

  return (
    <div style={{ display: 'flex', minHeight: '100vh', position: 'relative', zIndex: 1 }}>

      {/* SIDEBAR */}
      <aside style={{
        width: '230px',
        flexShrink: 0,
        background: 'rgba(6,6,18,0.8)',
        backdropFilter: 'blur(30px)',
        borderRight: '1px solid rgba(255,255,255,0.06)',
        display: 'flex',
        flexDirection: 'column',
        padding: '28px 0 24px',
        position: 'sticky',
        top: 0,
        height: '100vh',
        zIndex: 10
      }}>

        {/* Logo */}
        <div style={{ padding: '0 24px 28px', borderBottom: '1px solid rgba(255,255,255,0.05)', marginBottom: '20px' }}>
          <div style={{
            fontFamily: 'Syne',
            fontSize: '20px',
            fontWeight: 800,
            background: 'linear-gradient(135deg, #a78bfa, #e1306c)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            CommentFlow
          </div>
          <div style={{ fontSize: '9px', color: 'var(--text-dim)', letterSpacing: '2.5px', marginTop: '3px', fontFamily: 'DM Mono' }}>
            SOCIAL AUTOMATION
          </div>
        </div>

        {/* Nav */}
        <nav style={{ padding: '0 12px', flex: 1 }}>
          <div style={{ fontSize: '9px', color: 'var(--text-dim)', letterSpacing: '2px', padding: '0 12px', marginBottom: '8px', fontFamily: 'DM Mono' }}>
            NAVIGATION
          </div>
          {navItems.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.exact}
              style={({ isActive }) => ({
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '9px 12px',
                borderRadius: '10px',
                cursor: 'pointer',
                color: isActive ? '#c4b5fd' : 'var(--text-muted)',
                background: isActive ? 'rgba(124,58,237,0.1)' : 'transparent',
                textDecoration: 'none',
                fontSize: '13.5px',
                marginBottom: '2px',
                border: isActive ? '1px solid rgba(124,58,237,0.2)' : '1px solid transparent',
                backdropFilter: isActive ? 'blur(10px)' : 'none',
              })}
            >
              <span style={{ fontSize: '14px', width: '18px', textAlign: 'center' }}>{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* User */}
        <div style={{ padding: '16px 24px 0', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
          <div style={{
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.07)',
            borderRadius: '10px',
            padding: '12px'
          }}>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '2px', fontFamily: 'DM Mono' }}>SIGNED IN AS</div>
            <div style={{ fontSize: '13px', fontWeight: 500, marginBottom: '10px' }}>{user?.name}</div>
            <button
              onClick={handleLogout}
              style={{
                width: '100%', padding: '7px',
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: '7px',
                color: 'var(--text-muted)',
                cursor: 'pointer',
                fontSize: '12px',
                fontFamily: 'DM Sans'
              }}
            >
              Logout
            </button>
          </div>
        </div>
      </aside>

      {/* MAIN */}
      <main style={{ flex: 1, padding: '36px 40px', overflowY: 'auto', position: 'relative', zIndex: 1 }}>
        <Outlet />
      </main>
    </div>
  );
}

export default Layout;