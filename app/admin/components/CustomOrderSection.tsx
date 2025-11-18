'use client';
import { useEffect, useState } from 'react';
import API from '../../../utils/api';

type UserData = {
  names: string;
  email: string;
};

type CustomPlan = {
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
  user_data: UserData;
};

export default function CustomOrderSection() {
  const [plans, setPlans] = useState<CustomPlan[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<CustomPlan | null>(null);

  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  const fetchPlans = async () => {
    try {
      const res = await API.get('/admin/custom_plans');
      setPlans(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  const openReplyModal = (plan: CustomPlan) => {
    setSelectedPlan(plan);
    setSubject('');
    setMessage('');
    setModalOpen(true);
  };

  const sendReply = async () => {
    if (!selectedPlan) return;
    setSending(true);

    try {
      await API.post('/reply', {
        to: selectedPlan.user_data.email,
        messegeSubject: subject,
        replyMessage: message
      });

      setModalOpen(false);
    } catch (err) {
      console.error(err);
    } finally {
      setSending(false);
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Custom Orders</h2>

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-200">
          <thead>
            <tr className="bg-gray-100 text-left text-sm md:text-base">
              <th className="px-3 py-2 border-b">User</th>
              <th className="px-3 py-2 border-b">Email</th>
              <th className="px-3 py-2 border-b">Bedrooms</th>
              <th className="px-3 py-2 border-b">Bathrooms</th>
              <th className="px-3 py-2 border-b">Floors</th>
              <th className="px-3 py-2 border-b">Total Area</th>
              <th className="px-3 py-2 border-b">Category</th>
              <th className="px-3 py-2 border-b">Created</th>
              <th className="px-3 py-2 border-b">Options</th>
            </tr>
          </thead>

          <tbody>
            {plans.map((plan, idx) => (
              <tr key={idx} className="hover:bg-gray-50 text-sm md:text-base">
                <td className="px-3 py-2 border-b">{plan.user_data.names}</td>

                <td className="px-3 py-2 border-b">
                  <div className="flex flex-col md:flex-row md:items-center gap-2">
                    <span>{plan.user_data.email}</span>
                  </div>
                </td>

                <td className="px-3 py-2 border-b">{plan.bedrooms}</td>
                <td className="px-3 py-2 border-b">{plan.bathrooms}</td>
                <td className="px-3 py-2 border-b">{plan.floors}</td>
                <td className="px-3 py-2 border-b">{plan.total_area}</td>
                <td className="px-3 py-2 border-b">{plan.category}</td>
                <td className="px-3 py-2 border-b">
                  {new Date(plan.created_at).toLocaleString()}
                </td>

                <td className="px-3 py-2 border-b">
                  <button
                    onClick={() => openReplyModal(plan)}
                    className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 transition"
                  >
                    Reply
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {modalOpen && selectedPlan && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-lg p-6">

            <h3 className="text-xl font-bold mb-4">
              Replying to {selectedPlan.user_data.email}
            </h3>

            <div className="mb-4 p-3 bg-gray-100 rounded border text-sm">
              <h4 className="font-semibold mb-1">Request Description</h4>
              <p>{selectedPlan.description}</p>

              <h4 className="font-semibold mt-3 mb-1">Plan Details</h4>
              <p>Category: {selectedPlan.category}</p>
              <p>Area: {selectedPlan.total_area}</p>
              <p>Floors: {selectedPlan.floors}</p>
              <p>Rooms: {selectedPlan.bedrooms} beds, {selectedPlan.bathrooms} baths</p>
            </div>

            <label className="block mb-2 text-sm font-medium">Subject</label>
            <input
              className="w-full border p-2 rounded mb-4"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
            />

            <label className="block mb-2 text-sm font-medium">Message</label>
            <textarea
              className="w-full border p-2 rounded mb-4 h-32"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />

            <div className="flex justify-end gap-3">
              <button
                className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400 transition"
                onClick={() => setModalOpen(false)}
              >
                Cancel
              </button>

              <button
                disabled={sending}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
                onClick={sendReply}
              >
                {sending ? 'Sending...' : 'Send Reply'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
