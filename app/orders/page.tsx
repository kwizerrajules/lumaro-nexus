'use client';
import React, { useEffect, useState, useRef } from 'react';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import Newsletter from '@/components/Newsletter';
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
  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showSidebar, setShowSidebar] = useState(false);
  const footerRef = useRef<HTMLDivElement>(null);

  const scrollToContact = () => {
    footerRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleFilterChange = (newFilters: any) => {
    console.log("Filters applied:", newFilters);
  };

  const fetchEnquiries = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("userAccessToken");

      const response = await axios.get("/api/enquiries", {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Filter out invalid IDs
      const cleaned = response.data.filter(
        (e: Enquiry) => e.enquiry_id && e.enquiry_id !== "[object Object]"
      );

      setEnquiries(cleaned);
    } catch (err) {
      setError("Failed to load enquiries.");
    } finally {
      setLoading(false);
    }
  };

  const deleteEnquiry = async (id: string) => {
    if (!confirm("Are you sure you want to delete this enquiry?")) return;

    try {
      const token = localStorage.getItem("userAccessToken");
      await axios.delete(`/api/enquiries/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setEnquiries((prev) => prev.filter((e) => e.enquiry_id !== id));
    } catch (err) {
      console.error(err);
      alert("Failed to delete enquiry.");
    }
  };

  useEffect(() => {
    fetchEnquiries();
  }, []);

  if (loading) return <p className="text-center mt-10">Loading enquiries...</p>;
  if (error) return <p className="text-center mt-10 text-red-500">{error}</p>;

  return (
    <div className="min-h-screen bg-white">
      <Header
        onFilterToggle={() => setShowSidebar(!showSidebar)}
        onAuthSuccess={() => {}}
        onContactClick={scrollToContact}
      />

      {/* Hero Section */}
      <section className="bg-black text-white py-20">
        <div className="container mx-auto px-4 text-center max-w-3xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">My Enquiries</h1>
          <p className="text-lg text-gray-300 mb-8">
            Manage your submitted house project enquiries here
          </p>
        </div>
      </section>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-bold text-gray-900">
            All Enquiries ({enquiries.length})
          </h2>
          <button
            onClick={() => setShowSidebar(!showSidebar)}
            className="bg-gray-900 text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-800 transition-colors"
          >
            Filters
          </button>
        </div>

        {/* Enquiries Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {enquiries.map((item) => (
            <div key={item.enquiry_id} className="border rounded-lg shadow p-4 bg-white">
              <div className="w-full h-48 relative mb-3">
                <Image
                  src={item.thumbnail}
                  alt={item.project_title}
                  fill
                  className="object-cover rounded"
                />
              </div>
              <h2 className="text-lg font-semibold">{item.project_title}</h2>
              <p className="text-sm text-gray-600">Price: ${item.project_price}</p>
              <p className="text-sm">Bedrooms: {item.bedrooms}</p>
              <p className="text-sm">Bathrooms: {item.bathrooms}</p>
              <p className="text-sm">Floors: {item.floors}</p>
              <p className="text-sm">Area: {item.areaSqFt} sqft</p>

              <div className="flex gap-2 mt-3">
                <button
                  className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                  onClick={() => alert("Update functionality not implemented yet")}
                >
                  Update
                </button>
                <button
                  className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                  onClick={() => deleteEnquiry(item.enquiry_id)}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <Newsletter />

      <footer ref={footerRef} className="bg-gray-900 text-white py-16">
        {/* Footer content */}
      </footer>

      {showSidebar && (
        <div className="fixed right-0 top-0 h-full z-50">
          <Sidebar onFilterChange={handleFilterChange} onClose={() => setShowSidebar(false)} />
        </div>
      )}
    </div>
  );
}
