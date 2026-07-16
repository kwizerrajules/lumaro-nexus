'use client';
import React, { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Newsletter from '@/components/Newsletter';
import AuthModal from '@/components/AuthModal';
import axios from 'axios';
import Image from 'next/image';

interface Enquiry {
  enquiry_id: string;
  project_title: string;
  project_price: string;
  bedrooms: number;
  bathrooms: number;
  floors: number;
  areaSqFt: number;
  description: string;
  thumbnail: string;
}

export default function UserEnquiriesPage() {
  const router = useRouter();
  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authed, setAuthed] = useState(false);
  const footerRef = useRef<HTMLElement>(null);

  const scrollToContact = () => {
    footerRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchEnquiries = async () => {
    const token = localStorage.getItem('userAccessToken');
    if (!token) {
      setAuthed(false);
      setShowAuthModal(true);
      setLoading(false);
      return;
    }

    setAuthed(true);
    try {
      setLoading(true);
      const response = await axios.get('/api/enquiries', {
        headers: { Authorization: `Bearer ${token}` },
      });

      const cleaned = (response.data || []).filter(
        (e: Enquiry) => e.enquiry_id && e.enquiry_id !== '[object Object]'
      );
      setEnquiries(cleaned);
      setError('');
    } catch (err: any) {
      if (err?.response?.status === 401 || err?.response?.status === 403) {
        localStorage.removeItem('userAccessToken');
        setAuthed(false);
        setShowAuthModal(true);
        setError('Please sign in to view your enquiries.');
      } else {
        setError('Failed to load enquiries.');
      }
    } finally {
      setLoading(false);
    }
  };

  const deleteEnquiry = async (id: string) => {
    if (!confirm('Are you sure you want to delete this enquiry?')) return;

    try {
      const token = localStorage.getItem('userAccessToken');
      await axios.delete(`/api/enquiries/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setEnquiries((prev) => prev.filter((e) => e.enquiry_id !== id));
    } catch (err) {
      console.error(err);
      alert('Failed to delete enquiry.');
    }
  };

  useEffect(() => {
    fetchEnquiries();
  }, []);

  const handleAuthSuccess = () => {
    setShowAuthModal(false);
    setAuthed(true);
    fetchEnquiries();
  };

  return (
    <div className="min-h-screen bg-white">
      <Header
        onFilterToggle={() => {}}
        onAuthSuccess={handleAuthSuccess}
        onContactClick={scrollToContact}
      />

      <section className="bg-black text-white py-20">
        <div className="container mx-auto px-4 text-center max-w-3xl">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">My Enquiries</h1>
          <p className="text-lg text-gray-300 mb-8">
            Manage your submitted house project enquiries here
          </p>
        </div>
      </section>

      <div className="container mx-auto px-4 py-8">
        {!authed && !loading ? (
          <div className="text-center py-16">
            <h2 className="text-2xl font-bold text-gray-900 mb-3">Sign in required</h2>
            <p className="text-gray-600 mb-6">
              Please sign in to view and manage your enquiries.
            </p>
            <button onClick={() => setShowAuthModal(true)} className="btn-primary">
              Sign In
            </button>
          </div>
        ) : loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900" />
          </div>
        ) : error ? (
          <p className="text-center mt-10 text-red-500">{error}</p>
        ) : (
          <>
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900">
                All Enquiries ({enquiries.length})
              </h2>
            </div>

            {enquiries.length === 0 ? (
              <div className="text-center py-16">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No enquiries yet</h3>
                <p className="text-gray-600 mb-6">Browse the catalog and submit an enquiry.</p>
                <a href="/catalog" className="btn-secondary inline-block">
                  Browse Catalog
                </a>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {enquiries.map((item) => (
                  <div
                    key={item.enquiry_id}
                    className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden"
                  >
                    <div className="w-full h-48 relative">
                      <Image
                        src={item.thumbnail || '/image/features-template.jpg'}
                        alt={item.project_title}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="p-4">
                      <h2 className="text-lg font-semibold text-gray-900 mb-2">
                        {item.project_title}
                      </h2>
                      <p className="text-sm text-gray-600 mb-1">
                        Price: ${item.project_price}
                      </p>
                      <p className="text-sm text-gray-600">
                        {item.bedrooms} bed · {item.bathrooms} bath · {item.floors} floor
                        {item.floors !== 1 ? 's' : ''} · {item.areaSqFt} sqft
                      </p>
                      <button
                        className="mt-4 w-full px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-semibold"
                        onClick={() => deleteEnquiry(item.enquiry_id)}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      <Newsletter />
      <Footer ref={footerRef} />

      {showAuthModal && (
        <AuthModal
          isOpen={showAuthModal}
          onClose={() => {
            setShowAuthModal(false);
            if (!localStorage.getItem('userAccessToken')) {
              router.push('/');
            }
          }}
          onAuthSuccess={handleAuthSuccess}
        />
      )}
    </div>
  );
}
