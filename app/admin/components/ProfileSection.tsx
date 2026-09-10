'use client';

import React, { useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';
import {
  User,
  Mail,
  Phone,
  Lock,
  Key,
  Shield,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  Save,
  LogOut,
  Image as ImageIcon,
} from 'lucide-react';
import API from '../../../utils/api';

interface DecodedToken {
  id: string;
  names: string;
  email: string;
  role: string;
  permissions?: string[];
  iat: number;
  exp: number;
}

interface StaffData {
  id: string;
  names: string;
  email: string;
  phone?: string;
  role: string;
  permissions: string[];
  avatarUrl?: string;
  status?: string;
}

interface Props {
  onProfileUpdate?: (names: string) => void;
}

export default function ProfileSection({ onProfileUpdate }: Props) {
  const [profile, setProfile] = useState<StaffData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'permissions'>('profile');

  // Profile Edit Form State
  const [names, setNames] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState<string | null>(null);
  const [profileError, setProfileError] = useState<string | null>(null);

  // Change Password Form State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  // Load initial profile from API (with JWT fallback)
  useEffect(() => {
    const fetchProfile = async () => {
      const accessToken = localStorage.getItem('accessToken');
      if (!accessToken) {
        setProfileError('No session token found. Please log in.');
        setLoading(false);
        return;
      }

      // Populate immediately from JWT for instant UI rendering
      try {
        const decoded = jwtDecode<DecodedToken>(accessToken);
        setNames(decoded.names || '');
        setEmail(decoded.email || '');
        setProfile({
          id: decoded.id || '',
          names: decoded.names || '',
          email: decoded.email || '',
          role: decoded.role || 'ADMIN',
          permissions: decoded.permissions || [],
          status: 'ACTIVE',
        });
      } catch (e) {
        console.error('Failed to decode initial token:', e);
      }

      // Fetch fresh, authoritative data from MongoDB
      try {
        const res = await API.get('/admin/profile');
        if (res.data?.data) {
          const d = res.data.data;
          setProfile({
            id: d.id || '',
            names: d.names || '',
            email: d.email || '',
            phone: d.phone || '',
            role: d.role || 'ADMIN',
            permissions: d.permissions || [],
            avatarUrl: d.avatarUrl || '',
            status: d.status || 'ACTIVE',
          });
          setNames(d.names || '');
          setEmail(d.email || '');
          setPhone(d.phone || '');
          setAvatarUrl(d.avatarUrl || '');
        }
      } catch (err: any) {
        console.warn('Could not fetch remote profile details, using token state:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  // Handle Logout
  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    document.cookie = 'adminAccessToken=; path=/; max-age=0; SameSite=Lax';
    window.location.href = '/login';
  };

  // Handle Profile Update
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    setProfileSuccess(null);
    setProfileError(null);

    try {
      const payload = {
        names: names.trim(),
        email: email.trim(),
        phone: phone.trim() || undefined,
        avatarUrl: avatarUrl.trim() || undefined,
      };

      const res = await API.put('/admin/profile', payload);

      if (res.data?.success) {
        const updatedStaff = res.data.data.staff;
        setProfile((prev) => (prev ? { ...prev, ...updatedStaff } : updatedStaff));
        setProfileSuccess('Profile updated successfully.');

        // Update stored tokens if returned
        if (res.data.data.accessToken) {
          localStorage.setItem('accessToken', res.data.data.accessToken);
          document.cookie = `adminAccessToken=${res.data.data.accessToken}; path=/; SameSite=Lax`;
        }
        if (res.data.data.refreshToken) {
          localStorage.setItem('refreshToken', res.data.data.refreshToken);
        }

        // Notify parent dashboard and window
        if (onProfileUpdate) {
          onProfileUpdate(updatedStaff.names);
        }
        window.dispatchEvent(
          new CustomEvent('adminProfileUpdated', { detail: { names: updatedStaff.names } })
        );
      } else {
        setProfileError(res.data?.message || 'Failed to update profile.');
      }
    } catch (err: any) {
      const issues = err?.response?.data?.errors;
      if (Array.isArray(issues) && issues[0]?.message) {
        setProfileError(issues.map((i: any) => i.message).join(' · '));
      } else {
        setProfileError(err?.response?.data?.message || 'Failed to update profile.');
      }
    } finally {
      setSavingProfile(false);
    }
  };

  // Handle Password Change
  const handleSavePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingPassword(true);
    setPasswordSuccess(null);
    setPasswordError(null);

    if (newPassword.length < 8) {
      setPasswordError('New password must be at least 8 characters long.');
      setSavingPassword(false);
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError('New password and confirm password do not match.');
      setSavingPassword(false);
      return;
    }

    try {
      const res = await API.post('/admin/profile/change-password', {
        currentPassword,
        newPassword,
        confirmPassword,
      });

      if (res.data?.success) {
        setPasswordSuccess('Password changed successfully.');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        setPasswordError(res.data?.message || 'Failed to change password.');
      }
    } catch (err: any) {
      const issues = err?.response?.data?.errors;
      if (Array.isArray(issues) && issues[0]?.message) {
        setPasswordError(issues.map((i: any) => i.message).join(' · '));
      } else {
        setPasswordError(err?.response?.data?.message || 'Failed to change password.');
      }
    } finally {
      setSavingPassword(false);
    }
  };

  const getInitials = (fullName: string) => {
    const parts = fullName.trim().split(' ').filter(Boolean);
    if (parts.length === 0) return 'A';
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  if (loading && !profile) {
    return (
      <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-100 animate-pulse max-w-4xl">
        <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
        <div className="h-32 bg-gray-100 rounded-lg mb-6"></div>
        <div className="h-64 bg-gray-100 rounded-lg"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl space-y-6">
      {/* Header Card with User Summary */}
      <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          {profile?.avatarUrl ? (
            <img
              src={profile.avatarUrl}
              alt={profile.names}
              className="w-16 h-16 rounded-full object-cover border-2 border-blue-500 shadow-sm"
            />
          ) : (
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-600 to-indigo-700 text-white flex items-center justify-center text-xl font-bold shadow-md">
              {getInitials(profile?.names || 'Admin')}
            </div>
          )}
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-2xl font-bold text-gray-900">{profile?.names || 'Admin User'}</h2>
              <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-blue-100 text-blue-800 border border-blue-200">
                {profile?.role || 'ADMIN'}
              </span>
            </div>
            <p className="text-gray-500 text-sm mt-0.5 flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-gray-400" />
              {profile?.email}
            </p>
            {profile?.phone && (
              <p className="text-gray-500 text-xs mt-0.5 flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-gray-400" />
                {profile.phone}
              </p>
            )}
          </div>
        </div>

        <button
          type="button"
          onClick={handleLogout}
          className="inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors border border-red-200 self-start md:self-auto"
        >
          <LogOut className="w-4 h-4" />
          Log Out
        </button>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-gray-200 bg-white px-6 rounded-t-xl shadow-sm">
        <button
          type="button"
          onClick={() => setActiveTab('profile')}
          className={`flex items-center gap-2 py-4 px-3 border-b-2 font-medium text-sm transition-colors ${
            activeTab === 'profile'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <User className="w-4 h-4" />
          Edit Profile
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('security')}
          className={`flex items-center gap-2 py-4 px-3 border-b-2 font-medium text-sm transition-colors ${
            activeTab === 'security'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <Key className="w-4 h-4" />
          Change Password
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('permissions')}
          className={`flex items-center gap-2 py-4 px-3 border-b-2 font-medium text-sm transition-colors ${
            activeTab === 'permissions'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <Shield className="w-4 h-4" />
          Role & Permissions
        </button>
      </div>

      {/* Tab 1: Edit Profile */}
      {activeTab === 'profile' && (
        <div className="bg-white rounded-b-xl shadow-md border border-gray-100 p-6">
          <div className="mb-5">
            <h3 className="text-lg font-bold text-gray-800">Profile Information</h3>
            <p className="text-gray-500 text-sm">
              Update your account display name, email, phone number, and avatar.
            </p>
          </div>

          {profileSuccess && (
            <div className="mb-4 p-3.5 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-green-600" />
              <span>{profileSuccess}</span>
            </div>
          )}

          {profileError && (
            <div className="mb-4 p-3.5 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
              <span>{profileError}</span>
            </div>
          )}

          <form onSubmit={handleSaveProfile} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    value={names}
                    onChange={(e) => setNames(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                    placeholder="e.g. John Doe"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                    placeholder="admin@lumaronexus.com"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number <span className="text-gray-400 font-normal">(optional)</span>
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                    placeholder="+250 787 000 000"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Avatar Image URL <span className="text-gray-400 font-normal">(optional)</span>
                </label>
                <div className="relative">
                  <ImageIcon className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                  <input
                    type="url"
                    value={avatarUrl}
                    onChange={(e) => setAvatarUrl(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                    placeholder="https://..."
                  />
                </div>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={savingProfile}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-lg font-semibold text-sm hover:bg-blue-700 transition-colors disabled:opacity-60 shadow-sm"
              >
                <Save className="w-4 h-4" />
                {savingProfile ? 'Saving Changes…' : 'Save Profile Changes'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Tab 2: Change Password */}
      {activeTab === 'security' && (
        <div className="bg-white rounded-b-xl shadow-md border border-gray-100 p-6">
          <div className="mb-5">
            <h3 className="text-lg font-bold text-gray-800">Change Password</h3>
            <p className="text-gray-500 text-sm">
              Keep your admin account safe by using a strong password of at least 8 characters.
            </p>
          </div>

          {passwordSuccess && (
            <div className="mb-4 p-3.5 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-green-600" />
              <span>{passwordSuccess}</span>
            </div>
          )}

          {passwordError && (
            <div className="mb-4 p-3.5 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
              <span>{passwordError}</span>
            </div>
          )}

          <form onSubmit={handleSavePassword} className="space-y-4 max-w-lg">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Current Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                <input
                  type={showCurrentPassword ? 'text' : 'password'}
                  required
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full pl-9 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                  placeholder="Enter current password"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword((prev) => !prev)}
                  className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
                >
                  {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                New Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Key className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                <input
                  type={showNewPassword ? 'text' : 'password'}
                  required
                  minLength={8}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full pl-9 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                  placeholder="At least 8 characters"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword((prev) => !prev)}
                  className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
                >
                  {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <p className="mt-1 text-xs text-gray-500">Must be at least 8 characters long.</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Confirm New Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Key className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  required
                  minLength={8}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full pl-9 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                  placeholder="Re-enter new password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword((prev) => !prev)}
                  className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {confirmPassword && newPassword !== confirmPassword && (
                <p className="mt-1 text-xs text-red-500">Passwords do not match.</p>
              )}
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={savingPassword}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-lg font-semibold text-sm hover:bg-blue-700 transition-colors disabled:opacity-60 shadow-sm"
              >
                <Save className="w-4 h-4" />
                {savingPassword ? 'Updating Password…' : 'Update Password'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Tab 3: Role & Permissions */}
      {activeTab === 'permissions' && (
        <div className="bg-white rounded-b-xl shadow-md border border-gray-100 p-6 space-y-6">
          <div>
            <h3 className="text-lg font-bold text-gray-800">Role & Access Control</h3>
            <p className="text-gray-500 text-sm">
              Your system role and granular permissions defined for this administration account.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-lg bg-gray-50 border border-gray-200">
              <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                Assigned Role
              </span>
              <div className="mt-1 flex items-center gap-2">
                <span className="px-2.5 py-1 text-sm font-bold rounded-md bg-blue-100 text-blue-800">
                  {profile?.role || 'ADMIN'}
                </span>
              </div>
            </div>

            <div className="p-4 rounded-lg bg-gray-50 border border-gray-200">
              <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                Account Status
              </span>
              <div className="mt-1 flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-sm font-semibold rounded-md bg-green-100 text-green-800">
                  <span className="w-2 h-2 rounded-full bg-green-500"></span>
                  {profile?.status || 'ACTIVE'}
                </span>
              </div>
            </div>

            <div className="p-4 rounded-lg bg-gray-50 border border-gray-200">
              <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                Staff ID
              </span>
              <p className="mt-1 text-sm font-mono text-gray-700 truncate" title={profile?.id}>
                {profile?.id || '—'}
              </p>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-gray-700 mb-2">Granted Permissions</h4>
            <div className="flex flex-wrap gap-2">
              {profile?.permissions && profile.permissions.length > 0 ? (
                profile.permissions.map((p) => (
                  <span
                    key={p}
                    className="inline-flex items-center gap-1 px-3 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full border border-gray-200"
                  >
                    <Shield className="w-3 h-3 text-blue-600" />
                    {p}
                  </span>
                ))
              ) : (
                <span className="text-sm italic text-gray-500">
                  Full Administrative Privileges (System Default).
                </span>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}