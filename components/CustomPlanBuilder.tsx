import React, { useState } from 'react';

interface Room {
  id: string;
  name: string;
  count: number;
  included: boolean;
}

interface DrawingSet {
  id: string;
  name: string;
  price: number;
  selected: boolean;
}

const CustomPlanBuilder: React.FC = () => {
  const [floors, setFloors] = useState(1);
  const [bedrooms, setBedrooms] = useState(2);
  const [area, setArea] = useState(156);
  
  const [rooms, setRooms] = useState<Room[]>([
    { id: 'master-bedroom', name: 'Master Bedroom', count: 1, included: true },
    { id: 'bedroom', name: 'Bedroom', count: 1, included: true },
    { id: 'bathroom', name: 'Bathroom', count: 1, included: true },
    { id: 'kitchen', name: 'Kitchen', count: 1, included: true },
    { id: 'dining-room', name: 'Dining Room', count: 1, included: true },
    { id: 'living-room', name: 'Living Room', count: 1, included: true },
    { id: 'pantry', name: 'Pantry', count: 1, included: false },
    { id: 'veranda', name: 'Veranda', count: 1, included: false },
  ]);

  const [drawingSets, setDrawingSets] = useState<DrawingSet[]>([
    { id: 'architectural', name: 'Architectural Drawings', price: 585.00, selected: true },
    { id: 'structural', name: 'Structural Drawings', price: 175.00, selected: false },
    { id: 'mechanical', name: 'Mechanical Drawings', price: 150.00, selected: false },
    { id: 'electrical', name: 'Electrical Drawings', price: 160.00, selected: false },
    { id: 'boq', name: 'Bills Of Quantities', price: 487.50, selected: false },
  ]);

  const toggleRoom = (roomId: string) => {
    setRooms(rooms.map(room => 
      room.id === roomId ? { ...room, included: !room.included } : room
    ));
  };

  const updateRoomCount = (roomId: string, count: number) => {
    setRooms(rooms.map(room => 
      room.id === roomId ? { ...room, count: Math.max(0, count) } : room
    ));
  };

  const toggleDrawingSet = (drawingId: string) => {
    setDrawingSets(drawingSets.map(set => 
      set.id === drawingId ? { ...set, selected: !set.selected } : set
    ));
  };

  const addNewRoom = () => {
    const newRoom: Room = {
      id: `room-${Date.now()}`,
      name: 'New Room',
      count: 1,
      included: true
    };
    setRooms([...rooms, newRoom]);
  };

  const calculateTotal = () => {
    const basePrice = 585.00; // Architectural drawings base price
    const additionalPrice = drawingSets
      .filter(set => set.selected && set.id !== 'architectural')
      .reduce((sum, set) => sum + set.price, 0);
    return basePrice + additionalPrice;
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Custom Plan Builder</h2>

      {/* Basic Configuration */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Basic Configuration</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Number Of Floors
            </label>
            <select
              value={floors}
              onChange={(e) => setFloors(Number(e.target.value))}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
            >
              {[1, 2, 3].map(num => (
                <option key={num} value={num}>{num}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Number Of Bedrooms
            </label>
            <select
              value={bedrooms}
              onChange={(e) => setBedrooms(Number(e.target.value))}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
            >
              {[1, 2, 3, 4, 5, 6].map(num => (
                <option key={num} value={num}>{num}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Total Area (m²)
            </label>
            <input
              type="number"
              value={area}
              onChange={(e) => setArea(Number(e.target.value))}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
            />
          </div>
        </div>
      </div>

      {/* Room Selection */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Room Selection</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {rooms.map(room => (
            <div key={room.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={room.included}
                  onChange={() => toggleRoom(room.id)}
                  className="w-4 h-4 text-green-500 border-gray-300 rounded focus:ring-green-500"
                />
                <span className="text-gray-700 font-medium">{room.name}</span>
              </div>
              
              {room.included && (
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => updateRoomCount(room.id, room.count - 1)}
                    disabled={room.count <= 1}
                    className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center disabled:opacity-50"
                  >
                    -
                  </button>
                  <span className="w-8 text-center font-semibold">{room.count}</span>
                  <button
                    onClick={() => updateRoomCount(room.id, room.count + 1)}
                    className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center"
                  >
                    +
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Add Room Button */}
        <button
          onClick={addNewRoom}
          className="mt-4 flex items-center space-x-2 text-green-600 hover:text-green-700 font-semibold"
        >
          <span>+</span>
          <span>Want to add another room? Just Add a room</span>
        </button>
      </div>

      {/* Drawing Sets */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Drawing Sets</h3>
        <div className="space-y-3">
          {drawingSets.map(set => (
            <label key={set.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={set.selected}
                  onChange={() => toggleDrawingSet(set.id)}
                  className="w-4 h-4 text-green-500 border-gray-300 rounded focus:ring-green-500"
                />
                <div>
                  <span className="text-gray-700 font-medium">{set.name}</span>
                  {set.id === 'architectural' && (
                    <span className="ml-2 text-green-600 text-sm">(Base Plan)</span>
                  )}
                </div>
              </div>
              <span className="text-gray-600 font-semibold">${set.price.toFixed(2)}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Buy Now Button */}
      <div className="border-t border-gray-200 pt-6">
        <div className="flex justify-between items-center mb-4">
          <span className="text-lg font-semibold text-gray-800">Total Plan Cost</span>
          <span className="text-2xl font-bold text-green-600">${calculateTotal().toFixed(2)}</span>
        </div>
        <button className="w-full bg-green-500 text-white py-4 px-6 rounded-lg font-semibold text-lg hover:bg-green-600 transition-colors duration-300">
          BUY NOW - ${calculateTotal().toFixed(2)}
        </button>
        <p className="text-center text-gray-500 text-sm mt-3">
          Your custom plan will be delivered within 5-7 business days
        </p>
      </div>
    </div>
  );
};

export default CustomPlanBuilder;