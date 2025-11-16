'use client';
import { useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { ExclamationCircleIcon } from '@heroicons/react/24/solid';

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
        localStorage.setItem('accessToken', res.data.data.accessToken);
        localStorage.setItem('refreshToken', res.data.data.refreshToken);
        router.push('/admin/dashboard');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-r from-blue-900 via-gray-900 to-black p-4">
      <form
        onSubmit={handleLogin}
        className="bg-gray-800 rounded-xl shadow-xl w-full max-w-sm p-8 flex flex-col"
      >
        <div className="flex justify-center mb-6">
          {/* Optional: Logo/Icon */}
          <div className="bg-blue-600 rounded-full w-12 h-12 flex items-center justify-center text-white font-bold text-xl">
            A
          </div>
        </div>

        <h2 className="text-white text-2xl font-bold mb-6 text-center">Admin Login</h2>

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
          className="w-full p-3 mb-4 rounded-lg bg-gray-700 text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full p-3 mb-4 rounded-lg bg-gray-700 text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
          required
        />

        {/* Optional: Forgot Password */}
        <div className="flex justify-end mb-4">
          <a href="#" className="text-blue-400 text-sm hover:underline">
            Forgot password?
          </a>
        </div>

        <button
          type="submit"
          className="w-full p-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition"
        >
          Login
        </button>
      </form>
    </div>
  );
}
