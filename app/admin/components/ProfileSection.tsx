'use client';
import React, { useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';
import { LogOut } from 'lucide-react'; // Example icon for aesthetics

// --- Type Definitions ---

// Define the structure of the data expected inside the JWT payload
interface DecodedToken {
  id: string;
  names: string;
  email: string;
  role: string;
  permissions: string[];
  // Standard JWT claims (iat, exp) are often present but not strictly needed for display
  iat: number; 
  exp: number;
}

// Define the structure for the state to hold decoded user data
interface UserProfile {
  names: string;
  email: string;
  role: string;
  permissions: string[];
}


export default function ProfileSection() {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Function to handle the decoding and state update
  const decodeToken = (token: string) => {
    try {
      // Decode the JWT payload
      const decoded = jwtDecode<DecodedToken>(token);
      
      // Map the decoded claims to the user profile state
      setUserProfile({
        names: decoded.names,
        email: decoded.email,
        role: decoded.role,
        permissions: decoded.permissions || [], // Ensure permissions is an array
      });

      // Optional: Check token expiry
      if (decoded.exp * 1000 < Date.now()) {
        setError('Your session has expired. Please log in again.');
        // Consider triggering handleLogout here
      }

    } catch (e) {
      console.error("Failed to decode token:", e);
      setError('Invalid authentication token format.');
      // Clear token if it's corrupted
      handleLogout(); 
    }
  };

  // --- Effect to Load and Decode Token ---
  useEffect(() => {
    const accessToken = localStorage.getItem('accessToken');

    if (!accessToken) {
      setError('No access token found. Please log in.');
      setUserProfile(null);
      return;
    }
    
    decodeToken(accessToken);
  }, []);


  // --- Logout Functionality ---
  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    document.cookie = 'adminAccessToken=; path=/; max-age=0; SameSite=Lax';
    window.location.href = '/login';
  };

  // --- Rendering ---

  if (error && !userProfile) {
    return (
      <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
        <p className="font-semibold">Authentication Error</p>
        <p className="text-sm">{error}</p>
        <button 
          onClick={handleLogout} 
          className="mt-2 text-sm text-white bg-red-600 px-3 py-1 rounded hover:bg-red-700 transition"
        >
          Go to Login
        </button>
      </div>
    );
  }

  if (!userProfile) {
    // Show a loading/skeleton state while waiting for localStorage read
    return <div className="p-4 bg-gray-50 rounded-lg animate-pulse h-48 w-full"></div>;
  }

  return (
    <div className="bg-white p-6 shadow-xl rounded-xl max-w-sm mx-auto border border-gray-100">
      <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
        <span>User Profile</span>
      </h2>

      <div className="space-y-3 text-gray-700">
        
        {/* Names */}
        <div className="flex justify-between border-b pb-2">
          <span className="font-medium">Name:</span>
          <span className="text-gray-900 font-semibold">{userProfile.names}</span>
        </div>

        {/* Email */}
        <div className="flex justify-between border-b pb-2">
          <span className="font-medium">Email:</span>
          <span className="text-sm text-gray-600">{userProfile.email}</span>
        </div>

        {/* Role */}
        <div className="flex justify-between border-b pb-2">
          <span className="font-medium">Role:</span>
          <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${userProfile.role === 'admin' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'}`}>
            {userProfile.role.toUpperCase()}
          </span>
        </div>

        {/* Permissions */}
        <div>
          <span className="font-medium block mb-1">Permissions:</span>
          <div className="flex flex-wrap gap-2">
            {userProfile.permissions.length > 0 ? (
              userProfile.permissions.map(p => (
                <span key={p} className="px-3 py-1 text-xs bg-gray-200 text-gray-700 rounded-full">
                  {p}
                </span>
              ))
            ) : (
              <span className="text-sm italic text-gray-500">No specific permissions.</span>
            )}
          </div>
        </div>
      </div>

      {/* Logout Button */}
      <button
        onClick={handleLogout}
        className="w-full mt-6 flex items-center justify-center space-x-2 bg-red-500 text-white py-2 rounded-lg font-semibold hover:bg-red-600 transition-colors"
      >
        <LogOut className="w-5 h-5" />
        <span>Log Out</span>
      </button>
    </div>
  );
}