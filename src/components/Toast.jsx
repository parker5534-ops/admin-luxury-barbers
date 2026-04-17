import React from 'react';
export default function Toast({ message, type }) {
  const icon = type === 'success' ? '✓' : '✕';
  const color = type === 'success' ? 'var(--green)' : 'var(--red)';
  return (
    <div className={`toast ${type}`}>
      <span style={{ color, fontWeight: 700 }}>{icon}</span>
      <span>{message}</span>
    </div>
  );
}
