'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import HouseProjectsSection from '../components/HouseProjectsSection';
import OrdersSection from '../components/OrdersSection';
import CustomOrderSection from '../components/CustomOrderSection';

export default function AdminDashboardPage() {
  const [adminName, setAdminName] = useState('Admin');
  const router = useRouter();

  // Optional: fetch admin info from token/localStorage
  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      router.push('/login');
    } else {
      setAdminName('John Doe');
    }
  }, [router]);


  const [activeSection, setActiveSection] = useState('houseProjects');

  const sections = [
    { key: 'houseProjects', label: 'House Projects' },
    { key: 'orders', label: 'Orders' },
    { key: 'customOrders', label: 'Custom Orders' },
    { key: 'users', label: 'Users' },
  ];

  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-lg p-6 flex flex-col">
        <h2 className="text-xl font-bold text-gray-800 mb-8">Admin Dashboard</h2>
        <nav className="flex flex-col gap-4">
          {sections.map((section) => (
            <button
              key={section.key}
              onClick={() => setActiveSection(section.key)}
              className={`text-left px-4 py-2 rounded-lg transition ${
                activeSection === section.key
                  ? 'bg-blue-100 text-blue-700 font-semibold'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              {section.label}
            </button>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8">
        {/* Welcome Banner */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800">
            Welcome, <span className="text-blue-600">{adminName}</span>!
          </h1>
          <p className="text-gray-600 mt-2">
            Manage your platform efficiently from here.
          </p>
        </div>

        {/* Section Content */}
          <div>
  {activeSection === 'houseProjects' && <HouseProjectsSection />}
  {activeSection === 'orders' && <OrdersSection />}
  {activeSection === 'customOrders' && <CustomOrderSection />}
  {activeSection === 'users' && (
    <div className="bg-white p-6 rounded-lg shadow mb-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">Users</h2>
      <p className="text-gray-600">Manage registered users, view profiles, or deactivate accounts.</p>
    </div>
  )}
</div>
      </main>
    </div>
  );
}
