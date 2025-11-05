import React, { useState, useEffect } from 'react';

const Header = () => {
  const [announcements, setAnnouncements] = useState<string[]>([]);
  const [currentAnnouncement, setCurrentAnnouncement] = useState(0);

  // 🤚 GET endpoint to fetch announcements from admin
  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        // 🤚 Replace with: GET /api/announcements
        const response = await fetch('/api/announcements');
        const data = await response.json();
        setAnnouncements(data);
      } catch (error) {
        console.error('Error fetching announcements:', error);
        // Fallback announcements
        setAnnouncements([
          '🎉 New house plans added! Check out our latest designs.',
          '🚀 Free CAD files with every purchase this month!',
          '⭐ Special offer: Get 20% off on 3+ bedroom plans'
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
    <header className="bg-nude-50 border-b border-green-100">
      {/* Moving Announcement Bar */}
      <div className="bg-green-600 text-white py-2 overflow-hidden">
        <div className="animate-marquee whitespace-nowrap">
          {announcements[currentAnnouncement]}
        </div>
      </div>

      {/* Main Navigation */}
      <nav className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-green-500 rounded-full"></div>
            <span className="text-2xl font-bold text-green-800">Maramani</span>
          </div>

          {/* Navigation Links */}
          <div className="hidden md:flex space-x-8">
            <a href="/" className="text-green-700 hover:text-green-500 font-medium">Home</a>
            <a href="/catalog" className="text-green-700 hover:text-green-500 font-medium">Catalog</a>
            <a href="/custom" className="text-green-700 hover:text-green-500 font-medium">Custom Plans</a>
            <a href="/contact" className="text-green-700 hover:text-green-500 font-medium">Contact</a>
          </div>

          {/* Auth Buttons */}
          <div className="flex items-center space-x-4">
            <button className="text-green-700 hover:text-green-500">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </button>
            <button className="text-green-700 hover:text-green-500">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </button>
          </div>
        </div>
      </nav>
    </header>
  );
};

export default Header;