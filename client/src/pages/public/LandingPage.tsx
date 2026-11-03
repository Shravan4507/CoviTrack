import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Shield, Clock, FileCheck, Calendar, ArrowRight } from 'lucide-react';

export const LandingPage: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="container" style={{ paddingBottom: '3rem' }}>
      {/* Hero Section */}
      <section style={{ padding: '4rem 0 3rem 0', borderBottom: '1px solid var(--border-primary)' }}>
        <div style={{ maxWidth: '800px' }}>
          <div style={{ display: 'inline-block', marginBottom: '1rem' }}>
            <span className="badge">OFFICIAL LOCAL TESTING FACILITY SYSTEM</span>
          </div>
          <h1 style={{ fontSize: '2.5rem', lineHeight: '1.2', marginBottom: '1.25rem', letterSpacing: '-0.03em' }}>
            Local COVID-19 Information & Diagnostic Testing Management
          </h1>
          <p style={{ fontSize: '1.125rem', color: 'var(--text-secondary)', marginBottom: '2rem', lineHeight: '1.6' }}>
            CoviTrack manages patient registrations, appointment scheduling, and automated diagnostic report issuance
            for local COVID-19 health centers. Built with strict role-based verification and automated QA validation.
          </p>

          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            {!user ? (
              <>
                <Link to="/register" className="btn btn-primary" id="hero-btn-register">
                  <span>Register for Testing</span>
                  <ArrowRight size={16} />
                </Link>
                <Link to="/login" className="btn btn-secondary" id="hero-btn-login">
                  <span>Existing User Sign In</span>
                </Link>
              </>
            ) : (
              <Link
                to={
                  user.role === 'patient'
                    ? '/patient/dashboard'
                    : user.role === 'staff'
                    ? '/staff/dashboard'
                    : '/admin/dashboard'
                }
                className="btn btn-primary"
                id="hero-btn-dashboard"
              >
                <span>Go to {user.role.toUpperCase()} Dashboard</span>
                <ArrowRight size={16} />
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* Operations & Capabilities Grid */}
      <section style={{ padding: '3.5rem 0' }}>
        <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem' }}>Operational Infrastructure</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.5rem' }}>
          <div className="card" style={{ marginBottom: 0 }}>
            <div style={{ marginBottom: '1rem', color: '#FFFFFF' }}>
              <Calendar size={24} />
            </div>
            <h4 style={{ marginBottom: '0.5rem' }}>Capacity-Controlled Slots</h4>
            <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)', margin: 0 }}>
              Testing centers configure time slots with strict booking caps. Real-time transaction locking prevents overbooking.
            </p>
          </div>

          <div className="card" style={{ marginBottom: 0 }}>
            <div style={{ marginBottom: '1rem', color: '#FFFFFF' }}>
              <Clock size={24} />
            </div>
            <h4 style={{ marginBottom: '0.5rem' }}>Clinical RT-PCR Workflows</h4>
            <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)', margin: 0 }}>
              Testing staff track samples through collection, confirmation, and laboratory completion with strict audit logs.
            </p>
          </div>

          <div className="card" style={{ marginBottom: 0 }}>
            <div style={{ marginBottom: '1rem', color: '#FFFFFF' }}>
              <FileCheck size={24} />
            </div>
            <h4 style={{ marginBottom: '0.5rem' }}>Automated Report Issuance</h4>
            <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)', margin: 0 }}>
              Generate tamper-resistant diagnostic reports available for immediate download as printable PDF documents.
            </p>
          </div>

          <div className="card" style={{ marginBottom: 0 }}>
            <div style={{ marginBottom: '1rem', color: '#FFFFFF' }}>
              <Shield size={24} />
            </div>
            <h4 style={{ marginBottom: '0.5rem' }}>Automated QA & Isolation</h4>
            <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)', margin: 0 }}>
              Comprehensive test suite built on Selenium WebDriver and TestNG executing continuous regression checks.
            </p>
          </div>
        </div>
      </section>

      {/* Clinical Testing Instructions Notice */}
      <section className="card" style={{ padding: '2rem' }}>
        <h3 style={{ marginBottom: '0.75rem' }}>Patient Testing Guidelines</h3>
        <ul style={{ paddingLeft: '1.25rem', color: 'var(--text-secondary)', fontSize: 'var(--font-size-sm)', lineHeight: '1.8' }}>
          <li>Ensure you bring your unique Patient ID and Booking Reference to the testing center.</li>
          <li>Testing appointments must be booked at least 1 hour in advance of the scheduled slot.</li>
          <li>Fast for at least 30 minutes prior to oral or nasopharyngeal swab sample collection.</li>
          <li>Diagnostic reports are published to your secure patient portal immediately upon laboratory verification.</li>
        </ul>
      </section>
    </div>
  );
};

