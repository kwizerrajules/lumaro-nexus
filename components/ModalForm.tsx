import React, { useEffect, useState } from 'react';
import ImageCarousel from './ImageCarousel';
import axios from 'axios';

interface Project {
  id: string;
  title: string;
  price: number;
  bedrooms: number;
  bathrooms: number;
  floors: number;
  area: number;
  description?: string;
}

interface ModalFormProps {
  project: Project;
  onClose: () => void;
}


const STAFF_WHATSAPP_NUMBER = "250787369660";

const ModalForm: React.FC<ModalFormProps> = ({ project, onClose }) => {
  const [quantity, setQuantity] = useState(1);
  const [accessToken, setAccessToken] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("userAccessToken");
    if (token) setAccessToken(token);
  }, []);
    
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  };

  const calculateTotal = () => {
    let total = project.price;
    return total * quantity;
  };

  // 📌 2. FUNCTION TO GENERATE THE WHATSAPP LINK
  const getWhatsAppLink = () => {
    const total = formatPrice(calculateTotal());
    const message = encodeURIComponent(
      `Hello, I am interested in project "${project.title}" (ID: ${project.id}).\n` +
      `\nDetails:\n` +
      `  - Bedrooms: ${project.bedrooms}\n` +
      `  - Area: ${project.area}m²\n` +
      `  - Quantity: ${quantity}\n` +
      `  - Estimated Price: ${total}`
    );
    
    // Construct the wa.me link
    return `https://wa.me/${STAFF_WHATSAPP_NUMBER}?text=${message}`;
  };

  const handleAddEnquiry = async (id: string) => {
    console.log("AccesTOKEN IS ", accessToken);
    try {
      const response  = await axios.post('/api/enquiries', {projectId: id},{
        headers: {
          'Authorization':`Bearer ${accessToken}`
        }
      })
      if(!response) {
        console.error("Failed to create wishlist with error")
      }
      alert("Product added to wish list");
    } catch (err) {
      alert("Error while adding product to wishlist")
      console.error("Failed to add product to wishlist")
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-5xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex flex-col lg:flex-row">
          
          {/* Left - Image & Price Calculator */}
          <div className="flex-1 p-6">
            <ImageCarousel projectId={project.id} />
            {project.description && (
              <p className="mt-4 text-gray-700">{project.description}</p>
            )}
          </div>

          {/* Right - Form & Options */}
          <div className="flex-1 p-6 border-t lg:border-t-0 lg:border-l border-gray-200">
            {/* Header */}
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{project.title}</h2>
                <p className="text-gray-600">ID: {project.id}</p>
              </div>
              <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Project Specs */}
            <div className="grid grid-cols-2 gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
              <div className="text-center">
                <div className="text-gray-800 font-semibold">{project.floors}</div>
                <div className="text-sm text-gray-600">Floors</div>
              </div>
              <div className="text-center">
                <div className="text-gray-800 font-semibold">{project.bedrooms}</div>
                <div className="text-sm text-gray-600">Bedrooms</div>
              </div>
              <div className="text-center">
                <div className="text-gray-800 font-semibold">{project.bathrooms}</div>
                <div className="text-sm text-gray-600">Bathrooms</div>
              </div>
              <div className="text-center">
                <div className="text-gray-800 font-semibold">{project.area}m²</div>
                <div className="text-sm text-gray-600">Area</div>
              </div>
            </div>


            {/* Quantity */}
            <div className="mb-6">
              <label className="block font-semibold text-gray-800 mb-2">Quantity</label>
              <select
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              >
                {[1, 2, 3, 4, 5].map(num => (
                  <option key={num} value={num}>{num}</option>
                ))}
              </select>
            </div>

            {/* Total & WhatsApp Button */}
            <div className="border-t border-gray-200 pt-4">
              <div className="flex justify-between items-center mb-4">
                <span className="text-lg font-semibold text-gray-800">Total Price</span>
                <span className="text-2xl font-bold text-green-600">{formatPrice(calculateTotal())}</span>
              </div>
              
              {/* 📌 3. WHATSAPP BUTTON REPLACEMENT */}
              <a 
                href={getWhatsAppLink()} 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-full bg-green-500 text-white py-3 rounded-lg font-semibold hover:bg-green-600 transition-colors mb-3 flex items-center justify-center text-center"
              >
                {/* WhatsApp Icon SVG */}
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M.057 18.068l1.492-5.742a1.082 1.082 0 01.326-.411l3.541-3.541a1.08 1.08 0 011.53 0l3.7 3.7a1.08 1.08 0 010 1.53l-3.54 3.54a1.08 1.08 0 01-.765.317H.813a.75.75 0 01-.756-.757zM22.5 12A10.5 10.5 0 1012 22.5 10.5 10.5 0 0022.5 12zM12 21.6A9.6 9.6 0 1121.6 12 9.61 9.61 0 0112 21.6zm2.844-3.535l-.707-.707c-2.857-2.857-5.714-5.714-8.571-8.571-.059-.059-.118-.118-.177-.177a.6.6 0 01-.013-.85l.707-.707a.6.6 0 01.85 0l8.57 8.57c.059.059.118.118.177.177a.6.6 0 01.013.85z"/>
                  <path d="M12.06 1.157c-6.075 0-11 4.925-11 11s4.925 11 11 11 11-4.925 11-11-4.925-11-11-11zm5.992 14.538l-4.598-4.598a.5.5 0 00-.707 0l-4.598 4.598a.5.5 0 000 .707l4.598 4.598a.5.5 0 00.707 0l4.598-4.598a.5.5 0 000-.707z" fill="white"/>
                  <path d="M16.48 7.52L12 12.001 7.52 7.52a1.08 1.08 0 00-1.53 1.53l4.598 4.598a1.08 1.08 0 001.53 0l4.598-4.598a1.08 1.08 0 00-1.53-1.53z" fill="white"/>
                </svg>
                Contact Us on WhatsApp
              </a>

              <button 
              onClick={()=> handleAddEnquiry(project.id)} 
              disabled={!accessToken}
              className="w-full border border-yellow-500 text-yellow-500 py-3 rounded-lg font-semibold hover:bg-yellow-100 flex items-center justify-center">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
                Add To Enquiry
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModalForm;