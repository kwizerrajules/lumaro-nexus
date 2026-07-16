'use client';
import { useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { ExclamationCircleIcon } from '@heroicons/react/24/solid';
import GoogleSignInButton from '@/components/GoogleSignInButton';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await axios.post('/api/auth/login', { email, password });
      if (res.data.success) {
        const { accessToken, refreshToken } = res.data.data;
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', refreshToken);
        document.cookie = `adminAccessToken=${accessToken}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax`;
        router.push('/admin/dashboard');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed');
    }
  };

  const handleGoogleCredential = async (credential: string) => {
    setError('');
    try {
      const res = await axios.post('/api/auth/google/admin', { credential });
      if (res.data.success) {
        const { accessToken, refreshToken } = res.data.data;
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', refreshToken);
        document.cookie = `adminAccessToken=${accessToken}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax`;
        router.push('/admin/dashboard');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Google sign-in failed');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-r from-blue-900 via-gray-900 to-black p-4">
      <form
        onSubmit={handleLogin}
        className="bg-gray-800 rounded-xl shadow-xl w-full max-w-sm p-8 flex flex-col"
      >
        

        <h2 className="text-white text-2xl font-bold mb-6 text-center">Admin Panel</h2>

        {error && (
          <div className="flex items-center bg-red-800 text-red-100 text-sm p-2 rounded mb-4 animate-fadeIn">
            <ExclamationCircleIcon className="w-5 h-5 mr-2" />
            <span>{error}</span>
          </div>
        )}

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full p-3 mb-4 rounded-lg bg-gray-700 text-white placeholder-gray-400 focus:ring-2 focus:ring-amber-500 focus:outline-none transition"
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full p-3 mb-4 rounded-lg bg-gray-700 text-white placeholder-gray-400 focus:ring-2 focus:ring-amber-500 focus:outline-none transition"
          required
        />

        <button
          type="submit"
          className="w-full p-3 bg-amber-700 text-white font-bold rounded-lg hover:bg-amber-600 transition"
        >
          Login
        </button>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-600"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-gray-800 text-gray-400">Or continue with</span>
          </div>
        </div>

        <div className="flex justify-center">
          <GoogleSignInButton
            onCredential={handleGoogleCredential}
            onError={(message) => setError(message)}
            text="signin_with"
          />
        </div>
      </form>
    </div>
  );
}
