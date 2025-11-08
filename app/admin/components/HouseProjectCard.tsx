'use client';
import React from 'react';

type Props = {
  project: any;
  onDelete: (id: string) => void;
  onEdit: (id: string) => void;
};

export default function HouseProjectCard({ project, onDelete, onEdit }: Props) {
  return (
    <div className="bg-gray-700 p-4 rounded shadow hover:bg-gray-600 transition">
      <img
        src={project.thumbnail}
        alt={project.title}
        className="w-full h-40 object-cover rounded mb-3"
      />
      <h2 className="text-lg font-bold mb-1">{project.title}</h2>
      <p className="text-gray-300 mb-2">{project.description}</p>
      <p className="text-gray-300 mb-2">Price: ${project.price}</p>
      <p className="text-gray-300 mb-2">Location: {project.location}</p>
      <div className="flex gap-2 mt-2">
        <button
          onClick={() => onEdit(project.id)}
          className="bg-white text-gray-900 px-3 py-1 rounded hover:bg-gray-200 transition"
        >
          Edit
        </button>
        <button
          onClick={() => onDelete(project.id)}
          className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-500 transition"
        >
          Delete
        </button>
      </div>
    </div>
  );
}
