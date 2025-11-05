import React, { useState } from 'react';

interface CostItem {
  id: string;
  name: string;
  cost: number;
}

const PriceCalculator: React.FC = () => {
  const [constructionType, setConstructionType] = useState<'standard' | 'luxury'>('standard');
  const [costItems, setCostItems] = useState<CostItem[]>([
    { id: '1', name: 'Substructure', cost: 5075 },
    { id: '2', name: 'Superstructure', cost: 2639 },
    { id: '3', name: 'Roof', cost: 3045 }
  ]);

  const multiplier = constructionType === 'luxury' ? 1.5 : 1;

  const totalCost = costItems.reduce((sum, item) => sum + (item.cost * multiplier), 0);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  };

  return (
    <div className="bg-white border border-green-200 rounded-lg p-4">
      <h3 className="text-lg font-semibold text-green-800 mb-4">Construction Cost Calculator</h3>
      
      {/* Construction Type */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-green-700 mb-2">Construction Type</label>
        <div className="flex space-x-4">
          {[
            { id: 'standard', label: 'Standard', multiplier: 1 },
            { id: 'luxury', label: 'Luxury', multiplier: 1.5 }
          ].map((type) => (
            <label key={type.id} className="flex items-center cursor-pointer">
              <input
                type="radio"
                name="constructionType"
                value={type.id}
                checked={constructionType === type.id}
                onChange={(e) => setConstructionType(e.target.value as 'standard' | 'luxury')}
                className="text-green-500 focus:ring-green-500"
              />
              <span className="ml-2 text-green-600">{type.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Cost Items Table */}
      <div className="mb-4">
        <table className="w-full">
          <thead>
            <tr className="border-b border-green-200">
              <th className="text-left py-2 text-green-700 font-semibold">Item</th>
              <th className="text-right py-2 text-green-700 font-semibold">Cost Estimates</th>
            </tr>
          </thead>
          <tbody>
            {costItems.map((item) => (
              <tr key={item.id} className="border-b border-green-100">
                <td className="py-2 text-green-600">{item.name}</td>
                <td className="py-2 text-right text-green-700 font-semibold">
                  {formatPrice(item.cost * multiplier)}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="border-t border-green-300">
              <td className="py-2 text-green-800 font-bold">Total</td>
              <td className="py-2 text-right text-green-800 font-bold text-lg">
                {formatPrice(totalCost)}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      <div className="text-sm text-green-600 bg-green-50 p-3 rounded-lg">
        <p>💡 This is an estimate. Final costs may vary based on location, materials, and labor rates.</p>
      </div>
    </div>
  );
};

export default PriceCalculator;