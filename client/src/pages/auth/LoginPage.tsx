import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { FormField } from '../../components/forms/FormField';
import { Button } from '../../components/common/Button';
import { Alert } from '../../components/feedback/Alert';

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.trim() || !password) {
      setError('Please provide both your email address and password.');
      return;
    }

    setIsLoading(true);
    try {
      const user = await login({ email, password });
      
      const searchParams = new URLSearchParams(location.search);
      const redirectPath = searchParams.get('redirect');

      if (redirectPath) {
        navigate(redirectPath);
      } else if (user.role === 'admin') {
        navigate('/admin/dashboard');
      } else if (user.role === 'staff') {
        navigate('/staff/dashboard');
      } else {
        navigate('/patient/dashboard');
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Please verify your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container" style={{ maxWidth: '440px', paddingTop: '3rem', paddingBottom: '4rem' }}>
      <div className="card" id="login-card">
        <div style={{ marginBottom: '1.5rem', textAlign: 'center' }}>
          <h1 style={{ fontSize: '1.75rem', marginBottom: '0.5rem' }}>Account Sign In</h1>
          <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)' }}>
            Access CoviTrack testing portal and diagnostic records
          </p>
        </div>

        {error && (
          <Alert type="error" id="login-error-alert">
            {error}
          </Alert>
        )}

        <form onSubmit={handleSubmit} noValidate id="form-login">
          <FormField label="Email Address" required id="group-login-email">
            <input
              type="email"
              id="input-login-email"
              name="email"
              className="form-input"
              placeholder="e.g. user@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
              autoComplete="email"
            />
          </FormField>

          <FormField label="Password" required id="group-login-password">
            <input
              type="password"
              id="input-login-password"
              name="password"
              className="form-input"
              placeholder="Enter your account password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
              autoComplete="current-password"
            />
          </FormField>

          <div style={{ marginTop: '1.5rem' }}>
            <Button
              type="submit"
              variant="primary"
              style={{ width: '100%' }}
              isLoading={isLoading}
              id="btn-login-submit"
            >
              Sign In to Portal
            </Button>
          </div>
        </form>

        <div style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: 'var(--font-size-sm)' }}>
          <span style={{ color: 'var(--text-secondary)' }}>Don't have a patient account? </span>
          <Link to="/register" id="link-goto-register">
            Register here
          </Link>
        </div>
      </div>
    </div>
  );
};

