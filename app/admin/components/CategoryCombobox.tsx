'use client';
import { useEffect, useRef, useState } from 'react';
import API from '../../../utils/api';

type Category = {
  id: string;
  name: string;
};

type Props = {
  value: string;
  onChange: (name: string) => void;
  disabled?: boolean;
};

export default function CategoryCombobox({ value, onChange, disabled }: Props) {
  const [query, setQuery] = useState(value || '');
  const [options, setOptions] = useState<Category[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setQuery(value || '');
  }, [value]);

  useEffect(() => {
    const onClickOutside = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);

  useEffect(() => {
    if (!open) return;

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await API.get('/categories', {
          params: { search: query.trim() || undefined },
        });
        setOptions(res.data.data || []);
      } catch (err) {
        console.error(err);
        setOptions([]);
      } finally {
        setLoading(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [query, open]);

  const exactMatch = options.some(
    (c) => c.name.toLowerCase() === query.trim().toLowerCase()
  );
  const showCreate = query.trim().length > 0 && !exactMatch;

  const selectCategory = (name: string) => {
    onChange(name);
    setQuery(name);
    setOpen(false);
  };

  const createCategory = async () => {
    const name = query.trim();
    if (!name) return;
    setCreating(true);
    try {
      const res = await API.post('/categories', { name });
      const created = res.data.data as Category;
      selectCategory(created.name);
    } catch (err: any) {
      const existingName = err?.response?.data?.message === 'Category already exists'
        ? name
        : null;
      if (existingName) {
        selectCategory(existingName);
      } else {
        console.error(err);
        alert(err?.response?.data?.message || 'Failed to create category');
      }
    } finally {
      setCreating(false);
    }
  };

  return (
    <div ref={wrapRef} className="relative">
      <input
        type="text"
        value={query}
        disabled={disabled}
        placeholder="Search or create category…"
        onFocus={() => setOpen(true)}
        onChange={(e) => {
          setQuery(e.target.value);
          onChange(e.target.value);
          setOpen(true);
        }}
        className="w-full p-2 border rounded border-gray-300"
        autoComplete="off"
      />

      {open && (
        <div className="absolute z-20 mt-1 w-full max-h-56 overflow-y-auto rounded border border-gray-200 bg-white shadow-lg">
          {loading && (
            <div className="px-3 py-2 text-sm text-gray-500">Searching…</div>
          )}

          {!loading && options.length === 0 && !showCreate && (
            <div className="px-3 py-2 text-sm text-gray-500">No categories yet</div>
          )}

          {!loading &&
            options.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => selectCategory(cat.name)}
                className="block w-full px-3 py-2 text-left text-sm hover:bg-blue-50"
              >
                {cat.name}
              </button>
            ))}

          {showCreate && (
            <button
              type="button"
              onClick={createCategory}
              disabled={creating}
              className="block w-full border-t border-gray-100 px-3 py-2 text-left text-sm font-medium text-green-700 hover:bg-green-50 disabled:opacity-50"
            >
              {creating ? 'Creating…' : `Create "${query.trim()}"`}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
