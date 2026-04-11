import React, { useState, useEffect } from 'react';
import { accountsAPI } from '../utils/api';
import toast from 'react-hot-toast';

function Accounts() {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    
    if (params.get('success') === 'true') {
      window.history.replaceState({}, '', '/accounts');
      toast.success('Account connected successfully! ✅');
      // Wait a moment then fetch so DB has time to save
      setTimeout(() => {
        fetchAccounts();
      }, 1500);
    } else if (params.get('error')) {
      window.history.replaceState({}, '', '/accounts');
      toast.error('Failed to connect account. Please try again.');
      fetchAccounts();
    } else {
      fetchAccounts();
    }
  }, []);

  const fetchAccounts = async () => {
  try {
    setLoading(true);
    const token = localStorage.getItem('token');
    const res = await fetch('https://commentflow-q67q.onrender.com/api/accounts', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Cache-Control': 'no-cache'
      }
    });
    const data = await res.json();
    console.log('Accounts data:', data);
    setAccounts(data);
  } catch (err) {
    toast.error('Failed to load accounts');
  } finally {
    setLoading(false);
  }
};

  const handleConnect = async (platform) => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      toast.error('Please login first');
      return;
    }
    // Hardcoded URL — fixes undefined env variable issue
    window.location.href = `https://commentflow-q67q.onrender.com/api/accounts/oauth/connect?platform=${platform}&token=${token}`;
  } catch (err) {
    toast.error('Failed to start connection');
  }
};

  const handleDelete = async (id) => {
    if (!window.confirm('Disconnect this account?')) return;
    try {
      await accountsAPI.delete(id);
      toast.success('Account disconnected');
      fetchAccounts();
    } catch {
      toast.error('Failed to disconnect');
    }
  };

  const cardStyle = {
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '16px', padding: '20px 24px',
    display: 'flex', alignItems: 'center',
    justifyContent: 'space-between', gap: '16px'
  };

  return (
    <div style={{ maxWidth: '720px' }}>
      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontFamily: 'Syne', fontSize: '26px', fontWeight: 800, margin: 0 }}>
          Connected Accounts
        </h1>
        <p style={{ color: 'rgba(255,255,255,0.4)', marginTop: '6px', fontSize: '14px' }}>
          Connect your Instagram and Facebook accounts to enable auto-reply.
        </p>
      </div>

      {/* Connect Buttons */}
      <div style={{ display: 'flex', gap: '16px', marginBottom: '32px', flexWrap: 'wrap' }}>
        <button
          onClick={() => handleConnect('instagram')}
          style={{
            flex: 1, minWidth: '200px', padding: '18px 24px',
            background: 'linear-gradient(135deg, #7c3aed, #e1306c)',
            border: 'none', borderRadius: '14px', color: '#fff',
            fontFamily: 'DM Sans', fontWeight: 700, cursor: 'pointer',
            fontSize: '15px', display: 'flex', alignItems: 'center',
            justifyContent: 'center', gap: '10px',
            boxShadow: '0 8px 32px rgba(225,48,108,0.3)'
          }}
        >
          <span style={{ fontSize: '22px' }}>📸</span>
          Connect Instagram
        </button>

        <button
          onClick={() => handleConnect('facebook')}
          style={{
            flex: 1, minWidth: '200px', padding: '18px 24px',
            background: 'linear-gradient(135deg, #1877f2, #0a5dc2)',
            border: 'none', borderRadius: '14px', color: '#fff',
            fontFamily: 'DM Sans', fontWeight: 700, cursor: 'pointer',
            fontSize: '15px', display: 'flex', alignItems: 'center',
            justifyContent: 'center', gap: '10px',
            boxShadow: '0 8px 32px rgba(24,119,242,0.3)'
          }}
        >
          <span style={{ fontSize: '22px' }}>👍</span>
          Connect Facebook
        </button>
      </div>

      {/* Info Box */}
      <div style={{
        background: 'rgba(124,58,237,0.1)',
        border: '1px solid rgba(124,58,237,0.25)',
        borderRadius: '12px', padding: '16px 20px',
        marginBottom: '28px', fontSize: '13px',
        color: 'rgba(255,255,255,0.6)', lineHeight: '1.7'
      }}>
        <strong style={{ color: '#a78bfa' }}>ℹ️ How it works:</strong><br />
        Click "Connect Instagram" or "Connect Facebook" → you'll be redirected to Meta's secure login page →
        login with your account → grant permissions → you'll be brought back here automatically.
        We never see your password.
      </div>

      {/* Connected Accounts List */}
      <h3 style={{ fontFamily: 'Syne', fontWeight: 700, marginBottom: '16px', fontSize: '16px', color: 'rgba(255,255,255,0.7)' }}>
        Connected Accounts
      </h3>

      {loading ? (
        <p style={{ color: 'rgba(255,255,255,0.4)' }}>Loading accounts...</p>
      ) : accounts.length === 0 ? (
        <div style={{
          ...cardStyle, justifyContent: 'center',
          flexDirection: 'column', padding: '48px', textAlign: 'center'
        }}>
          <div style={{ fontSize: '40px', marginBottom: '12px' }}>🔗</div>
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '14px' }}>
            No accounts connected yet. Click a button above to connect.
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {accounts.map(acc => (
            <div key={acc._id} style={cardStyle}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div style={{
                  width: '44px', height: '44px', borderRadius: '12px',
                  background: acc.platform === 'instagram'
                    ? 'linear-gradient(135deg, #7c3aed, #e1306c)'
                    : 'linear-gradient(135deg, #1877f2, #0a5dc2)',
                  display: 'flex', alignItems: 'center',
                  justifyContent: 'center', fontSize: '20px'
                }}>
                  {acc.platform === 'instagram' ? '📸' : '👍'}
                </div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '15px' }}>
                    @{acc.accountName}
                  </div>
                  <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '12px', marginTop: '2px' }}>
                    {acc.platform === 'instagram' ? 'Instagram' : 'Facebook'} •{' '}
                    <span style={{ color: '#4ade80' }}>● Connected</span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => handleDelete(acc._id)}
                style={{
                  padding: '8px 16px',
                  background: 'rgba(239,68,68,0.15)',
                  border: '1px solid rgba(239,68,68,0.3)',
                  borderRadius: '8px', color: '#f87171',
                  fontFamily: 'DM Sans', cursor: 'pointer',
                  fontSize: '13px', fontWeight: 500
                }}
              >
                Disconnect
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Accounts;