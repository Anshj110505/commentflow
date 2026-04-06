import React from 'react';

function Queue() {
  return (
    <div>
      <h1 style={{ fontFamily: 'Syne, sans-serif', fontSize: '26px', fontWeight: 800 }}>
        Comment Queue
      </h1>
      <p style={{ color: 'var(--text-muted)', marginTop: '8px' }}>
        Your scheduled comments appear here.
      </p>
    </div>
  );
}

export default Queue;