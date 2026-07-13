import React, { useState } from 'react';
import { Lightbulb } from '@phosphor-icons/react';

interface CostItem {
  id: string;
  name: string;
  cost: number;
}

const ConstructionCalculator: React.FC = () => {
  const [constructionType, setConstructionType] = useState<'basic' | 'standard' | 'luxury'>('standard');
  const [area, setArea] = useState(156);

  const costItems: CostItem[] = [
    { id: '1', name: 'Substructure', cost: 13650 },
    { id: '2', name: 'Superstructure', cost: 7098 },
    { id: '3', name: 'Roof', cost: 8190 },
    { id: '4', name: 'Doors', cost: 4212 },
    { id: '5', name: 'Windows', cost: 3510 },
    { id: '6', name: 'Finishes', cost: 14742 },
    { id: '7', name: 'Decorations', cost: 2808 },
    { id: '8', name: 'Plumbing Installations', cost: 3510 },
    { id: '9', name: 'Electrical Installations', cost: 4212 },
  ];

  const getMultiplier = () => {
    switch (constructionType) {
      case 'basic': return 0.8;
      case 'standard': return 1;
      case 'luxury': return 1.5;
      default: return 1;
    }
  };

  const calculateItemCost = (baseCost: number) => {
    return baseCost * getMultiplier() * (area / 156);
  };

  const totalCost = costItems.reduce((sum, item) => sum + calculateItemCost(item.cost), 0);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(price);
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 sticky top-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Construction Cost Calculator</h2>

      {/* Construction Type */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-3">Construction Type</label>
        <div className="grid grid-cols-3 gap-2">
          {[
            { id: 'basic', label: 'Basic', multiplier: 0.8 },
            { id: 'standard', label: 'Standard', multiplier: 1 },
            { id: 'luxury', label: 'Luxury', multiplier: 1.5 }
          ].map((type) => (
            <button
              key={type.id}
              onClick={() => setConstructionType(type.id as 'basic' | 'standard' | 'luxury')}
              className={`p-3 rounded-lg border-2 text-center transition-all ${
                constructionType === type.id
                  ? 'border-green-500 bg-green-50 text-green-700 font-semibold'
                  : 'border-gray-200 text-gray-600 hover:border-gray-300'
              }`}
            >
              {type.label}
            </button>
          ))}
        </div>
      </div>

      {/* Area Input */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Area (m²)
        </label>
        <input
          type="number"
          value={area}
          onChange={(e) => setArea(Number(e.target.value))}
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
        />
      </div>

      {/* Cost Breakdown */}
      <div className="mb-6">
        <h3 className="font-semibold text-gray-800 mb-4">Cost Breakdown</h3>
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {costItems.map((item) => (
            <div key={item.id} className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="text-gray-600 text-sm">{item.id}. {item.name}</span>
              <span className="text-gray-800 font-semibold">
                {formatPrice(calculateItemCost(item.cost))}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Total Cost */}
      <div className="border-t border-gray-200 pt-4">
        <div className="flex justify-between items-center">
          <span className="text-lg font-bold text-gray-900">TOTAL</span>
          <span className="text-2xl font-bold text-green-600">
            {formatPrice(totalCost)}
          </span>
        </div>
        <p className="text-gray-500 text-sm mt-2 text-center">
          Estimated construction cost for {area}m²
        </p>
      </div>

      {/* Info Note */}
      <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
        <p className="text-blue-700 text-sm flex items-start gap-2">
          <Lightbulb size={16} weight="fill" className="shrink-0 mt-0.5" />
          This is an estimate based on current market rates. Final costs may vary based on location, materials, and labor rates.
        </p>
      </div>
    </div>
  );
};

export default ConstructionCalculator;