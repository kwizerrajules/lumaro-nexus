"use client";
import React, { useState, useRef, useEffect } from 'react';
import Header from '@/components/Header';
import HouseProjectCard from '@/components/HouseProjectCard';
import Sidebar from '@/components/Sidebar'; // Fixed the typo - added 'r'
import Newsletter from '@/components/Newsletter';

import axios from "axios";

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
  const [token, setToken] = useState("");

  useEffect(()=>{
    const token = localStorage.getItem("userAccessToken")
    if(token){
      setToken(token);
      fetchPlans(token)
    }
  }, [])

  // FETCH USER PLANS
  const fetchPlans = async (accesToken) => {
    try {
      const res = await axios.get("/api/custom-plan", {
        headers: { Authorization: `Bearer ${accesToken}` },
      });

      // Filter invalid entries (you already have some invalid IDs in DB)
      const cleaned = res.data.filter((p: CustomPlan) => p.id && p.id !== "");

      setPlans(cleaned);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };


  // DELETE PLAN
  const deletePlan = async (id: string) => {
    if (!confirm("Are you sure you want to delete this plan?")) return;

    try {
      const token = localStorage.getItem("userAccessToken");

      await axios.delete(`/api/custom-plan/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setPlans(plans.filter((p) => p.id !== id));
    } catch (err: any) {
      alert("Delete failed: " + err.message);
    }
  };

  // UPDATE PLAN
  const updatePlan = async () => {
    if (!editing) return;

    try {
      const token = localStorage.getItem("userAccessToken");

      await axios.put(`/api/custom-plan/${editing.id}`, editing, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setPlans(
        plans.map((p) => (p.id === editing.id ? editing : p))
      );

      setEditing(null);
    } catch (err: any) {
      alert("Update failed: " + err.message);
    }
  };

  if (loading) return <p>Loading plans...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">My Custom Plans</h1>

      {/* TABLE */}
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

      {/* EDIT MODAL */}
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
                className="px-4 py-2 bg-amber-700 text-white rounded hover:bg-amber-600"
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
