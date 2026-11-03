import React from 'react';
import { Link } from 'react-router-dom';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="container" style={{ textAlign: 'center', padding: '6rem 1rem' }}>
      <h1 style={{ fontSize: '4rem', fontWeight: 700, marginBottom: '1rem' }}>404</h1>
      <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Page Not Found</h2>
      <p style={{ maxWidth: '460px', margin: '0 auto 2rem auto', color: 'var(--text-secondary)' }}>
        The requested resource does not exist or has been moved within the CoviTrack clinical management system.
      </p>
      <Link to="/" className="btn btn-primary" id="btn-return-home">
        Return to Home
      </Link>
    </div>
  );
};

