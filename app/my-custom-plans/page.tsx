'use client';
import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Newsletter from '@/components/Newsletter';
import AuthModal from '@/components/AuthModal';
import axios from 'axios';

interface CustomPlan {
  id: string;
  user_id: string;
  bedrooms: number;
  bathrooms: number;
  dining_rooms: number;
  kitchen: number;
  floors: number;
  total_area: string;
  category: string;
  description: string;
  created_at: string;
  updated_at: string;
}

export default function MyCustomPlans() {
  const router = useRouter();
  const [plans, setPlans] = useState<CustomPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<CustomPlan | null>(null);
  const [error, setError] = useState('');
  const [token, setToken] = useState<string | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const footerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const stored = localStorage.getItem('userAccessToken');
    setToken(stored);
    if (!stored) {
      setLoading(false);
      setShowAuthModal(true);
    }
  }, []);

  const fetchPlans = async (accessToken: string) => {
    try {
      setLoading(true);
      const res = await axios.get('/api/custom-plan', {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const cleaned = (res.data || [])
        .map((p: any) => ({
          ...p,
          id: p.id || p._id || '',
          user_id: p.user_id || p.userId || '',
          created_at: p.created_at || p.createdAt || '',
          updated_at: p.updated_at || p.updatedAt || '',
        }))
        .filter((p: CustomPlan) => p.id && p.id !== '');
      setPlans(cleaned);
      setError('');
    } catch (err: any) {
      if (err?.response?.status === 401 || err?.response?.status === 403) {
        localStorage.removeItem('userAccessToken');
        setToken(null);
        setShowAuthModal(true);
        setError('Please sign in to view your custom plans.');
      } else {
        setError(err.message || 'Failed to load plans.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchPlans(token);
  }, [token]);

  const deletePlan = async (id: string) => {
    if (!confirm('Are you sure you want to delete this plan?')) return;

    try {
      await axios.delete(`/api/custom-plan/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPlans(plans.filter((p) => p.id !== id));
    } catch (err: any) {
      alert('Delete failed: ' + err.message);
    }
  };

  const updatePlan = async () => {
    if (!editing) return;

    try {
      await axios.put(`/api/custom-plan/${editing.id}`, editing, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPlans(plans.map((p) => (p.id === editing.id ? editing : p)));
      setEditing(null);
    } catch (err: any) {
      alert('Update failed: ' + err.message);
    }
  };

  const scrollToContact = () => {
    footerRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleAuthSuccess = () => {
    const stored = localStorage.getItem('userAccessToken');
    setShowAuthModal(false);
    setToken(stored);
  };

  return (
    <div className="min-h-screen bg-white">
      <Header
        onFilterToggle={() => {}}
        onAuthSuccess={handleAuthSuccess}
        onContactClick={scrollToContact}
      />

      <section className="bg-black text-white py-20">
        <div className="container mx-auto px-4 text-center max-w-3xl">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">My Custom Plans</h1>
          <p className="text-lg text-gray-300 mb-8">
            View, edit, or delete your personalized house plans
          </p>
        </div>
      </section>

      <div className="container mx-auto px-4 py-8">
        {!token && !loading ? (
          <div className="text-center py-16">
            <h2 className="text-2xl font-bold text-gray-900 mb-3">Sign in required</h2>
            <p className="text-gray-600 mb-6">
              Please sign in to view and manage your custom plans.
            </p>
            <button onClick={() => setShowAuthModal(true)} className="btn-primary">
              Sign In
            </button>
          </div>
        ) : loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900" />
          </div>
        ) : error ? (
          <p className="text-center mt-10 text-red-500">{error}</p>
        ) : (
          <>
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900">
                Your Plans ({plans.length})
              </h2>
              <p className="text-gray-600">Manage your house plans easily</p>
            </div>

            {plans.length === 0 ? (
              <div className="text-center py-16">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No custom plans yet</h3>
                <p className="text-gray-600 mb-6">
                  Start by creating a custom plan tailored to your needs.
                </p>
                <a href="/custom-plan" className="btn-secondary inline-block">
                  Create Custom Plan
                </a>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {plans.map((plan) => (
                  <div
                    key={plan.id}
                    className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {plan.category || 'Custom Plan'}
                      </h3>
                      <span className="text-xs text-gray-500">
                        {new Date(plan.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                      {plan.description || 'No description'}
                    </p>
                    <div className="grid grid-cols-2 gap-3 mb-5 text-sm text-gray-700">
                      <div>
                        <span className="text-gray-500">Bedrooms</span>
                        <p className="font-semibold">{plan.bedrooms}</p>
                      </div>
                      <div>
                        <span className="text-gray-500">Bathrooms</span>
                        <p className="font-semibold">{plan.bathrooms}</p>
                      </div>
                      <div>
                        <span className="text-gray-500">Floors</span>
                        <p className="font-semibold">{plan.floors}</p>
                      </div>
                      <div>
                        <span className="text-gray-500">Area</span>
                        <p className="font-semibold">{plan.total_area} m²</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        className="flex-1 btn-secondary py-2 text-sm"
                        onClick={() => setEditing(plan)}
                      >
                        Edit
                      </button>
                      <button
                        className="flex-1 px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-semibold"
                        onClick={() => deletePlan(plan.id)}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      <Newsletter />
      <Footer ref={footerRef} />

      {editing && (
        <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50 p-4">
          <div className="bg-white p-6 rounded-xl shadow-lg w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Edit Plan</h2>
            <label className="block mb-2 text-sm font-medium text-gray-700">Category</label>
            <input
              type="text"
              value={editing.category}
              className="border border-gray-300 p-2 w-full mb-3 rounded-lg"
              onChange={(e) => setEditing({ ...editing, category: e.target.value })}
            />
            <label className="block mb-2 text-sm font-medium text-gray-700">Description</label>
            <textarea
              className="border border-gray-300 p-2 w-full mb-3 rounded-lg"
              rows={4}
              value={editing.description}
              onChange={(e) => setEditing({ ...editing, description: e.target.value })}
            />
            <div className="flex justify-end gap-3">
              <button
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg font-semibold"
                onClick={() => setEditing(null)}
              >
                Cancel
              </button>
              <button className="btn-primary px-4 py-2" onClick={updatePlan}>
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {showAuthModal && (
        <AuthModal
          isOpen={showAuthModal}
          onClose={() => {
            setShowAuthModal(false);
            if (!localStorage.getItem('userAccessToken')) {
              router.push('/');
            }
          }}
          onAuthSuccess={handleAuthSuccess}
        />
      )}
    </div>
  );
}
