'use client';
import React, { useRef } from 'react';
import Header from './Header';
import Footer from './Footer';

interface LegalPageLayoutProps {
  title: string;
  lastUpdated: string;
  children: React.ReactNode;
}

export default function LegalPageLayout({
  title,
  lastUpdated,
  children,
}: LegalPageLayoutProps) {
  const footerRef = useRef<HTMLElement>(null);

  const scrollToContact = () => {
    footerRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-white">
      <Header
        onFilterToggle={() => {}}
        onAuthSuccess={() => {}}
        onContactClick={scrollToContact}
      />

      <section className="bg-black text-white py-16">
        <div className="container mx-auto px-4 max-w-3xl text-center">
          <h1 className="text-3xl md:text-5xl font-bold mb-4">{title}</h1>
          <p className="text-gray-300 text-sm md:text-base">
            Last updated: {lastUpdated}
          </p>
        </div>
      </section>

      <main className="container mx-auto px-4 py-12 max-w-3xl">
        <article className="prose-legal space-y-8 text-gray-700 leading-relaxed">
          {children}
        </article>

        <nav className="mt-12 pt-8 border-t border-gray-200 flex flex-wrap gap-4 text-sm">
          <a href="/privacy" className="text-yellow-800 hover:text-yellow-900 font-medium">
            Privacy Policy
          </a>
          <a href="/terms" className="text-yellow-800 hover:text-yellow-900 font-medium">
            Terms &amp; Conditions
          </a>
          <a href="/tos" className="text-yellow-800 hover:text-yellow-900 font-medium">
            Terms of Service
          </a>
        </nav>
      </main>

      <Footer ref={footerRef} />
    </div>
  );
}

export function LegalSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <h2 className="text-xl font-bold text-gray-900 mb-3">{title}</h2>
      <div className="space-y-3 text-[15px]">{children}</div>
    </section>
  );
}
