'use client';
import React, { useState, useRef } from 'react';
import Header from '@/components/Header';
import HouseProjectCard from '@/components/HouseProjectCard';
import Sidebar from '@/components/Sidebar'; // Fixed the typo - added 'r'
import Newsletter from '@/components/Newsletter';

const catalogProjects = [
  {
    id: '22303',
    title: 'Modern 2 Bedroom Apartment Block',
    price: 511,
    image: '/placeholder-house-1.jpg',
    bedrooms: 2,
    bathrooms: 2,
    floors: 2,
    area: 71,
    description: 'Contemporary apartment design with optimal space utilization'
  },
  {
    id: '28802',
    title: 'Compact 2 Bedroom Building Plan',
    price: 366,
    image: '/placeholder-house-2.jpg',
    bedrooms: 2,
    bathrooms: 1,
    floors: 1,
    area: 55,
    description: 'Efficient single-floor design perfect for urban areas'
  },
  // Add more projects as needed
];

export default function Catalog() {
  const [projects, setProjects] = useState(catalogProjects);
  const [filteredProjects, setFilteredProjects] = useState(catalogProjects);
  const [showSidebar, setShowSidebar] = useState(false);
  const [user, setUser] = useState<any>(null);
  const footerRef = useRef<HTMLDivElement>(null);

  const handleAuthSuccess = (userData: any) => {
    setUser(userData);
  };

  const scrollToContact = () => {
    footerRef.current?.scrollIntoView({ 
      behavior: 'smooth' 
    });
  };

  const handleFilterChange = (newFilters: any) => {
    // Implement filter logic here
    console.log('Filters applied:', newFilters);
    // Filter projects based on newFilters
  };

  return (
    <div className="min-h-screen bg-white">
      <Header 
        onFilterToggle={() => setShowSidebar(!showSidebar)}
        onAuthSuccess={handleAuthSuccess}
        onContactClick={scrollToContact}
      />
      
      {/* Catalog Hero Section */}
      <section className="bg-black text-white py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Browse Our Catalog
            </h1>
            <p className="text-lg text-gray-300 mb-8">
              Discover our complete collection of house plans, from compact designs to luxury villas
            </p>
          </div>
        </div>
     </section>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              All House Plans ({filteredProjects.length})
            </h2>
            <p className="text-gray-600">Filter and find your perfect home design</p>
          </div>
          
          <button 
            onClick={() => setShowSidebar(!showSidebar)}
            className="bg-gray-900 text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-800 transition-colors flex items-center space-x-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.207A1 1 0 013 6.5V4z" />
            </svg>
            <span>Filters</span>
          </button>
        </div>

        {/* Projects Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-16">
          {filteredProjects.map(project => (
            <HouseProjectCard key={project.id} project={project} />
          ))}
        </div>
      </div>

      {/* Newsletter & Footer */}
      <Newsletter />
      
      <footer ref={footerRef} className="bg-gray-900 text-white py-16">
        {/* Your footer content */}
      </footer>

      {/* Filter Sidebar */}
      {showSidebar && (
        <div className="fixed right-0 top-0 h-full z-50">
          <Sidebar 
            onFilterChange={handleFilterChange} 
            onClose={() => setShowSidebar(false)} 
          />
        </div>
      )}
    </div>
  );
}