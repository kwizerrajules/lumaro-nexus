'use client';

import { useEffect, useState } from 'react';
import API from '../../../utils/api';
import {
  DEFAULT_SITE_SETTINGS,
  type SiteSettingsInput,
} from '@/src/schemas/siteSettings.schema';
import { invalidateSiteSettingsCache } from '@/utils/siteSettingsCache';

type FormState = SiteSettingsInput;

const FIELDS: Array<{
  key: keyof FormState;
  label: string;
  hint?: string;
  type?: string;
}> = [
  { key: 'primaryEmail', label: 'Primary email', type: 'email' },
  { key: 'helpEmail', label: 'Help / support email', type: 'email' },
  { key: 'websiteUrl', label: 'Website URL', hint: 'Full URL with https://' },
  { key: 'websiteDisplay', label: 'Website display text', hint: 'e.g. www.lumaronexus.com' },
  { key: 'phoneDisplay', label: 'Phone display', hint: 'Shown on the site, e.g. +250 787 369 630' },
  {
    key: 'whatsappNumber',
    label: 'WhatsApp number',
    hint: 'Digits only with country code, e.g. 250787369630',
  },
  { key: 'address', label: 'Address / location' },
  { key: 'availability', label: 'Availability hours' },
  { key: 'footerTagline', label: 'Footer tagline', hint: 'Short company blurb under the logo' },
];

export default function SiteSettingsPanel() {
  const [form, setForm] = useState<FormState>({ ...DEFAULT_SITE_SETTINGS });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await API.get('/admin/site-settings');
      if (res.data?.data) {
        const d = res.data.data;
        setForm({
          primaryEmail: d.primaryEmail,
          helpEmail: d.helpEmail,
          websiteUrl: d.websiteUrl,
          websiteDisplay: d.websiteDisplay,
          phoneDisplay: d.phoneDisplay,
          whatsappNumber: d.whatsappNumber,
          address: d.address,
          availability: d.availability,
          footerTagline: d.footerTagline,
        });
      }
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to load site settings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleChange = (
    key: keyof FormState,
    value: string
  ) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    setError(null);
    try {
      const payload = {
        ...form,
        whatsappNumber: form.whatsappNumber.replace(/\D/g, ''),
      };
      await API.put('/admin/site-settings', payload);
      invalidateSiteSettingsCache();
      setMessage('Saved. Footer and contact section will use the new details.');
      setForm(payload);
    } catch (err: any) {
      const issues = err?.response?.data?.errors;
      if (Array.isArray(issues) && issues[0]?.message) {
        setError(issues.map((i: any) => i.message).join(' · '));
      } else {
        setError(err?.response?.data?.message || 'Failed to save settings');
      }
    } finally {
      setSaving(false);
    }
  };

  const handleReset = async () => {
    if (
      !confirm(
        'Reset all contact details to the original Lumaro Nexus defaults?'
      )
    ) {
      return;
    }
    setSaving(true);
    setMessage(null);
    setError(null);
    try {
      const res = await API.delete('/admin/site-settings');
      if (res.data?.data) {
        const d = res.data.data;
        setForm({
          primaryEmail: d.primaryEmail,
          helpEmail: d.helpEmail,
          websiteUrl: d.websiteUrl,
          websiteDisplay: d.websiteDisplay,
          phoneDisplay: d.phoneDisplay,
          whatsappNumber: d.whatsappNumber,
          address: d.address,
          availability: d.availability,
          footerTagline: d.footerTagline,
        });
      }
      invalidateSiteSettingsCache();
      setMessage('Reset to default contact details.');
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to reset settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white p-6 rounded-xl shadow-xl">
        <p className="text-gray-500">Loading site settings…</p>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-xl shadow-xl max-w-3xl">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Site Settings</h2>
        <p className="text-gray-600 mt-1 text-sm">
          Edit phone, email, WhatsApp, and address shown in the footer and
          contact section. First visit seeds the database with the current
          Lumaro Nexus details.
        </p>
      </div>

      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}
      {message && (
        <div className="mb-4 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
          {message}
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-5">
        {FIELDS.map((field) => (
          <div key={field.key}>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {field.label}
            </label>
            {field.key === 'footerTagline' ? (
              <textarea
                value={form[field.key]}
                onChange={(e) => handleChange(field.key, e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            ) : (
              <input
                type={field.type || 'text'}
                value={form[field.key]}
                onChange={(e) => handleChange(field.key, e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            )}
            {field.hint && (
              <p className="mt-1 text-xs text-gray-500">{field.hint}</p>
            )}
          </div>
        ))}

        <div className="flex flex-wrap gap-3 pt-2">
          <button
            type="submit"
            disabled={saving}
            className="bg-blue-600 text-white px-5 py-2.5 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-60"
          >
            {saving ? 'Saving…' : 'Save changes'}
          </button>
          <button
            type="button"
            onClick={handleReset}
            disabled={saving}
            className="bg-gray-100 text-gray-800 px-5 py-2.5 rounded-lg font-semibold hover:bg-gray-200 disabled:opacity-60"
          >
            Reset to defaults
          </button>
        </div>
      </form>
    </div>
  );
}
