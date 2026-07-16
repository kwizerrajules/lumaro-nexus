'use client';
import React, { useState, useRef } from 'react';
import {
  Phone,
  CreditCard,
  Users,
} from '@phosphor-icons/react';
import Header from './Header';
import Footer from './Footer';
import Newsletter from './Newsletter';
import CustomPlanBuilder from './CustomPlanBuilder';

export default function CustomPlanPage() {
  const [showSidebar, setShowSidebar] = useState(false);
  const footerRef = useRef<HTMLElement>(null);

  const handleContactClick = () => {
    footerRef.current?.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    });
  };

  const handleAuthSuccess = (userData: any) => {
    console.log('User authenticated:', userData);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header
        onFilterToggle={() => setShowSidebar(!showSidebar)}
        onAuthSuccess={handleAuthSuccess}
        onContactClick={handleContactClick}
      />

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

      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <CustomPlanBuilder />
          </div>
          <div className="lg:col-span-1" />
        </div>
      </div>

      <section className="bg-white py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <div className="text-center">
              <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Phone size={28} weight="fill" className="text-amber-800" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Customer Service</h3>
              <p className="text-gray-600 mb-2">
                Contact us at <strong>info@lumaronexus.com</strong>
              </p>
              <p className="text-gray-600 mb-2">
                Phone: <strong>+250 791 756 343</strong>
              </p>
              <p className="text-gray-600 text-sm">
                Monday to Friday 9:00 AM to 4:00 PM GMT +3
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CreditCard size={28} weight="fill" className="text-blue-700" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Secure Payment</h3>
              <p className="text-gray-600">
                We accept Credit/Debit/Prepaid Cards, Apple Pay, Bank Transfers, and PayPal.
              </p>
            </div>

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

      <Newsletter />
      <Footer ref={footerRef} />
    </div>
  );
}
