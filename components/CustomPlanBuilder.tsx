import axios from 'axios';
import React, { useState, useEffect, use } from 'react';

// --- INTERFACES ---

interface Room {
  id: string;
  name: string;
  count: number;
  included: boolean;
}

interface DrawingSet {
  id: string;
  name: string;
  category: string; 
  price: number;
}


const mockDrawingSets: DrawingSet[] = [
  { id: 'ds-1', name: 'Modern Style', category: 'modern', price: 1500 },
  { id: 'ds-2', name: 'Rustic Cottage', category: 'rustic', price: 1200 },
  { id: 'ds-3', name: 'Classic Design', category: 'classic', price: 1000 },
];




const CustomPlanBuilder: React.FC = () => {
  // Basic Configuration
  const [floors, setFloors] = useState(1);
  const [area, setArea] = useState(156);
  const [token, setToken] = useState("");

useEffect(()=>{
  const token = localStorage.getItem("userAccessToken")
  if(token){
    setToken(token);

    
  }
}, [])
  // Custom Fields for Backend
  const [description, setDescription] = useState('A modern duplex with open living area.');
  const [selectedDrawingSet, setSelectedDrawingSet] = useState<DrawingSet>(mockDrawingSets[0]);

  // Room Configuration
  const initialRooms: Room[] = [
    { id: 'master-bedroom', name: 'Master Bedroom', count: 1, included: true },
    { id: 'bedroom', name: 'Bedroom', count: 1, included: true },
    { id: 'bathroom', name: 'Bathroom', count: 1, included: true },
    { id: 'kitchen', name: 'Kitchen', count: 1, included: true },
    { id: 'dining-room', name: 'Dining Room', count: 1, included: true },
    { id: 'living-room', name: 'Living Room', count: 1, included: true },
    { id: 'pantry', name: 'Pantry', count: 1, included: false },
    { id: 'veranda', name: 'Veranda', count: 1, included: false },
  ];
  const [rooms, setRooms] = useState<Room[]>(initialRooms);

  // Status
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);


  // --- ROOM HANDLERS (No Change) ---
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

  const addNewRoom = () => {
    const newRoom: Room = {
      id: `room-${Date.now()}`,
      name: 'New Room',
      count: 1,
      included: true
    };
    setRooms([...rooms, newRoom]);
  };


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(false);
    const includedRooms = rooms.filter(r => r.included);
    

    const getRoomCount = (namePart: string) => 
      includedRooms
        .filter(r => r.name.toLowerCase().includes(namePart))
        .reduce((sum, room) => sum + room.count, 0);

    // This handles both 'Master Bedroom' and 'Bedroom'
    const totalBedrooms = getRoomCount('bedroom'); 
    const totalBathrooms = getRoomCount('bathroom');
    const totalDiningRooms = getRoomCount('dining room');
    const totalKitchen = getRoomCount('kitchen');


    const payload = {
      bedrooms: totalBedrooms,
      bathrooms: totalBathrooms,
      dining_rooms: totalDiningRooms,
      kitchen: totalKitchen,
      floors: floors,
      total_area: area,
      category: selectedDrawingSet.category,
      description: description,
    };  

    try {
      const response = await axios.post('/api/custom-plan', payload, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (!response) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.data;
      console.log("Reslut is: ", result)
      console.log('Project created successfully:', result);
      setSuccess(true);
      // Optional: Redirect user or show confirmation modal
      
    } catch (err) {
      console.error('Submission failed:', err);
      // @ts-ignore
      setError(`Please Login First`);
    } finally {
      setIsLoading(false);
    }
  };

  // --- RENDER ---
  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-lg p-6">
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

          {/* Bedrooms dropdown is now removed as total bedrooms are calculated from rooms state */}
          <div className="col-span-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Total Area (m²)
            </label>
            <input
              type="number"
              value={area}
              onChange={(e) => setArea(Number(e.target.value))}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              required
            />
          </div>
          
          {/* Drawing Set Selection (Category) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Drawing Set / Category
            </label>
            <select
              value={selectedDrawingSet.id}
              onChange={(e) => {
                const selected = mockDrawingSets.find(ds => ds.id === e.target.value);
                if (selected) {
                  setSelectedDrawingSet(selected);
                }
              }}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
            >
              {mockDrawingSets.map(ds => (
                <option key={ds.id} value={ds.id}>{ds.name} ({ds.category})</option>
              ))}
            </select>
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
                    type="button" // Important: Prevents button from submitting the form
                    onClick={() => updateRoomCount(room.id, room.count - 1)}
                    disabled={room.count <= 1}
                    className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center disabled:opacity-50"
                  >
                    -
                  </button>
                  <span className="w-8 text-center font-semibold">{room.count}</span>
                  <button
                    type="button" // Important: Prevents button from submitting the form
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
          type="button" 
          onClick={addNewRoom}
          className="mt-4 flex items-center space-x-2 text-yellow-600 hover:text-yellow-700 font-semibold"
        >
          <span>+</span>
          <span>Want to add another room? Just Add a room</span>
        </button>
      </div>
      
      {/* Description Field */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Project Description</h3>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={4}
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
          placeholder="e.g., A modern duplex with open living area, facing the east..."
          required
        ></textarea>
      </div>

      {/* Status Messages */}
      {isLoading && (
        <p className="text-blue-600 font-medium text-center mb-4">Submitting custom plan...</p>
      )}
      {error && (
        <p className="text-red-600 font-medium text-center mb-4 border border-red-300 bg-red-50 p-3 rounded-lg">
          Error: {error}
        </p>
      )}
      {success && (
        <p className="text-green-600 font-medium text-center mb-4 border border-green-300 bg-green-50 p-3 rounded-lg">
          Success! Your custom project has been submitted.
        </p>
      )}

      {/* Submit Button (Replaces Buy Now) */}
      <div className="border-t border-gray-200 pt-6">
        <button 
          type="submit"
          disabled={isLoading}
          className="w-full bg-yellow-900 text-white py-4 px-6 rounded-lg font-semibold text-lg hover:bg-yellow-600 transition-colors duration-300 disabled:bg-gray-400"
        >
          {isLoading ? 'Processing...' : 'SUBMIT CUSTOM PLAN'}
        </button>
        <p className="text-center text-gray-500 text-sm mt-3">
          Your custom plan will be delivered within 5-7 business days
        </p>
      </div>
    </form>
  );
};

export default CustomPlanBuilder;