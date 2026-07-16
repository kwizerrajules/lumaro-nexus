'use client';
import axios from 'axios';
import React, { useState, useEffect } from 'react';

interface Room {
  id: string;
  name: string;
  count: number;
  included: boolean;
}

interface CategoryOption {
  id: string;
  name: string;
}

interface StyleOption {
  id: string;
  name: string;
  categoryName: string;
}

const CustomPlanBuilder: React.FC = () => {
  const [floors, setFloors] = useState(1);
  const [area, setArea] = useState(156);
  const [token, setToken] = useState('');
  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [styles, setStyles] = useState<StyleOption[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedStyle, setSelectedStyle] = useState('');
  const [optionsLoading, setOptionsLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem('userAccessToken');
    if (stored) setToken(stored);
  }, []);

  useEffect(() => {
    const loadOptions = async () => {
      setOptionsLoading(true);
      try {
        const [catRes, styleRes] = await Promise.all([
          axios.get('/api/categories'),
          axios.get('/api/styles'),
        ]);
        const cats: CategoryOption[] = (catRes.data?.data || []).map((c: any) => ({
          id: c.id,
          name: c.name,
        }));
        const styleList: StyleOption[] = (styleRes.data?.data || []).map((s: any) => ({
          id: s.id,
          name: s.name,
          categoryName: s.categoryName || s.category || '',
        }));
        setCategories(cats);
        setStyles(styleList);
        if (cats.length > 0) setSelectedCategory(cats[0].name);
        if (styleList.length > 0) setSelectedStyle(styleList[0].name);
      } catch (err) {
        console.error('Failed to load categories/styles:', err);
      } finally {
        setOptionsLoading(false);
      }
    };
    loadOptions();
  }, []);

  const filteredStyles = selectedCategory
    ? styles.filter(
        (s) =>
          !s.categoryName ||
          s.categoryName.toLowerCase() === selectedCategory.toLowerCase()
      )
    : styles;

  useEffect(() => {
    if (filteredStyles.length === 0) {
      setSelectedStyle('');
      return;
    }
    if (!filteredStyles.some((s) => s.name === selectedStyle)) {
      setSelectedStyle(filteredStyles[0].name);
    }
  }, [selectedCategory, styles]); // eslint-disable-line react-hooks/exhaustive-deps

  const [description, setDescription] = useState(
    'A modern duplex with open living area.'
  );

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
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const toggleRoom = (roomId: string) => {
    setRooms(
      rooms.map((room) =>
        room.id === roomId ? { ...room, included: !room.included } : room
      )
    );
  };

  const updateRoomCount = (roomId: string, count: number) => {
    setRooms(
      rooms.map((room) =>
        room.id === roomId ? { ...room, count: Math.max(0, count) } : room
      )
    );
  };

  const addNewRoom = () => {
    const newRoom: Room = {
      id: `room-${Date.now()}`,
      name: 'New Room',
      count: 1,
      included: true,
    };
    setRooms([...rooms, newRoom]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(false);
    const includedRooms = rooms.filter((r) => r.included);

    const getRoomCount = (namePart: string) =>
      includedRooms
        .filter((r) => r.name.toLowerCase().includes(namePart))
        .reduce((sum, room) => sum + room.count, 0);

    const totalBedrooms = getRoomCount('bedroom');
    const totalBathrooms = getRoomCount('bathroom');
    const totalDiningRooms = getRoomCount('dining room');
    const totalKitchen = getRoomCount('kitchen');

    const categoryValue = selectedStyle
      ? `${selectedCategory}${selectedStyle ? ` / ${selectedStyle}` : ''}`
      : selectedCategory || 'Custom';

    const payload = {
      bedrooms: totalBedrooms,
      bathrooms: totalBathrooms,
      dining_rooms: totalDiningRooms,
      kitchen: totalKitchen,
      floors: floors,
      total_area: area,
      category: categoryValue,
      description: description,
    };

    const currentToken = localStorage.getItem('userAccessToken') || token;

    if (!currentToken) {
      setError('Please Login First');
      setIsLoading(false);
      return;
    }

    try {
      await axios.post('/api/custom-plan', payload, {
        headers: {
          Authorization: `Bearer ${currentToken}`,
        },
      });
      setSuccess(true);
    } catch (err) {
      console.error('Submission failed:', err);
      const status = axios.isAxiosError(err) ? err.response?.status : undefined;
      if (status === 401 || status === 403) {
        setError('Your session has expired. Please log in again.');
      } else {
        const message = axios.isAxiosError(err)
          ? err.response?.data?.error || err.message
          : 'Something went wrong. Please try again.';
        setError(message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-lg p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Custom Plan Builder</h2>

      <div className="mb-8">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Basic Configuration</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Number Of Floors
            </label>
            <select
              value={floors}
              onChange={(e) => setFloors(Number(e.target.value))}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-700 focus:border-yellow-700"
            >
              {[1, 2, 3].map((num) => (
                <option key={num} value={num}>
                  {num}
                </option>
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
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-700 focus:border-yellow-700"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Category
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              disabled={optionsLoading || categories.length === 0}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-700 focus:border-yellow-700 disabled:bg-gray-100"
            >
              {categories.length === 0 ? (
                <option value="">No categories available</option>
              ) : (
                categories.map((cat) => (
                  <option key={cat.id} value={cat.name}>
                    {cat.name}
                  </option>
                ))
              )}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Style
            </label>
            <select
              value={selectedStyle}
              onChange={(e) => setSelectedStyle(e.target.value)}
              disabled={optionsLoading || filteredStyles.length === 0}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-700 focus:border-yellow-700 disabled:bg-gray-100"
            >
              {filteredStyles.length === 0 ? (
                <option value="">No styles available</option>
              ) : (
                filteredStyles.map((style) => (
                  <option key={style.id} value={style.name}>
                    {style.name}
                  </option>
                ))
              )}
            </select>
          </div>
        </div>
      </div>

      <div className="mb-8">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Room Selection</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {rooms.map((room) => (
            <div
              key={room.id}
              className="flex items-center justify-between p-4 border border-gray-200 rounded-lg"
            >
              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={room.included}
                  onChange={() => toggleRoom(room.id)}
                  className="w-4 h-4 text-yellow-900 border-gray-300 rounded focus:ring-yellow-700"
                />
                <span className="text-gray-700 font-medium">{room.name}</span>
              </div>

              {room.included && (
                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={() => updateRoomCount(room.id, room.count - 1)}
                    disabled={room.count <= 1}
                    className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center disabled:opacity-50"
                  >
                    -
                  </button>
                  <span className="w-8 text-center font-semibold">{room.count}</span>
                  <button
                    type="button"
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

        <button
          type="button"
          onClick={addNewRoom}
          className="mt-4 flex items-center space-x-2 text-yellow-700 hover:text-yellow-900 font-semibold"
        >
          <span>+</span>
          <span>Add another room</span>
        </button>
      </div>

      <div className="mb-8">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Project Description</h3>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={4}
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-700 focus:border-yellow-700"
          placeholder="e.g., A modern duplex with open living area, facing the east..."
          required
        />
      </div>

      {isLoading && (
        <p className="text-gray-700 font-medium text-center mb-4">
          Submitting custom plan...
        </p>
      )}
      {error && (
        <p className="text-red-600 font-medium text-center mb-4 border border-red-300 bg-red-50 p-3 rounded-lg">
          Error: {error}
        </p>
      )}
      {success && (
        <p className="text-amber-800 font-medium text-center mb-4 border border-amber-300 bg-amber-50 p-3 rounded-lg">
          Success! Your custom project has been submitted.
        </p>
      )}

      <div className="border-t border-gray-200 pt-6">
        <button
          type="submit"
          disabled={isLoading}
          className="w-full btn-primary py-4 text-lg disabled:bg-gray-400 disabled:hover:bg-gray-400"
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
