'use client';
import axios from 'axios';
import { useEffect, useState, useMemo } from 'react';

/**
 * Type definition for a Contact Us submission.
 */
type ContactUs = {
  id: string;
  names: string;
  email: string;
  phone?: string;
  message: string;
  created_at: string;
};

// --- START: Mock API Implementation ---

// Mock data to simulate the API response structure
const MOCK_CONTACTS_DATA: ContactUs[] = [
    {
        "id": "e729d836-13fa-4261-8ce4-e449a2df0d81",
        "names": "Mwimule Bienvenu",
        "email": "bienvenugashema@gmail.com",
        "phone": "123-456-7890",
        "message": "Hello this is the testing message. This message is intentionally long to ensure that the table truncates it correctly and the expand feature works as expected. We need to check responsiveness and usability across different devices.",
        "created_at": "2025-10-28T05:19:08.339Z"
    },
    {
        "id": "f8a9b0c1-d2e3-4f5a-6b7c-8d9e0f1a2b3c",
        "names": "Alice Wonderland",
        "email": "alice@wonderland.com",
        "phone": null,
        "message": "I have an inquiry about product availability and bulk discounts. Please reply to this email as soon as possible.",
        "created_at": "2025-11-15T10:30:00.000Z"
    },
    {
        "id": "g9h0i1j2-k3l4-m5n6-o7p8-q9r0s1t2u3v4",
        "names": "Bob The Builder",
        "email": "bob@builder.org",
        "phone": "999-999-9999",
        "message": "Can we fix it? Yes we can! I need help with installation and scheduling a follow-up visit. The site address is ready.",
        "created_at": "2025-11-18T14:45:12.789Z"
    }
];

// Mock API call simulation for GET
const mockContactFetch = (url: string, config: any) => new Promise<{ data: ContactUs[] }>((resolve, reject) => {
    // Simulate token check if needed, but resolve with mock data
    if (!config || !config.headers || !config.headers.Authorization) {
        console.warn("Mock API (GET): Token check bypassed for demonstration.");
    }
    setTimeout(() => {
        if (url === '/admin/contact_us') {
            resolve({ data: MOCK_CONTACTS_DATA });
        } else {
            reject(new Error(`Unknown endpoint: ${url}`));
        }
    }, 500); // Simulate network delay
});

// Mock API call simulation for POST (Reply Endpoint)
const mockReplyPost = (url: string, data: any, config: any) => new Promise<void>((resolve, reject) => {
    if (url === '/api/reply') {
        setTimeout(() => {
            console.log(`--- Mock Reply Sent Successfully ---`);
            console.log(`To: ${data.to}`);
            console.log(`Subject: ${data.messegeSubject}`);
            console.log(`Message: ${data.replyMessage.substring(0, 50)}...`);
            console.log(`----------------------------------`);
            resolve(); // Simulate successful send
        }, 800);
    } else {
        reject(new Error(`Unknown POST endpoint: ${url}`));
    }
});

// Mock API object to replace the import
const API = {
    get: mockContactFetch,
    post: mockReplyPost, // Added post method
};
// --- END: Mock API Implementation ---


