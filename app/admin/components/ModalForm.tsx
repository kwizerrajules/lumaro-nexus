'use client';
import { useState, useEffect, useRef } from 'react';
import API from '../../../utils/api';
import {
  MAX_IMAGE_BYTES,
  uploadImageToCloudinary,
  uploadImagesToCloudinary,
} from '../../../utils/cloudinaryUpload';
import CategoryCombobox from './CategoryCombobox';
import StyleSelect from './StyleSelect';

type Props = {
  mode: 'create' | 'edit';
  project?: any;
  onSuccess: () => void;
  onClose: () => void;
};

export default function ModalForm({ mode, project, onSuccess, onClose }: Props) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState<string | null>(null);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [additionalFiles, setAdditionalFiles] = useState<File[]>([]);
  const [thumbnailPreview, setThumbnailPreview] = useState<string>('');
  const [additionalPreviews, setAdditionalPreviews] = useState<string[]>([]);
  const thumbnailInputRef = useRef<HTMLInputElement>(null);
  const additionalInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    thumbnail: '',
    additionalImages: [] as string[],
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
      const existingAdditional = Array.isArray(project.additionalImages)
        ? project.additionalImages
        : [];
      setFormData({
        title: project.title || '',
        description: project.description || '',
        thumbnail: project.thumbnail || '',
        additionalImages: existingAdditional,
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
      setThumbnailPreview(project.thumbnail || '');
      setAdditionalPreviews(existingAdditional);
    }
  }, [project, mode]);

  const validateFileSize = (file: File) => {
    if (file.size > MAX_IMAGE_BYTES) {
      throw new Error(`"${file.name}" exceeds the 5MB limit`);
    }
  };

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

    setFormData(prev => ({
      ...prev,
      [name]: numericFields.includes(name)
        ? (value === '' ? 0 : parseFloat(value))
        : value,
    }));
  };

  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      validateFileSize(file);
      setError(null);
      setThumbnailFile(file);
      setThumbnailPreview(URL.createObjectURL(file));
    } catch (err: any) {
      setError(err.message);
      if (thumbnailInputRef.current) thumbnailInputRef.current.value = '';
    }
  };

  const handleAdditionalChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    try {
      files.forEach(validateFileSize);
      setError(null);
      setAdditionalFiles(files);
      setAdditionalPreviews(files.map(f => URL.createObjectURL(f)));
    } catch (err: any) {
      setError(err.message);
      if (additionalInputRef.current) additionalInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setUploadProgress(null);

    try {
      let thumbnailUrl = formData.thumbnail;
      let additionalImageUrls = [...formData.additionalImages];

      if (thumbnailFile) {
        setUploadProgress('Uploading thumbnail to Cloudinary…');
        thumbnailUrl = await uploadImageToCloudinary(thumbnailFile);
      }

      if (mode === 'create' && !thumbnailUrl) {
        throw new Error('Please select a thumbnail image');
      }

      if (additionalFiles.length > 0) {
        setUploadProgress(
          `Uploading ${additionalFiles.length} additional image(s) to Cloudinary…`
        );
        additionalImageUrls = await uploadImagesToCloudinary(additionalFiles);
      }

      setUploadProgress('Saving project…');

      const payload = {
        ...formData,
        thumbnail: thumbnailUrl,
        additionalImages: additionalImageUrls,
        price:
          formData.price === '' || formData.price === null
            ? 0
            : Number(formData.price),
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
      setError(
        err?.response?.data?.error ||
          err.message ||
          'An unexpected error occurred. Please try again.'
      );
    } finally {
      setIsLoading(false);
      setUploadProgress(null);
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

        {uploadProgress && (
          <div className="bg-blue-50 border border-blue-200 text-blue-800 px-4 py-3 rounded mb-4">
            {uploadProgress}
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
            <CategoryCombobox
              value={formData.category}
              onChange={(name) =>
                setFormData((prev) => ({
                  ...prev,
                  category: name,
                  style: prev.category === name ? prev.style : '',
                }))
              }
              disabled={isLoading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Style</label>
            <StyleSelect
              categoryName={formData.category}
              value={formData.style}
              onChange={(name) => setFormData((prev) => ({ ...prev, style: name }))}
              disabled={isLoading}
            />
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
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Thumbnail image {mode === 'create' ? '*' : '(optional — leave empty to keep current)'}
            </label>
            <input
              ref={thumbnailInputRef}
              type="file"
              accept="image/jpeg,image/png,image/gif,image/webp"
              onChange={handleThumbnailChange}
              className="w-full p-2 border rounded border-gray-300"
              required={mode === 'create'}
            />
            <p className="text-xs text-gray-500 mt-1">Max 5MB. Uploaded to Cloudinary; only the URL is stored.</p>
            {thumbnailPreview && (
              <img
                src={thumbnailPreview}
                alt="Thumbnail preview"
                className="mt-2 h-32 w-auto object-cover rounded border"
              />
            )}
          </div>

          <div className="md:col-span-2 lg:col-span-3">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Additional images (multi-select)
            </label>
            <input
              ref={additionalInputRef}
              type="file"
              accept="image/jpeg,image/png,image/gif,image/webp"
              multiple
              onChange={handleAdditionalChange}
              className="w-full p-2 border rounded border-gray-300"
            />
            <p className="text-xs text-gray-500 mt-1">
              Select multiple images (each max 5MB). Replacing files overwrites previous additional images on save.
            </p>
            {additionalPreviews.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {additionalPreviews.map((src, idx) => (
                  <img
                    key={`${src}-${idx}`}
                    src={src}
                    alt={`Additional ${idx + 1}`}
                    className="h-20 w-20 object-cover rounded border"
                  />
                ))}
              </div>
            )}
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
