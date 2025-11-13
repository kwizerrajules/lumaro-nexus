'use client';
import React, { useState, useEffect } from 'react';
import AuthModal from './AuthModal';
import SearchModal from './SearchModal';
import Image from 'next/image';
import axios from 'axios';

interface HeaderProps {
  onFilterToggle: () => void;
  onAuthSuccess: (userData: any) => void; 
  onContactClick: () => void;
}



interface User {
  id: string;
  email: string;
  fullName: string;
  country: string;
}




const Header: React.FC<HeaderProps> = ({ onFilterToggle, onAuthSuccess, onContactClick }) => {
  const [announcements, setAnnouncements] = useState<string[]>([]);
  const [currentAnnouncement, setCurrentAnnouncement] = useState(0);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [sampleHouses, setSampleHouses] = useState<any[]>([]);


  useEffect(() => {
  const fetchHouses = async () => {
    try {
      const res = await axios.get('/api/houseprojects');
      const houses = res.data.data.map((item: any) => ({
        id: item.id,
        name: item.title, 
        price: Number(item.price),
        floors: item.floors,
        bedrooms: item.bedrooms,
        bathrooms: item.bathrooms,
        type: item.categoty || 'Residential',
      }));
      setSampleHouses(houses);
    } catch (err) {
      console.error('Failed to fetch houses:', err);
    }
  };

  fetchHouses();
}, []);


  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const savedUser = localStorage.getItem('lumaro_user');
    if (savedUser) setUser(JSON.parse(savedUser));
  }, []);

  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        const response = await fetch('/api/announcements');
        const data = await response.json();
        setAnnouncements(data);
      } catch {
        setAnnouncements([
          '✨New House Plan Added Weekly!',
          '🏠Special Offer:Get 20% on 3+ Bedroom PlanSpecial Offer',
          '🟩Customise Your Own House Plan Now!'
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
    localStorage.setItem('lumaro_user', JSON.stringify(userData));
    setShowAuthModal(false);
    onAuthSuccess(userData);
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('lumaro_user');
    setShowUserMenu(false);
  };

  const handleSearchClick = () => setShowSearchModal(true);

  const handleHouseSelect = (houseId: string) => {
    console.log('House selected from search:', houseId);
    setShowSearchModal(false);
  };

  return (
    <header className={`bg-white border-b border-gray-100 transition-all duration-300 ${isScrolled ? 'fixed top-0 left-0 right-0 z-50 shadow-lg' : 'relative'}`}>
      {/* Announcement Bar */}
      <div className="bg-gray-900 text-white py-3">
        <div className="container mx-auto px-4 flex justify-center items-center">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
            <span className="text-sm font-medium tracking-wide">
              {announcements[currentAnnouncement]}
            </span>
          </div>
        </div>
      </div>

      {/* Main Navigation */}
      <nav className="bg-white py-4">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            
            {/* 🌟 Lumaro Nexus Logo */}
            <a href="/" className="flex items-center space-x-3 group">
              <div className="w-12 h-12 rounded-lg flex items-center justify-center shadow-sm overflow-hidden transition-transform duration-300 group-hover:scale-105">
                <Image
                  src="/image/logo_images/Unex_log.png"
                  alt="Lumaro Nexus Logo"
                  width={48}
                  height={48}
                  className="object-contain"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).style.display = 'none';
                    const nextElement = e.currentTarget.nextSibling as HTMLElement | null;
                    if (nextElement) nextElement.style.display = 'flex';
                  }}
                />
                <div className="hidden w-full h-full items-center justify-center bg-gray-900">
                  <span className="text-white font-bold text-lg">LN</span>
                </div>
              </div>

              <div className="flex flex-col">
                <span className="text-2xl font-extrabold bg-gradient-to-r from-yellow-600 to-orange-600 text-transparent bg-clip-text text-yellow-600">
                  Lumaro
                </span>
                <span className="text-sm font-semibold tracking-widest text-gray-700 uppercase">
                  Nexus
                </span>
              </div>
            </a>

            {/* Navigation Links */}
            <div className="hidden lg:flex items-center space-x-8">
              <a href="/" className="text-gray-700 hover:text-gray-900 font-medium text-sm uppercase tracking-wide border-b-2 border-transparent hover:border-gray-900 py-1">Home</a>
              <a href="/catalog" className="text-gray-700 hover:text-gray-900 font-medium text-sm uppercase tracking-wide border-b-2 border-transparent hover:border-gray-900 py-1">Catalog</a>
              <a href="/custom-plan" className="text-gray-700 hover:text-gray-900 font-medium text-sm uppercase tracking-wide border-b-2 border-transparent hover:border-gray-900 py-1">Custom Plans</a>
              <a href="#" onClick={(e) => { e.preventDefault(); onContactClick(); }} className="text-gray-700 hover:text-gray-900 font-medium text-sm uppercase tracking-wide border-b-2 border-transparent hover:border-gray-900 py-1">Contact</a>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center space-x-4">
              <button onClick={onFilterToggle} className="hidden lg:flex items-center space-x-2 bg-gray-900 text-white px-4 py-2 rounded-lg font-semibold hover:bg-gray-800 transition-colors">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.207A1 1 0 013 6.5V4z" />
                </svg>
                <span>Filters</span>
              </button>

              {user ? (
                <div className="relative">
                  <button onClick={() => setShowUserMenu(!showUserMenu)} className="flex items-center space-x-2 bg-green-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-green-600 transition-colors">
                    <span>👤</span>
                    <span className="hidden sm:inline">{user.fullName}</span>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {showUserMenu && (
                    <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-xl border border-gray-200 z-50 py-2">
                      <div className="px-4 py-2 border-b border-gray-100">
                        <p className="text-sm font-medium text-gray-900">{user.fullName}</p>
                        <p className="text-sm text-gray-500 truncate">{user.email}</p>
                      </div>
                      <a href="/profile" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">My Profile</a>
                      <a href="/orders" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">My Orders</a>
                      <a href="/favorites" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">Favorites</a>
                      <button onClick={handleLogout} className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-50">Sign Out</button>
                    </div>
                  )}
                </div>
              ) : (
                <button onClick={() => setShowAuthModal(true)} className="bg-green-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-green-600 transition-colors flex items-center space-x-2">
                  <span>👤</span>
                  <span className="hidden sm:inline">Sign In</span>
                </button>
              )}

              <button onClick={handleSearchClick} className="p-2 text-gray-600 hover:text-gray-900 transition-colors">
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
