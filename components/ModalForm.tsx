import React, { useState } from 'react';
import ImageCarousel from './ImageCarousel';
import PriceCalculator from './PriceCalculator';

interface Project {
  id: string;
  title: string;
  price: number;
  bedrooms: number;
  bathrooms: number;
  floors: number;
  area: number;
}

interface ModalFormProps {
  project: Project;
  onClose: () => void;
}

const ModalForm: React.FC<ModalFormProps> = ({ project, onClose }) => {
  const [selectedFileType, setSelectedFileType] = useState<'cad+pdf' | 'pdf'>('pdf');
  const [selectedDrawings, setSelectedDrawings] = useState<string[]>(['architectural']);
  const [quantity, setQuantity] = useState(1);

  const fileTypes = [
    { id: 'cad+pdf', label: 'CAD + PDF', price: project.price },
    { id: 'pdf', label: 'PDF', price: project.price * 0.8 }
  ];

  const drawingSets = [
    { id: 'architectural', label: 'Architectural Drawings', included: true },
    { id: 'boq', label: 'Bills of Quantity (BOQ)', price: 50 }
  ];

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  };

  const calculateTotal = () => {
    let total = selectedFileType === 'cad+pdf' ? project.price : project.price * 0.8;
    
    selectedDrawings.forEach(drawing => {
      if (drawing === 'boq') {
        total += 50;
      }
    });

    return total * quantity;
  };

  const handleCheckout = async () => {
    try {
      // 🤚 POST endpoint to create order
      const orderData = {
        projectId: project.id,
        fileType: selectedFileType,
        drawings: selectedDrawings,
        quantity,
        total: calculateTotal()
      };

      // 🤚 Replace with: POST /api/orders
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData),
      });

      if (response.ok) {
        const order = await response.json();
        // Redirect to checkout page
        window.location.href = `/checkout/${order.id}`;
      }
    } catch (error) {
      console.error('Error creating order:', error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex">
          {/* Left Side - Images */}
          <div className="flex-1 p-6">
            <ImageCarousel projectId={project.id} />
            
            <div className="mt-6">
              <h3 className="text-lg font-semibold text-green-800 mb-4">Construction Cost Calculator</h3>
              <PriceCalculator />
            </div>
          </div>

          {/* Right Side - Form */}
          <div className="flex-1 p-6 border-l border-green-100">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-2xl font-bold text-green-800">{project.title}</h2>
                <p className="text-green-600">ID: {project.id}</p>
              </div>
              <button 
                onClick={onClose}
                className="text-green-500 hover:text-green-700"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Project Specifications */}
            <div className="grid grid-cols-2 gap-4 mb-6 p-4 bg-green-50 rounded-lg">
              <div className="text-center">
                <div className="text-green-600 font-semibold">{project.floors}</div>
                <div className="text-sm text-green-500">Floors</div>
              </div>
              <div className="text-center">
                <div className="text-green-600 font-semibold">{project.bedrooms}</div>
                <div className="text-sm text-green-500">Bedrooms</div>
              </div>
              <div className="text-center">
                <div className="text-green-600 font-semibold">{project.bathrooms}</div>
                <div className="text-sm text-green-500">Bathrooms</div>
              </div>
              <div className="text-center">
                <div className="text-green-600 font-semibold">{project.area}m²</div>
                <div className="text-sm text-green-500">Area</div>
              </div>
            </div>

            {/* File Type Selection */}
            <div className="mb-6">
              <h3 className="font-semibold text-green-800 mb-3">File Type</h3>
              {fileTypes.map((fileType) => (
                <label key={fileType.id} className="flex items-center mb-2 cursor-pointer">
                  <input
                    type="radio"
                    name="fileType"
                    value={fileType.id}
                    checked={selectedFileType === fileType.id}
                    onChange={(e) => setSelectedFileType(e.target.value as 'cad+pdf' | 'pdf')}
                    className="text-green-500 focus:ring-green-500"
                  />
                  <span className="ml-2 text-green-700">{fileType.label}</span>
                  <span className="ml-auto text-green-600 font-semibold">
                    {formatPrice(fileType.price)}
                  </span>
                </label>
              ))}
            </div>

            {/* Drawing Sets */}
            <div className="mb-6">
              <h3 className="font-semibold text-green-800 mb-3">Drawing Sets</h3>
              {drawingSets.map((drawing) => (
                <label key={drawing.id} className="flex items-center mb-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedDrawings.includes(drawing.id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedDrawings([...selectedDrawings, drawing.id]);
                      } else {
                        setSelectedDrawings(selectedDrawings.filter(d => d !== drawing.id));
                      }
                    }}
                    className="text-green-500 focus:ring-green-500"
                  />
                  <span className="ml-2 text-green-700">{drawing.label}</span>
                  {drawing.price && (
                    <span className="ml-auto text-green-600 font-semibold">
                      +{formatPrice(drawing.price)}
                    </span>
                  )}
                </label>
              ))}
            </div>

            {/* Quantity */}
            <div className="mb-6">
              <label className="block font-semibold text-green-800 mb-2">Quantity</label>
              <select
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
                className="w-full p-2 border border-green-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              >
                {[1, 2, 3, 4, 5].map(num => (
                  <option key={num} value={num}>{num}</option>
                ))}
              </select>
            </div>

            {/* Features */}
            <div className="mb-6 p-4 bg-green-50 rounded-lg">
              <h3 className="font-semibold text-green-800 mb-3">Instant digital delivery includes:</h3>
              <ul className="text-green-700 space-y-2">
                <li className="flex items-center">
                  <svg className="w-5 h-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  100% Money Back Guarantee
                </li>
                <li className="flex items-center">
                  <svg className="w-5 h-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Multiple payment options
                </li>
              </ul>
            </div>

            {/* Total and Buy Button */}
            <div className="border-t border-green-200 pt-4">
              <div className="flex justify-between items-center mb-4">
                <span className="text-lg font-semibold text-green-800">Total</span>
                <span className="text-2xl font-bold text-green-600">{formatPrice(calculateTotal())}</span>
              </div>
              
              <button
                onClick={handleCheckout}
                className="w-full bg-green-500 text-white py-3 rounded-lg font-semibold hover:bg-green-600 transition-colors mb-3"
              >
                Buy Now
              </button>

              <button className="w-full border border-green-500 text-green-500 py-3 rounded-lg font-semibold hover:bg-green-50 transition-colors flex items-center justify-center">
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