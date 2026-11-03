import React from 'react';

export const Spinner: React.FC<{ label?: string }> = ({ label = 'Loading data...' }) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '3rem' }}>
      <div
        style={{
          width: '28px',
          height: '28px',
          border: '2px solid #333333',
          borderTopColor: '#FFFFFF',
          borderRadius: '50%',
          animation: 'spin 0.8s linear infinite',
        }}
      />
      <span style={{ marginTop: '12px', fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)' }}>
        {label}
      </span>
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

