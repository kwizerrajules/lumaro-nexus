'use client';
import React, { useState, useRef } from 'react';
import Image from 'next/image';
import {
  Phone,
  CreditCard,
  Users,
  InstagramLogo,
  ChatCircle,
  Envelope,
  Globe,
  Lifebuoy,
  DeviceMobile,
  MapPin,
  FacebookLogo,
  TwitterLogo,
} from '@phosphor-icons/react';
import Header from './Header';
import Newsletter from './Newsletter';
import CustomPlanBuilder from './CustomPlanBuilder';
// import ConstructionCalculator from './ConstructionCalculator';

export default function CustomPlanPage() {
  const [showSidebar, setShowSidebar] = useState(false);
  const footerRef = useRef<HTMLElement>(null);

  const handleContactClick = () => {
    if (footerRef.current) {
      footerRef.current.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      });
    }
  };

  const handleAuthSuccess = (userData: any) => {
    console.log('User authenticated:', userData);
    // Handle user authentication logic here
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header 
        onFilterToggle={() => setShowSidebar(!showSidebar)} 
        onAuthSuccess={handleAuthSuccess} 
        onContactClick={handleContactClick} 
      />
      
      {/* Hero Section */}
      <section className="bg-black text-white py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Customize Your Dream Home
            </h1>
            <p className="text-xl text-gray-300 mb-8 leading-relaxed">
              Create the perfect house plan with the highest quality, the best layout, and a budget that suits you. 
              Customize rooms, bathrooms, and all additions as you imagined them.
            </p>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left - Custom Plan Builder (2/3 width) */}
          <div className="lg:col-span-2">
            <CustomPlanBuilder />
          </div>

          {/* Right - Construction Calculator (1/3 width) */}
          <div className="lg:col-span-1">
            {/* <ConstructionCalculator /> */}
          </div>
        </div>
      </div>

      {/* Customer Service Section */}
      <section className="bg-white py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Customer Service */}
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Phone size={28} weight="fill" className="text-green-700" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Customer Service</h3>
              <p className="text-gray-600 mb-2">
                Contact us at <strong>info@lumaro_nexus.com</strong>
              </p>
              <p className="text-gray-600 mb-2">
                Phone: <strong>+250791756343</strong>
              </p>
              <p className="text-gray-600 text-sm">
                Monday to Friday 9:00 AM to 4:00 PM GMT +3
              </p>
            </div>

            {/* Secure Payment */}
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CreditCard size={28} weight="fill" className="text-blue-700" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Secure Payment</h3>
              <p className="text-gray-600">
                We accept Credit/Debit/Prepaid Cards, Apple Pay, Bank Transfers, and PayPal.
              </p>
            </div>

            {/* Refer a Friend */}
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users size={28} weight="fill" className="text-purple-700" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Refer a Friend</h3>
              <p className="text-gray-600">
                Tell your friends about our promotional offers and earn rewards.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <Newsletter />

      {/* Footer with contact section */}
      <footer ref={footerRef} className="bg-gray-900 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Column 1: Logo and Company Info */}
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-lg flex items-center justify-center shadow-sm overflow-hidden transition-transform duration-300 group-hover:scale-105">
                  <Image
                    src="/image/logo_images/Unex_log.png"
                    alt="Lumaro Nexus Logo"
                    width={48}
                    height={48}
                    className="object-contain"
                    onError={(e) => {
                      // Fallback if image fails to load
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                    }}
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
                <a href="#" className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-green-500 transition-colors" aria-label="Facebook">
                  <FacebookLogo size={20} weight="fill" className="text-white" />
                </a>
                <a href="#" className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-pink-500 transition-colors" aria-label="Instagram">
                  <InstagramLogo size={20} weight="fill" className="text-white" />
                </a>
                <a href="#" className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-green-600 transition-colors" aria-label="WhatsApp">
                  <ChatCircle size={20} weight="fill" className="text-white" />
                </a>
                <a href="#" className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-blue-400 transition-colors" aria-label="Twitter">
                  <TwitterLogo size={20} weight="fill" className="text-white" />
                </a>
              </div>
            </div>
            
            {/* Column 2: Shop Links */}
            <div>
              <h4 className="font-semibold mb-4 text-lg">Shop</h4>
              <ul className="space-y-3 text-sm text-gray-400">
                <li><a href="/" className="hover:text-white transition-colors">Home</a></li>
                <li><a href="/catalog" className="hover:text-white transition-colors">Catalog</a></li>
                <li><a href="/custom-plan" className="hover:text-white transition-colors">Customise Your Design</a></li>
              </ul>
            </div>
            
            {/* Column 3: Contact Info */}
            <div id="contact-section">
              <h4 className="font-semibold mb-4 text-lg">Contact</h4>
              <ul className="space-y-3 text-sm text-gray-400">
                <li className="flex items-center space-x-2">
                  <Envelope size={16} weight="regular" className="shrink-0" />
                  <span>Email: info@lumaro_nexus.com</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Globe size={16} weight="regular" className="shrink-0" />
                  <span>Website: www.lumaro_nexus.com</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Lifebuoy size={16} weight="regular" className="shrink-0" />
                  <span>Support: help@lumaro_nexus.com</span>
                </li>
                <li className="flex items-center space-x-2">
                  <DeviceMobile size={16} weight="regular" className="shrink-0" />
                  <span>WhatsApp: +250791756343</span>
                </li>
                <li className="flex items-center space-x-2">
                  <MapPin size={16} weight="regular" className="shrink-0" />
                  <span>Location: Kigali Rwanda</span>
                </li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-12 pt-8 text-center">
            <p className="text-gray-400 text-sm">&copy; 2025 Lumaro Nexus House Plans. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}