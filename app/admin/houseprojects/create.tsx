'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import ModalForm from '../components/ModalForm';

export default function CreateProjectPage() {
  const router = useRouter();
  const [showForm, setShowForm] = useState(true);

  return (
    <div>
      {showForm && (
        <ModalForm
          mode="create"
          onClose={() => setShowForm(false)}
          onSuccess={() => router.push('/admin/houseprojects')}
        />
      )}
    </div>
  );
}
