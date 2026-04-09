import React, { useState, useEffect } from 'react';
import { accountsAPI } from '../utils/api';
import toast from 'react-hot-toast';

function Accounts() {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    platform: 'instagram',
    accountName: '',
    accessToken: '',
    pageId: ''
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => { fetchAccounts(); }, []);

  const fetchAccounts = async () => {
    try {
      const res = await accountsAPI.getAll();
      setAccounts(res.data);
    } catch {
      toast.error('Failed to load accounts');
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async () => {
    if (!form.accountName || !form.accessToken) {
      toast.error('Account name and access token are required');
      return;
    }
    setSubmitting(true);
    try {
      await accountsAPI.add(form);
      toast.success('Account connected! ✅');
      setShowForm(false);
      setForm({ platform: 'instagram', accountName: '', accessToken: '', pageId: '' });
      fetchAccounts();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add account');
    } finally {
      setSubmitting(false);
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

  const inputStyle = {
    width: '100%', padding: '11px 14px',
    background: 'rgba(255,255,255,0.06)',
    border: '1px solid rgba(255,255,255,0.12)',
    borderRadius: '10px', color: '#fff',
    fontFamily: 'DM Sans', fontSize: '14px',
    outline: 'none', boxSizing: 'border-box'
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
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px' }}>
        <div>
          <h1 style={{ fontFamily: 'Syne', fontSize: '26px', fontWeight: 800, margin: 0 }}>
            Connected Accounts
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.4)', marginTop: '6px', fontSize: '14px' }}>
            Connect your Instagram and Facebook accounts to enable auto-reply.
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          style={{
            padding: '10px 20px',
            background: 'linear-gradient(135deg, #7c3aed, #e1306c)',
            border: 'none', borderRadius: '10px', color: '#fff',
            fontFamily: 'DM Sans', fontWeight: 600, cursor: 'pointer',
            fontSize: '14px', whiteSpace: 'nowrap'
          }}
        >
          + Add Account
        </button>
      </div>

      {/* Add Account Form */}
      {showForm && (
        <div style={{
          background: 'rgba(255,255,255,0.05)',
          border: '1px solid rgba(255,255,255,0.12)',
          borderRadius: '16px', padding: '24px',
          marginBottom: '24px'
        }}>
          <h3 style={{ fontFamily: 'Syne', fontWeight: 700, marginBottom: '20px', fontSize: '16px' }}>
            Connect New Account
          </h3>

          {/* How to get token guide */}
          <div style={{
            background: 'rgba(124,58,237,0.15)',
            border: '1px solid rgba(124,58,237,0.3)',
            borderRadius: '10px', padding: '14px 16px',
            marginBottom: '20px', fontSize: '13px',
            color: 'rgba(255,255,255,0.7)', lineHeight: '1.6'
          }}>
            <strong style={{ color: '#a78bfa' }}>📖 How to get your Access Token:</strong><br />
            1. Go to <a href="https://developers.facebook.com/tools/explorer/" target="_blank" rel="noreferrer" style={{ color: '#a78bfa' }}>Meta Graph API Explorer</a><br />
            2. Select your App → Click "Generate Access Token"<br />
            3. Add permissions: <code>instagram_basic</code>, <code>instagram_manage_comments</code>, <code>pages_manage_engagement</code><br />
            4. Copy the token and paste below<br />
            <strong style={{ color: '#f472b6' }}>For Instagram:</strong> Page ID = your Instagram Business Account ID<br />
            <strong style={{ color: '#60a5fa' }}>For Facebook:</strong> Page ID = your Facebook Page ID
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {/* Platform */}
            <div>
              <label style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)', letterSpacing: '1px', display: 'block', marginBottom: '6px' }}>
                PLATFORM
              </label>
              <select
                value={form.platform}
                onChange={e => setForm({ ...form, platform: e.target.value })}
                style={{ ...inputStyle }}
              >
                <option value="instagram">📸 Instagram</option>
                <option value="facebook">👍 Facebook</option>
              </select>
            </div>

            {/* Account Name */}
            <div>
              <label style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)', letterSpacing: '1px', display: 'block', marginBottom: '6px' }}>
                ACCOUNT USERNAME
              </label>
              <input
                placeholder="e.g. ajclothing175"
                value={form.accountName}
                onChange={e => setForm({ ...form, accountName: e.target.value })}
                style={inputStyle}
              />
            </div>

            {/* Access Token */}
            <div>
              <label style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)', letterSpacing: '1px', display: 'block', marginBottom: '6px' }}>
                ACCESS TOKEN
              </label>
              <textarea
                placeholder="Paste your access token here..."
                value={form.accessToken}
                onChange={e => setForm({ ...form, accessToken: e.target.value })}
                rows={3}
                style={{ ...inputStyle, resize: 'vertical' }}
              />
            </div>

            {/* Page ID */}
            <div>
              <label style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)', letterSpacing: '1px', display: 'block', marginBottom: '6px' }}>
                PAGE / ACCOUNT ID <span style={{ color: 'rgba(255,255,255,0.3)' }}>(optional but recommended)</span>
              </label>
              <input
                placeholder="e.g. 17841435165711631"
                value={form.pageId}
                onChange={e => setForm({ ...form, pageId: e.target.value })}
                style={inputStyle}
              />
            </div>

            <div style={{ display: 'flex', gap: '10px', marginTop: '4px' }}>
              <button
                onClick={handleAdd}
                disabled={submitting}
                style={{
                  flex: 1, padding: '12px',
                  background: 'linear-gradient(135deg, #7c3aed, #e1306c)',
                  border: 'none', borderRadius: '10px', color: '#fff',
                  fontFamily: 'DM Sans', fontWeight: 600,
                  cursor: submitting ? 'not-allowed' : 'pointer', fontSize: '14px'
                }}
              >
                {submitting ? 'Connecting...' : 'Connect Account'}
              </button>
              <button
                onClick={() => setShowForm(false)}
                style={{
                  padding: '12px 20px',
                  background: 'rgba(255,255,255,0.06)',
                  border: '1px solid rgba(255,255,255,0.12)',
                  borderRadius: '10px', color: '#fff',
                  fontFamily: 'DM Sans', cursor: 'pointer', fontSize: '14px'
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Accounts List */}
      {loading ? (
        <p style={{ color: 'rgba(255,255,255,0.4)' }}>Loading accounts...</p>
      ) : accounts.length === 0 ? (
        <div style={{
          ...cardStyle, justifyContent: 'center',
          flexDirection: 'column', padding: '48px',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '40px', marginBottom: '12px' }}>🔗</div>
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '14px' }}>
            No accounts connected yet. Click "Add Account" to get started.
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