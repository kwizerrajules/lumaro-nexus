'use client';
import axios from 'axios';
import React, { useState, useEffect } from 'react';
import TurnstileWidget, { resetTurnstile } from '@/components/TurnstileWidget';

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
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const turnstileRequired = Boolean(
    process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY?.trim()
  );

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

    if (turnstileRequired && !turnstileToken) {
      setError('Please complete the human verification check.');
      setIsLoading(false);
      return;
    }

    try {
      await axios.post(
        '/api/custom-plan',
        { ...payload, turnstileToken: turnstileToken || undefined },
        {
          headers: {
            Authorization: `Bearer ${currentToken}`,
          },
        }
      );
      setSuccess(true);
      setTurnstileToken(null);
      resetTurnstile();
    } catch (err) {
      console.error('Submission failed:', err);
      setTurnstileToken(null);
      resetTurnstile();
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
    <form
      onSubmit={handleSubmit}
      className="bg-white rounded-xl shadow-lg p-4 sm:p-6 border border-brand-line"
    >
      <h2 className="font-display text-xl sm:text-2xl font-semibold text-neutral-900 mb-4 sm:mb-6">
        Custom Plan Builder
      </h2>

      <div className="mb-6 sm:mb-8">
        <h3 className="text-sm sm:text-lg font-semibold text-neutral-800 mb-3">
          Basic Configuration
        </h3>
        <div className="grid grid-cols-2 gap-3 sm:gap-4">
          <div>
            <label className="block text-xs sm:text-sm font-medium text-neutral-700 mb-1.5">
              Floors
            </label>
            <select
              value={floors}
              onChange={(e) => setFloors(Number(e.target.value))}
              className="input-brand text-sm py-2.5 px-3"
            >
              {[1, 2, 3].map((num) => (
                <option key={num} value={num}>
                  {num}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs sm:text-sm font-medium text-neutral-700 mb-1.5">
              Area (m²)
            </label>
            <input
              type="number"
              value={area}
              onChange={(e) => setArea(Number(e.target.value))}
              className="input-brand text-sm py-2.5 px-3"
              required
            />
          </div>

          <div>
            <label className="block text-xs sm:text-sm font-medium text-neutral-700 mb-1.5">
              Category
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              disabled={optionsLoading || categories.length === 0}
              className="input-brand text-sm py-2.5 px-3 disabled:bg-stone-100"
            >
              {categories.length === 0 ? (
                <option value="">No categories</option>
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
            <label className="block text-xs sm:text-sm font-medium text-neutral-700 mb-1.5">
              Style
            </label>
            <select
              value={selectedStyle}
              onChange={(e) => setSelectedStyle(e.target.value)}
              disabled={optionsLoading || filteredStyles.length === 0}
              className="input-brand text-sm py-2.5 px-3 disabled:bg-stone-100"
            >
              {filteredStyles.length === 0 ? (
                <option value="">No styles</option>
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

      <div className="mb-6 sm:mb-8">
        <h3 className="text-sm sm:text-lg font-semibold text-neutral-800 mb-3">
          Room Selection
        </h3>
        <div className="grid grid-cols-2 gap-2 sm:gap-3">
          {rooms.map((room) => (
            <div
              key={room.id}
              className="flex flex-col gap-2 p-2.5 sm:p-3 border border-brand-line bg-stone-50/50"
            >
              <label className="flex items-start gap-2 cursor-pointer min-w-0">
                <input
                  type="checkbox"
                  checked={room.included}
                  onChange={() => toggleRoom(room.id)}
                  className="mt-0.5 w-4 h-4 shrink-0 text-amber-700 border-stone-300 rounded focus:ring-amber-500"
                />
                <span className="text-xs sm:text-sm text-neutral-800 font-medium leading-snug">
                  {room.name}
                </span>
              </label>

              {room.included && (
                <div className="flex items-center justify-end gap-1.5">
                  <button
                    type="button"
                    onClick={() => updateRoomCount(room.id, room.count - 1)}
                    disabled={room.count <= 1}
                    className="w-7 h-7 sm:w-8 sm:h-8 bg-stone-200 rounded-full flex items-center justify-center text-sm disabled:opacity-50"
                    aria-label={`Decrease ${room.name}`}
                  >
                    -
                  </button>
                  <span className="w-6 text-center text-sm font-semibold">
                    {room.count}
                  </span>
                  <button
                    type="button"
                    onClick={() => updateRoomCount(room.id, room.count + 1)}
                    className="w-7 h-7 sm:w-8 sm:h-8 bg-stone-200 rounded-full flex items-center justify-center text-sm"
                    aria-label={`Increase ${room.name}`}
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
          className="mt-3 flex items-center gap-2 text-sm text-amber-800 hover:text-amber-950 font-semibold"
        >
          <span>+</span>
          <span>Add another room</span>
        </button>
      </div>

      <div className="mb-6 sm:mb-8">
        <h3 className="text-sm sm:text-lg font-semibold text-neutral-800 mb-3">
          Project Description
        </h3>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          className="input-brand text-sm"
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
        <TurnstileWidget
          theme="light"
          onToken={setTurnstileToken}
          className="mb-4"
        />
        <button
          type="submit"
          disabled={isLoading || (turnstileRequired && !turnstileToken)}
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
