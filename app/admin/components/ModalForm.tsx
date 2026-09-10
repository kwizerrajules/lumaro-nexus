'use client';
import { useState, useEffect, useRef } from 'react';
import API from '../../../utils/api';
import {
  MAX_IMAGE_BYTES,
  uploadImageToCloudinary,
  uploadImagesToCloudinary,
} from '../../../utils/cloudinaryUpload';
import { invalidateHouseProjectsCache } from '../../../utils/productCache';
import { formatFloor, FLOOR_G_OPTIONS } from '../../../utils/brand';
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
  const [thumbnailUploading, setThumbnailUploading] = useState(false);
  const [additionalUploading, setAdditionalUploading] = useState(false);
  const [thumbMode, setThumbMode] = useState<'file' | 'url'>('file');
  const [additionalMode, setAdditionalMode] = useState<'file' | 'url'>('file');
  const [additionalUrlInput, setAdditionalUrlInput] = useState('');
  const [uploadNotice, setUploadNotice] = useState<string | null>(null);
  /** Remount file inputs so the same file can be chosen again after an error */
  const [thumbInputKey, setThumbInputKey] = useState(0);
  const [extraInputKey, setExtraInputKey] = useState(0);
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

    setFormData((prev) => ({
      ...prev,
      [name]: numericFields.includes(name)
        ? value === ''
          ? 0
          : parseFloat(value)
        : value,
    }));
  };

  /** Upload thumbnail as soon as a file is chosen — keep URL so save can retry without re-upload */
  const handleThumbnailChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      validateFileSize(file);
      setError(null);
      setUploadNotice(null);
      setThumbnailUploading(true);
      setUploadProgress('Uploading thumbnail to Cloudinary…');
      const url = await uploadImageToCloudinary(file);
      setFormData((prev) => ({ ...prev, thumbnail: url }));
      setUploadProgress('Thumbnail uploaded');
    } catch (err: any) {
      const msg = err?.message || 'Thumbnail upload failed — choose the image again';
      console.warn('Thumbnail upload failed:', err);
      if (msg.includes('Cloudinary is not configured')) {
        setUploadNotice(
          'Cloudinary is not configured in .env.local. Switch to "Paste Image URL" above to paste an image link directly.'
        );
      } else {
        setError(msg);
      }
      // Remount input so the same file can be selected again
      setThumbInputKey((k) => k + 1);
    } finally {
      setThumbnailUploading(false);
      setTimeout(() => setUploadProgress(null), 1500);
    }
  };

  /** Upload additional images in parallel as soon as selected */
  const handleAdditionalChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    try {
      files.forEach(validateFileSize);
      setError(null);
      setUploadNotice(null);
      setAdditionalUploading(true);
      setUploadProgress(
        `Uploading ${files.length} additional image(s) to Cloudinary…`
      );
      const urls = await uploadImagesToCloudinary(files);
      setFormData((prev) => ({
        ...prev,
        // Append so a failed save can keep previous successful uploads
        additionalImages: [...prev.additionalImages, ...urls],
      }));
      setUploadProgress(`${urls.length} additional image(s) uploaded`);
      setExtraInputKey((k) => k + 1);
    } catch (err: any) {
      const msg = err?.message || 'Additional image upload failed';
      console.warn('Additional images upload failed:', err);
      if (msg.includes('Cloudinary is not configured')) {
        setUploadNotice(
          'Cloudinary is not configured in .env.local. Switch to "Add Image URL" above to paste image links directly.'
        );
      } else {
        setError(msg);
      }
      setExtraInputKey((k) => k + 1);
    } finally {
      setAdditionalUploading(false);
      setTimeout(() => setUploadProgress(null), 1500);
    }
  };

  const clearThumbnail = () => {
    setFormData((prev) => ({ ...prev, thumbnail: '' }));
    setThumbInputKey((k) => k + 1);
  };

  const removeAdditionalAt = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      additionalImages: prev.additionalImages.filter((_, i) => i !== index),
    }));
  };

  const clearAdditional = () => {
    setFormData((prev) => ({ ...prev, additionalImages: [] }));
    setExtraInputKey((k) => k + 1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (thumbnailUploading || additionalUploading) {
      setError('Please wait for image uploads to finish');
      return;
    }

    setIsLoading(true);
    setError(null);
    setUploadProgress(null);

    try {
      if (mode === 'create' && !formData.thumbnail) {
        throw new Error('Please upload a thumbnail image');
      }

      setUploadProgress('Saving project…');

      const payload = {
        ...formData,
        price:
          formData.price === '' || formData.price === null
            ? 0
            : Number(formData.price),
        height: formData.height > 0 ? formData.height : undefined,
        width: formData.width > 0 ? formData.width : undefined,
        areaSqFt: formData.areaSqFt > 0 ? formData.areaSqFt : undefined,
        location: formData.location.trim() || undefined,
        type: formData.type.trim().length >= 5 ? formData.type.trim() : undefined,
        category: formData.category.trim() || undefined,
        style: formData.style.trim() || undefined,
        status: formData.status.trim() || undefined,
        description: formData.description.trim(),
      };

      if (!payload.description) {
        throw new Error('Description is required');
      }

      if (mode === 'create') {
        await API.post('/houseprojects', payload);
      } else if (mode === 'edit' && project) {
        await API.patch(`/houseprojects/${project.id}`, payload);
      }

      // Drop stale home/catalog session cache so new plans show immediately
      invalidateHouseProjectsCache();
      onSuccess();
      onClose();
    } catch (err: any) {
      console.error('Form submission error:', err);
      setError(
        err?.response?.data?.error ||
          err.message ||
          'An unexpected error occurred. Please try again.'
      );
      // Images already on Cloudinary stay in formData — retry save without re-upload
    } finally {
      setIsLoading(false);
      setUploadProgress(null);
    }
  };

  const imagesBusy = thumbnailUploading || additionalUploading;

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
            <p className="text-sm mt-2 text-red-600">
              Uploaded images are kept — fix the fields above and save again, or
              pick new images if an upload failed.
            </p>
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
              Description *
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={3}
              placeholder="Enter project description"
              className="w-full p-2 border rounded border-gray-300"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Category
            </label>
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
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Style
            </label>
            <StyleSelect
              categoryName={formData.category}
              value={formData.style}
              onChange={(name) =>
                setFormData((prev) => ({ ...prev, style: name }))
              }
              disabled={isLoading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <input
              type="text"
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full p-2 border rounded border-gray-300"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Location
            </label>
            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleChange}
              className="w-full p-2 border rounded border-gray-300"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Price
            </label>
            <input
              type="text"
              name="price"
              value={formData.price}
              onChange={handleChange}
              className="w-full p-2 border rounded border-gray-300"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Bedrooms
            </label>
            <input
              type="number"
              name="bedrooms"
              value={formData.bedrooms}
              onChange={handleChange}
              className="w-full p-2 border rounded border-gray-300"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Bathrooms
            </label>
            <input
              type="number"
              name="bathrooms"
              value={formData.bathrooms}
              onChange={handleChange}
              className="w-full p-2 border rounded border-gray-300"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Rooms
            </label>
            <input
              type="number"
              name="rooms"
              value={formData.rooms}
              onChange={handleChange}
              className="w-full p-2 border rounded border-gray-300"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Floors (G+)
            </label>
            <select
              name="floors"
              value={formData.floors || 1}
              onChange={handleChange}
              className="w-full p-2 border rounded border-gray-300 bg-white"
            >
              {FLOOR_G_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
              {formData.floors > 12 && (
                <option value={formData.floors}>
                  {formatFloor(formData.floors)} ({formData.floors} Levels)
                </option>
              )}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Height (m){' '}
              <span className="text-gray-400 font-normal">optional</span>
            </label>
            <input
              type="number"
              name="height"
              min={0}
              step="any"
              value={formData.height || ''}
              onChange={handleChange}
              placeholder="Leave blank if unknown"
              className="w-full p-2 border rounded border-gray-300"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Width (m){' '}
              <span className="text-gray-400 font-normal">optional</span>
            </label>
            <input
              type="number"
              name="width"
              min={0}
              step="any"
              value={formData.width || ''}
              onChange={handleChange}
              placeholder="Leave blank if unknown"
              className="w-full p-2 border rounded border-gray-300"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Area (m²){' '}
              <span className="text-gray-400 font-normal">optional</span>
            </label>
            <input
              type="number"
              name="areaSqFt"
              min={0}
              step="any"
              value={formData.areaSqFt || ''}
              onChange={handleChange}
              placeholder="Leave blank if unknown"
              className="w-full p-2 border rounded border-gray-300"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Type{' '}
              <span className="text-gray-400 font-normal">
                optional · min 5 chars
              </span>
            </label>
            <input
              type="text"
              name="type"
              value={formData.type}
              onChange={handleChange}
              placeholder="e.g. RESIDENTIAL"
              className="w-full p-2 border rounded border-gray-300"
            />
          </div>

          <div className="md:col-span-2 lg:col-span-3">
            <div className="flex items-center justify-between mb-1">
              <label className="block text-sm font-medium text-gray-700">
                Thumbnail image {mode === 'create' ? '*' : '(optional)'}
              </label>
              <div className="inline-flex rounded-md shadow-sm border border-gray-200 overflow-hidden text-xs">
                <button
                  type="button"
                  onClick={() => setThumbMode('file')}
                  className={`px-3 py-1 font-medium transition ${
                    thumbMode === 'file'
                      ? 'bg-blue-600 text-white'
                      : 'bg-white text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  Upload File
                </button>
                <button
                  type="button"
                  onClick={() => setThumbMode('url')}
                  className={`px-3 py-1 font-medium transition ${
                    thumbMode === 'url'
                      ? 'bg-blue-600 text-white'
                      : 'bg-white text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  Paste Image URL
                </button>
              </div>
            </div>

            {thumbMode === 'file' ? (
              <>
                <input
                  key={thumbInputKey}
                  ref={thumbnailInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/gif,image/webp"
                  onChange={handleThumbnailChange}
                  disabled={thumbnailUploading || isLoading}
                  className="w-full p-2 border rounded border-gray-300 bg-white"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Max 5MB. Uploads immediately to Cloudinary when you select a file.
                  {thumbnailUploading ? ' Uploading…' : ''}
                </p>
              </>
            ) : (
              <div>
                <input
                  type="url"
                  value={formData.thumbnail}
                  onChange={(e) => setFormData((prev) => ({ ...prev, thumbnail: e.target.value.trim() }))}
                  placeholder="https://example.com/house-thumbnail.jpg"
                  disabled={isLoading}
                  className="w-full p-2 border rounded border-gray-300"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Enter a direct web link to an image (e.g., from Cloudinary, Unsplash, or any image host).
                </p>
              </div>
            )}

            {uploadNotice && (
              <div className="mt-2 p-3 bg-amber-50 border border-amber-200 text-amber-800 text-xs rounded-lg flex items-center justify-between">
                <span>{uploadNotice}</span>
                <button
                  type="button"
                  onClick={() => setThumbMode('url')}
                  className="ml-2 font-semibold underline hover:text-amber-900 shrink-0"
                >
                  Switch to URL
                </button>
              </div>
            )}

            {formData.thumbnail && (
              <div className="mt-2 flex items-start gap-3 p-2.5 bg-gray-50 rounded-lg border border-gray-200">
                <img
                  src={formData.thumbnail}
                  alt="Thumbnail preview"
                  className="h-28 w-auto max-w-[200px] object-cover rounded border border-gray-300 shadow-sm"
                />
                <div className="flex flex-col gap-1 overflow-hidden">
                  <span className="text-xs text-green-700 font-semibold flex items-center gap-1">
                    ✓ Thumbnail attached
                  </span>
                  <span className="text-xs text-gray-500 font-mono truncate max-w-sm" title={formData.thumbnail}>
                    {formData.thumbnail}
                  </span>
                  <button
                    type="button"
                    onClick={clearThumbnail}
                    className="text-xs text-red-600 hover:underline mt-1 text-left"
                    disabled={isLoading}
                  >
                    Remove thumbnail
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="md:col-span-2 lg:col-span-3">
            <div className="flex items-center justify-between mb-1">
              <label className="block text-sm font-medium text-gray-700">
                Additional images (optional)
              </label>
              <div className="inline-flex rounded-md shadow-sm border border-gray-200 overflow-hidden text-xs">
                <button
                  type="button"
                  onClick={() => setAdditionalMode('file')}
                  className={`px-3 py-1 font-medium transition ${
                    additionalMode === 'file'
                      ? 'bg-blue-600 text-white'
                      : 'bg-white text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  Upload Files
                </button>
                <button
                  type="button"
                  onClick={() => setAdditionalMode('url')}
                  className={`px-3 py-1 font-medium transition ${
                    additionalMode === 'url'
                      ? 'bg-blue-600 text-white'
                      : 'bg-white text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  Add Image URL
                </button>
              </div>
            </div>

            {additionalMode === 'file' ? (
              <>
                <input
                  key={extraInputKey}
                  ref={additionalInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/gif,image/webp"
                  multiple
                  onChange={handleAdditionalChange}
                  disabled={additionalUploading || isLoading}
                  className="w-full p-2 border rounded border-gray-300 bg-white"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Each max 5MB. Uploads in parallel when selected; you can add more batches.
                  {additionalUploading ? ' Uploading…' : ''}
                </p>
              </>
            ) : (
              <div className="flex gap-2">
                <input
                  type="url"
                  value={additionalUrlInput}
                  onChange={(e) => setAdditionalUrlInput(e.target.value)}
                  placeholder="https://example.com/floor-plan-1.jpg"
                  disabled={isLoading}
                  className="flex-1 p-2 border rounded border-gray-300 text-sm"
                />
                <button
                  type="button"
                  onClick={() => {
                    const trimmed = additionalUrlInput.trim();
                    if (trimmed) {
                      setFormData((prev) => ({
                        ...prev,
                        additionalImages: [...prev.additionalImages, trimmed],
                      }));
                      setAdditionalUrlInput('');
                    }
                  }}
                  disabled={isLoading || !additionalUrlInput.trim()}
                  className="px-4 py-2 bg-blue-600 text-white rounded text-sm font-semibold hover:bg-blue-700 disabled:opacity-50"
                >
                  Add URL
                </button>
              </div>
            )}

            {formData.additionalImages.length > 0 && (
              <div className="mt-2">
                <div className="flex flex-wrap gap-2">
                  {formData.additionalImages.map((src, idx) => (
                    <div key={`${src}-${idx}`} className="relative group">
                      <img
                        src={src}
                        alt={`Additional ${idx + 1}`}
                        className="h-20 w-20 object-cover rounded border"
                      />
                      <button
                        type="button"
                        onClick={() => removeAdditionalAt(idx)}
                        className="absolute -top-1 -right-1 bg-red-600 text-white text-xs w-5 h-5 rounded-full"
                        aria-label={`Remove image ${idx + 1}`}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={clearAdditional}
                  className="mt-2 text-sm text-red-600 hover:underline"
                  disabled={isLoading}
                >
                  Clear all additional images
                </button>
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
            disabled={isLoading || imagesBusy}
            className="px-4 py-2 bg-blue-600 text-white rounded disabled:bg-blue-300"
          >
            {isLoading
              ? 'Submitting...'
              : imagesBusy
                ? 'Waiting for uploads…'
                : mode === 'create'
                  ? 'Create'
                  : 'Update'}
          </button>
        </div>
      </form>
    </div>
  );
}
