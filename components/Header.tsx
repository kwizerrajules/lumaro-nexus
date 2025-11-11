'use client';
import React, { useState, useEffect } from 'react';
import AuthModal from './AuthModal';
import SearchModal from './SearchModal';

interface HeaderProps {
  onFilterToggle: () => void;
  onAuthSuccess: (userData: any) => void; 
  onContactClick: () => void; // Added contact click handler
}

interface User {
  id: string;
  email: string;
  fullName: string;
  country: string;
}

// Sample house data
const sampleHouses = [
  {
    id: 24512,
    name: "Flat roof 4 bedroom mansion",
    price: 403.20,
    floors: 2,
    bedrooms: 4,
    bathrooms: 5,
    type: "Residential"
  },
  {
    id: 12219,
    name: "Gatehouse design",
    price: 117.00,
    floors: 1,
    bedrooms: 2,
    bathrooms: 2,
    type: "Residential"
  },
  {
    id: 14308,
    name: "4 bedrooms and 2 car garage",
    price: 344.70,
    floors: 2,
    bedrooms: 4,
    bathrooms: 3,
    type: "Residential"
  },
  {
    id: 10104,
    name: "Modern garage plan",
    price: 87.30,
    floors: 1,
    bedrooms: 0,
    bathrooms: 1,
    type: "Residential"
  },
  {
    id: 22201,
    name: "Pool house and gym",
    price: 161.10,
    floors: 1,
    bedrooms: 1,
    bathrooms: 2,
    type: "Residential"
  },
  {
    id: 14307,
    name: "4 bedroom 3 bath house with garage",
    price: 299.99,
    floors: 2,
    bedrooms: 4,
    bathrooms: 3,
    type: "Residential"
  }
];

const Header: React.FC<HeaderProps> = ({ onFilterToggle, onAuthSuccess, onContactClick }) => {
  const [announcements, setAnnouncements] = useState<string[]>([]);
  const [currentAnnouncement, setCurrentAnnouncement] = useState(0);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [showUserMenu, setShowUserMenu] = useState(false);

  // Check if user is logged in on component mount
  useEffect(() => {
    const savedUser = localStorage.getItem('maramani_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        const response = await fetch('/api/announcements');
        const data = await response.json();
        setAnnouncements(data);
      } catch (error) {
        setAnnouncements([
          '🎉 New house plans added weekly!',
          '🚀 Special offer: Get 20% off on 3+ bedroom plans',
          '⭐ Customize Your Own House Plan Now!'
        ]);
      }
    };
    fetchAnnouncements();
  }, []);

  useEffect(() => {
    if (announcements.length > 0) {
      const interval = setInterval(() => {
        setCurrentAnnouncement((prev) => (prev + 1) % announcements.length);
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [announcements]);

  const handleAuthSuccess = (userData: User) => {
    setUser(userData);
    // Save user to localStorage to keep them logged in
    localStorage.setItem('maramani_user', JSON.stringify(userData));
    setShowAuthModal(false);
    onAuthSuccess(userData);
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('maramani_user');
    setShowUserMenu(false);
  };

  const handleSearchClick = () => {
    setShowSearchModal(true);
  };

  const handleHouseSelect = (houseId: number) => {
    // This will be handled by the parent component
    console.log('House selected from search:', houseId);
    setShowSearchModal(false);
  };

  return (
    <header className="bg-white border-b border-gray-100">
      {/* Premium Announcement Bar */}
      <div className="bg-gray-900 text-white py-3">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
              <span className="text-sm font-medium tracking-wide">
                {announcements[currentAnnouncement]}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Navigation */}
      <nav className="bg-white py-4">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gray-900 rounded-lg flex items-center justify-center shadow-sm">
                <span className="text-white font-bold text-lg">M</span>
              </div>
              <div>
                <span className="text-2xl font-bold text-gray-900 tracking-tight">Maramani</span>
                <div className="h-1 w-8 bg-gray-900 mt-1"></div>
              </div>
            </div>

            {/* Navigation Links */}
            <div className="hidden lg:flex items-center space-x-8">
              <a href="/" className="text-gray-700 hover:text-gray-900 font-medium text-sm uppercase tracking-wide transition-colors">Home</a>
              <a href="/catalog" className="text-gray-700 hover:text-gray-900 font-medium text-sm uppercase tracking-wide transition-colors">Catalog</a>
              <a href="/custom-plan" className="text-gray-700 hover:text-gray-900 font-medium text-sm uppercase tracking-wide transition-colors">Custom Plans</a>
              <a 
                href="#" 
                onClick={(e) => {
                  e.preventDefault();
                  onContactClick();
                }} 
                className="text-gray-700 hover:text-gray-900 font-medium text-sm uppercase tracking-wide transition-colors"
              >
                Contact
              </a>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center space-x-4">
              {/* Filter Button - Visible on desktop */}
              <button 
                onClick={onFilterToggle}
                className="hidden lg:flex items-center space-x-2 bg-gray-900 text-white px-4 py-2 rounded-lg font-semibold hover:bg-gray-800 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.207A1 1 0 013 6.5V4z" />
                </svg>
                <span>Filters</span>
              </button>

              {/* Auth Buttons or User Menu */}
              {user ? (
                <div className="relative">
                  <button 
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="flex items-center space-x-2 bg-green-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-green-600 transition-colors"
                  >
                    <span>👤</span>
                    <span className="hidden sm:inline">{user.fullName.split(' ')[0]}</span>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {/* User Dropdown Menu */}
                  {showUserMenu && (
                    <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-xl border border-gray-200 z-50 py-2">
                      <div className="px-4 py-2 border-b border-gray-100">
                        <p className="text-sm font-medium text-gray-900">{user.fullName}</p>
                        <p className="text-sm text-gray-500 truncate">{user.email}</p>
                      </div>
                      <a href="/profile" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                        My Profile
                      </a>
                      <a href="/orders" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                        My Orders
                      </a>
                      <a href="/favorites" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                        Favorites
                      </a>
                      <button 
                        onClick={handleLogout}
                        className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-50"
                      >
                        Sign Out
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <button 
                  onClick={() => setShowAuthModal(true)}
                  className="bg-green-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-green-600 transition-colors flex items-center space-x-2"
                >
                  <span>👤</span>
                  <span className="hidden sm:inline">Sign In</span>
                </button>
              )}

              {/* Search Button - Now with functionality */}
              <button 
                onClick={handleSearchClick}
                className="p-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>
              
              <button className="p-2 text-gray-600 hover:text-gray-900 transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Auth Modal */}
      {showAuthModal && (
        <AuthModal 
          isOpen={showAuthModal}
          onClose={() => setShowAuthModal(false)}
          onAuthSuccess={handleAuthSuccess}
        />
      )}

      {/* Search Modal */}
      {showSearchModal && (
        <SearchModal 
          isOpen={showSearchModal}
          onClose={() => setShowSearchModal(false)}
          houses={sampleHouses}
          onHouseSelect={handleHouseSelect}
        />
      )}
    </header>
  );
};

export default Header;