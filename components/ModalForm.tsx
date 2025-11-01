'use client';
import { useState, useEffect } from 'react';
import API from '@/utils/api';

type Props = {
  mode: 'create' | 'edit';
  project?: any;
  onSuccess: () => void;
  onClose: () => void;
};

export default function ModalForm({ mode, project, onSuccess, onClose }: Props) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    thumbnail: '',
    status: '',
    rooms: 0,
    height: 0,
    width: 0,
    areaSqFt: 0,
    location: '',
    bedrooms: 0,
    bathrooms: 0,
    floors: 0,
    categoty: '',
    style: '',
    price: '',
  });

  useEffect(() => {
    if (mode === 'edit' && project) {
      setFormData({ ...project });
    }
  }, [project, mode]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (mode === 'create') {
        await API.post('/houseprojects', formData);
      } else if (mode === 'edit' && project) {
        await API.patch(`/houseprojects/${project.id}`, formData);
      }
      onSuccess();
      onClose();
    } catch (err) {
      console.error(err);
      alert('Error submitting the form');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
      <form
        onSubmit={handleSubmit}
        className="bg-gray-800 p-6 rounded-lg w-full max-w-5xl max-h-[90vh] overflow-y-auto"
      >
        <h2 className="text-xl font-bold mb-6 text-white">
          {mode === 'create' ? 'Create' : 'Edit'} Project
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          {/* Title - Full width */}
          <div className="md:col-span-2 lg:col-span-3">
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Title *
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="Enter project title"
              className="w-full p-2 rounded bg-gray-700 text-white placeholder-gray-400"
              required
            />
          </div>

          {/* Description - Full width */}
          <div className="md:col-span-2 lg:col-span-3">
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Enter project description"
              rows={3}
              className="w-full p-2 rounded bg-gray-700 text-white placeholder-gray-400"
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Category
            </label>
            <input
              type="text"
              name="categoty"
              value={formData.categoty}
              onChange={handleChange}
              placeholder="e.g., Residential, Commercial"
              className="w-full p-2 rounded bg-gray-700 text-white placeholder-gray-400"
            />
          </div>

          {/* Style */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Style
            </label>
            <input
              type="text"
              name="style"
              value={formData.style}
              onChange={handleChange}
              placeholder="e.g., Modern, Traditional"
              className="w-full p-2 rounded bg-gray-700 text-white placeholder-gray-400"
            />
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Status
            </label>
            <input
              type="text"
              name="status"
              value={formData.status}
              onChange={handleChange}
              placeholder="e.g., Available, Sold"
              className="w-full p-2 rounded bg-gray-700 text-white placeholder-gray-400"
            />
          </div>

          {/* Location - Span 2 columns */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Location
            </label>
            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleChange}
              placeholder="Enter property location"
              className="w-full p-2 rounded bg-gray-700 text-white placeholder-gray-400"
            />
          </div>

          {/* Price */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Price
            </label>
            <input
              type="text"
              name="price"
              value={formData.price}
              onChange={handleChange}
              placeholder="e.g., $250,000"
              className="w-full p-2 rounded bg-gray-700 text-white placeholder-gray-400"
            />
          </div>

          {/* Bedrooms */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Bedrooms
            </label>
            <input
              type="number"
              name="bedrooms"
              value={formData.bedrooms}
              onChange={handleChange}
              placeholder="Number of bedrooms"
              className="w-full p-2 rounded bg-gray-700 text-white placeholder-gray-400"
            />
          </div>

          {/* Bathrooms */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Bathrooms
            </label>
            <input
              type="number"
              name="bathrooms"
              value={formData.bathrooms}
              onChange={handleChange}
              placeholder="Number of bathrooms"
              className="w-full p-2 rounded bg-gray-700 text-white placeholder-gray-400"
            />
          </div>

          {/* Rooms */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Total Rooms
            </label>
            <input
              type="number"
              name="rooms"
              value={formData.rooms}
              onChange={handleChange}
              placeholder="Total number of rooms"
              className="w-full p-2 rounded bg-gray-700 text-white placeholder-gray-400"
            />
          </div>

          {/* Floors */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Floors
            </label>
            <input
              type="number"
              name="floors"
              value={formData.floors}
              onChange={handleChange}
              placeholder="Number of floors"
              className="w-full p-2 rounded bg-gray-700 text-white placeholder-gray-400"
            />
          </div>

          {/* Height */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Height (ft)
            </label>
            <input
              type="number"
              name="height"
              value={formData.height}
              onChange={handleChange}
              placeholder="Height in feet"
              className="w-full p-2 rounded bg-gray-700 text-white placeholder-gray-400"
            />
          </div>

          {/* Width */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Width (ft)
            </label>
            <input
              type="number"
              name="width"
              value={formData.width}
              onChange={handleChange}
              placeholder="Width in feet"
              className="w-full p-2 rounded bg-gray-700 text-white placeholder-gray-400"
            />
          </div>

          {/* Area Sq Ft */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Area (sq ft)
            </label>
            <input
              type="number"
              name="areaSqFt"
              value={formData.areaSqFt}
              onChange={handleChange}
              placeholder="Total square footage"
              className="w-full p-2 rounded bg-gray-700 text-white placeholder-gray-400"
            />
          </div>

          {/* Thumbnail - Full width */}
          <div className="md:col-span-2 lg:col-span-3">
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Thumbnail URL
            </label>
            <input
              type="text"
              name="thumbnail"
              value={formData.thumbnail}
              onChange={handleChange}
              placeholder="Enter image URL"
              className="w-full p-2 rounded bg-gray-700 text-white placeholder-gray-400"
            />
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-4 border-t border-gray-700">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-gray-600 rounded hover:bg-gray-500 text-white"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-white text-gray-900 rounded hover:bg-gray-200"
          >
            {mode === 'create' ? 'Create' : 'Update'}
          </button>
        </div>
      </form>
    </div>
  );
}