import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';

function StatCard({ label, value, icon, gradient, sub }) {
  return (
    <div style={{
      background: 'rgba(255,255,255,0.04)',
      border: '1px solid rgba(255,255,255,0.1)',
      borderRadius: '20px',
      padding: '24px',
      position: 'relative',
      overflow: 'hidden',
    }}>
      <div style={{
        position: 'absolute', top: '-20px', right: '-20px',
        width: '100px', height: '100px', borderRadius: '50%',
        background: gradient, filter: 'blur(30px)', opacity: 0.5,
      }} />
      <div style={{ fontSize: '28px', marginBottom: '12px' }}>{icon}</div>
      <div style={{
        fontSize: '32px', fontWeight: 800, fontFamily: 'Syne',
        background: gradient, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
      }}>{value}</div>
      <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)', marginTop: '4px' }}>{label}</div>
      {sub && <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)', marginTop: '4px' }}>{sub}</div>}
    </div>
  );
}

function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({ campaigns: 0, replies: 0, dms: 0, accounts: 0 });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [campaigns, logs, accounts] = await Promise.all([
          api.get('/campaigns'),
          api.get('/campaigns/logs'),
          api.get('/accounts'),
        ]);
        setStats({
          campaigns: campaigns.data.length,
          replies: logs.data.filter(l => l.publicReplySent).length,
          dms: logs.data.filter(l => l.dmSent).length,
          accounts: accounts.data.length,
        });
      } catch {}
    };
    fetchStats();
  }, []);

  const quickActions = [
    { label: 'Create Campaign', icon: '⚡', path: '/campaigns', gradient: 'linear-gradient(135deg, #7c3aed, #a855f7)' },
    { label: 'AI Composer', icon: '✦', path: '/composer', gradient: 'linear-gradient(135deg, #e1306c, #f472b6)' },
    { label: 'View Logs', icon: '◈', path: '/logs', gradient: 'linear-gradient(135deg, #f59e0b, #fb923c)' },
    { label: 'Add Account', icon: '⊕', path: '/accounts', gradient: 'linear-gradient(135deg, #10b981, #34d399)' },
  ];

  return (
    <div style={{ maxWidth: '1100px' }}>
      {/* Welcome */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(124,58,237,0.2), rgba(225,48,108,0.2))',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: '24px',
        padding: '36px 40px',
        marginBottom: '28px',
        position: 'relative',
        overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute', top: '-60px', right: '-60px',
          width: '250px', height: '250px', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(124,58,237,0.3), transparent)',
          filter: 'blur(40px)',
        }} />
        <div style={{
          position: 'absolute', bottom: '-60px', left: '30%',
          width: '200px', height: '200px', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(225,48,108,0.2), transparent)',
          filter: 'blur(40px)',
        }} />
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)', fontFamily: 'DM Mono', letterSpacing: '2px', marginBottom: '8px' }}>
            WELCOME BACK
          </div>
          <h1 style={{
            fontFamily: 'Syne', fontSize: '36px', fontWeight: 800, marginBottom: '8px',
            background: 'linear-gradient(135deg, #fff, #a78bfa)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          }}>
            Hey, {user?.name?.split(' ')[0]}! 👋
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '14px' }}>
            Your automation is running. Here's what's happening today.
          </p>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '28px' }}>
        <StatCard label="Active Campaigns" value={stats.campaigns} icon="⚡" gradient="linear-gradient(135deg, #7c3aed, #a855f7)" />
        <StatCard label="Auto Replies Sent" value={stats.replies} icon="💬" gradient="linear-gradient(135deg, #e1306c, #f472b6)" />
        <StatCard label="DMs Sent" value={stats.dms} icon="📩" gradient="linear-gradient(135deg, #f59e0b, #fb923c)" />
        <StatCard label="Connected Accounts" value={stats.accounts} icon="📸" gradient="linear-gradient(135deg, #10b981, #34d399)" />
      </div>

      {/* Quick Actions */}
      <div style={{ marginBottom: '12px' }}>
        <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)', fontFamily: 'DM Mono', letterSpacing: '2px', marginBottom: '16px' }}>
          QUICK ACTIONS
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
          {quickActions.map(action => (
            <button
              key={action.path}
              onClick={() => navigate(action.path)}
              style={{
                padding: '20px',
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: '16px',
                color: '#fff',
                cursor: 'pointer',
                textAlign: 'left',
                fontFamily: 'DM Sans',
                transition: 'all 0.2s',
              }}
            >
              <div style={{
                fontSize: '24px', marginBottom: '10px',
                background: action.gradient,
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
              }}>{action.icon}</div>
              <div style={{ fontSize: '13px', fontWeight: 500 }}>{action.label}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Status Banner */}
      <div style={{
        marginTop: '24px',
        background: 'rgba(16,185,129,0.08)',
        border: '1px solid rgba(16,185,129,0.2)',
        borderRadius: '16px',
        padding: '16px 20px',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
      }}>
        <div style={{
          width: '8px', height: '8px', borderRadius: '50%',
          background: '#10b981',
          boxShadow: '0 0 10px #10b981',
        }} />
        <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.6)' }}>
          System is <span style={{ color: '#10b981', fontWeight: 600 }}>online</span> — automation is active and monitoring your campaigns
        </span>
      </div>
    </div>
  );
}

export default Dashboard;