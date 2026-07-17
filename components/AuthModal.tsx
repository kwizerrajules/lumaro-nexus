'use client';
import React, { useState } from 'react';
import GoogleSignInButton from './GoogleSignInButton';
import TurnstileWidget, { resetTurnstile } from './TurnstileWidget';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthSuccess: (userData: any) => void;
}

function formatAuthError(result: any, fallback: string): string {
  if (result?.message) return result.message;
  if (Array.isArray(result?.errors) && result.errors.length > 0) {
    return result.errors
      .map((e: any) => e.message)
      .filter(Boolean)
      .join('. ');
  }
  return fallback;
}

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onAuthSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const turnstileRequired = Boolean(
    process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY?.trim()
  );
  const [formData, setFormData] = useState({
    email: '',
    names: '',
    password: '',
    confirmPassword: '',
    phone: '',
    agreeToTerms: false,
  });

  const resetForm = () => {
    setFormData({
      email: '',
      names: '',
      password: '',
      confirmPassword: '',
      phone: '',
      agreeToTerms: false,
    });
    setError('');
    setTurnstileToken(null);
    resetTurnstile();
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
    if (error) setError('');
  };

  const finishAuth = (accessToken: string, refreshToken: string, user: any) => {
    if (accessToken) localStorage.setItem('userAccessToken', accessToken);
    if (refreshToken) localStorage.setItem('userRefreshToken', refreshToken);

    const normalizedUser = {
      id: user.id,
      email: user.email,
      fullName: user.names,
      names: user.names,
      phone: user.phone || '',
      country: '',
    };

    onAuthSuccess(normalizedUser);
    onClose();
    resetForm();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!isLogin) {
      if (formData.password !== formData.confirmPassword) {
        setError('Passwords do not match');
        return;
      }
      if (!formData.agreeToTerms) {
        setError('Please agree to the Terms & Conditions and Privacy Policy');
        return;
      }
      if (!formData.names.trim()) {
        setError('Full name is required');
        return;
      }
      if (!formData.phone.trim()) {
        setError('Phone number is required');
        return;
      }
      if (formData.phone.trim().length > 20) {
        setError('Phone number cannot exceed 20 characters');
        return;
      }
    }

    if (turnstileRequired && !turnstileToken) {
      setError('Please complete the human verification check.');
      return;
    }

    setIsSubmitting(true);
    try {
      const endpoint = isLogin ? '/api/auth/login/users' : '/api/auth/register/users';
      const payload = isLogin
        ? {
            email: formData.email.trim(),
            password: formData.password,
            turnstileToken: turnstileToken || undefined,
          }
        : {
            email: formData.email.trim(),
            names: formData.names.trim(),
            phone: formData.phone.trim() || undefined,
            password: formData.password,
            turnstileToken: turnstileToken || undefined,
          };

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        setError(
          formatAuthError(result, isLogin ? 'Login failed' : 'Registration failed')
        );
        setTurnstileToken(null);
        resetTurnstile();
        return;
      }

      const { accessToken, refreshToken, user } = result.data;
      finishAuth(accessToken, refreshToken, user);
    } catch (err) {
      console.error('Auth error:', err);
      setError('An error occurred. Please try again.');
      setTurnstileToken(null);
      resetTurnstile();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleCredential = async (credential: string) => {
    setError('');
    setIsSubmitting(true);
    try {
      const response = await fetch('/api/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ credential }),
      });
      const result = await response.json();
      if (response.ok && result.success) {
        const { accessToken, refreshToken, user } = result.data;
        finishAuth(accessToken, refreshToken, user);
      } else {
        setError(formatAuthError(result, 'Google sign-in failed'));
      }
    } catch (err) {
      console.error('Google auth error:', err);
      setError('An error occurred during Google sign-in. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  const inputClass =
    'w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-800 focus:border-yellow-800 transition-colors';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black bg-opacity-50" onClick={onClose} />

      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 sticky top-0 bg-white z-10">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-1">
              {isLogin ? 'Welcome Back' : 'Create Account'}
            </h2>
            <div className="h-1 w-12 bg-gray-900" />
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors rounded-lg hover:bg-gray-100"
            aria-label="Close"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-8">
          <div className="flex mb-8 bg-gray-100 rounded-lg p-1">
            <button
              type="button"
              onClick={() => {
                setIsLogin(true);
                setError('');
                setTurnstileToken(null);
              }}
              className={`flex-1 py-3 px-4 rounded-md font-semibold transition-all ${
                isLogin
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setIsLogin(false);
                setError('');
                setTurnstileToken(null);
                resetTurnstile();
              }}
              className={`flex-1 py-3 px-4 rounded-md font-semibold transition-all ${
                !isLogin
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Sign Up
            </button>
          </div>

          {error && (
            <div
              className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
              role="alert"
            >
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address *
              </label>
              <input
                type="email"
                name="email"
                autoComplete="email"
                value={formData.email}
                onChange={handleInputChange}
                required
                className={inputClass}
                placeholder="Enter your email"
              />
            </div>

            {!isLogin && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name *
                </label>
                <input
                  type="text"
                  name="names"
                  autoComplete="name"
                  value={formData.names}
                  onChange={handleInputChange}
                  required
                  className={inputClass}
                  placeholder="Enter your full name"
                />
              </div>
            )}

            {!isLogin && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone *
                </label>
                <input
                  type="tel"
                  name="phone"
                  autoComplete="tel"
                  value={formData.phone}
                  onChange={handleInputChange}
                  required
                  maxLength={20}
                  className={inputClass}
                  placeholder="e.g. 0788123456"
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password *
              </label>
              <input
                type="password"
                name="password"
                autoComplete={isLogin ? 'current-password' : 'new-password'}
                value={formData.password}
                onChange={handleInputChange}
                required
                minLength={6}
                className={inputClass}
                placeholder="Enter your password"
              />
            </div>

            {!isLogin && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Confirm Password *
                </label>
                <input
                  type="password"
                  name="confirmPassword"
                  autoComplete="new-password"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  required
                  minLength={6}
                  className={inputClass}
                  placeholder="Confirm your password"
                />
              </div>
            )}

            {!isLogin && (
              <div className="flex items-start">
                <input
                  type="checkbox"
                  name="agreeToTerms"
                  id="agreeToTerms"
                  checked={formData.agreeToTerms}
                  onChange={handleInputChange}
                  className="mt-1 w-4 h-4 text-yellow-900 border-gray-300 rounded focus:ring-yellow-800"
                />
                <label htmlFor="agreeToTerms" className="ml-3 text-sm text-gray-600">
                  I agree to the{' '}
                  <a
                    href="/terms"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-yellow-800 underline hover:text-yellow-900"
                  >
                    Terms &amp; Conditions
                  </a>{' '}
                  and{' '}
                  <a
                    href="/privacy"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-yellow-800 underline hover:text-yellow-900"
                  >
                    Privacy Policy
                  </a>
                </label>
              </div>
            )}

            <TurnstileWidget theme="light" onToken={setTurnstileToken} />

            <button
              type="submit"
              disabled={isSubmitting || (turnstileRequired && !turnstileToken)}
              className="w-full bg-yellow-900 text-white py-4 px-6 rounded-lg font-semibold hover:bg-yellow-700 transition-colors duration-300 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isSubmitting
                ? isLogin
                  ? 'Signing in...'
                  : 'Creating account...'
                : isLogin
                  ? 'Sign In'
                  : 'Create Account'}
            </button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Or continue with</span>
              </div>
            </div>

            <div className="flex justify-center">
              <GoogleSignInButton
                onCredential={handleGoogleCredential}
                onError={(message) => setError(message)}
                text={isLogin ? 'signin_with' : 'signup_with'}
              />
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AuthModal;
