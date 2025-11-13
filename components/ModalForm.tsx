import React, { useState } from 'react';
import ImageCarousel from './ImageCarousel';

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

const ModalForm: React.FC<ModalFormProps> = ({ project, onClose }) => {
  const [selectedFileType, setSelectedFileType] = useState<'cad+pdf' | 'pdf'>('pdf');
  const [selectedDrawings, setSelectedDrawings] = useState<string[]>(['architectural']);
  const [quantity, setQuantity] = useState(1);
  

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

  const handleCheckout = async () => {
    try {
      const orderData = {
        projectId: project.id,
        fileType: selectedFileType,
        drawings: selectedDrawings,
        quantity,
        total: calculateTotal()
      };
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData),
      });
      if (response.ok) {
        const order = await response.json();
        window.location.href = `/checkout/${order.id}`;
      }
    } catch (error) {
      console.error('Error creating order:', error);
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

            {/* Total & Buy Button */}
            <div className="border-t border-gray-200 pt-4">
              <div className="flex justify-between items-center mb-4">
                <span className="text-lg font-semibold text-gray-800">Total</span>
                <span className="text-2xl font-bold text-gray-600">{formatPrice(calculateTotal())}</span>
              </div>
              <button
                onClick={handleCheckout}
                className="w-full bg-green-500 text-white py-3 rounded-lg font-semibold hover:bg-green-600 transition-colors mb-3"
              >
                Buy Now
              </button>
              <button className="w-full border border-green-500 text-green-500 py-3 rounded-lg font-semibold hover:bg-green-50 flex items-center justify-center">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
                Add To Wishlist
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModalForm;
