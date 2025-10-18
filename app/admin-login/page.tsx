'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../hooks/use-toast';
import { useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import Image from 'next/image';

export default function AdminLogin() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const { adminLogin, isLoading, error } = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);

  
  useEffect(() => {
    if (isAuthenticated && user?.role === 'admin') {
      router.replace('/dashboard/admin/');
    }
  }, [isAuthenticated, user, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await adminLogin(username, password);
      toast({
        title: 'Login successful',
        description: 'Welcome to the admin dashboard',
      });
    } catch (error: any) {
      toast({
        title: 'Login failed',
        description: error.message || 'Invalid credentials',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#FFFBEA] via-[#FFF9E6] to-[#FFF6D5] px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-md p-8 border border-gray-100">
        {/* Logo + Title */}
        <div className="flex flex-col items-center mb-6">
          <h1 className="text-2xl font-semibold text-gray-800">Admin Login</h1>
          <p className="text-sm text-gray-500 mt-1">
            Access the Tuitionstime dashboard
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label
              htmlFor="username"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Username
            </label>
            <input
              id="username"
              type="text"
              required
              placeholder="Enter your username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-gray-800 placeholder-gray-400 focus:border-[#FFD54F] focus:ring-2 focus:ring-[#FFD54F] focus:outline-none transition-base"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              required
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-gray-800 placeholder-gray-400 focus:border-[#FFD54F] focus:ring-2 focus:ring-[#FFD54F] focus:outline-none transition-base"
            />
          </div>

          {error && (
            <div className="text-red-500 text-sm text-center">{error}</div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-2.5 rounded-lg bg-[#FFD54F] text-gray-900 font-semibold text-sm hover:bg-[#FFCA28] focus:ring-2 focus:ring-offset-2 focus:ring-[#FFD54F] transition-base disabled:opacity-70 shadow-sm"
          >
            {isLoading ? 'Logging in...' : 'Sign In'}
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-gray-400">
          © {new Date().getFullYear()} Tuitionstime Admin
        </p>
      </div>
    </div>
  );
}
