'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import API from '@/utils/api';
import ModalForm from '@/components/ModalForm';

export default function EditProjectPage() {
  const { id } = useParams();
  const router = useRouter();
  const [project, setProject] = useState<any>(null);
  const [showForm, setShowForm] = useState(true);

  const fetchProject = async () => {
    try {
      // Make sure we call the backend API
      const res = await API.get(`/houseprojects/${id}`);
      // Assuming backend returns { data: project }
      setProject(res.data.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async () => {
    if (confirm('Are you sure you want to delete this project?')) {
      try {
        await API.delete(`/houseprojects/${id}`);
        router.push('/admin/houseprojects');
      } catch (err) {
        console.error(err);
      }
    }
  };

  useEffect(() => {
    fetchProject();
  }, [id]);

  if (!project) return <p>Loading...</p>;

  return (
    <div>
      {showForm && (
        <ModalForm
          mode="edit"
          project={project}
          onClose={() => setShowForm(false)}
          onSuccess={() => router.push('/admin/houseprojects')}
        />
      )}
      <button
        onClick={handleDelete}
        className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-500"
      >
        Delete Project
      </button>
    </div>
  );
}
