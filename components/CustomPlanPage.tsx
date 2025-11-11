'use client';
import React, { useState } from 'react';
import Header from './Header';
import Newsletter from './Newsletter';
import CustomPlanBuilder from './CustomPlanBuilder';
import ConstructionCalculator from './ConstructionCalculator';

export default function CustomPlanPage() {
  const [showSidebar, setShowSidebar] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header onFilterToggle={() => setShowSidebar(!showSidebar)} onAuthSuccess={function (userData: any): void {
        throw new Error('Function not implemented.');
      } } onContactClick={function (): void {
        throw new Error('Function not implemented.');
      } } />
      
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-gray-900 to-black text-white py-16">
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
            <ConstructionCalculator />
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
                <span className="text-2xl">📞</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Customer Service</h3>
              <p className="text-gray-600 mb-2">
                Contact us at <strong>info@maramani.com</strong>
              </p>
              <p className="text-gray-600 mb-2">
                Phone: <strong>+1 408 540 0400</strong>
              </p>
              <p className="text-gray-600 text-sm">
                Monday to Friday 9:00 AM to 4:00 PM GMT +3
              </p>
            </div>

            {/* Secure Payment */}
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">💳</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Secure Payment</h3>
              <p className="text-gray-600">
                We accept Credit/Debit/Prepaid Cards, Apple Pay, Bank Transfers, and PayPal.
              </p>
            </div>

            {/* Refer a Friend */}
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">👥</span>
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

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
                  <span className="text-gray-900 font-bold text-lg">M</span>
                </div>
                <span className="text-xl font-bold">Maramani</span>
              </div>
              <p className="text-gray-400 text-sm leading-relaxed">
                Since 2014, providing affordable, African market-tailored designs with premium 
                construction documents and custom design options.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4 text-lg">Shop</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Best Sellers</a></li>
                <li><a href="#" className="hover:text-white transition-colors">By Size</a></li>
                <li><a href="#" className="hover:text-white transition-colors">By Style</a></li>
                <li><a href="#" className="hover:text-white transition-colors">By Budget</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Custom Plan</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4 text-lg">Support</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Frequently Asked Questions</a></li>
                <li><a href="#" className="hover:text-white transition-colors">For Affiliates</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Refer a friend</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Terms and Conditions</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4 text-lg">Contact</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>📧 Email: info@maramani.com</li>
                <li>🌐 Website: www.maramani.com</li>
                <li>🛟 Support: help@maramani.com</li>
                <li>📱 WhatsApp: +1234567890</li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 text-center">
            <p className="text-gray-400 text-sm">
              &copy; 2024 Maramani House Plans. All rights reserved. | Privacy Policy | Terms of Service
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}