'use client';
import React, { useState, useRef, useEffect } from 'react';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import Newsletter from '@/components/Newsletter';
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
  const [plans, setPlans] = useState<CustomPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<CustomPlan | null>(null);
  const [error, setError] = useState("");
  const [showSidebar, setShowSidebar] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const footerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Ensure localStorage is only accessed on the client
    setToken(localStorage.getItem("userAccessToken"));
  }, []);

  // Fetch user plans
  const fetchPlans = async () => {
    try {
      const res = await axios.get("/api/custom-plan", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const cleaned = res.data.filter((p: CustomPlan) => p.id && p.id !== "");
      setPlans(cleaned);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchPlans();
    }
  }, [token]); // Re-run when token is available

  // Delete plan
  const deletePlan = async (id: string) => {
    if (!confirm("Are you sure you want to delete this plan?")) return;

    try {
      await axios.delete(`/api/custom-plan/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPlans(plans.filter((p) => p.id !== id));
    } catch (err: any) {
      alert("Delete failed: " + err.message);
    }
  };

  // Update plan
  const updatePlan = async () => {
    if (!editing) return;

    try {
      await axios.put(`/api/custom-plan/${editing.id}`, editing, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setPlans(plans.map((p) => (p.id === editing.id ? editing : p)));
      setEditing(null);
    } catch (err: any) {
      alert("Update failed: " + err.message);
    }
  };

  const scrollToContact = () => {
    footerRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleFilterChange = (newFilters: any) => {
    console.log("Filters applied:", newFilters);
    // Implement filtering logic if needed
  };

  if (loading) return <p>Loading plans...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <div className="min-h-screen bg-white">
      <Header
        onFilterToggle={() => setShowSidebar(!showSidebar)}
        onAuthSuccess={() => {}}
        onContactClick={scrollToContact}
      />

      {/* Page Hero */}
      <section className="bg-black text-white py-20">
        <div className="container mx-auto px-4 text-center max-w-3xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            My Custom Plans
          </h1>
          <p className="text-lg text-gray-300 mb-8">
            View, edit, or delete your personalized house plans
          </p>
        </div>
      </section>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              Your Plans ({plans.length})
            </h2>
            <p className="text-gray-600">Manage your house plans easily</p>
          </div>

          <button
            onClick={() => setShowSidebar(!showSidebar)}
            className="bg-gray-900 text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-800 transition-colors flex items-center space-x-2"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.207A1 1 0 013 6.5V4z"
              />
            </svg>
            <span>Filters</span>
          </button>
        </div>

        {/* Plans Table */}
        <table className="w-full border-collapse border border-gray-300">
          <thead>
            <tr className="bg-gray-100">
              <th className="border p-2">Category</th>
              <th className="border p-2">Bedrooms</th>
              <th className="border p-2">Bathrooms</th>
              <th className="border p-2">Floors</th>
              <th className="border p-2">Area (m²)</th>
              <th className="border p-2">Created</th>
              <th className="border p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {plans.map((plan) => (
              <tr key={plan.id}>
                <td className="border p-2">{plan.category}</td>
                <td className="border p-2">{plan.bedrooms}</td>
                <td className="border p-2">{plan.bathrooms}</td>
                <td className="border p-2">{plan.floors}</td>
                <td className="border p-2">{plan.total_area}</td>
                <td className="border p-2">
                  {new Date(plan.created_at).toLocaleDateString()}
                </td>
                <td className="border p-2 space-x-2">
                  <button
                    className="bg-blue-500 text-white px-3 py-1 rounded"
                    onClick={() => setEditing(plan)}
                  >
                    Edit
                  </button>
                  <button
                    className="bg-red-500 text-white px-3 py-1 rounded"
                    onClick={() => deletePlan(plan.id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Newsletter */}
      <Newsletter />

      <footer ref={footerRef} className="bg-gray-900 text-white py-16">
        {/* Footer content */}
      </footer>

      {/* Sidebar */}
      {showSidebar && (
        <div className="fixed right-0 top-0 h-full z-50">
          <Sidebar onFilterChange={handleFilterChange} onClose={() => setShowSidebar(false)} />
        </div>
      )}

      {/* Edit Modal */}
      {editing && (
        <div className="fixed inset-0 bg-black/40 flex justify-center items-center">
          <div className="bg-white p-6 rounded shadow-lg w-96">
            <h2 className="text-xl font-bold mb-4">Edit Plan</h2>
            <label className="block mb-2">Category</label>
            <input
              type="text"
              value={editing.category}
              className="border p-2 w-full mb-3"
              onChange={(e) =>
                setEditing({ ...editing, category: e.target.value })
              }
            />
            <label className="block mb-2">Description</label>
            <textarea
              className="border p-2 w-full mb-3"
              value={editing.description}
              onChange={(e) =>
                setEditing({ ...editing, description: e.target.value })
              }
            />
            <div className="flex justify-end gap-3">
              <button
                className="px-4 py-2 bg-gray-400 text-white rounded"
                onClick={() => setEditing(null)}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-green-600 text-white rounded"
                onClick={updatePlan}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
