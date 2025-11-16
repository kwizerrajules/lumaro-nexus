'use client';
import { useEffect, useState } from 'react';
import API from '../../../utils/api';
import ModalForm from '../components/ModalForm';

type HouseProject = {
  id: string;
  title: string;
  description?: string;
  thumbnail?: string;
  price?: string;
  status?: string;
};

export default function HouseProjectsSection() {
  const [projects, setProjects] = useState<HouseProject[]>([]);
  const [editingProject, setEditingProject] = useState<HouseProject | null>(null);
  const [creating, setCreating] = useState(false); // <-- state for create modal

  const fetchProjects = async () => {
    try {
      const res = await API.get('/houseprojects');
      setProjects(res.data.data);
    } catch (err) {
      console.error(err);
    }
  };

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

  const handleEdit = (project: HouseProject) => {
    setEditingProject(project);
  };

  const handleCreate = () => {
    setCreating(true);
  };

  const closeModal = () => {
    setEditingProject(null);
    setCreating(false);
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  return (
    <div>
      {/* Create New Project Button */}
      <div className="mb-4">
        <button
          onClick={handleCreate}
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition"
        >
          Create New Project
        </button>
      </div>

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
              {project.description && (
                <p className="text-gray-600 text-sm mt-1">{project.description}</p>
              )}
              {project.price && (
                <p className="text-blue-600 font-semibold mt-2">{project.price}</p>
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
                onClick={() => handleEdit(project)}
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

      {/* Edit Modal */}
      {editingProject && (
        <ModalForm
          mode="edit"
          project={editingProject}
          onClose={closeModal}
          onSuccess={fetchProjects}
        />
      )}

      {/* Create Modal */}
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
