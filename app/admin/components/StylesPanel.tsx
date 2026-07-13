'use client';
import { useEffect, useMemo, useState } from 'react';
import API from '../../../utils/api';

type Category = {
  id: string;
  name: string;
};

type Style = {
  id: string;
  name: string;
  categoryId: string;
  categoryName: string;
};

export default function StylesPanel() {
  const [styles, setStyles] = useState<Style[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [name, setName] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [filterCategoryId, setFilterCategoryId] = useState('');
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');
  const [editingCategoryId, setEditingCategoryId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCategories = async () => {
    try {
      const res = await API.get('/categories');
      setCategories(res.data.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchStyles = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await API.get('/styles', {
        params: {
          categoryId: filterCategoryId || undefined,
        },
      });
      setStyles(res.data.data || []);
      setSelected(new Set());
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to load styles');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchStyles();
  }, [filterCategoryId]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return styles;
    return styles.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.categoryName.toLowerCase().includes(q)
    );
  }, [styles, search]);

  const allFilteredSelected =
    filtered.length > 0 && filtered.every((s) => selected.has(s.id));

  const toggleAll = () => {
    if (allFilteredSelected) {
      const next = new Set(selected);
      filtered.forEach((s) => next.delete(s.id));
      setSelected(next);
    } else {
      const next = new Set(selected);
      filtered.forEach((s) => next.add(s.id));
      setSelected(next);
    }
  };

  const toggleOne = (id: string) => {
    const next = new Set(selected);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelected(next);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !categoryId) {
      alert('Style name and parent category are required');
      return;
    }
    try {
      await API.post('/styles', { name: name.trim(), categoryId });
      setName('');
      fetchStyles();
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Failed to create style');
    }
  };

  const saveEdit = async () => {
    if (!editingId || !editingName.trim() || !editingCategoryId) return;
    try {
      await API.patch(`/styles/${editingId}`, {
        name: editingName.trim(),
        categoryId: editingCategoryId,
      });
      setEditingId(null);
      fetchStyles();
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Failed to update style');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this style?')) return;
    try {
      await API.delete(`/styles/${id}`);
      fetchStyles();
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Failed to delete style');
    }
  };

  const handleBulkDelete = async () => {
    if (selected.size === 0) return;
    if (!confirm(`Delete ${selected.size} selected style${selected.size === 1 ? '' : 's'}?`)) {
      return;
    }
    try {
      await Promise.all([...selected].map((id) => API.delete(`/styles/${id}`)));
      fetchStyles();
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Failed to delete selected styles');
    }
  };

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <h3 className="text-xl font-bold text-gray-800">Styles</h3>
        <form onSubmit={handleCreate} className="flex flex-wrap gap-2">
          <select
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded text-sm bg-white"
            required
          >
            <option value="">Parent category</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="New style"
            className="px-3 py-2 border border-gray-300 rounded text-sm min-w-[160px]"
            required
          />
          <button
            type="submit"
            className="px-4 py-2 bg-green-600 text-white text-sm rounded hover:bg-green-700"
          >
            Add
          </button>
        </form>
      </div>

      <div className="flex flex-wrap items-center gap-3 mb-3">
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search styles…"
          className="px-3 py-2 border border-gray-300 rounded text-sm flex-1 min-w-[180px]"
        />
        <select
          value={filterCategoryId}
          onChange={(e) => setFilterCategoryId(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded text-sm bg-white"
        >
          <option value="">All categories</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </select>
        {selected.size > 0 && (
          <button
            type="button"
            onClick={handleBulkDelete}
            className="px-3 py-2 bg-red-600 text-white text-sm rounded hover:bg-red-700"
          >
            Delete selected ({selected.size})
          </button>
        )}
      </div>

      {error && <p className="mb-3 text-sm text-red-600">{error}</p>}

      <div className="overflow-x-auto bg-white border border-gray-200 rounded">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="bg-gray-100 text-left">
              <th className="px-3 py-2 border-b w-10">
                <input
                  type="checkbox"
                  checked={allFilteredSelected}
                  onChange={toggleAll}
                  aria-label="Select all styles"
                />
              </th>
              <th className="px-3 py-2 border-b">Style</th>
              <th className="px-3 py-2 border-b">Parent category</th>
              <th className="px-3 py-2 border-b w-40">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={4} className="px-3 py-6 text-center text-gray-500">
                  Loading…
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-3 py-6 text-center text-gray-500">
                  No styles found
                </td>
              </tr>
            ) : (
              filtered.map((style) => (
                <tr key={style.id} className="hover:bg-gray-50">
                  <td className="px-3 py-2 border-b">
                    <input
                      type="checkbox"
                      checked={selected.has(style.id)}
                      onChange={() => toggleOne(style.id)}
                      aria-label={`Select ${style.name}`}
                    />
                  </td>
                  <td className="px-3 py-2 border-b">
                    {editingId === style.id ? (
                      <input
                        type="text"
                        value={editingName}
                        onChange={(e) => setEditingName(e.target.value)}
                        className="w-full px-2 py-1 border border-gray-300 rounded"
                        autoFocus
                      />
                    ) : (
                      <span className="font-medium text-gray-800">{style.name}</span>
                    )}
                  </td>
                  <td className="px-3 py-2 border-b">
                    {editingId === style.id ? (
                      <select
                        value={editingCategoryId}
                        onChange={(e) => setEditingCategoryId(e.target.value)}
                        className="w-full px-2 py-1 border border-gray-300 rounded bg-white"
                      >
                        {categories.map((cat) => (
                          <option key={cat.id} value={cat.id}>
                            {cat.name}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <span className="text-gray-600">{style.categoryName}</span>
                    )}
                  </td>
                  <td className="px-3 py-2 border-b">
                    {editingId === style.id ? (
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={saveEdit}
                          className="px-2 py-1 bg-blue-600 text-white rounded text-xs"
                        >
                          Save
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingId(null)}
                          className="px-2 py-1 bg-gray-200 rounded text-xs"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setEditingId(style.id);
                            setEditingName(style.name);
                            setEditingCategoryId(style.categoryId);
                          }}
                          className="px-2 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(style.id)}
                          className="px-2 py-1 bg-red-600 text-white rounded text-xs hover:bg-red-700"
                        >
                          Delete
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
