'use client';
import React, { forwardRef } from 'react';
import Image from 'next/image';
import {
  ChatCircle,
  Envelope,
  Globe,
  Lifebuoy,
  Phone,
  MapPin,
} from '@phosphor-icons/react';

const Footer = forwardRef<HTMLElement>(function Footer(_, ref) {
  return (
    <footer ref={ref} id="contact" className="bg-gray-900 text-white py-16">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-lg flex items-center justify-center shadow-sm overflow-hidden">
                <Image
                  src="/image/logo_images/Unex_log.png"
                  alt="Lumaro Nexus Logo"
                  width={48}
                  height={48}
                  className="object-contain"
                />
              </div>
              <span className="text-xl font-display font-semibold">
                <span className="text-amber-500">Lumaro</span>
                <span className="text-white"> Nexus</span>
              </span>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed mb-4">
              Based in Kigali since 2014. We draw house plans and construction
              documents that fit local plots, budgets, and Rwanda housing standards.
            </p>
            <a
              href="https://wa.me/250791756343"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex w-10 h-10 bg-gray-800 rounded-lg items-center justify-center hover:bg-amber-700 transition-colors"
              aria-label="WhatsApp"
            >
              <ChatCircle size={20} weight="fill" className="text-white" />
            </a>
          </div>

          <div>
            <h4 className="font-semibold mb-4 text-lg">Explore</h4>
            <ul className="space-y-3 text-sm text-gray-400">
              <li><a href="/" className="hover:text-white transition-colors">Home</a></li>
              <li><a href="/catalog" className="hover:text-white transition-colors">Catalog</a></li>
              <li><a href="/custom-plan" className="hover:text-white transition-colors">Custom design</a></li>
              <li><a href="/about" className="hover:text-white transition-colors">About us</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4 text-lg">Rwanda housing</h4>
            <ul className="space-y-3 text-sm text-gray-400">
              <li>
                <a
                  href="https://rha.gov.rw/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors"
                >
                  Rwanda Housing Authority
                </a>
              </li>
              <li>
                <a
                  href="https://bpmis.gov.rw/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors"
                >
                  Building permits (BPMIS)
                </a>
              </li>
              <li>
                <a
                  href="https://www.mininfra.gov.rw/1/urbanisation-human-settlement-and-housing-development"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors"
                >
                  Building Code &amp; Urban Planning
                </a>
              </li>
              <li>
                <a
                  href="https://www.rha.gov.rw/publications"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors"
                >
                  RHA laws &amp; guidelines
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4 text-lg">Legal</h4>
            <ul className="space-y-3 text-sm text-gray-400">
              <li><a href="/privacy" className="hover:text-white transition-colors">Privacy Policy</a></li>
              <li><a href="/terms" className="hover:text-white transition-colors">Terms &amp; Conditions</a></li>
              <li><a href="/tos" className="hover:text-white transition-colors">Terms of Service</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4 text-lg">Contact</h4>
            <ul className="space-y-3 text-sm text-gray-400">
              <li className="flex items-center space-x-2">
                <Envelope size={16} weight="regular" className="shrink-0" />
                <a href="mailto:info@lumaronexus.com" className="hover:text-white transition-colors">
                  info@lumaronexus.com
                </a>
              </li>
              <li className="flex items-center space-x-2">
                <Globe size={16} weight="regular" className="shrink-0" />
                <a href="https://www.lumaronexus.com" className="hover:text-white transition-colors">
                  www.lumaronexus.com
                </a>
              </li>
              <li className="flex items-center space-x-2">
                <Lifebuoy size={16} weight="regular" className="shrink-0" />
                <a href="mailto:help@lumaronexus.com" className="hover:text-white transition-colors">
                  help@lumaronexus.com
                </a>
              </li>
              <li className="flex items-center space-x-2">
                <Phone size={16} weight="fill" className="shrink-0 text-amber-500" />
                <a href="tel:+250791756343" className="hover:text-white transition-colors">
                  +250 791 756 343
                </a>
              </li>
              <li className="flex items-center space-x-2">
                <MapPin size={16} weight="regular" className="shrink-0" />
                <span>Kigali, Rwanda</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-12 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <p className="text-gray-400 text-sm">
            &copy; {new Date().getFullYear()} Lumaro Nexus House Plans. All rights reserved.
          </p>
          <div className="flex flex-wrap justify-center gap-4 text-sm text-gray-500">
            <a href="/privacy" className="hover:text-white transition-colors">Privacy</a>
            <a href="/terms" className="hover:text-white transition-colors">Terms</a>
            <a href="/tos" className="hover:text-white transition-colors">ToS</a>
          </div>
        </div>
      </div>
    </footer>
  );
});

export default Footer;
