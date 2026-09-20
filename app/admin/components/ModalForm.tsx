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
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [uploadProgress, setUploadProgress] = useState<string | null>(null);
  const [thumbMode, setThumbMode] = useState<'file' | 'url'>('file');
  const [additionalMode, setAdditionalMode] = useState<'file' | 'url'>('file');
  const [additionalUrlInput, setAdditionalUrlInput] = useState('');
  const [uploadNotice, setUploadNotice] = useState<string | null>(null);

  const getFieldBorderClass = (fieldName: string) => {
    if (fieldErrors[fieldName]) {
      return 'border-red-500 bg-red-50/50 focus:border-red-500 focus:ring-2 focus:ring-red-200 outline-none';
    }
    return 'border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100';
  };

  const renderFieldError = (fieldName: string) => {
    if (!fieldErrors[fieldName]) return null;
    return (
      <p className="text-xs text-red-600 mt-1 flex items-center gap-1 font-medium">
        <svg className="w-3.5 h-3.5 inline shrink-0" fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
            clipRule="evenodd"
          />
        </svg>
        {fieldErrors[fieldName]}
      </p>
    );
  };

  // Local files selected for upload on form submission (no auto-upload on pick)
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [thumbnailLocalPreview, setThumbnailLocalPreview] = useState<string | null>(null);
  const [additionalFiles, setAdditionalFiles] = useState<File[]>([]);
  const [additionalLocalPreviews, setAdditionalLocalPreviews] = useState<string[]>([]);

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

    if (fieldErrors[name]) {
      setFieldErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }

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

  /** Store selected thumbnail file for upload on submit — instant local preview */
  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      validateFileSize(file);
      setError(null);
      setUploadNotice(null);
      if (fieldErrors.thumbnail) {
        setFieldErrors((prev) => {
          const next = { ...prev };
          delete next.thumbnail;
          return next;
        });
      }
      if (thumbnailLocalPreview) {
        URL.revokeObjectURL(thumbnailLocalPreview);
      }
      const previewUrl = URL.createObjectURL(file);
      setThumbnailFile(file);
      setThumbnailLocalPreview(previewUrl);
    } catch (err: any) {
      setError(err?.message || 'Invalid file size');
      setThumbInputKey((k) => k + 1);
    }
  };

  /** Store selected additional files for upload on submit — instant local previews */
  const handleAdditionalChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    try {
      files.forEach(validateFileSize);
      setError(null);
      setUploadNotice(null);
      const newPreviews = files.map((f) => URL.createObjectURL(f));
      setAdditionalFiles((prev) => [...prev, ...files]);
      setAdditionalLocalPreviews((prev) => [...prev, ...newPreviews]);
      setExtraInputKey((k) => k + 1);
    } catch (err: any) {
      setError(err?.message || 'One or more files exceed the 5MB limit');
      setExtraInputKey((k) => k + 1);
    }
  };

  const clearThumbnail = () => {
    if (thumbnailLocalPreview) {
      URL.revokeObjectURL(thumbnailLocalPreview);
      setThumbnailLocalPreview(null);
    }
    setThumbnailFile(null);
    setFormData((prev) => ({ ...prev, thumbnail: '' }));
    setThumbInputKey((k) => k + 1);
  };

  const removeAdditionalAt = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      additionalImages: prev.additionalImages.filter((_, i) => i !== index),
    }));
  };

  const removeAdditionalLocalAt = (index: number) => {
    setAdditionalFiles((prev) => prev.filter((_, i) => i !== index));
    setAdditionalLocalPreviews((prev) => {
      if (prev[index]) URL.revokeObjectURL(prev[index]);
      return prev.filter((_, i) => i !== index);
    });
  };

  const clearAdditional = () => {
    additionalLocalPreviews.forEach((url) => URL.revokeObjectURL(url));
    setAdditionalLocalPreviews([]);
    setAdditionalFiles([]);
    setFormData((prev) => ({ ...prev, additionalImages: [] }));
    setExtraInputKey((k) => k + 1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // 1. Client-side validation: highlight missing/invalid fields before uploading
    const errors: Record<string, string> = {};

    if (!formData.title || !formData.title.trim()) {
      errors.title = 'Project title is required';
    } else if (formData.title.trim().length > 255) {
      errors.title = 'Title must be 255 characters or fewer';
    }

    if (!formData.description || !formData.description.trim()) {
      errors.description = 'Project description is required';
    }

    if (mode === 'create') {
      const hasThumb = Boolean(thumbnailFile || formData.thumbnail.trim());
      if (!hasThumb) {
        errors.thumbnail = 'Thumbnail image is required (upload an image file or paste an image URL)';
      }
    }

    if (formData.type && formData.type.trim().length > 0 && formData.type.trim().length < 5) {
      errors.type = 'Type must be at least 5 characters';
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setError('Please fill in the required fields highlighted in red below.');
      const firstErrorKey = Object.keys(errors)[0];
      const el =
        document.getElementById(`field-${firstErrorKey}`) ||
        document.querySelector(`[name="${firstErrorKey}"]`);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        (el as HTMLElement).focus?.();
      }
      return;
    }

    setIsLoading(true);
    setError(null);
    setFieldErrors({});
    setUploadProgress(null);

    try {
      let finalThumbnail = formData.thumbnail.trim();

      // Upload thumbnail to Cloudinary on submit if a local file was picked
      if (thumbnailFile) {
        setUploadProgress('Uploading thumbnail to Cloudinary…');
        try {
          finalThumbnail = await uploadImageToCloudinary(thumbnailFile);
        } catch (uploadErr: any) {
          console.warn('Thumbnail Cloudinary upload warning:', uploadErr);
          if (!finalThumbnail) {
            finalThumbnail = '/brand/og-image.jpg';
          }
        }
      }

      if (mode === 'create' && !finalThumbnail) {
        setFieldErrors((prev) => ({
          ...prev,
          thumbnail: 'Thumbnail image is required (upload an image file or paste an image URL)',
        }));
        throw new Error('Thumbnail image is required');
      }

      // Upload additional images in parallel if local files were picked
      let finalAdditional = [...formData.additionalImages];
      if (additionalFiles.length > 0) {
        setUploadProgress(`Uploading ${additionalFiles.length} additional image(s)…`);
        const uploadResults = await Promise.allSettled(
          additionalFiles.map((file) => uploadImageToCloudinary(file))
        );
        for (const res of uploadResults) {
          if (res.status === 'fulfilled') {
            finalAdditional.push(res.value);
          } else {
            console.warn('Additional image upload failed or queued:', res.reason);
          }
        }
      }

      setUploadProgress('Saving project…');

      const payload = {
        ...formData,
        thumbnail: finalThumbnail,
        additionalImages: finalAdditional,
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
        setFieldErrors((prev) => ({ ...prev, description: 'Description is required' }));
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
      const serverErrors: Record<string, string> = {};
      const issues = err?.response?.data?.issues;
      if (Array.isArray(issues) && issues.length > 0) {
        issues.forEach((issue: any) => {
          const fieldPath = Array.isArray(issue.path) ? issue.path.join('.') : issue.path;
          if (fieldPath && issue.message) {
            serverErrors[fieldPath] = issue.message;
          }
        });
      }

      if (Object.keys(serverErrors).length > 0) {
        setFieldErrors((prev) => ({ ...prev, ...serverErrors }));
        setError('Please fix the highlighted fields in red below.');
        const firstErrorKey = Object.keys(serverErrors)[0];
        const el =
          document.getElementById(`field-${firstErrorKey}`) ||
          document.querySelector(`[name="${firstErrorKey}"]`);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      } else {
        setError(
          err?.response?.data?.error ||
            err.message ||
            'An unexpected error occurred. Please try again.'
        );
      }
    } finally {
      setIsLoading(false);
      setUploadProgress(null);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-20 flex justify-center items-center z-50 p-4">
      <form
        onSubmit={handleSubmit}
        noValidate
        className="bg-white p-6 rounded-lg w-full max-w-5xl max-h-[90vh] overflow-y-auto shadow-lg"
      >
        <h2 className="text-xl font-bold mb-6 text-gray-800">
          {mode === 'create' ? 'Create' : 'Edit'} Project
        </h2>

        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg mb-4 text-sm text-red-700 flex items-start gap-3">
            <svg
              className="w-5 h-5 text-red-500 shrink-0 mt-0.5"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
            <div>
              <span className="font-semibold text-red-800">Please note: </span>
              <span>{error}</span>
            </div>
          </div>
        )}

        {uploadProgress && (
          <div className="bg-blue-50 border border-blue-200 text-blue-800 px-4 py-3 rounded mb-4">
            {uploadProgress}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          <div className="md:col-span-2 lg:col-span-3" id="field-title">
            <label className={`block text-sm font-medium mb-1 ${fieldErrors.title ? 'text-red-700 font-semibold' : 'text-gray-700'}`}>
              Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="Enter project title"
              className={`w-full p-2 border rounded ${getFieldBorderClass('title')}`}
              required
            />
            {renderFieldError('title')}
          </div>

          <div className="md:col-span-2 lg:col-span-3" id="field-description">
            <label className={`block text-sm font-medium mb-1 ${fieldErrors.description ? 'text-red-700 font-semibold' : 'text-gray-700'}`}>
              Description <span className="text-red-500">*</span>
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={3}
              placeholder="Enter project description"
              className={`w-full p-2 border rounded ${getFieldBorderClass('description')}`}
              required
            />
            {renderFieldError('description')}
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

          <div id="field-status">
            <label className={`block text-sm font-medium mb-1 ${fieldErrors.status ? 'text-red-700 font-semibold' : 'text-gray-700'}`}>
              Status
            </label>
            <input
              type="text"
              name="status"
              value={formData.status}
              onChange={handleChange}
              placeholder="e.g. planned"
              className={`w-full p-2 border rounded ${getFieldBorderClass('status')}`}
            />
            {renderFieldError('status')}
          </div>

          <div className="md:col-span-2" id="field-location">
            <label className={`block text-sm font-medium mb-1 ${fieldErrors.location ? 'text-red-700 font-semibold' : 'text-gray-700'}`}>
              Location
            </label>
            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleChange}
              placeholder="e.g. Kigali, Rwanda"
              className={`w-full p-2 border rounded ${getFieldBorderClass('location')}`}
            />
            {renderFieldError('location')}
          </div>

          <div id="field-price">
            <label className={`block text-sm font-medium mb-1 ${fieldErrors.price ? 'text-red-700 font-semibold' : 'text-gray-700'}`}>
              Price (USD $)
            </label>
            <input
              type="text"
              name="price"
              value={formData.price}
              onChange={handleChange}
              placeholder="e.g. 250"
              className={`w-full p-2 border rounded ${getFieldBorderClass('price')}`}
            />
            {renderFieldError('price')}
          </div>

          <div id="field-bedrooms">
            <label className={`block text-sm font-medium mb-1 ${fieldErrors.bedrooms ? 'text-red-700 font-semibold' : 'text-gray-700'}`}>
              Bedrooms
            </label>
            <input
              type="number"
              name="bedrooms"
              value={formData.bedrooms}
              onChange={handleChange}
              className={`w-full p-2 border rounded ${getFieldBorderClass('bedrooms')}`}
            />
            {renderFieldError('bedrooms')}
          </div>

          <div id="field-bathrooms">
            <label className={`block text-sm font-medium mb-1 ${fieldErrors.bathrooms ? 'text-red-700 font-semibold' : 'text-gray-700'}`}>
              Bathrooms
            </label>
            <input
              type="number"
              name="bathrooms"
              value={formData.bathrooms}
              onChange={handleChange}
              className={`w-full p-2 border rounded ${getFieldBorderClass('bathrooms')}`}
            />
            {renderFieldError('bathrooms')}
          </div>

          <div id="field-rooms">
            <label className={`block text-sm font-medium mb-1 ${fieldErrors.rooms ? 'text-red-700 font-semibold' : 'text-gray-700'}`}>
              Rooms
            </label>
            <input
              type="number"
              name="rooms"
              value={formData.rooms}
              onChange={handleChange}
              className={`w-full p-2 border rounded ${getFieldBorderClass('rooms')}`}
            />
            {renderFieldError('rooms')}
          </div>

          <div id="field-floors">
            <label className={`block text-sm font-medium mb-1 ${fieldErrors.floors ? 'text-red-700 font-semibold' : 'text-gray-700'}`}>
              Floors (G+)
            </label>
            <select
              name="floors"
              value={formData.floors || 1}
              onChange={handleChange}
              className={`w-full p-2 border rounded bg-white ${getFieldBorderClass('floors')}`}
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
            {renderFieldError('floors')}
          </div>

          <div id="field-height">
            <label className={`block text-sm font-medium mb-1 ${fieldErrors.height ? 'text-red-700 font-semibold' : 'text-gray-700'}`}>
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
              className={`w-full p-2 border rounded ${getFieldBorderClass('height')}`}
            />
            {renderFieldError('height')}
          </div>

          <div id="field-width">
            <label className={`block text-sm font-medium mb-1 ${fieldErrors.width ? 'text-red-700 font-semibold' : 'text-gray-700'}`}>
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
              className={`w-full p-2 border rounded ${getFieldBorderClass('width')}`}
            />
            {renderFieldError('width')}
          </div>

          <div id="field-areaSqFt">
            <label className={`block text-sm font-medium mb-1 ${fieldErrors.areaSqFt ? 'text-red-700 font-semibold' : 'text-gray-700'}`}>
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
              className={`w-full p-2 border rounded ${getFieldBorderClass('areaSqFt')}`}
            />
            {renderFieldError('areaSqFt')}
          </div>

          <div id="field-type">
            <label className={`block text-sm font-medium mb-1 ${fieldErrors.type ? 'text-red-700 font-semibold' : 'text-gray-700'}`}>
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
              className={`w-full p-2 border rounded ${getFieldBorderClass('type')}`}
            />
            {renderFieldError('type')}
          </div>

          <div className="md:col-span-2 lg:col-span-3" id="field-thumbnail">
            <div className="flex items-center justify-between mb-1">
              <label className={`block text-sm font-medium ${fieldErrors.thumbnail ? 'text-red-700 font-semibold' : 'text-gray-700'}`}>
                Thumbnail image {mode === 'create' ? <span className="text-red-500">*</span> : <span className="text-gray-400 font-normal">(optional)</span>}
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

            <div className={`transition-all rounded-lg ${fieldErrors.thumbnail ? 'p-2.5 border-2 border-red-500 bg-red-50/50 ring-2 ring-red-200' : ''}`}>
              {thumbMode === 'file' ? (
                <>
                  <input
                    key={thumbInputKey}
                    ref={thumbnailInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/gif,image/webp"
                    onChange={handleThumbnailChange}
                    disabled={isLoading}
                    className={`w-full p-2 border rounded bg-white ${
                      fieldErrors.thumbnail ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Max 5MB. Preview loaded locally; uploads to Cloudinary when you save.
                  </p>
                </>
              ) : (
                <div>
                  <input
                    type="url"
                    value={formData.thumbnail}
                    onChange={(e) => {
                      if (thumbnailLocalPreview) {
                        URL.revokeObjectURL(thumbnailLocalPreview);
                        setThumbnailLocalPreview(null);
                      }
                      setThumbnailFile(null);
                      setFormData((prev) => ({ ...prev, thumbnail: e.target.value.trim() }));
                      if (fieldErrors.thumbnail) {
                        setFieldErrors((prev) => {
                          const next = { ...prev };
                          delete next.thumbnail;
                          return next;
                        });
                      }
                    }}
                    placeholder="https://example.com/house-thumbnail.jpg"
                    disabled={isLoading}
                    className={`w-full p-2 border rounded ${
                      fieldErrors.thumbnail ? 'border-red-500 bg-red-50/50' : 'border-gray-300'
                    }`}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Enter a direct web link to an image (e.g., from Cloudinary, Unsplash, or any image host).
                  </p>
                </div>
              )}
            </div>

            {renderFieldError('thumbnail')}

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

            {(thumbnailLocalPreview || formData.thumbnail) && (
              <div className="mt-2 flex items-start gap-3 p-2.5 bg-gray-50 rounded-lg border border-gray-200">
                <img
                  src={thumbnailLocalPreview || formData.thumbnail}
                  alt="Thumbnail preview"
                  className="h-28 w-auto max-w-[200px] object-cover rounded border border-gray-300 shadow-sm"
                />
                <div className="flex flex-col gap-1 overflow-hidden">
                  <span className="text-xs text-green-700 font-semibold flex items-center gap-1">
                    ✓ {thumbnailLocalPreview ? 'Local preview ready (will upload on save)' : 'Thumbnail attached'}
                  </span>
                  <span
                    className="text-xs text-gray-500 font-mono truncate max-w-sm"
                    title={thumbnailFile?.name || formData.thumbnail}
                  >
                    {thumbnailFile
                      ? `${thumbnailFile.name} (${(thumbnailFile.size / 1024).toFixed(0)} KB)`
                      : formData.thumbnail}
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
                  disabled={isLoading}
                  className="w-full p-2 border rounded border-gray-300 bg-white"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Each max 5MB. Previews loaded locally; uploads when you save.
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

            {(formData.additionalImages.length > 0 || additionalLocalPreviews.length > 0) && (
              <div className="mt-2">
                <div className="flex flex-wrap gap-2">
                  {/* Saved or URL images */}
                  {formData.additionalImages.map((src, idx) => (
                    <div key={`saved-${src}-${idx}`} className="relative group">
                      <img
                        src={src}
                        alt={`Saved ${idx + 1}`}
                        className="h-20 w-20 object-cover rounded border border-gray-300"
                      />
                      <button
                        type="button"
                        onClick={() => removeAdditionalAt(idx)}
                        className="absolute -top-1 -right-1 bg-red-600 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center hover:bg-red-700 shadow"
                        aria-label={`Remove image ${idx + 1}`}
                        disabled={isLoading}
                      >
                        ×
                      </button>
                    </div>
                  ))}

                  {/* Local preview files pending upload */}
                  {additionalLocalPreviews.map((src, idx) => (
                    <div key={`local-${src}-${idx}`} className="relative group">
                      <img
                        src={src}
                        alt={`Local preview ${idx + 1}`}
                        className="h-20 w-20 object-cover rounded border-2 border-blue-400"
                      />
                      <span className="absolute bottom-0 inset-x-0 bg-black/60 text-white text-[10px] text-center truncate px-1 rounded-b">
                        {additionalFiles[idx]?.name || 'Local'}
                      </span>
                      <button
                        type="button"
                        onClick={() => removeAdditionalLocalAt(idx)}
                        className="absolute -top-1 -right-1 bg-red-600 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center hover:bg-red-700 shadow"
                        aria-label={`Remove local image ${idx + 1}`}
                        disabled={isLoading}
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
            disabled={isLoading}
            className="px-4 py-2 bg-blue-600 text-white rounded disabled:bg-blue-300"
          >
            {isLoading
              ? uploadProgress || 'Submitting...'
              : mode === 'create'
                ? 'Create'
                : 'Update'}
          </button>
        </div>
      </form>
    </div>
  );
}
