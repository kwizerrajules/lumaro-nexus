'use client';
import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import HouseProjectCard from '../components/HouseProjectCard';
import Sidebar from '../components/Sidebar';
import Newsletter from '../components/Newsletter';

// Mock data for testing - replace with real API later
const mockProjects = [
  {
    id: '22303',
    title: '2 Bedroom Apartment Block - ID 22303',
    price: 511.00,
    image: '/placeholder-house-1.jpg',
    bedrooms: 2,
    bathrooms: 2,
    floors: 2,
    area: 71,
    description: 'Modern 2 bedroom apartment block design'
  },
  {
    id: '28802',
    title: '2 Bedroom Apartment Building Plan - ID 28802',
    price: 366.30,
    image: '/placeholder-house-2.jpg',
    bedrooms: 2,
    bathrooms: 1,
    floors: 1,
    area: 55,
    description: 'Compact 2 bedroom apartment building'
  },
  {
    id: '49801',
    title: '2 Bedroom Apartments - ID 49801',
    price: 985.00,
    image: '/placeholder-house-3.jpg',
    bedrooms: 2,
    bathrooms: 2,
    floors: 3,
    area: 85,
    description: 'Luxury 2 bedroom apartments'
  },
  {
    id: '12103',
    title: '2 Bedroom House Plan - ID 12103',
    price: 107.10,
    image: '/placeholder-house-1.jpg',
    bedrooms: 2,
    bathrooms: 1,
    floors: 1,
    area: 65,
    description: 'Affordable 2 bedroom house plan'
  },
  {
    id: '11107',
    title: 'Simple One Bedroom Studio Apartment - ID 11107',
    price: 58.80,
    image: '/placeholder-house-2.jpg',
    bedrooms: 1,
    bathrooms: 1,
    floors: 1,
    area: 45,
    description: 'Compact one bedroom studio design'
  }
];

// 🤚 This will be replaced with real API call
const fetchProjects = async (filters = {}) => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  return mockProjects;
};

export default function Home() {
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({});

  // 🤚 GET endpoint to fetch projects
  useEffect(() => {
    const loadProjects = async () => {
      setLoading(true);
      try {
        // 🤚 Replace with: GET /api/projects with filters
        const data = await fetchProjects(filters);
        setProjects(data);
      } catch (error) {
        console.error('Error fetching projects:', error);
        setProjects(mockProjects); // Fallback to mock data
      } finally {
        setLoading(false);
      }
    };

    loadProjects();
  }, [filters]);

  const handleFilterChange = (newFilters: any) => {
    setFilters(newFilters);
    console.log('Filters applied:', newFilters);
  };

  return (
    <div className="min-h-screen bg-green-50">
      <Header />
      
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-green-600 to-nude-500 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Affordable House Plans for Africa
          </h1>
          <p className="text-xl mb-8 text-green-100">
            Since 2014, providing market-tailored designs with premium construction documents
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-white text-green-600 px-8 py-3 rounded-lg font-semibold hover:bg-green-50 transition-colors">
              Browse Catalog
            </button>
            <button className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-green-600 transition-colors">
              Custom Design
            </button>
          </div>
        </div>
      </section>

      <div className="flex">
        {/* Sidebar Filters */}
        <Sidebar onFilterChange={handleFilterChange} />
        
        {/* Main Content */}
        <main className="flex-1 p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-green-800">
              Featured House Plans
            </h1>
            <div className="text-green-600">
              Showing {projects.length} plans
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
            </div>
          ) : (
            <>
              {/* Projects Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
                {projects.map(project => (
                  <HouseProjectCard key={project.id} project={project} />
                ))}
              </div>

              {/* Features Section */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                <div className="bg-white p-6 rounded-lg border border-green-200 text-center">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  </div>
                  <h3 className="font-semibold text-green-800 mb-2">100% Money Guarantee</h3>
                  <p className="text-green-600 text-sm">Full refund if not satisfied with your purchase</p>
                </div>

                <div className="bg-white p-6 rounded-lg border border-green-200 text-center">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <h3 className="font-semibold text-green-800 mb-2">Instant Digital Delivery</h3>
                  <p className="text-green-600 text-sm">Get your plans immediately after payment</p>
                </div>

                <div className="bg-white p-6 rounded-lg border border-green-200 text-center">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <h3 className="font-semibold text-green-800 mb-2">Multiple Payment Options</h3>
                  <p className="text-green-600 text-sm">Credit cards, mobile money, and bank transfers</p>
                </div>
              </div>
            </>
          )}
        </main>
      </div>
      
      {/* Newsletter */}
      <Newsletter />
      
      {/* Footer */}
      <footer className="bg-green-800 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-lg font-semibold mb-4">Maramani House Plans</h3>
              <p className="text-green-200 text-sm">
                Since 2014, providing affordable, African market-tailored designs with premium construction documents.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-sm text-green-200">
                <li><a href="#" className="hover:text-white">Frequently Asked Questions</a></li>
                <li><a href="#" className="hover:text-white">For Affiliates</a></li>
                <li><a href="#" className="hover:text-white">Refer a friend</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-green-200">
                <li><a href="#" className="hover:text-white">Terms and Conditions</a></li>
                <li><a href="#" className="hover:text-white">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-white">Refund policy</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Contact</h4>
              <ul className="space-y-2 text-sm text-green-200">
                <li>Email: info@maramani.com</li>
                <li>Website: www.maramani.com</li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-green-700 mt-8 pt-8 text-center text-green-200 text-sm">
            <p>&copy; 2024 Maramani House Plans. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}