export default function ContactUsSection() {
  const [contacts, setContacts] = useState<ContactUs[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedContactId, setExpandedContactId] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isReplyModalOpen, setIsReplyModalOpen] = useState(false);
  const [contactToReply, setContactToReply] = useState<ContactUs | null>(null);
  const [replyStatus, setReplyStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');

  useEffect(() => {
    // In a real app, this would get a token. Here, we set a mock token for demonstration.
    const storedToken = localStorage.getItem('accessToken'); 
    if (storedToken) {
      setToken(storedToken);
    }
  }, []);

  const fetchContacts = async () => {
    if (!token) return;

    setLoading(true);
    setError(null);
    try {
      const res = await API.get('/admin/contact_us', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      setContacts(res.data);
    } catch (err) {
      console.error("Failed to fetch contacts:", err);
      setError("Failed to load contacts. Ensure API and CORS are configured correctly.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchContacts();
    }
  }, [token]);

  const toggleExpand = (id: string) => {
    setExpandedContactId(expandedContactId === id ? null : id);
  };
  
  const openReplyModal = (contact: ContactUs) => {
    setContactToReply(contact);
    setIsReplyModalOpen(true);
    setReplyStatus('idle'); // Reset status when opening
  };

  const closeReplyModal = () => {
    setIsReplyModalOpen(false);
    setContactToReply(null);
    setReplyStatus('idle');
  };


  // Filter contacts based on search term (case-insensitive across name, email, and message)
  const filteredContacts = useMemo(() => {
    if (!searchTerm) {
      return contacts;
    }
    const lowerCaseSearch = searchTerm.toLowerCase();
    return contacts.filter(contact =>
      contact.names.toLowerCase().includes(lowerCaseSearch) ||
      contact.email.toLowerCase().includes(lowerCaseSearch) ||
      contact.message.toLowerCase().includes(lowerCaseSearch)
    );
  }, [contacts, searchTerm]);


  // --- Reply Modal Component ---
  const ReplyModal = () => {
    if (!isReplyModalOpen || !contactToReply) return null;

    const [subject, setSubject] = useState(`Re: Your Inquiry to ${contactToReply.names}`);
    const [replyMessage, setReplyMessage] = useState('');
    
    const handleReplySubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setReplyStatus('sending');
        
        const payload = {
            to: contactToReply.email,
            messegeSubject: subject,
            replyMessage: replyMessage,
        };

        try {
            // Using the mock API.post
            await axios.post('/api/reply', payload, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            setReplyStatus('success');
            setTimeout(closeReplyModal, 2000); 
        } catch (err) {
            console.error("Failed to send reply:", err);
            setReplyStatus('error');
        }
    };

    return (
        // Modal Backdrop
        <div className="fixed inset-0 bg-gray-900 bg-opacity-70 z-50 flex items-center justify-center p-4">
            {/* Modal Content */}
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg transform transition-all duration-300">
                <div className="p-6 border-b border-gray-200">
                    <h3 className="text-xl font-bold text-gray-900">Reply to {contactToReply.names}</h3>
                    <p className="text-sm text-gray-500 mt-1">To: <span className="font-medium text-indigo-600">{contactToReply.email}</span></p>
                </div>
                
                <form onSubmit={handleReplySubmit} className="p-6 space-y-4">
                    
                    <div>
                        <label htmlFor="subject" className="block text-sm font-medium text-gray-700">Subject</label>
                        <input
                            id="subject"
                            type="text"
                            value={subject}
                            onChange={(e) => setSubject(e.target.value)}
                            required
                            className="mt-1 block w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                        />
                    </div>

                    <div>
                        <label htmlFor="replyMessage" className="block text-sm font-medium text-gray-700">Reply Message</label>
                        <textarea
                            id="replyMessage"
                            rows={6}
                            value={replyMessage}
                            onChange={(e) => setReplyMessage(e.target.value)}
                            required
                            className="mt-1 block w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                            placeholder={`Dear ${contactToReply.names}, \n\n...`}
                        />
                    </div>

                    <div className="flex justify-end space-x-3 pt-2">
                        <button
                            type="button"
                            onClick={closeReplyModal}
                            disabled={replyStatus === 'sending'}
                            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition disabled:opacity-50"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={replyStatus === 'sending' || replyStatus === 'success'}
                            className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition disabled:opacity-50 flex items-center"
                        >
                            {replyStatus === 'sending' && (
                                <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                            )}
                            {replyStatus === 'success' ? 'Sent!' : 'Send Reply'}
                        </button>
                    </div>
                </form>
                
                {replyStatus === 'error' && (
                    <div className="p-4 bg-red-100 text-red-700 border-t border-red-200 rounded-b-xl">
                        Failed to send reply. Please try again.
                    </div>
                )}
            </div>
        </div>
    );
  };
  // --- End Reply Modal Component ---


  // --- Helper Render Functions ---

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 bg-white rounded-xl shadow-lg">
        <svg className="animate-spin h-8 w-8 text-indigo-600 mr-3" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <p className="text-lg text-gray-600">Loading inquiries...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-red-100 border-l-4 border-red-500 text-red-700 rounded-xl shadow-md">
        <h2 className="text-xl font-bold mb-2">Data Fetch Error</h2>
        <p>{error}</p>
        <button onClick={fetchContacts} className="mt-4 px-3 py-1 bg-red-600 text-white rounded-lg hover:bg-red-700 transition">
            Retry Fetch
        </button>
      </div>
    );
  }

  // --- Main Content UI (Table View) ---
  return (
    <div className="p-4 sm:p-6 bg-white shadow-xl rounded-xl">
      <h2 className="text-3xl font-extrabold text-gray-900 mb-6 border-b pb-2">Contact Us Submissions</h2>

      {/* Search Bar */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="Search by name, email, or message content..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-150 shadow-sm"
        />
      </div>

      {filteredContacts.length === 0 && contacts.length > 0 && (
          <div className="p-4 bg-yellow-100 text-yellow-800 rounded-lg">
              No results found for "{searchTerm}".
          </div>
      )}

      {contacts.length === 0 ? (
        <div className="p-6 bg-indigo-50 border-l-4 border-indigo-500 text-indigo-700 rounded-xl shadow-md">
            <h3 className="text-xl font-bold mb-2">No Contact Inquiries</h3>
            <p>There are currently no submissions in the database.</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-gray-200">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Message Snippet</th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredContacts.map((contact) => {
                const expanded = expandedContactId === contact.id;
                const date = new Date(contact.created_at);
                const formattedDate = date.toLocaleDateString() + ' ' + date.toLocaleTimeString();

                return (
                  <>
                    <tr key={contact.id} className="hover:bg-indigo-50/50 transition">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{contact.names}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-600 truncate max-w-xs" title={contact.email}>
                          {contact.email}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500" title={formattedDate}>
                          {date.toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700 truncate max-w-sm">
                          {contact.message.substring(0, 50)}{contact.message.length > 50 ? '...' : ''}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                        <button
                            onClick={() => toggleExpand(contact.id)}
                            className="text-indigo-600 hover:text-indigo-900 font-semibold transition"
                            title={expanded ? 'Collapse Message' : 'Expand Message'}
                        >
                          {expanded ? 'Hide' : 'View'}
                        </button>
                      </td>
                    </tr>
                    {expanded && (
                      <tr className="bg-gray-100">
                        <td colSpan={5} className="px-6 py-4">
                          <div className="p-4 border-l-4 border-indigo-400 bg-white shadow-inner rounded-md">
                            <h4 className="font-bold text-gray-800 mb-2 flex items-center">
                                <span className="h-2 w-2 bg-indigo-500 rounded-full mr-2"></span> Full Message Details
                            </h4>
                            <p className="text-sm text-gray-700 mb-2">
                                <span className="font-semibold">Phone:</span> {contact.phone || 'N/A'}
                            </p>
                            <p className="text-sm text-gray-700 whitespace-pre-wrap mb-4">
                                <span className="font-semibold">Message:</span> {contact.message}
                            </p>
                            
                            <button
                                onClick={() => openReplyModal(contact)}
                                className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition shadow-md flex items-center"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.86 9.86 0 01-4.2-.953M3 12a9 9 0 014.2-.953M20 18c0-2.209-1.791-4-4-4s-4 1.791-4 4 1.791 4 4 4 4-1.791 4-4z" />
                                </svg>
                                Send Reply
                            </button>
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
      
      {/* Render the reply modal */}
      <ReplyModal />
    </div>
  );
}