'use client';
import React, { useState, useEffect } from 'react';
import {
  User as UserIcon,
  MagnifyingGlass,
  List,
  X,
} from '@phosphor-icons/react';
import AuthModal from './AuthModal';
import SearchModal from './SearchModal';
import Image from 'next/image';
import { mapProjectForSearch } from '@/utils/brand';

interface HeaderProps {
  /** @deprecated Filters live in the catalog left panel / mobile drawer. */
  onFilterToggle?: () => void;
  onAuthSuccess: (userData: any) => void;
  onContactClick: () => void;
}

interface AuthUser {
  id: string;
  email: string;
  fullName: string;
  country: string;
}

const Header: React.FC<HeaderProps> = ({ onAuthSuccess, onContactClick }) => {
  const [announcements, setAnnouncements] = useState<string[]>([]);
  const [currentAnnouncement, setCurrentAnnouncement] = useState(0);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [sampleHouses, setSampleHouses] = useState<any[]>([]);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const fetchHouses = async () => {
      try {
        const { fetchHouseProjects } = await import('@/utils/productCache');
        const items = await fetchHouseProjects({ limit: 100 });
        setSampleHouses(items.map(mapProjectForSearch));
      } catch (err) {
        console.error('Failed to fetch houses:', err);
      }
    };
    fetchHouses();
  }, []);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const savedUser = localStorage.getItem('lumaro_user');
    if (savedUser) setUser(JSON.parse(savedUser));
  }, []);

  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        const response = await fetch('/api/announcements');
        const data = await response.json();
        setAnnouncements(data);
      } catch {
        setAnnouncements([
          'New house plans added regularly',
          'Ask about custom modifications on WhatsApp',
          'Construction documents included with every plan',
        ]);
      }
    };
    fetchAnnouncements();
  }, []);

  useEffect(() => {
    if (announcements.length === 0) return;
    const interval = setInterval(() => {
      setCurrentAnnouncement((prev) => (prev + 1) % announcements.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [announcements]);

  const handleAuthSuccess = (userData: AuthUser) => {
    setUser(userData);
    localStorage.setItem('lumaro_user', JSON.stringify(userData));
    setShowAuthModal(false);
    onAuthSuccess(userData);
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('lumaro_user');
    localStorage.removeItem('userAccessToken');
    localStorage.removeItem('userRefreshToken');
    setShowUserMenu(false);
  };

  const handleNavLinkClick = (callback?: () => void) => {
    setIsMenuOpen(false);
    if (callback) callback();
  };

  return (
    <header
      className={`bg-white border-b border-brand-line transition-all duration-300 ${
        isScrolled ? 'fixed top-0 left-0 right-0 z-50 shadow-md' : 'relative'
      }`}
    >
      <div className="bg-neutral-900 text-white py-2.5">
        <div className="container mx-auto px-4 flex justify-center items-center">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-soft-pulse" />
            <span className="text-xs sm:text-sm font-medium tracking-wide">
              {announcements[currentAnnouncement]}
            </span>
          </div>
        </div>
      </div>

      <nav className="bg-white py-3.5">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            <a href="/" className="flex items-center gap-3 group">
              <div className="w-11 h-11 overflow-hidden transition-transform duration-300 group-hover:scale-105">
                <Image
                  src="/image/logo_images/Unex_log.png"
                  alt="Lumaro Nexus Logo"
                  width={44}
                  height={44}
                  className="object-contain"
                  priority
                />
              </div>
              <div className="flex flex-col leading-none">
                <span className="font-display text-2xl font-semibold text-amber-700 tracking-tight">
                  Lumaro
                </span>
                <span className="text-[11px] font-semibold tracking-[0.28em] text-neutral-700 uppercase mt-0.5">
                  Nexus
                </span>
              </div>
            </a>

            <div className="hidden lg:flex items-center gap-8">
              {[
                { href: '/', label: 'Home' },
                { href: '/catalog', label: 'Catalog' },
                { href: '/custom-plan', label: 'Custom Plans' },
              ].map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className="text-neutral-700 hover:text-neutral-900 font-medium text-sm uppercase tracking-wide border-b-2 border-transparent hover:border-amber-600 py-1 transition-colors"
                >
                  {link.label}
                </a>
              ))}
              <a
                href="#contact"
                onClick={(e) => {
                  e.preventDefault();
                  onContactClick();
                }}
                className="text-neutral-700 hover:text-neutral-900 font-medium text-sm uppercase tracking-wide border-b-2 border-transparent hover:border-amber-600 py-1 transition-colors"
              >
                Contact
              </a>
            </div>

            <div className="flex items-center gap-2 sm:gap-3">
              <button
                type="button"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="p-2 text-neutral-600 hover:text-neutral-900 lg:hidden"
                aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
              >
                {isMenuOpen ? <X size={24} weight="bold" /> : <List size={24} weight="bold" />}
              </button>

              {user ? (
                <div className="relative hidden lg:block">
                  <button
                    type="button"
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="flex items-center gap-2 btn-secondary py-2 px-4 text-sm"
                  >
                    <UserIcon size={18} weight="fill" />
                    <span className="hidden sm:inline max-w-[120px] truncate">
                      {user.fullName}
                    </span>
                  </button>
                  {showUserMenu && (
                    <div className="absolute right-0 top-full mt-2 w-48 bg-white shadow-brand border border-brand-line z-50 py-2">
                      <div className="px-4 py-2 border-b border-brand-line">
                        <p className="text-sm font-medium text-neutral-900">{user.fullName}</p>
                        <p className="text-sm text-neutral-500 truncate">{user.email}</p>
                      </div>
                      <a href="/orders" className="block px-4 py-2 text-sm text-neutral-700 hover:bg-stone-50">
                        My Orders
                      </a>
                      <a href="/my-custom-plans" className="block px-4 py-2 text-sm text-neutral-700 hover:bg-stone-50">
                        Custom Plans
                      </a>
                      <button
                        type="button"
                        onClick={handleLogout}
                        className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-stone-50"
                      >
                        Sign Out
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setShowAuthModal(true)}
                  className="hidden lg:inline-flex btn-primary py-2 px-4 text-sm"
                >
                  Sign In
                </button>
              )}

              <button
                type="button"
                onClick={() => setShowSearchModal(true)}
                className="p-2 text-neutral-600 hover:text-amber-700 transition-colors"
                aria-label="Search plans"
              >
                <MagnifyingGlass size={22} weight="bold" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div
        className={`lg:hidden transition-all duration-300 overflow-hidden ${
          isMenuOpen ? 'max-h-96 opacity-100 py-2 border-t border-brand-line' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="container mx-auto px-4 flex flex-col gap-1">
          <a href="/" onClick={() => handleNavLinkClick()} className="px-4 py-2.5 text-neutral-700 hover:bg-stone-50 font-medium">
            Home
          </a>
          <a href="/catalog" onClick={() => handleNavLinkClick()} className="px-4 py-2.5 text-neutral-700 hover:bg-stone-50 font-medium">
            Catalog
          </a>
          <a href="/custom-plan" onClick={() => handleNavLinkClick()} className="px-4 py-2.5 text-neutral-700 hover:bg-stone-50 font-medium">
            Custom Plans
          </a>
          <a
            href="#contact"
            onClick={(e) => {
              e.preventDefault();
              handleNavLinkClick(onContactClick);
            }}
            className="px-4 py-2.5 text-neutral-700 hover:bg-stone-50 font-medium"
          >
            Contact
          </a>
          <div className="border-t border-brand-line my-2" />
          {user ? (
            <>
              <div className="px-4 py-2 text-sm font-medium text-neutral-900 flex items-center gap-2">
                <UserIcon size={16} weight="fill" />
                {user.fullName}
              </div>
              <a href="/orders" onClick={() => handleNavLinkClick()} className="px-4 py-2 text-sm text-neutral-700 hover:bg-stone-50">
                My Orders
              </a>
              <a href="/my-custom-plans" onClick={() => handleNavLinkClick()} className="px-4 py-2 text-sm text-neutral-700 hover:bg-stone-50">
                Custom Plans
              </a>
              <button
                type="button"
                onClick={() => handleNavLinkClick(handleLogout)}
                className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-stone-50"
              >
                Sign Out
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={() => handleNavLinkClick(() => setShowAuthModal(true))}
              className="btn-primary mx-4 my-1"
            >
              Sign In
            </button>
          )}
        </div>
      </div>

      {showAuthModal && (
        <AuthModal
          isOpen={showAuthModal}
          onClose={() => setShowAuthModal(false)}
          onAuthSuccess={handleAuthSuccess}
        />
      )}

      {showSearchModal && (
        <SearchModal
          isOpen={showSearchModal}
          onClose={() => setShowSearchModal(false)}
          houses={sampleHouses}
        />
      )}
    </header>
  );
};

export default Header;
