'use client';
import { useState, useEffect } from 'react';
import API from '../../../utils/api';
import { initializeApp, getApps } from "firebase/app";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";

// --- Initialize Firebase ---
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_TOKEN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGE_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};
if (!getApps().length) {
  initializeApp(firebaseConfig);
}
const storage = getStorage();

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
    thumbnail: null as File | null,
    additionalImages: [] as File[],
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

  // --- Pre-fill form in edit mode ---
  useEffect(() => {
    if (mode === 'edit' && project) {
      setFormData({
        title: project.title || '',
        description: project.description || '',
        thumbnail: null,
        additionalImages: [],
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

    if (e.target instanceof HTMLInputElement && e.target.files) {
      const { files } = e.target;
      if (name === 'thumbnail') {
        setFormData((prev) => ({ ...prev, thumbnail: files[0] || null }));
      } else if (name === 'additionalImages') {
        setFormData((prev) => ({ ...prev, additionalImages: Array.from(files) }));
      }
    } else {
      const isNumericField = ['rooms', 'height', 'width', 'areaSqFt', 'bedrooms', 'bathrooms', 'floors'].includes(name);
      setFormData((prev) => ({
        ...prev,
        [name]: isNumericField ? (value === '' ? 0 : parseFloat(value)) : value,
      }));
    }
  };

  const uploadFileToFirebase = async (file: File, folder: string) => {
    const fileRef = ref(storage, `${folder}/${Date.now()}_${file.name}`);
    await uploadBytes(fileRef, file);
    return getDownloadURL(fileRef);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      // Destructure files from formData to avoid including them in the JSON payload
      const { thumbnail, additionalImages, ...restOfData } = formData;
      // Upload images to Firebase and get URLs
      const thumbnailUrl = formData.thumbnail
        ? await uploadFileToFirebase(formData.thumbnail, 'thumbnails')
        : project?.thumbnail || '';

      const additionalImagesUrls = await Promise.all(
        formData.additionalImages.map((file) => uploadFileToFirebase(file, 'additional'))
      );

      const payload = {
        ...restOfData,
        thumbnail: thumbnailUrl,
        additionalImages: additionalImagesUrls.length > 0 ? additionalImagesUrls : project?.additionalImages || [],
      };

      if (mode === 'create') {
        await API.post('/houseprojects', payload);
      } else if (mode === 'edit' && project) {
        await API.patch(`/houseprojects/${project.id}`, payload);
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      console.error("Form submission error:", err);
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
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
            <strong className="font-bold">Error: </strong>
            <span className="block sm:inline">{error}</span>
          </div>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          {/* All your existing input fields */}
          <div className="md:col-span-2 lg:col-span-3">
            <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
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
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={3}
              placeholder="Enter project description"
              className="w-full p-2 border rounded border-gray-300"
            />
          </div>

          {/* Category, Style, Status, Location */}
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

          {/* Numeric fields */}
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

          {/* Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
            <input type="text" name="type" value={formData.type} onChange={handleChange} className="w-full p-2 border rounded border-gray-300" />
          </div>

          {/* Thumbnail */}
          <div className="md:col-span-2 lg:col-span-3">
            <label className="block text-sm font-medium text-gray-700 mb-1">Thumbnail</label>
            <input type="file" name="thumbnail" accept="image/*" onChange={handleChange} className="w-full p-2 border rounded border-gray-300" />
          </div>

          {/* Additional Images */}
          <div className="md:col-span-2 lg:col-span-3">
            <label className="block text-sm font-medium text-gray-700 mb-1">Additional Images</label>
            <input type="file" name="additionalImages" multiple accept="image/*" onChange={handleChange} className="w-full p-2 border rounded border-gray-300" />
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-4 border-t border-gray-200">
          <button type="button" onClick={onClose} disabled={isLoading} className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50">
            Cancel
          </button>
          <button type="submit" disabled={isLoading} className="px-4 py-2 bg-blue-600 text-white rounded disabled:bg-blue-300">
            {isLoading ? 'Submitting...' : (mode === 'create' ? 'Create' : 'Update')}
          </button>
        </div>
      </form>
    </div>
  );
}
