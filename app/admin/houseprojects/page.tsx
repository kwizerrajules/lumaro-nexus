'use client';
import { useEffect, useState } from 'react';
import API from '../../../utils/api';
import HouseProjectCard from '../components/HouseProjectCard';
import ModalForm from '../components/ModalForm';

export default function HouseProjectsPage() {
  const [projects, setProjects] = useState<any[]>([]);
  const [editingProject, setEditingProject] = useState<any | null>(null);

  const fetchProjects = async () => {
    try {
      const res = await API.get('/houseprojects'); // GET doesn't need token
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
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  return (
    <div>
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

      {editingProject && (
        <ModalForm
          mode="edit"
          project={editingProject}
          onClose={closeModal}
          onSuccess={fetchProjects}
        />
      )}
    </div>
  );
}
