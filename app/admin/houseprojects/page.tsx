'use client';
import { useEffect, useState } from 'react';
import API from '../../../utils/api';
import HouseProjectCard from '../components/HouseProjectCard';
import ModalForm from '../components/ModalForm';

export default function HouseProjectsPage() {
  const [projects, setProjects] = useState<any[]>([]);
  const [editingProject, setEditingProject] = useState<any | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);

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

  const handleEdit = (project: any) => {
    setEditingProject(project);
  };

  const closeModal = () => {
    setEditingProject(null);
    setShowAddModal(false);
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">House Projects</h1>
        <button
          className="px-4 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition"
          onClick={() => setShowAddModal(true)}
        >
          + Add New Project
        </button>
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map((proj) => (
          <HouseProjectCard
            key={proj.id}
            project={proj}
            onDelete={handleDelete}
            onEdit={() => handleEdit(proj)}
          />
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

      {/* Add Modal */}
      {showAddModal && (
        <ModalForm
          mode="add"
          project={null}
          onClose={closeModal}
          onSuccess={fetchProjects}
        />
      )}
    </div>
  );
}
