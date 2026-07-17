'use client';
import React, { useRef } from 'react';
import Image from 'next/image';
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
  const footerRef = useRef<HTMLElement>(null);

  const handleContactClick = () => {
    footerRef.current?.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    });
  };

  const handleAuthSuccess = (_userData: any) => {};

  return (
    <div className="min-h-screen surface-atmosphere">
      <Header
        onAuthSuccess={handleAuthSuccess}
        onContactClick={handleContactClick}
      />

      <section className="relative min-h-[42vh] sm:min-h-[48vh] flex items-end overflow-hidden bg-neutral-950 text-white">
        <div className="absolute inset-0">
          <Image
            src="/image/features-template.jpg"
            alt=""
            fill
            className="object-cover object-[center_42%] md:object-center animate-hero-reveal"
            sizes="100vw"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/65 to-black/35" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_30%_70%,rgba(217,119,6,0.16),transparent_55%)]" />
        </div>

        <div className="container mx-auto px-4 relative z-10 pb-10 md:pb-14 pt-28">
          <div className="max-w-2xl">
            <p className="text-amber-400 font-display text-sm uppercase tracking-[0.2em] mb-3">
              Custom design
            </p>
            <h1 className="font-display text-3xl sm:text-4xl md:text-5xl font-semibold leading-tight mb-4">
              Brief a custom house plan
            </h1>
            <p className="text-neutral-200 text-sm sm:text-base md:text-lg leading-relaxed max-w-xl">
              Tell us the rooms, floors, and plot needs. We prepare construction
              documents aligned with Rwanda housing standards — ready for your
              builder and permitting.
            </p>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-8 md:py-12">
        <div className="max-w-3xl mx-auto">
          <CustomPlanBuilder />
        </div>
      </div>

      <section className="bg-white/80 border-t border-brand-line py-12 md:py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <div className="text-center">
              <div className="w-14 h-14 bg-amber-700/10 flex items-center justify-center mx-auto mb-4">
                <Phone size={26} weight="fill" className="text-amber-800" />
              </div>
              <h3 className="font-display text-xl font-semibold text-neutral-900 mb-3">
                Customer Service
              </h3>
              <p className="text-neutral-600 text-sm mb-1">
                Contact us at <strong>info@lumaronexus.com</strong>
              </p>
              <p className="text-neutral-600 text-sm mb-1">
                Phone: <strong>+250 787 369 630</strong>
              </p>
              <p className="text-neutral-500 text-xs">
                Monday to Friday 9:00 AM to 4:00 PM GMT +3
              </p>
            </div>

            <div className="text-center">
              <div className="w-14 h-14 bg-amber-700/10 flex items-center justify-center mx-auto mb-4">
                <CreditCard size={26} weight="fill" className="text-amber-800" />
              </div>
              <h3 className="font-display text-xl font-semibold text-neutral-900 mb-3">
                Secure Payment
              </h3>
              <p className="text-neutral-600 text-sm">
                We accept cards, bank transfers, and other secure payment options
                when your custom plan is ready.
              </p>
            </div>

            <div className="text-center">
              <div className="w-14 h-14 bg-amber-700/10 flex items-center justify-center mx-auto mb-4">
                <Users size={26} weight="fill" className="text-amber-800" />
              </div>
              <h3 className="font-display text-xl font-semibold text-neutral-900 mb-3">
                Refer a Friend
              </h3>
              <p className="text-neutral-600 text-sm">
                Tell friends about Lumaro Nexus plans and share promotional offers.
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
