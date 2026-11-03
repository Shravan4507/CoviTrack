import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authService } from '../../services/auth.service';
import { FormField } from '../../components/forms/FormField';
import { Button } from '../../components/common/Button';
import { Alert } from '../../components/feedback/Alert';
import {
  isValidFullName,
  isValidEmail,
  isValidMobileNumber,
  isValidDateFormat,
  isValidIsoDate,
  isValidPassword,
  formatDdmmyyyyToIso,
} from '../../validators/regex';

export const RegisterPage: React.FC = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    mobileNumber: '',
    dateOfBirth: '',
    address: '',
    password: '',
    confirmPassword: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [successInfo, setSuccessInfo] = useState<{ patientIdNumber: string } | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear specific field error on typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required.';
    } else if (!isValidFullName(formData.fullName)) {
      newErrors.fullName = 'Full name must be 3-50 letters and spaces only.';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email address is required.';
    } else if (!isValidEmail(formData.email)) {
      newErrors.email = 'Please provide a valid email format (e.g. user@domain.com).';
    }

    if (!formData.mobileNumber.trim()) {
      newErrors.mobileNumber = 'Mobile number is required.';
    } else if (!isValidMobileNumber(formData.mobileNumber)) {
      newErrors.mobileNumber = 'Mobile number must be exactly 10 digits without special characters.';
    }

    if (!formData.dateOfBirth.trim()) {
      newErrors.dateOfBirth = 'Date of birth is required.';
    } else if (!isValidIsoDate(formData.dateOfBirth) && !isValidDateFormat(formData.dateOfBirth)) {
      newErrors.dateOfBirth = 'Date of birth must be a valid calendar date.';
    }

    if (!formData.address.trim()) {
      newErrors.address = 'Residential address is required.';
    } else if (formData.address.trim().length < 5) {
      newErrors.address = 'Address must be at least 5 characters long.';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required.';
    } else if (!isValidPassword(formData.password)) {
      newErrors.password = 'Password must be at least 8 characters long and contain letters and numbers.';
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Password confirmation does not match.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGeneralError(null);

    if (!validateForm()) {
      setGeneralError('Please resolve the errors highlighted below.');
      return;
    }

    setIsLoading(true);
    try {
      const response = await authService.register(formData);
      if (response.success && response.data) {
        setSuccessInfo({ patientIdNumber: response.data.patientIdNumber });
      } else {
        if (response.errors) {
          setErrors(response.errors);
        }
        setGeneralError(response.error || 'Registration failed. Please check your information.');
      }
    } catch (err: any) {
      if (err.errors) {
        setErrors(err.errors);
      }
      setGeneralError(err.message || 'An unexpected error occurred during registration.');
    } finally {
      setIsLoading(false);
    }
  };

  if (successInfo) {
    return (
      <div className="container" style={{ maxWidth: '520px', paddingTop: '3rem', paddingBottom: '4rem' }}>
        <div className="card" id="register-success-card" style={{ textAlign: 'center', padding: '2.5rem' }}>
          <div style={{ marginBottom: '1.5rem' }}>
            <span className="badge badge-negative" style={{ fontSize: 'var(--font-size-sm)', padding: '0.4rem 0.8rem' }}>
              REGISTRATION COMPLETE
            </span>
          </div>
          <h2 style={{ marginBottom: '1rem' }}>Patient Account Created</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
            Your account has been officially registered in the local CoviTrack database. Your permanent Patient Identification Number is:
          </p>

          <div
            style={{
              padding: '1rem',
              backgroundColor: '#000000',
              border: '1px solid var(--border-secondary)',
              borderRadius: '4px',
              fontSize: '1.25rem',
              fontWeight: 700,
              letterSpacing: '0.05em',
              marginBottom: '2rem',
            }}
            id="display-patient-id"
          >
            {successInfo.patientIdNumber}
          </div>

          <Link to="/login" className="btn btn-primary" id="btn-goto-login">
            Proceed to Sign In
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container" style={{ maxWidth: '580px', paddingTop: '2.5rem', paddingBottom: '4rem' }}>
      <div className="card" id="register-card">
        <div style={{ marginBottom: '1.5rem', textAlign: 'center' }}>
          <h1 style={{ fontSize: '1.75rem', marginBottom: '0.5rem' }}>Patient Registration</h1>
          <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)' }}>
            Register to schedule appointments and view COVID-19 diagnostic records
          </p>
        </div>

        {generalError && (
          <Alert type="error" id="register-error-alert">
            {generalError}
          </Alert>
        )}

        <form onSubmit={handleSubmit} noValidate id="form-register">
          <FormField
            label="Full Legal Name"
            required
            error={errors.fullName}
            helpText="3 to 50 characters, letters and spaces only"
            id="group-register-fullname"
          >
            <input
              type="text"
              id="input-register-fullname"
              name="fullName"
              className={`form-input ${errors.fullName ? 'is-invalid' : ''}`}
              placeholder="e.g. John Doe"
              value={formData.fullName}
              onChange={handleChange}
              disabled={isLoading}
            />
          </FormField>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <FormField
              label="Email Address"
              required
              error={errors.email}
              id="group-register-email"
            >
              <input
                type="email"
                id="input-register-email"
                name="email"
                className={`form-input ${errors.email ? 'is-invalid' : ''}`}
                placeholder="e.g. user@domain.com"
                value={formData.email}
                onChange={handleChange}
                disabled={isLoading}
              />
            </FormField>

            <FormField
              label="Mobile Number"
              required
              error={errors.mobileNumber}
              helpText="Exactly 10 numeric digits"
              id="group-register-mobile"
            >
              <input
                type="tel"
                id="input-register-mobile"
                name="mobileNumber"
                className={`form-input ${errors.mobileNumber ? 'is-invalid' : ''}`}
                placeholder="e.g. 9876543210"
                value={formData.mobileNumber}
                onChange={handleChange}
                maxLength={10}
                disabled={isLoading}
              />
            </FormField>
          </div>

          <FormField
            label="Date of Birth"
            required
            error={errors.dateOfBirth}
            helpText="Format: YYYY-MM-DD or DD-MM-YYYY (e.g. 1995-05-15)"
            id="group-register-dob"
          >
            <input
              type="text"
              id="input-register-dob"
              name="dateOfBirth"
              className={`form-input ${errors.dateOfBirth ? 'is-invalid' : ''}`}
              placeholder="YYYY-MM-DD (e.g. 1995-05-15)"
              value={formData.dateOfBirth}
              onChange={handleChange}
              disabled={isLoading}
            />
          </FormField>

          <FormField
            label="Residential Address"
            required
            error={errors.address}
            id="group-register-address"
          >
            <textarea
              id="input-register-address"
              name="address"
              className={`form-textarea ${errors.address ? 'is-invalid' : ''}`}
              placeholder="Enter complete permanent residential address"
              value={formData.address}
              onChange={handleChange}
              disabled={isLoading}
              rows={2}
            />
          </FormField>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <FormField
              label="Password"
              required
              error={errors.password}
              helpText="Min 8 chars, letters & digits"
              id="group-register-password"
            >
              <input
                type="password"
                id="input-register-password"
                name="password"
                className={`form-input ${errors.password ? 'is-invalid' : ''}`}
                placeholder="Create password"
                value={formData.password}
                onChange={handleChange}
                disabled={isLoading}
              />
            </FormField>

            <FormField
              label="Confirm Password"
              required
              error={errors.confirmPassword}
              id="group-register-confirm-password"
            >
              <input
                type="password"
                id="input-register-confirm-password"
                name="confirmPassword"
                className={`form-input ${errors.confirmPassword ? 'is-invalid' : ''}`}
                placeholder="Re-enter password"
                value={formData.confirmPassword}
                onChange={handleChange}
                disabled={isLoading}
              />
            </FormField>
          </div>

          <div style={{ marginTop: '1.5rem' }}>
            <Button
              type="submit"
              variant="primary"
              style={{ width: '100%' }}
              isLoading={isLoading}
              id="btn-register-submit"
            >
              Complete Registration
            </Button>
          </div>
        </form>

        <div style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: 'var(--font-size-sm)' }}>
          <span style={{ color: 'var(--text-secondary)' }}>Already registered? </span>
          <Link to="/login" id="link-goto-login">
            Sign in here
          </Link>
        </div>
      </div>
    </div>
  );
};

