'use client';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { X, Heart, WhatsappLogo, ArrowSquareOut } from '@phosphor-icons/react';
import ImageCarousel from './ImageCarousel';
import axios from 'axios';
import { formatPlanPrice, whatsappPlanUrl, planHref } from '@/utils/brand';

interface Project {
  id: string;
  slug?: string;
  title: string;
  price: number;
  bedrooms: number;
  bathrooms: number;
  floors: number;
  area: number;
  description?: string;
}

interface ModalFormProps {
  project: Project;
  onClose: () => void;
}

const ModalForm: React.FC<ModalFormProps> = ({ project, onClose }) => {
  const [quantity, setQuantity] = useState(1);
  const [accessToken, setAccessToken] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('userAccessToken');
    if (token) setAccessToken(token);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const total = project.price * quantity;

  const handleAddEnquiry = async (id: string) => {
    try {
      await axios.post(
        '/api/enquiries',
        { projectId: id },
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );
      alert('Product added to wish list');
    } catch {
      alert('Error while adding product to wishlist');
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/55 flex items-center justify-center p-4 z-[60] animate-fadeIn"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-white max-w-5xl w-full max-h-[90vh] overflow-y-auto shadow-brand border border-brand-line">
        <div className="flex flex-col lg:flex-row">
          <div className="flex-1 p-6">
            <ImageCarousel projectId={project.id} />
            {project.description && (
              <p className="mt-4 text-neutral-600 leading-relaxed text-sm">
                {project.description}
              </p>
            )}
          </div>

          <div className="flex-1 p-6 border-t lg:border-t-0 lg:border-l border-brand-line">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="font-display text-3xl font-semibold text-neutral-900 leading-tight">
                  {project.title || 'House plan'}
                </h2>
                <p className="text-neutral-500 text-sm mt-1">ID: {project.id}</p>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="text-neutral-500 hover:text-neutral-900 p-1"
                aria-label="Close"
              >
                <X size={24} weight="bold" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-6 p-4 bg-stone-50 border border-brand-line">
              <div className="text-center">
                <div className="text-neutral-900 font-semibold">{project.floors}</div>
                <div className="text-xs text-neutral-500 uppercase tracking-wide">Floors</div>
              </div>
              <div className="text-center">
                <div className="text-neutral-900 font-semibold">{project.bedrooms}</div>
                <div className="text-xs text-neutral-500 uppercase tracking-wide">Bedrooms</div>
              </div>
              <div className="text-center">
                <div className="text-neutral-900 font-semibold">{project.bathrooms}</div>
                <div className="text-xs text-neutral-500 uppercase tracking-wide">Bathrooms</div>
              </div>
              <div className="text-center">
                <div className="text-neutral-900 font-semibold">{project.area} m²</div>
                <div className="text-xs text-neutral-500 uppercase tracking-wide">Area</div>
              </div>
            </div>

            <div className="mb-6">
              <label className="block font-semibold text-neutral-800 mb-2 text-sm">
                Quantity
              </label>
              <select
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
                className="input-brand"
              >
                {[1, 2, 3, 4, 5].map((num) => (
                  <option key={num} value={num}>
                    {num}
                  </option>
                ))}
              </select>
            </div>

            <div className="border-t border-brand-line pt-4">
              <div className="flex justify-between items-center mb-4">
                <span className="text-lg font-semibold text-neutral-800">Total</span>
                <span className="text-2xl price-brand">{formatPlanPrice(total)}</span>
              </div>

              <a
                href={whatsappPlanUrl({
                  title: project.title,
                  id: project.id,
                  bedrooms: project.bedrooms,
                  bathrooms: project.bathrooms,
                  area: project.area,
                  price: project.price,
                  quantity,
                })}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary w-full mb-3"
              >
                <WhatsappLogo size={20} weight="fill" />
                Order via WhatsApp
              </a>

              <Link
                href={planHref(project)}
                onClick={onClose}
                className="btn-outline-dark w-full mb-3 text-sm"
              >
                <ArrowSquareOut size={18} />
                Open full plan page
              </Link>

              <button
                type="button"
                onClick={() => handleAddEnquiry(project.id)}
                disabled={!accessToken}
                className="w-full border border-amber-700 text-amber-800 py-3 rounded-md font-semibold hover:bg-amber-50 flex items-center justify-center gap-2 disabled:opacity-40"
              >
                <Heart size={18} />
                Add to enquiry
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModalForm;
