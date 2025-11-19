'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import HouseProjectsSection from '../components/HouseProjectsSection';
import OrdersSection from '../components/OrdersSection';
import CustomOrderSection from '../components/CustomOrderSection';
import UsersSection from '../components/UsersSection';
import ContactUsSection from '../components/ContactUsSections';
import {jwtDecode} from 'jwt-decode';
import useNavigate from 'react'


export default function AdminDashboardPage() {

  useEffect(() => {
    const token = localStorage.getItem('accessToken')
    const refreshToken = localStorage.getItem('refreshToken')

    if(!token || !refreshToken) {
      window.location.href='/login'
    }
  }, [])
  
  const [adminName, setAdminName] = useState('Admin');
  const [token, setToken] = useState("");
  
  const handleLogout = async () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken'),
    window.location.href = '/login'
  }

  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      router.push('/login');
    } else {
      const decodedPayload: any = jwtDecode(token);
      setAdminName(decodedPayload.email);
    }
  }, [router]);


  const [activeSection, setActiveSection] = useState('houseProjects');

  const sections = [
    { key: 'houseProjects', label: 'House Projects' },
    { key: 'orders', label: 'Orders' },
    { key: 'customOrders', label: 'Custom Orders' },
    { key: 'users', label: 'Users' },
    { key: 'contact_us', label: 'Contacts' },
    {key: 'profile', label: 'Profile'}
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
  {activeSection === 'users' && <UsersSection />}
  {activeSection === 'contact_us' && <ContactUsSection />}
  {activeSection === 'profile' && (
    <div>
        <button className='bg-red-700 hover:bg-red-500  text-white font-bold py-2 px-4 rounded' onClick={handleLogout}>
            Logout
        </button>
    </div>
)}

</div>
      </main>
    </div>
  );
}
