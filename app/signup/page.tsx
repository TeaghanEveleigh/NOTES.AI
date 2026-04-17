'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Eye, EyeOff, Mail, Lock, UserPlus, ArrowRight, Sparkles, Check, X } from 'lucide-react';

interface ValidationError {
  field: string;
  message: string;
}

export default function Signup() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  // Password strength indicators
  const passwordRequirements = [
    { label: 'At least 8 characters', met: password.length >= 8 },
    { label: 'Contains a number', met: /\d/.test(password) },
    { label: 'Contains a letter', met: /[a-zA-Z]/.test(password) },
    { label: 'Contains special character', met: /[!@#$%^&*(),.?":{}|<>]/.test(password) },
  ];

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateForm = (): ValidationError[] => {
    const errors: ValidationError[] = [];

    if (!email.trim()) {
      errors.push({ field: 'email', message: 'Email address is required' });
    } else if (!validateEmail(email)) {
      errors.push({ field: 'email', message: 'Please enter a valid email address' });
    }

    if (!password) {
      errors.push({ field: 'password', message: 'Password is required' });
    } else if (password.length < 8) {
      errors.push({ field: 'password', message: 'Password must be at least 8 characters' });
    }

    return errors;
  };

  const getErrorMessage = (status: number, serverMessage?: string): string => {
    switch (status) {
      case 409:
        return 'An account with this email already exists. Try signing in instead.';
      case 400:
        if (serverMessage?.includes('password')) {
          return 'Your password doesn\'t meet the requirements. Please choose a stronger password.';
        }
        return serverMessage || 'Please check your information and try again.';
      case 429:
        return 'Too many signup attempts. Please wait a moment and try again.';
      case 500:
        return 'Something went wrong on our end. Please try again later.';
      default:
        return serverMessage || 'An unexpected error occurred. Please try again.';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setFieldErrors({});

    // Client-side validation
    const validationErrors = validateForm();
    if (validationErrors.length > 0) {
      const errorMap: Record<string, string> = {};
      validationErrors.forEach((err) => {
        errorMap[err.field] = err.message;
      });
      setFieldErrors(errorMap);
      setIsLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password }),
      });

      const data = await res.json();

      if (!res.ok) {
        const errorMessage = getErrorMessage(res.status, data.error);
        setError(errorMessage);

        // Set field-specific errors
        if (res.status === 409) {
          setFieldErrors({ email: 'This email is already registered' });
        }
      } else {
        // Success - redirect to login with success message
        router.push('/login?registered=true');
      }
    } catch (err) {
      setError('Unable to connect to the server. Please check your internet connection.');
    } finally {
      setIsLoading(false);
    }
  };

  const getErrorIcon = () => (
    <svg className="error-icon" viewBox="0 0 20 20" fill="currentColor">
      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
    </svg>
  );

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-card">
          {/* Header */}
          <div className="auth-header">
            <div className="auth-logo">
              <UserPlus className="auth-logo-icon" />
            </div>
            <h1 className="auth-title">Create account</h1>
            <p className="auth-subtitle">Join Notes.ai and start organizing your thoughts</p>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="auth-error" role="alert">
              {getErrorIcon()}
              <span className="auth-error-text">{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="auth-form">
            {/* Email Field */}
            <div className={`auth-field ${focusedField === 'email' ? 'focused' : ''} ${email ? 'filled' : ''} ${fieldErrors.email ? 'error' : ''}`}>
              <label htmlFor="email" className="auth-label">
                Email address
              </label>
              <div className="auth-input-wrapper">
                <Mail className="auth-input-icon" />
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (fieldErrors.email) {
                      setFieldErrors({ ...fieldErrors, email: '' });
                    }
                  }}
                  onFocus={() => setFocusedField('email')}
                  onBlur={() => setFocusedField(null)}
                  className="auth-input"
                  placeholder="you@example.com"
                  autoComplete="email"
                  disabled={isLoading}
                />
              </div>
              {fieldErrors.email && (
                <span className="auth-field-error">{fieldErrors.email}</span>
              )}
            </div>

            {/* Password Field */}
            <div className={`auth-field ${focusedField === 'password' ? 'focused' : ''} ${password ? 'filled' : ''} ${fieldErrors.password ? 'error' : ''}`}>
              <label htmlFor="password" className="auth-label">
                Password
              </label>
              <div className="auth-input-wrapper">
                <Lock className="auth-input-icon" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  name="password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (fieldErrors.password) {
                      setFieldErrors({ ...fieldErrors, password: '' });
                    }
                  }}
                  onFocus={() => setFocusedField('password')}
                  onBlur={() => setFocusedField(null)}
                  className="auth-input auth-input-with-toggle"
                  placeholder="Create a strong password"
                  autoComplete="new-password"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  className="auth-password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex={-1}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="auth-toggle-icon" /> : <Eye className="auth-toggle-icon" />}
                </button>
              </div>
              {fieldErrors.password && (
                <span className="auth-field-error">{fieldErrors.password}</span>
              )}
            </div>

            {/* Password Requirements */}
            {password && (
              <div className="auth-password-requirements">
                <p className="auth-requirements-title">Password requirements:</p>
                <ul className="auth-requirements-list">
                  {passwordRequirements.map((req, index) => (
                    <li
                      key={index}
                      className={`auth-requirement ${req.met ? 'met' : ''}`}
                    >
                      {req.met ? (
                        <Check className="auth-requirement-icon" />
                      ) : (
                        <X className="auth-requirement-icon" />
                      )}
                      <span>{req.label}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              className={`auth-button ${isLoading ? 'loading' : ''}`}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <span className="auth-spinner"></span>
                  <span>Creating account...</span>
                </>
              ) : (
                <>
                  <span>Create account</span>
                  <ArrowRight className="auth-button-icon" />
                </>
              )}
            </button>
          </form>

          {/* Footer */}
          <div className="auth-footer">
            <p className="auth-footer-text">
              Already have an account?{' '}
              <Link href="/login" className="auth-link">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
