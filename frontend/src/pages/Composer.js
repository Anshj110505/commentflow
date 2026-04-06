import React, { useState } from 'react';
import { aiAPI, commentsAPI } from '../utils/api';
import toast from 'react-hot-toast';

function Composer() {
  const [postContext, setPostContext] = useState('');
  const [tone, setTone] = useState('friendly');
  const [platform, setPlatform] = useState('instagram');
  const [comments, setComments] = useState([]);
  const [selectedComment, setSelectedComment] = useState(null);
  const [loading, setLoading] = useState(false);
  const [postId, setPostId] = useState('');
  const [scheduledAt, setScheduledAt] = useState('');

  const tones = ['friendly', 'witty', 'professional', 'enthusiastic', 'minimal'];

  const generateComments = async () => {
    if (!postContext.trim()) {
      toast.error('Please describe the post first');
      return;
    }
    setLoading(true);
    setComments([]);
    setSelectedComment(null);
    try {
      const res = await aiAPI.generate({ postContext, tone, platform, count: 3 });
      setComments(res.data.comments);
      toast.success('Comments generated!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Generation failed');
    } finally {
      setLoading(false);
    }
  };

  const scheduleComment = async () => {
    if (selectedComment === null) { toast.error('Select a comment first'); return; }
    if (!postId.trim()) { toast.error('Enter a Post ID'); return; }
    if (!scheduledAt) { toast.error('Select a schedule time'); return; }
    try {
      await commentsAPI.schedule({
        platform, postId,
        commentText: comments[selectedComment],
        scheduledAt, isAiGenerated: true
      });
      toast.success('Comment scheduled!');
      setPostId('');
      setScheduledAt('');
      setSelectedComment(null);
    } catch (err) {
      toast.error('Failed to schedule');
    }
  };

  const inputStyle = {
    width: '100%',
    background: 'var(--surface2)',
    border: '1px solid var(--border)',
    borderRadius: '8px',
    padding: '10px 14px',
    color: 'var(--text)',
    fontFamily: 'DM Sans',
    fontSize: '13.5px',
    outline: 'none',
    cursor: 'text'
  };

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{
          fontFamily: 'Syne, sans-serif',
          fontSize: '26px',
          fontWeight: 800
        }}>
          AI Composer
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginTop: '4px' }}>
          Generate contextual human-like comments powered by AI
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>

        {/* Left — Generator */}
        <div style={{
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: '16px',
          overflow: 'hidden'
        }}>
          <div style={{
            padding: '18px 22px',
            borderBottom: '1px solid var(--border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <div style={{ fontFamily: 'Syne, sans-serif', fontSize: '14px', fontWeight: 700 }}>
              Comment Generator
            </div>
            <span style={{
              padding: '3px 10px', borderRadius: '20px', fontSize: '11px',
              fontFamily: 'DM Mono', background: 'rgba(124,58,237,0.12)',
              color: '#a78bfa', border: '1px solid rgba(124,58,237,0.2)'
            }}>
              ✦ AI Powered
            </span>
          </div>

          <div style={{
            padding: '20px 22px',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px'
          }}>

            {/* Post Context */}
            <div>
              <label style={{
                display: 'block', fontSize: '11px',
                color: 'var(--text-muted)', textTransform: 'uppercase',
                letterSpacing: '1px', fontFamily: 'DM Mono', marginBottom: '6px'
              }}>
                Post Context
              </label>
              <textarea
                value={postContext}
                onChange={(e) => setPostContext(e.target.value)}
                placeholder="Describe the post... e.g. 'Fashion brand posting summer collection of floral dresses'"
                style={{
                  ...inputStyle,
                  minHeight: '90px',
                  resize: 'vertical',
                  lineHeight: '1.5'
                }}
              />
            </div>

            {/* Tone */}
            <div>
              <label style={{
                display: 'block', fontSize: '11px',
                color: 'var(--text-muted)', textTransform: 'uppercase',
                letterSpacing: '1px', fontFamily: 'DM Mono', marginBottom: '8px'
              }}>
                Tone
              </label>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {tones.map(t => (
                  <button
                    key={t}
                    onClick={() => setTone(t)}
                    style={{
                      padding: '5px 12px', borderRadius: '20px',
                      fontSize: '11.5px', cursor: 'pointer',
                      fontFamily: 'DM Mono',
                      border: `1px solid ${tone === t ? 'var(--accent-ai)' : 'var(--border)'}`,
                      background: tone === t ? 'rgba(124,58,237,0.08)' : 'transparent',
                      color: tone === t ? '#a78bfa' : 'var(--text-muted)'
                    }}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            {/* Platform */}
            <div>
              <label style={{
                display: 'block', fontSize: '11px',
                color: 'var(--text-muted)', textTransform: 'uppercase',
                letterSpacing: '1px', fontFamily: 'DM Mono', marginBottom: '8px'
              }}>
                Platform
              </label>
              <div style={{ display: 'flex', gap: '8px' }}>
                {['instagram', 'facebook'].map(p => (
                  <button
                    key={p}
                    onClick={() => setPlatform(p)}
                    style={{
                      padding: '6px 16px', borderRadius: '8px',
                      fontSize: '12px', cursor: 'pointer',
                      fontFamily: 'DM Mono', textTransform: 'uppercase',
                      border: `1px solid ${platform === p
                        ? (p === 'instagram' ? 'var(--accent-ig)' : 'var(--accent-fb)')
                        : 'var(--border)'}`,
                      background: platform === p
                        ? (p === 'instagram'
                          ? 'rgba(225,48,108,0.08)'
                          : 'rgba(24,119,242,0.08)')
                        : 'transparent',
                      color: platform === p
                        ? (p === 'instagram' ? 'var(--accent-ig)' : '#60a5fa')
                        : 'var(--text-muted)'
                    }}
                  >
                    {p === 'instagram' ? 'IG' : 'FB'}
                  </button>
                ))}
              </div>
            </div>

            {/* Generate Button */}
            <button
              onClick={generateComments}
              disabled={loading}
              style={{
                width: '100%', padding: '12px',
                background: loading ? 'var(--surface2)' : 'var(--accent-ai)',
                border: 'none', borderRadius: '8px',
                color: '#fff', fontFamily: 'DM Sans',
                fontSize: '14px', fontWeight: 500,
                cursor: loading ? 'not-allowed' : 'pointer'
              }}
            >
              {loading ? '⏳ Generating...' : '✦ Generate Comments'}
            </button>

            {/* Generated Comments */}
            {comments.length > 0 && (
              <div style={{
                background: 'var(--surface2)',
                border: '1px solid rgba(124,58,237,0.2)',
                borderRadius: '10px',
                padding: '14px',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px'
              }}>
                {comments.map((c, i) => (
                  <div
                    key={i}
                    onClick={() => setSelectedComment(i)}
                    style={{
                      display: 'flex', alignItems: 'flex-start', gap: '10px',
                      padding: '8px 10px', borderRadius: '8px',
                      cursor: 'pointer',
                      border: `1px solid ${selectedComment === i
                        ? 'rgba(124,58,237,0.4)' : 'transparent'}`,
                      background: selectedComment === i
                        ? 'rgba(124,58,237,0.08)' : 'rgba(255,255,255,0.02)'
                    }}
                  >
                    <div style={{
                      fontFamily: 'DM Mono', fontSize: '11px',
                      color: 'var(--text-dim)', paddingTop: '1px', flexShrink: 0
                    }}>
                      0{i + 1}
                    </div>
                    <div style={{ fontSize: '13px', lineHeight: 1.5, flex: 1 }}>
                      {c}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right — Schedule */}
        <div style={{
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: '16px',
          overflow: 'hidden'
        }}>
          <div style={{
            padding: '18px 22px',
            borderBottom: '1px solid var(--border)'
          }}>
            <div style={{
              fontFamily: 'Syne, sans-serif',
              fontSize: '14px',
              fontWeight: 700
            }}>
              Schedule Selected Comment
            </div>
          </div>

          <div style={{
            padding: '20px 22px',
            display: 'flex',
            flexDirection: 'column',
            gap: '14px'
          }}>
            {selectedComment !== null ? (
              <>
                {/* Selected comment preview */}
                <div style={{
                  background: 'var(--surface2)',
                  border: '1px solid var(--border)',
                  borderRadius: '8px', padding: '12px',
                  fontSize: '13px', color: 'var(--text)',
                  lineHeight: 1.5, fontStyle: 'italic'
                }}>
                  "{comments[selectedComment]}"
                </div>

                {/* Post ID */}
                <div>
                  <label style={{
                    display: 'block', fontSize: '11px',
                    color: 'var(--text-muted)', textTransform: 'uppercase',
                    letterSpacing: '1px', fontFamily: 'DM Mono', marginBottom: '6px'
                  }}>
                    Post ID or URL
                  </label>
                  <input
                    value={postId}
                    onChange={(e) => setPostId(e.target.value)}
                    placeholder="17854360229135492"
                    style={inputStyle}
                  />
                </div>

                {/* Schedule Time */}
                <div>
                  <label style={{
                    display: 'block', fontSize: '11px',
                    color: 'var(--text-muted)', textTransform: 'uppercase',
                    letterSpacing: '1px', fontFamily: 'DM Mono', marginBottom: '6px'
                  }}>
                    Schedule Time
                  </label>
                  <input
                    type="datetime-local"
                    value={scheduledAt}
                    onChange={(e) => setScheduledAt(e.target.value)}
                    style={{ ...inputStyle, colorScheme: 'dark' }}
                  />
                </div>

                {/* Schedule Button */}
                <button
                  onClick={scheduleComment}
                  style={{
                    width: '100%', padding: '12px',
                    background: 'var(--accent-ai)',
                    border: 'none', borderRadius: '8px',
                    color: '#fff', fontFamily: 'DM Sans',
                    fontSize: '14px', fontWeight: 500,
                    cursor: 'pointer'
                  }}
                >
                  Schedule Comment →
                </button>
              </>
            ) : (
              <div style={{
                textAlign: 'center', padding: '40px 0',
                color: 'var(--text-dim)', fontSize: '13px'
              }}>
                Generate and select a comment<br />
                to schedule it here
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Composer;