'use client';
import { useCallback, useEffect, useState } from 'react';
import API from '../../../utils/api';
import ModalForm from '../components/ModalForm';
import CategoriesPanel from './CategoriesPanel';
import StylesPanel from './StylesPanel';

type HouseProject = {
  id: string;
  title: string;
  description?: string;
  thumbnail?: string;
  price?: string | number;
  status?: string;
  category?: string;
  style?: string;
  location?: string;
};

type Category = {
  id: string;
  name: string;
};

export default function HouseProjectsSection() {
  const [projects, setProjects] = useState<HouseProject[]>([]);
  const [total, setTotal] = useState(0);
  const [editingProject, setEditingProject] = useState<HouseProject | null>(null);
  const [creating, setCreating] = useState(false);
  const [view, setView] = useState<'projects' | 'categories' | 'styles'>('projects');
  const [loading, setLoading] = useState(false);

  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [category, setCategory] = useState('');
  const [status, setStatus] = useState('');
  const [style, setStyle] = useState('');
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search.trim()), 300);
    return () => clearTimeout(timer);
  }, [search]);

  const fetchCategories = async () => {
    try {
      const res = await API.get('/categories');
      setCategories(res.data.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchProjects = useCallback(async () => {
    setLoading(true);
    try {
      const res = await API.get('/houseprojects', {
        params: {
          limit: 100,
          offset: 0,
          search: debouncedSearch || undefined,
          category: category || undefined,
          status: status || undefined,
          style: style || undefined,
        },
      });
      setProjects(res.data.data || []);
      setTotal(res.data.total ?? res.data.data?.length ?? 0);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, category, status, style]);

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    if (view === 'projects') {
      fetchProjects();
    }
  }, [view, fetchProjects]);

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this project?')) {
      try {
        await API.delete(`/houseprojects/${id}`);
        fetchProjects();
      } catch (err) {
        console.error(err);
      }
    }
  };

  const clearFilters = () => {
    setSearch('');
    setDebouncedSearch('');
    setCategory('');
    setStatus('');
    setStyle('');
  };

  const closeModal = () => {
    setEditingProject(null);
    setCreating(false);
  };

  const hasFilters = Boolean(search || category || status || style);

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => setView('projects')}
          className={`px-4 py-2 rounded transition ${
            view === 'projects'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Projects
        </button>
        <button
          type="button"
          onClick={() => setView('categories')}
          className={`px-4 py-2 rounded transition ${
            view === 'categories'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Categories
        </button>
        <button
          type="button"
          onClick={() => setView('styles')}
          className={`px-4 py-2 rounded transition ${
            view === 'styles'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Styles
        </button>

        {view === 'projects' && (
          <button
            onClick={() => setCreating(true)}
            className="ml-auto px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition"
          >
            Create New Project
          </button>
        )}
      </div>

      {view === 'categories' ? (
        <CategoriesPanel />
      ) : view === 'styles' ? (
        <StylesPanel />
      ) : (
        <>
          <div className="mb-6 bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
              <div className="lg:col-span-2">
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Search
                </label>
                <input
                  type="search"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search by name, description, location, type…"
                  className="w-full p-2 border rounded border-gray-300"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full p-2 border rounded border-gray-300 bg-white"
                >
                  <option value="">All categories</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.name}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Status
                </label>
                <input
                  type="text"
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  placeholder="e.g. planned, sold"
                  className="w-full p-2 border rounded border-gray-300"
                  list="status-suggestions"
                />
                <datalist id="status-suggestions">
                  <option value="planned" />
                  <option value="available" />
                  <option value="sold" />
                </datalist>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Style
                </label>
                <input
                  type="text"
                  value={style}
                  onChange={(e) => setStyle(e.target.value)}
                  placeholder="Filter by style"
                  className="w-full p-2 border rounded border-gray-300"
                />
              </div>
            </div>

            <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
              <p className="text-sm text-gray-500">
                {loading
                  ? 'Searching…'
                  : `${total} project${total === 1 ? '' : 's'} found`}
              </p>
              {hasFilters && (
                <button
                  type="button"
                  onClick={clearFilters}
                  className="text-sm text-blue-600 hover:underline"
                >
                  Clear filters
                </button>
              )}
            </div>
          </div>

          {loading && projects.length === 0 ? (
            <p className="text-gray-500 text-sm">Loading projects…</p>
          ) : projects.length === 0 ? (
            <p className="text-gray-500 text-sm">
              No projects match your search or filters.
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {projects.map((project) => (
                <div
                  key={project.id}
                  className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition"
                >
                  {project.thumbnail && (
                    <img
                      src={project.thumbnail}
                      alt={project.title}
                      className="h-48 w-full object-cover"
                    />
                  )}
                  <div className="p-4">
                    <h3 className="text-lg font-bold text-gray-800">{project.title}</h3>
                    {project.category && (
                      <p className="text-xs text-blue-600 mt-1 font-medium">
                        {project.category}
                      </p>
                    )}
                    {project.description && (
                      <p className="text-gray-600 text-sm mt-1 line-clamp-2">
                        {project.description}
                      </p>
                    )}
                    {project.price !== undefined && project.price !== '' && (
                      <p className="text-blue-600 font-semibold mt-2">
                        {project.price}
                      </p>
                    )}
                    {project.status && (
                      <p
                        className={`inline-block mt-2 px-2 py-1 text-xs font-medium rounded ${
                          project.status.toLowerCase() === 'sold'
                            ? 'bg-red-100 text-red-700'
                            : 'bg-green-100 text-green-700'
                        }`}
                      >
                        {project.status}
                      </p>
                    )}
                  </div>
                  <div className="flex justify-between items-center p-4 border-t border-gray-200">
                    <button
                      onClick={() => setEditingProject(project)}
                      className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(project.id)}
                      className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 transition"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {editingProject && (
        <ModalForm
          mode="edit"
          project={editingProject}
          onClose={closeModal}
          onSuccess={fetchProjects}
        />
      )}

      {creating && (
        <ModalForm
          mode="create"
          onClose={closeModal}
          onSuccess={fetchProjects}
        />
      )}
    </div>
  );
}
