'use client';
import { useEffect, useState } from 'react';
import API from '../../../utils/api';

type UserData = {
  id: string;
  names: string;
  email: string;
  phone?: string;
};

type ProjectData = {
  id: string;
  title: string;
  thumbnail?: string;
  status?: string;
  price?: string;
};

type Enquiry = {
  id: string;
  created_at: string;
  user_data: UserData;
  project_data: ProjectData;
};

export default function OrdersSection() {
  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [expandedEnquiryId, setExpandedEnquiryId] = useState<string | null>(null);

  const fetchEnquiries = async () => {
    try {
      const res = await API.get('/enquiries/manager');
      setEnquiries(res.data); // nested user_data/project_data
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchEnquiries();
  }, []);

  const toggleExpand = (id: string) => {
    setExpandedEnquiryId(expandedEnquiryId === id ? null : id);
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Orders</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {enquiries.map((enquiry) => {
          const expanded = expandedEnquiryId === enquiry.id;

          return (
            <div
              key={enquiry.id}
              className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition"
            >
              {enquiry.project_data.thumbnail && (
                <img
                  src={enquiry.project_data.thumbnail}
                  alt={enquiry.project_data.title}
                  className="h-48 w-full object-cover"
                />
              )}

              <div className="p-4">
                <h3 className="text-lg font-bold text-gray-800">
                  {enquiry.project_data.title}
                </h3>
                {enquiry.project_data.price && (
                  <p className="text-blue-600 font-semibold mt-1">
                    {enquiry.project_data.price}
                  </p>
                )}
                {enquiry.project_data.status && (
                  <p
                    className={`inline-block mt-1 px-2 py-1 text-xs font-medium rounded ${
                      enquiry.project_data.status.toLowerCase() === 'completed'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-yellow-100 text-yellow-700'
                    }`}
                  >
                    {enquiry.project_data.status}
                  </p>
                )}
                <p className="text-gray-500 mt-1 text-sm">
                  Ordered on: {new Date(enquiry.created_at).toLocaleString()}
                </p>
              </div>

              <div className="flex justify-center p-2 border-t border-gray-200">
                <button
                  onClick={() => toggleExpand(enquiry.id)}
                  className="px-3 py-1 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition"
                >
                  {expanded ? 'Hide Details' : 'View Details'}
                </button>
              </div>

              {expanded && (
                <div className="p-4 border-t border-gray-200 bg-gray-50">
                  <div className="mb-2">
                    <h4 className="font-semibold text-gray-700">User Info</h4>
                    <p className="text-gray-600 text-sm">Name: {enquiry.user_data.names}</p>
                    <p className="text-gray-600 text-sm">Email: {enquiry.user_data.email}</p>
                    {enquiry.user_data.phone && (
                      <p className="text-gray-600 text-sm">Phone: {enquiry.user_data.phone}</p>
                    )}
                  </div>

                  <div>
                    <h4 className="font-semibold text-gray-700 mt-2">Project Info</h4>
                    <p className="text-gray-600 text-sm">Title: {enquiry.project_data.title}</p>
                    <p className="text-gray-600 text-sm">Status: {enquiry.project_data.status}</p>
                    {enquiry.project_data.price && (
                      <p className="text-gray-600 text-sm">Price: {enquiry.project_data.price}</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
