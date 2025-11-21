'use client';
import { useState, useEffect } from 'react';
import API from '../../../utils/api';

type Props = {
  mode: 'create' | 'edit';
  project?: any;
  onSuccess: () => void;
  onClose: () => void;
};

export default function ModalForm({ mode, project, onSuccess, onClose }: Props) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    thumbnail: '',
    additionalImages: '',
    status: '',
    rooms: 0,
    height: 0,
    width: 0,
    areaSqFt: 0,
    location: '',
    bedrooms: 0,
    bathrooms: 0,
    floors: 0,
    category: '',
    style: '',
    type: '',
    price: '',
  });

  useEffect(() => {
    if (mode === 'edit' && project) {
      setFormData({
        title: project.title || '',
        description: project.description || '',
        thumbnail: '',
        additionalImages: Array.isArray(project.additionalImages)
          ? project.additionalImages.join('\n')
          : '',
        status: project.status || '',
        rooms: project.rooms || 0,
        height: project.height || 0,
        width: project.width || 0,
        areaSqFt: project.areaSqFt || 0,
        location: project.location || '',
        bedrooms: project.bedrooms || 0,
        bathrooms: project.bathrooms || 0,
        floors: project.floors || 0,
        category: project.category || '',
        style: project.style || '',
        type: project.type || '',
        price: project.price || '',
      });
    }
  }, [project, mode]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;

    const numericFields = [
      'rooms',
      'height',
      'width',
      'areaSqFt',
      'bedrooms',
      'bathrooms',
      'floors',
    ];

    if (name === 'additionalImages') {
      setFormData(prev => ({ ...prev, additionalImages: value }));
      return;
    }

    setFormData(prev => ({
      ...prev,
      [name]: numericFields.includes(name)
        ? (value === '' ? 0 : parseFloat(value))
        : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const payload = {
        ...formData,
        additionalImages: formData.additionalImages
          .split('\n')
          .map(url => url.trim())
          .filter(url => url.length > 0),
      };

      if (mode === 'create') {
        await API.post('/houseprojects', payload);
      } else if (mode === 'edit' && project) {
        await API.patch(`/houseprojects/${project.id}`, payload);
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      console.error('Form submission error:', err);
      setError(err.message || 'An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-20 flex justify-center items-center z-50 p-4">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded-lg w-full max-w-5xl max-h-[90vh] overflow-y-auto shadow-lg"
      >
        <h2 className="text-xl font-bold mb-6 text-gray-800">
          {mode === 'create' ? 'Create' : 'Edit'} Project
        </h2>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
            <strong className="font-bold">Error: </strong>
            <span className="block sm:inline">{error}</span>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          <div className="md:col-span-2 lg:col-span-3">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Title *
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="Enter project title"
              className="w-full p-2 border rounded border-gray-300"
              required
            />
          </div>

          <div className="md:col-span-2 lg:col-span-3">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={3}
              placeholder="Enter project description"
              className="w-full p-2 border rounded border-gray-300"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <input type="text" name="category" value={formData.category} onChange={handleChange} className="w-full p-2 border rounded border-gray-300" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Style</label>
            <input type="text" name="style" value={formData.style} onChange={handleChange} className="w-full p-2 border rounded border-gray-300" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <input type="text" name="status" value={formData.status} onChange={handleChange} className="w-full p-2 border rounded border-gray-300" />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
            <input type="text" name="location" value={formData.location} onChange={handleChange} className="w-full p-2 border rounded border-gray-300" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Price</label>
            <input type="text" name="price" value={formData.price} onChange={handleChange} className="w-full p-2 border rounded border-gray-300" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Bedrooms</label>
            <input type="number" name="bedrooms" value={formData.bedrooms} onChange={handleChange} className="w-full p-2 border rounded border-gray-300" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Bathrooms</label>
            <input type="number" name="bathrooms" value={formData.bathrooms} onChange={handleChange} className="w-full p-2 border rounded border-gray-300" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Rooms</label>
            <input type="number" name="rooms" value={formData.rooms} onChange={handleChange} className="w-full p-2 border rounded border-gray-300" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Floors</label>
            <input type="number" name="floors" value={formData.floors} onChange={handleChange} className="w-full p-2 border rounded border-gray-300" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Height (ft)</label>
            <input type="number" name="height" value={formData.height} onChange={handleChange} className="w-full p-2 border rounded border-gray-300" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Width (ft)</label>
            <input type="number" name="width" value={formData.width} onChange={handleChange} className="w-full p-2 border rounded border-gray-300" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Area (sq ft)</label>
            <input type="number" name="areaSqFt" value={formData.areaSqFt} onChange={handleChange} className="w-full p-2 border rounded border-gray-300" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
            <input type="text" name="type" value={formData.type} onChange={handleChange} className="w-full p-2 border rounded border-gray-300" />
          </div>

          <div className="md:col-span-2 lg:col-span-3">
            <label className="block text-sm font-medium text-gray-700 mb-1">Thumbnail URL</label>
            <input
              type="text"
              name="thumbnail"
              value={formData.thumbnail}
              onChange={handleChange}
              placeholder="https://example.com/image.jpg"
              className="w-full p-2 border rounded border-gray-300"
            />
          </div>

          <div className="md:col-span-2 lg:col-span-3">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Additional Image URLs (one per line)
            </label>
            <textarea
              name="additionalImages"
              value={formData.additionalImages}
              onChange={handleChange}
              rows={4}
              placeholder={`https://example.com/img1.jpg\nhttps://example.com/img2.jpg`}
              className="w-full p-2 border rounded border-gray-300"
            />
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-4 border-t border-gray-200">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="px-4 py-2 bg-blue-600 text-white rounded disabled:bg-blue-300"
          >
            {isLoading ? 'Submitting...' : mode === 'create' ? 'Create' : 'Update'}
          </button>
        </div>
      </form>
    </div>
  );
}
