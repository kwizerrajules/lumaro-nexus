'use client';
import React, { useRef } from 'react';
import Image from 'next/image';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import {
  Buildings,
  MapPin,
  Handshake,
  Blueprint,
} from '@phosphor-icons/react';

export default function AboutPage() {
  const footerRef = useRef<HTMLElement>(null);

  const scrollToContact = () => {
    footerRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const pillars = [
    {
      icon: Blueprint,
      title: 'Plans for real plots',
      text: 'Layouts that fit local sites, materials, and how people actually build here — from compact homes to multi-floor houses.',
    },
    {
      icon: Buildings,
      title: 'Clear construction docs',
      text: 'Drawings prepared with the Rwanda Building Code and permitting in mind, so you can talk to your builder and One Stop Centre with confidence.',
    },
    {
      icon: Handshake,
      title: 'Custom when you need it',
      text: 'Start from a catalog plan or brief your own rooms, floors, and layout for the land you have.',
    },
    {
      icon: MapPin,
      title: 'Rooted in Kigali',
      text: 'We work from Rwanda — fair pricing, WhatsApp support, and practical guidance for clients at home and nearby.',
    },
  ];

  return (
    <div className="min-h-screen surface-atmosphere">
      <Header onAuthSuccess={() => {}} onContactClick={scrollToContact} />

      <section className="relative bg-neutral-950 text-white py-16 md:py-24 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_30%_40%,rgba(217,119,6,0.18),transparent_55%)]" />
        <div className="container mx-auto px-4 max-w-3xl text-center relative z-10">
          <p className="text-amber-400 text-xs font-semibold tracking-[0.2em] uppercase mb-3">
            About us
          </p>
          <h1 className="font-display text-4xl md:text-6xl font-semibold mb-4">
            Lumaro Nexus
          </h1>
          <p className="text-neutral-300 text-base md:text-lg leading-relaxed">
            Quality designs. Clear construction documents. Compliant with Rwanda
            housing standards. Fair pricing.
          </p>
        </div>
      </section>

      <section className="container mx-auto px-4 py-14 md:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center max-w-6xl mx-auto">
          <div>
            <h2 className="font-display text-3xl md:text-4xl font-semibold text-neutral-900 mb-4">
              Our story
            </h2>
            <div className="space-y-4 text-neutral-600 leading-relaxed">
              <p>
                Since 2014, Lumaro Nexus has drawn practical house plans for real Rwanda
                sites — small plots, local materials, and budgets people can actually work with.
              </p>
              <p>
                You get more than a floor plan: construction documents you can take to your
                builder, engineer, and District One Stop Centre when you apply for a permit.
              </p>
              <p>
                Browse the catalog or brief a custom plan — either way, the aim is a home
                that fits your land and how you want to live.
              </p>
            </div>
          </div>
          <div className="relative aspect-[4/3] overflow-hidden bg-white border border-brand-line flex items-center justify-center">
            <Image
              src="/image/logo_images/Unex_log.png"
              alt="Lumaro Nexus"
              width={220}
              height={220}
              className="object-contain"
            />
          </div>
        </div>
      </section>

      <section className="bg-white/80 border-y border-brand-line py-14 md:py-20">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center mb-10">
            <h2 className="font-display text-3xl md:text-4xl font-semibold text-neutral-900 mb-3">
              What we stand for
            </h2>
            <p className="text-neutral-600 max-w-2xl mx-auto">
              Good drawings, honest prices, and respect for local rules and the people who will live in the house.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {pillars.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.title}
                  className="bg-brand-surface border border-brand-line p-6 flex gap-4"
                >
                  <div className="shrink-0 w-12 h-12 bg-amber-700/10 flex items-center justify-center">
                    <Icon size={24} weight="fill" className="text-amber-800" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-neutral-900 mb-1">{item.title}</h3>
                    <p className="text-sm text-neutral-600 leading-relaxed">{item.text}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4 py-14 md:py-16">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="font-display text-3xl font-semibold text-neutral-900 mb-3">
            Looking for a plan?
          </h2>
          <p className="text-neutral-600 mb-8">
            Browse ready plans or send a custom brief. We&apos;ll help you get to
            buildable drawings you can use on site.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <a href="/catalog" className="btn-secondary text-center">
              Browse catalog
            </a>
            <a href="/custom-plan" className="btn-primary text-center">
              Request a custom plan
            </a>
          </div>
        </div>
      </section>

      <Footer ref={footerRef} />
    </div>
  );
}
