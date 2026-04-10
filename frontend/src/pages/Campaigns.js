import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import api from '../utils/api';

const glass = {
  background: 'rgba(255,255,255,0.03)',
  backdropFilter: 'blur(20px)',
  border: '1px solid rgba(255,255,255,0.08)',
  borderRadius: '16px',
};

const inputStyle = {
  width: '100%',
  background: 'rgba(255,255,255,0.05)',
  border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: '8px',
  padding: '10px 14px',
  color: '#f0f0f8',
  fontFamily: 'DM Sans',
  fontSize: '13.5px',
  outline: 'none',
};

const labelStyle = {
  display: 'block',
  fontSize: '10px',
  color: '#7070a0',
  textTransform: 'uppercase',
  letterSpacing: '1.5px',
  fontFamily: 'DM Mono',
  marginBottom: '6px',
};

const defaultForm = {
  name: '',
  platform: 'instagram',
  postUrl: '',
  triggerType: 'keywords',
  keywords: '',
  publicReply: 'Hey! 👋 Check your DMs, we just sent you something special! 📩',
  dmGreeting: 'Hey {name}! 👋 Thanks for your interest!',
  productName: '',
  productLink: '',
  includeDescription: false,
  productDescription: '',
};

function Campaigns() {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(defaultForm);
  const [saving, setSaving] = useState(false);

  useEffect(() => { fetchCampaigns(); }, []);

  const fetchCampaigns = async () => {
    try {
      const res = await api.get('/campaigns');
      setCampaigns(res.data);
    } catch (err) {
      toast.error('Failed to load campaigns');
    } finally {
      setLoading(false);
    }
  };

  const saveCampaign = async () => {
    if (!form.name || !form.postUrl || !form.publicReply) {
      toast.error('Name, Post URL and Public Reply are required');
      return;
    }
    setSaving(true);
    try {
      const payload = {
        ...form,
        postId: form.postUrl, // backend will auto-resolve to numeric ID
        keywords: form.keywords.split(',').map(k => k.trim()).filter(Boolean),
      };
      const res = await api.post('/campaigns', payload);
      setCampaigns([res.data, ...campaigns]);
      setForm(defaultForm);
      setShowForm(false);
      toast.success('Campaign created! ✅');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create');
    } finally {
      setSaving(false);
    }
  };

  const toggleCampaign = async (id) => {
    try {
      const res = await api.patch(`/campaigns/${id}/toggle`);
      setCampaigns(campaigns.map(c =>
        c._id === id ? { ...c, isActive: res.data.isActive } : c
      ));
      toast.success(res.data.message);
    } catch {
      toast.error('Failed to toggle');
    }
  };

  const deleteCampaign = async (id) => {
    try {
      await api.delete(`/campaigns/${id}`);
      setCampaigns(campaigns.filter(c => c._id !== id));
      toast.success('Campaign deleted');
    } catch {
      toast.error('Failed to delete');
    }
  };

  if (loading) return <div style={{ color: 'var(--text-muted)', fontFamily: 'DM Mono' }}>Loading...</div>;

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '28px' }}>
        <div>
          <h1 style={{ fontFamily: 'Syne', fontSize: '26px', fontWeight: 800 }}>Campaigns</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginTop: '4px' }}>
            Auto-reply to comments like ManyChat
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          style={{
            padding: '10px 22px',
            background: showForm ? 'rgba(255,255,255,0.05)' : 'linear-gradient(135deg, #7c3aed, #e1306c)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '10px',
            color: '#fff',
            fontFamily: 'DM Sans',
            fontSize: '13px',
            fontWeight: 500,
            cursor: 'pointer',
          }}
        >
          {showForm ? 'Cancel' : '+ New Campaign'}
        </button>
      </div>

      {/* Create Form */}
      {showForm && (
        <div style={{ ...glass, padding: '28px', marginBottom: '24px' }}>
          <h2 style={{ fontFamily: 'Syne', fontSize: '16px', fontWeight: 700, marginBottom: '24px' }}>
            ⚡ New Auto-Reply Campaign
          </h2>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>

            {/* Campaign Name */}
            <div>
              <label style={labelStyle}>Campaign Name *</label>
              <input
                value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
                placeholder="Summer Sale"
                style={inputStyle}
              />
            </div>

            {/* Platform */}
            <div>
              <label style={labelStyle}>Platform *</label>
              <select
                value={form.platform}
                onChange={e => setForm({ ...form, platform: e.target.value })}
                style={{ ...inputStyle, cursor: 'pointer' }}
              >
                <option value="instagram">Instagram</option>
                <option value="facebook">Facebook</option>
              </select>
            </div>

            {/* Post URL — full width, no Post ID field */}
            <div style={{ gridColumn: 'span 2' }}>
              <label style={labelStyle}>Post / Reel URL *</label>
              <input
                value={form.postUrl}
                onChange={e => setForm({ ...form, postUrl: e.target.value })}
                placeholder="https://www.instagram.com/reel/ABC123xyz/"
                style={inputStyle}
              />
              <div style={{ fontSize: '11px', color: 'var(--text-dim)', marginTop: '4px', fontFamily: 'DM Mono' }}>
                Paste your full Instagram or Facebook post/reel URL — we'll handle the rest automatically
              </div>
            </div>

            {/* Trigger Type */}
            <div>
              <label style={labelStyle}>Trigger Type</label>
              <select
                value={form.triggerType}
                onChange={e => setForm({ ...form, triggerType: e.target.value })}
                style={{ ...inputStyle, cursor: 'pointer' }}
              >
                <option value="keywords">Keywords Only</option>
                <option value="all">All Comments</option>
                <option value="both">Both</option>
              </select>
            </div>

            {/* Keywords */}
            <div>
              <label style={labelStyle}>Keywords (comma separated)</label>
              <input
                value={form.keywords}
                onChange={e => setForm({ ...form, keywords: e.target.value })}
                placeholder="price, buy, cost, link, where"
                style={inputStyle}
                disabled={form.triggerType === 'all'}
              />
            </div>

            {/* Public Reply */}
            <div style={{ gridColumn: 'span 2' }}>
              <label style={labelStyle}>Public Comment Reply *</label>
              <textarea
                value={form.publicReply}
                onChange={e => setForm({ ...form, publicReply: e.target.value })}
                style={{ ...inputStyle, minHeight: '70px', resize: 'vertical' }}
              />
              <div style={{ fontSize: '11px', color: 'var(--text-dim)', marginTop: '4px', fontFamily: 'DM Mono' }}>
                This is posted publicly as a reply to the comment
              </div>
            </div>

            {/* DM Greeting */}
            <div style={{ gridColumn: 'span 2' }}>
              <label style={labelStyle}>DM Greeting — use {'{name}'} for their name</label>
              <input
                value={form.dmGreeting}
                onChange={e => setForm({ ...form, dmGreeting: e.target.value })}
                placeholder="Hey {name}! 👋 Thanks for your interest!"
                style={inputStyle}
              />
            </div>

            {/* Product Name */}
            <div>
              <label style={labelStyle}>Product Name</label>
              <input
                value={form.productName}
                onChange={e => setForm({ ...form, productName: e.target.value })}
                placeholder="Summer Floral Dress"
                style={inputStyle}
              />
            </div>

            {/* Product Link */}
            <div>
              <label style={labelStyle}>Product Link (any URL)</label>
              <input
                value={form.productLink}
                onChange={e => setForm({ ...form, productLink: e.target.value })}
                placeholder="https://yourstore.com/product"
                style={inputStyle}
              />
            </div>

            {/* Include Description Toggle */}
            <div style={{ gridColumn: 'span 2', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div
                onClick={() => setForm({ ...form, includeDescription: !form.includeDescription })}
                style={{
                  width: '42px', height: '24px', borderRadius: '12px', cursor: 'pointer',
                  background: form.includeDescription ? '#7c3aed' : 'rgba(255,255,255,0.1)',
                  border: '1px solid rgba(255,255,255,0.15)',
                  position: 'relative', transition: 'background 0.2s',
                }}
              >
                <div style={{
                  position: 'absolute', top: '3px',
                  left: form.includeDescription ? '20px' : '3px',
                  width: '16px', height: '16px', borderRadius: '50%',
                  background: '#fff', transition: 'left 0.2s',
                }} />
              </div>
              <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                Include product description in DM
              </span>
            </div>

            {/* Description */}
            {form.includeDescription && (
              <div style={{ gridColumn: 'span 2' }}>
                <label style={labelStyle}>Product Description</label>
                <textarea
                  value={form.productDescription}
                  onChange={e => setForm({ ...form, productDescription: e.target.value })}
                  placeholder="Beautiful summer dress available in 5 colors. Premium quality!"
                  style={{ ...inputStyle, minHeight: '80px', resize: 'vertical' }}
                />
              </div>
            )}
          </div>

          {/* Save Button */}
          <button
            onClick={saveCampaign}
            disabled={saving}
            style={{
              marginTop: '20px',
              padding: '12px 32px',
              background: saving ? 'rgba(255,255,255,0.05)' : 'linear-gradient(135deg, #7c3aed, #e1306c)',
              border: 'none', borderRadius: '10px',
              color: '#fff', fontFamily: 'DM Sans',
              fontSize: '14px', fontWeight: 500, cursor: 'pointer',
            }}
          >
            {saving ? 'Creating...' : '⚡ Create Campaign'}
          </button>
        </div>
      )}

      {/* Campaign List */}
      {campaigns.length === 0 ? (
        <div style={{ ...glass, padding: '60px', textAlign: 'center', color: 'var(--text-dim)', fontSize: '13px' }}>
          No campaigns yet.{' '}
          <span style={{ color: '#a78bfa', cursor: 'pointer' }} onClick={() => setShowForm(true)}>
            Create your first one →
          </span>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {campaigns.map(c => (
            <div key={c._id} style={{
              ...glass, padding: '20px 24px',
              display: 'flex', alignItems: 'center', gap: '16px',
              borderLeft: `3px solid ${c.isActive ? '#7c3aed' : 'rgba(255,255,255,0.1)'}`,
            }}>
              <div style={{
                width: '10px', height: '10px', borderRadius: '50%', flexShrink: 0,
                background: c.isActive ? '#10b981' : '#3a3a5a',
                boxShadow: c.isActive ? '0 0 8px #10b981' : 'none',
              }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: '14px', marginBottom: '4px' }}>
                  {c.name}
                </div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'DM Mono', display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                  <span style={{ color: c.platform === 'instagram' ? '#e1306c' : '#60a5fa' }}>
                    {c.platform.toUpperCase()}
                  </span>
                  <span>Trigger: {c.triggerType}</span>
                  {c.keywords?.length > 0 && <span>Keywords: {c.keywords.join(', ')}</span>}
                  <span>Replies: {c.totalReplies}</span>
                  <span>DMs: {c.totalDMs}</span>
                </div>
                {c.postUrl && (
                  <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)', marginTop: '4px', fontFamily: 'DM Mono', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    🔗 {c.postUrl}
                  </div>
                )}
              </div>
              <span style={{
                padding: '4px 10px', borderRadius: '20px', fontSize: '10px', fontFamily: 'DM Mono',
                background: c.isActive ? 'rgba(16,185,129,0.1)' : 'rgba(255,255,255,0.05)',
                color: c.isActive ? '#10b981' : 'var(--text-dim)',
                border: `1px solid ${c.isActive ? 'rgba(16,185,129,0.2)' : 'rgba(255,255,255,0.08)'}`,
                flexShrink: 0,
              }}>
                {c.isActive ? 'Active' : 'Paused'}
              </span>
              <button onClick={() => toggleCampaign(c._id)} style={{
                padding: '6px 14px', borderRadius: '8px',
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.1)',
                color: 'var(--text-muted)', fontSize: '12px',
                cursor: 'pointer', fontFamily: 'DM Sans', flexShrink: 0,
              }}>
                {c.isActive ? 'Pause' : 'Activate'}
              </button>
              <button onClick={() => deleteCampaign(c._id)} style={{
                padding: '6px 14px', borderRadius: '8px',
                background: 'rgba(225,48,108,0.08)',
                border: '1px solid rgba(225,48,108,0.2)',
                color: '#e1306c', fontSize: '12px',
                cursor: 'pointer', fontFamily: 'DM Sans', flexShrink: 0,
              }}>
                Delete
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Campaigns;