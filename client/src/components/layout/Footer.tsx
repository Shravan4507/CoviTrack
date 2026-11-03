import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="app-footer">
      <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <span>&copy; {new Date().getFullYear()} CoviTrack. Local COVID-19 Information & Testing Management System.</span>
        </div>
        <div>
          <span>Academic QA Engineering & Automation Implementation | Monochromatic Strict Mode</span>
        </div>
      </div>
    </footer>
  );
};

