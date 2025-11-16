'use client';
import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import AuthModal from '../components/AuthModal';
import Header from '../components/Header';
import HouseProjectCard from '../components/HouseProjectCard';
import Sidebar from '../components/Sidebar';
import Newsletter from '../components/Newsletter';
import FeaturedProject from '../components/FeaturedProject';
import SearchModal from '../components/SearchModal';
import axios from 'axios';
import { Console } from 'console';

export default function Home() {
  const [projects, setProjects] = useState<any[]>([]);
  const [filteredProjects, setFilteredProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({});
  const [showSidebar, setShowSidebar] = useState(false);
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const router = useRouter();
  const mainContentRef = useRef<HTMLDivElement>(null);
  const footerRef = useRef<HTMLDivElement>(null);

  // Fetch projects from API
  useEffect(() => {
    const loadProjects = async () => {
      setLoading(true);
      try {
        const result = await axios.get('/api/houseprojects');
        // const result = await response.json();
        
        if (result.data) {
          const transformedProjects = result.data.data.map((project: any) => ({
            id: project.id,
            title: project.title,
            price: parseFloat(project.price),
            image: project.thumbnail,
            bedrooms: project.bedrooms,
            bathrooms: project.bathrooms,
            floors: project.floors,
            area: project.areaSqFt,
            description: project.description,
            location: project.location,
            style: project.style,
            type: project.type,
            category: project.category,
            rooms: project.rooms,
            status: project.status
          }));
          
          setProjects(transformedProjects);
          setFilteredProjects(transformedProjects);
        }
      } catch (error) {
        console.error('Error loading projects:', error);
        // Keep empty array on error
        setProjects([]);
        setFilteredProjects([]);
      } finally {
        setLoading(false);
      }
    };

    loadProjects();
  }, []);

  // Convert projects to the format expected by SearchModal
  const searchHouses = projects.map(project => ({
    id: project.id,
    name: project.title,
    price: project.price,
    floors: project.floors,
    bedrooms: project.bedrooms,
    bathrooms: project.bathrooms,
    type: project.category
  }));


const handleFilterChange = (newFilters: any) => {
  setFilters(newFilters);
  let filtered = [...projects];
  console.log("FIlters: ", newFilters);
  console.log("Orginals", filtered)
  if (Array.isArray(newFilters.bedrooms) && newFilters.bedrooms.length > 0) {
    filtered = filtered.filter(project =>
      newFilters.bedrooms.includes(project.bedrooms)
    );
  }

  if (Array.isArray(newFilters.bathrooms) && newFilters.bathrooms.length > 0) {
    filtered = filtered.filter(project =>
      newFilters.bathrooms.includes(project.bathrooms)
    );
  }
  
  if (Array.isArray(newFilters.areas) && newFilters.areas.length > 0) {
    filtered = filtered.filter(project => {
      return newFilters.areas.some(rangeStr => {
        const [minStr, maxStr] = rangeStr.split("-");

        const min = Number(minStr);
        const max = maxStr === "null" ? null : Number(maxStr);

        if (max === null) {
          return project.area >= min;
        }

        return project.area >= min && project.area <= max;
      });
    });
  }  

  
  if (Array.isArray(newFilters.priceRanges) && newFilters.priceRanges.length > 0) {
    filtered = filtered.filter(project => {
      return newFilters.priceRanges.some(rangeStr => {
        const [minStr, maxStr] = rangeStr.split("-");
        const min = Number(minStr);
        const max = maxStr === "null" ? null : Number(maxStr);

        if (max === null) {
          return project.price >= min;
        }

        return project.price >= min && project.price <= max;
      });
    });
  }
  
 if (Array.isArray(newFilters.styles) && newFilters.styles.length > 0) {
  filtered = filtered.filter(
  project => (project.type || "Unknown") && newFilters.styles.includes(project.type || "Unknown")
);
}

if (Array.isArray(newFilters.categories) && newFilters.categories.length > 0) {
  filtered = filtered.filter(project =>
    project.category && newFilters.categories.includes(project.category)
  );
}
  console.log("Filitered types", filtered);


  setFilteredProjects(filtered);
};


  const toggleSidebar = () => {
    const newShowSidebar = !showSidebar;
    setShowSidebar(newShowSidebar);
    
    if (newShowSidebar && mainContentRef.current) {
      setTimeout(() => {
        mainContentRef.current?.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'start' 
        });
      }, 100);
    }
  };

  const handleAuthSuccess = (userData: any) => {
    setUser(userData);
    setShowAuthModal(false);
  };

  const navigateToCustomPlan = () => {
    router.push('/custom-plan');
  };

  const navigateToCatalog = () => {
    router.push('/catalog');
  };

  const scrollToContact = () => {
    footerRef.current?.scrollIntoView({ 
      behavior: 'smooth' 
    });
  };

  // Handle house selection from search modal
  const handleHouseSelect = (houseId: string) => {
    const selectedHouse = projects.find(project => project.id === houseId.toString());
    if (selectedHouse) {
      console.log('Selected house:', selectedHouse);
      setShowSearchModal(false);
      
      // Optional: Scroll to the selected house in the grid
      const element = document.getElementById(`house-${houseId}`);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        element.classList.add('ring-2', 'ring-blue-500', 'transition-all', 'duration-1000');
        setTimeout(() => {
          element.classList.remove('ring-2', 'ring-blue-500');
        }, 2000);
      }
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Updated Header with contact navigation */}
      <Header 
        onFilterToggle={toggleSidebar}
        onAuthSuccess={handleAuthSuccess}
        onContactClick={scrollToContact}
      />
      
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
          houses={searchHouses}
          onHouseSelect={handleHouseSelect}
        />
      )}
      
      {/* Featured Project Banner */}
      <FeaturedProject />
      
      {/* Minimized Premium Hero Section */}
      <section className="relative bg-gradient-to-br from-gray-900 to-black text-white py-16">
        <div className="absolute inset-0 bg-black bg-opacity-50"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 leading-tight">
              Affordable House Plans
              <span className="block text-2xl md:text-3xl font-light mt-2">for Africa</span>
            </h1>
            <p className="text-lg text-gray-300 mb-8 leading-relaxed max-w-2xl mx-auto">
              Since 2014, providing market-tailored designs with premium construction documents and custom design options.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {/* Browse Catalog Button - Now Functional */}
              <button 
                className="bg-white text-gray-900 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-all duration-300 transform hover:scale-105 shadow-lg flex items-center justify-center space-x-2 group"
              >
                <a href='#all_house_plans'>Browse Catalog</a>
                <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
              
              {/* Custom Design Button */}
              <button 
                onClick={navigateToCustomPlan}
                className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-gray-900 transition-all duration-300 transform hover:scale-105 flex items-center justify-center space-x-2 group"
              >
                <span>Custom Design</span>
                <svg className="w-4 h-4 group-hover:rotate-45 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <div ref={mainContentRef} className="relative">
        {/* Filter Sidebar */}
        {showSidebar && (
          <div className="fixed right-0 top-20 z-50 lg:top-24">
            <Sidebar 
              onFilterChange={handleFilterChange} 
              onClose={() => setShowSidebar(false)} 
            />
          </div>
        )}
        
        {/* Overlay when filter is open - for mobile */}
        {showSidebar && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
            onClick={() => setShowSidebar(false)}
          ></div>
        )}
        
        {/* Main Content */}
        <main id="all_house_plans"  className="p-8">
          {/* Page Header with Filter Button */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Browse All House Plans</h1>
              <p className="text-gray-600">Discover our curated collection of affordable house plans</p>
            </div>
            
            {/* Filter Toggle Button */}
            <button 
              onClick={toggleSidebar}
              className="bg-gray-900 text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-800 transition-colors flex items-center space-x-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.207A1 1 0 013 6.5V4z" />
              </svg>
              <span>Filters</span>
            </button>
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-20">
              <div className="text-center">
                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-gray-900 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading premium house plans...</p>
              </div>
            </div>
          ) : (
            <>
              {/* Projects Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-16">
                {filteredProjects.map(project => (
                  <div key={project.id} id={`house-${project.id}`}>
                    <HouseProjectCard project={project} />
                  </div>
                ))}
              </div>

              {/* Show message if no projects match filters */}
              {filteredProjects.length === 0 && (
                <div className="text-center py-12">
                  <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">No plans found</h3>
                  <p className="text-gray-600">Try adjusting your filters to see more results</p>
                </div>
              )}

              {/* Premium Features */}
              <div className="bg-gray-50 rounded-2xl p-8 mb-16">
                <div className="text-center mb-8">
                  <h2 className="text-3xl font-bold text-gray-900 mb-4">Why Choose Lumaro Nexus?</h2>
                  <p className="text-gray-600 text-lg max-w-2xl mx-auto">
                    We combine African architectural expertise with international standards to deliver exceptional value.
                  </p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-white rounded-2xl shadow-lg flex items-center justify-center mx-auto mb-4">
                      <svg className="w-8 h-8 text-gray-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                      </svg>
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2 text-lg">100% Money Guarantee</h3>
                    <p className="text-gray-600 text-sm leading-relaxed">
                      Full refund if you're not satisfied with your purchase. No questions asked.
                    </p>
                  </div>

                  <div className="text-center">
                    <div className="w-16 h-16 bg-white rounded-2xl shadow-lg flex items-center justify-center mx-auto mb-4">
                      <svg className="w-8 h-8 text-gray-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2 text-lg">Instant Digital Delivery</h3>
                    <p className="text-gray-600 text-sm leading-relaxed">
                      Receive your plans immediately after payment. Ready to use in CAD and PDF formats.
                    </p>
                  </div>

                  <div className="text-center">
                    <div className="w-16 h-16 bg-white rounded-2xl shadow-lg flex items-center justify-center mx-auto mb-4">
                      <svg className="w-8 h-8 text-gray-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2 text-lg">Multiple Payment Options</h3>
                    <p className="text-gray-600 text-sm leading-relaxed">
                      Secure payments via credit cards, mobile money, and bank transfers across Africa.
                    </p>
                  </div>
                </div>
              </div>
            </>
          )}
        </main>
      </div>
      
      {/* Newsletter */}
      <Newsletter />
      
      {/* Premium Footer with Social Media - Added ref for contact navigation */}
      <footer ref={footerRef} className="bg-gray-900 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Column 1: Logo and Company Info */}
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-lg flex items-center justify-center shadow-sm overflow-hidden transition-transform duration-300 group-hover:scale-105">
                  <Image
                    src="/image/logo_images/Unex_log.png"
                    alt="Lumaro Nexus Logo"
                    width={40}
                    height={40}
                    className="object-contain"
                  />
                </div>
                <span className="text-xl font-bold">
                  <span className="text-orange-500">Lumaro</span>
                  <span className="text-white"> Nexus</span>
                </span>
              </div>
              <p className="text-gray-400 text-sm leading-relaxed mb-4">
                Since 2014, providing affordable, African market-tailored designs with premium construction documents and custom design options.
              </p>
              
              {/* Social Media Links */}
              <div className="flex space-x-4">
                <a href="#" className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-green-500 transition-colors">
                  <span className="text-white">f</span>
                </a>
                <a href="#" className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-pink-500 transition-colors">
                  <span className="text-white">📸</span>
                </a>
                <a href="#" className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-green-600 transition-colors">
                  <span className="text-white">💬</span>
                </a>
                <a href="#" className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-blue-400 transition-colors">
                  <span className="text-white">t</span>
                </a>
              </div>
            </div>
            
            {/* Column 2: Shop Links */}
            <div>
              <h4 className="font-semibold mb-4 text-lg">Shop</h4>
              <ul className="space-y-3 text-sm text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Back to Head</a></li>
                <li><a href="/catalog" className="hover:text-white transition-colors">Catalog</a></li>
                <li><a href="/custom-plan" className="hover:text-white transition-colors">Customise Your Design</a></li>
              </ul>
            </div>
            
            {/* Column 3: Learn Links */}
            <div>
              <h4 className="font-semibold mb-4 text-lg">Learn</h4>
              <ul className="space-y-3 text-sm text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Frequently Asked Questions</a></li>
                <li><a href="#" className="hover:text-white transition-colors">For Affiliates</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Refer a friend</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Terms and Conditions</a></li>
              </ul>
            </div>
            
            {/* Column 4: Contact Info */}
            <div>
              <h4 className="font-semibold mb-4 text-lg">Contact</h4>
              <ul className="space-y-3 text-sm text-gray-400">
                <li className="flex items-center space-x-2">
                  <span>📧</span>
                  <span>Email: info@lumaro_nexus.com</span>
                </li>
                <li className="flex items-center space-x-2">
                  <span>🌐</span>
                  <span>Website: www.Lumaro_nexus.com</span>
                </li>
                <li className="flex items-center space-x-2">
                  <span>🛟</span>
                  <span>Support: help@lumaro_nexus.com</span>
                </li>
                <li className="flex items-center space-x-2">
                  <span>📱</span>
                  <span>WhatsApp: +250791756343</span>
                </li>
                <li className="flex items-center space-x-2">
                  <span>📍</span>
                  <span>Location: Kigali Rwanda</span>
                </li>
              </ul>
            </div>
          </div>
          
                <div className="border-t border-gray-800 mt-12 pt-8 text-center">
                  <p className="text-gray-400 text-sm">&copy; 2025 Lumaro Nexus House Plans. All rights reserved. | Privacy Policy | Terms of Service</p>
                </div>
              </div>
            </footer>
          </div>
        );
      }