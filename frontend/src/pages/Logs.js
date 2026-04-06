import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import api from '../utils/api';

function Logs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const res = await api.get('/campaigns/logs');
        setLogs(res.data);
      } catch {
        toast.error('Failed to load logs');
      } finally {
        setLoading(false);
      }
    };
    fetchLogs();
  }, []);

  if (loading) return <div style={{ color: 'var(--text-muted)', fontFamily: 'DM Mono' }}>Loading...</div>;

  const glass = {
    background: 'rgba(255,255,255,0.03)',
    backdropFilter: 'blur(20px)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: '16px',
  };

  return (
    <div>
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontFamily: 'Syne', fontSize: '26px', fontWeight: 800 }}>Reply Logs</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginTop: '4px' }}>
          {logs.length} auto-replies sent
        </p>
      </div>

      <div style={{ ...glass, overflow: 'hidden' }}>
        {logs.length === 0 ? (
          <div style={{ padding: '60px', textAlign: 'center', color: 'var(--text-dim)', fontSize: '13px' }}>
            No auto-replies sent yet. Campaigns will log here when triggered.
          </div>
        ) : (
          logs.map((log, i) => (
            <div key={log._id} style={{
              display: 'flex', alignItems: 'flex-start', gap: '16px',
              padding: '18px 24px',
              borderBottom: i < logs.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none',
            }}>
              {/* Status indicators */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', flexShrink: 0, paddingTop: '2px' }}>
                <div style={{
                  width: '7px', height: '7px', borderRadius: '50%',
                  background: log.publicReplySent ? '#10b981' : '#f87171',
                  boxShadow: log.publicReplySent ? '0 0 5px #10b981' : 'none',
                  title: 'Public reply',
                }} />
                <div style={{
                  width: '7px', height: '7px', borderRadius: '50%',
                  background: log.dmSent ? '#7c3aed' : '#f87171',
                  boxShadow: log.dmSent ? '0 0 5px #7c3aed' : 'none',
                  title: 'DM sent',
                }} />
              </div>

              {/* Content */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px', flexWrap: 'wrap' }}>
                  <span style={{ fontWeight: 500, fontSize: '13px' }}>
                    {log.commenterName || 'Unknown'}
                  </span>
                  <span style={{
                    padding: '2px 8px', borderRadius: '20px', fontSize: '10px',
                    fontFamily: 'DM Mono',
                    background: log.platform === 'instagram' ? 'rgba(225,48,108,0.1)' : 'rgba(24,119,242,0.1)',
                    color: log.platform === 'instagram' ? '#e1306c' : '#60a5fa',
                    border: `1px solid ${log.platform === 'instagram' ? 'rgba(225,48,108,0.2)' : 'rgba(24,119,242,0.2)'}`,
                  }}>
                    {log.platform?.toUpperCase()}
                  </span>
                  {log.triggeredBy && (
                    <span style={{
                      padding: '2px 8px', borderRadius: '20px', fontSize: '10px', fontFamily: 'DM Mono',
                      background: 'rgba(124,58,237,0.1)', color: '#a78bfa',
                      border: '1px solid rgba(124,58,237,0.2)',
                    }}>
                      keyword: {log.triggeredBy}
                    </span>
                  )}
                  <span style={{ fontSize: '11px', color: 'var(--text-dim)', fontFamily: 'DM Mono', marginLeft: 'auto' }}>
                    {new Date(log.createdAt).toLocaleString()}
                  </span>
                </div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' }}>
                  💬 "{log.commentText}"
                </div>
                <div style={{ fontSize: '11px', color: 'var(--text-dim)', fontFamily: 'DM Mono', display: 'flex', gap: '16px' }}>
                  <span style={{ color: log.publicReplySent ? '#10b981' : '#f87171' }}>
                    {log.publicReplySent ? '✓ Public reply sent' : '✗ Public reply failed'}
                  </span>
                  <span style={{ color: log.dmSent ? '#a78bfa' : '#f87171' }}>
                    {log.dmSent ? '✓ DM sent' : '✗ DM failed'}
                  </span>
                  {log.campaignId?.name && (
                    <span>Campaign: {log.campaignId.name}</span>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default Logs;