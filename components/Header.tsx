import React, { useState, useEffect } from 'react';

const Header = () => {
  const [announcements, setAnnouncements] = useState<string[]>([]);
  const [currentAnnouncement, setCurrentAnnouncement] = useState(0);

  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        // 👋 API Endpoint → Fetch announcement messages
        const response = await fetch('/api/announcements'); // 👋 Example: /api/announcements
        const data = await response.json();
        setAnnouncements(data);
      } catch (error) {
        setAnnouncements([
          '🎉 New house plans added weekly!',
          '🚀 Special offer: Get 20% off on 3+ bedroom plans',
          '⭐ Customize Your Own House Plan Now!',
        ]);
      }
    };
    fetchAnnouncements();
  }, []);

  useEffect(() => {
    if (announcements.length > 0) {
      const interval = setInterval(() => {
        setCurrentAnnouncement((prev) => (prev + 1) % announcements.length);
      }, 4000);
      return () => clearInterval(interval);
    }
  }, [announcements]);

  return (
    <header className="bg-white border-b border-gray-200">
      {/* 🔹 Announcement Bar */}
      <div className="bg-gray-900 text-white py-2 text-center text-sm">
        <div className="flex items-center justify-center space-x-2">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
          <span>{announcements[currentAnnouncement]}</span>
        </div>
      </div>

      {/* 🔹 Main Navbar */}
      <nav className="py-4 px-6 flex items-center justify-between bg-white shadow-sm">
        {/* Left Section - Logo */}
        <div className="flex items-center space-x-2">
          {/* 👋 Logo Source */}
          <img src="/logo.png" alt="logo" className="w-10 h-10" /> {/* 👋 Replace with your logo image */}
          <span className="text-2xl font-bold text-sky-600">Maramani</span>
        </div>

        {/* Center Section - Navigation Links */}
        <div className="hidden md:flex items-center gap-8 text-gray-700 font-medium">
          {/* 👋 Link Endpoints */}
          <a href="/" className="hover:text-sky-600 transition-colors">Shop</a> {/* 👋 /shop */}
          <a href="/best-sellers" className="hover:text-sky-600 transition-colors">Best Sellers</a> {/* 👋 /best-sellers */}
          <a href="/by-size" className="hover:text-sky-600 transition-colors">By Size</a> {/* 👋 /by-size */}
          <a href="/by-style" className="hover:text-sky-600 transition-colors">By Style</a> {/* 👋 /by-style */}
          <a href="/by-budget" className="hover:text-sky-600 transition-colors">By Budget</a> {/* 👋 /by-budget */}
          <a href="/custom-plan" className="hover:text-sky-600 transition-colors">Custom Plan</a> {/* 👋 /custom-plan */}
          <a href="/learn" className="hover:text-sky-600 transition-colors">Learn</a> {/* 👋 /learn */}
        </div>

        {/* Right Section - Icons */}
        <div className="flex items-center gap-4 text-gray-700">
          {/* 👋 Search Endpoint */}
          <button aria-label="Search">
            <svg className="w-5 h-5 hover:text-sky-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </button>

          {/* 👋 Wishlist Endpoint */}
          <button aria-label="Wishlist">
            <svg className="w-5 h-5 hover:text-sky-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </button>

          {/* 👋 Profile Endpoint */}
          <button aria-label="Profile">
            <svg className="w-5 h-5 hover:text-sky-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </button>

          {/* 👋 Cart Endpoint */}
          <button aria-label="Cart">
            <svg className="w-5 h-5 hover:text-sky-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-1.3 5H19m-8 0a1 1 0 11-2 0m6 0a1 1 0 11-2 0" />
            </svg>
          </button>
        </div>
      </nav>
    </header>
  );
};

export default Header;
