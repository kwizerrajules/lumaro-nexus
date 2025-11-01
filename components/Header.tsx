'use client';
import { useRouter } from 'next/navigation';

export default function Header() {
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    router.push('/login');
  };

  return (
    <header className="flex justify-end items-center bg-gray-900 p-4">
      <button
        onClick={handleLogout}
        className="bg-white text-gray-900 px-4 py-2 rounded hover:bg-gray-200 transition"
      >
        Logout
      </button>
    </header>
  );
}
