'use client';
import { use, useEffect, useState } from 'react';
import API from '../../../utils/api';
import axios from 'axios';
/**
 * Type definition matching the user data structure from the /api/admin/users endpoint.
 */
type UserData = {
  id: string;
  names: string;
  email: string;
  phone?: string;
};


// Mock data to simulate the API response structure
const MOCK_USERS_DATA: UserData[] = [
    {
        "id": "29b0f369-93b9-4378-bef1-39b68559f138",
        "names": "Bienvenu Gashema",
        "email": "bienvenugashema@gmail.com",
        "phone": "0736701735"
    },
    {
        "id": "e4f8c12a-4d7b-4e0f-9a1b-3c5d6e7f8a90",
        "names": "Jane Doe Smith",
        "email": "jane.doe@example.com",
        "phone": "+1-555-123-4567"
    },
    {
        "id": "a1b2c3d4-e5f6-7890-1234-567890abcdef",
        "names": "Alex Johnson",
        "email": "alex.j@company.net",
        // This user intentionally has no phone number to test conditional rendering
    },
];

export default function UsersSection() {
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedUserId, setExpandedUserId] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const storedToken = localStorage.getItem('accessToken');
    if (storedToken) {
      setToken(storedToken);
    }
  }, []);


  /**
   * Fetches the list of users from the admin API endpoint.
   */
  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      console.log("Fetching users");
      console.log("TOken is", token);
      const res = await axios.get('/api/admin/users', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      console.log("Users data is: ", res.data)
      setUsers(res.data || []);
    } catch (err) {
      setError("Failed to load users. Check console for details.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  /**
   * Toggles the expanded view for a specific user card.
   * @param id The ID of the user to expand or collapse.
   */
  const toggleExpand = (id: string) => {
    setExpandedUserId(expandedUserId === id ? null : id);
  };

  // --- Loading State UI ---
  if (loading) {
    return (
      <div className="flex items-center justify-center h-48">
        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <p className="text-gray-600">Loading user data...</p>
      </div>
    );
  }

  // --- Error State UI ---
  if (error) {
    return (
      <div className="p-6 bg-red-100 border-l-4 border-red-500 text-red-700 rounded-xl shadow-md">
        <h2 className="text-xl font-bold mb-2">Error</h2>
        <p>{error}</p>
        <button onClick={fetchUsers} className="mt-4 px-3 py-1 bg-red-600 text-white rounded-lg hover:bg-red-700 transition">
            Try Again
        </button>
      </div>
    );
  }

  // --- Empty State UI ---
  if (users.length === 0) {
    return (
        <div className="p-6 bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 rounded-xl shadow-md">
            <h2 className="text-xl font-bold mb-2">No Users Found</h2>
            <p>The user list is currently empty.</p>
        </div>
    );
  }

  // --- Main Content UI ---
  return (
    <div className="p-4 sm:p-6 bg-gray-50 min-h-screen rounded-xl">
      <h2 className="text-3xl font-extrabold text-gray-900 mb-8 border-b pb-2">User Management Dashboard</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {users.map((user) => {
          const expanded = expandedUserId === user.id;
          // Create initials for a simple avatar placeholder (e.g., "BG")
          const initials = user.names.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);

          return (
            <div
              key={user.id}
              className="bg-white rounded-xl shadow-lg hover:shadow-2xl transition duration-300 transform hover:-translate-y-1 overflow-hidden border border-gray-100"
            >
              {/* Avatar Placeholder */}
              <div className="h-32 w-full flex items-center justify-center bg-indigo-600/90">
                <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center text-indigo-700 font-bold text-2xl shadow-xl ring-4 ring-white">
                  {initials}
                </div>
              </div>

              <div className="p-5">
                <h3 className="text-xl font-bold text-gray-800 truncate mb-1" title={user.names}>
                  {user.names}
                </h3>
                <p className="text-sm text-blue-600 font-medium truncate" title={user.email}>
                  {user.email}
                </p>
                {/* Phone information displayed upfront */}
                <div className="flex items-center space-x-2 mt-3">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    <p className={`text-sm ${user.phone ? 'text-gray-600' : 'text-red-500 italic'}`}>
                        {user.phone || 'No Phone Provided'}
                    </p>
                </div>
              </div>

              <div className="flex justify-center p-3 border-t border-gray-200 bg-gray-50">
                <button
                  onClick={() => toggleExpand(user.id)}
                  className="w-full mx-2 py-2 text-sm font-semibold rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 transition transform hover:scale-[1.01] shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                >
                  {expanded ? 'Hide Details' : 'View Full Details'}
                </button>
              </div>

              {expanded && (
                <div className="p-5 border-t border-gray-200 bg-indigo-50/50">
                  <h4 className="font-bold text-indigo-700 mb-2">Detailed Information</h4>
                  <div className="space-y-1 text-sm">
                    {/* User ID (ID is typically important for management dashboards) */}
                    <p className="text-gray-700 break-all">
                        <span className="font-semibold text-gray-800">User ID:</span> {user.id}
                    </p>
                    <p className="text-gray-700">
                        <span className="font-semibold text-gray-800">Full Name:</span> {user.names}
                    </p>
                    <p className="text-gray-700 break-all">
                        <span className="font-semibold text-gray-800">Email:</span> {user.email}
                    </p>
                    {user.phone && (
                        <p className="text-gray-700">
                            <span className="font-semibold text-gray-800">Phone:</span> {user.phone}
                        </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}