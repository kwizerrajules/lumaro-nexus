'use client';
import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import HouseProjectCard from '../components/HouseProjectCard';
import Sidebar from '../components/Sidebar';
import Newsletter from '../components/Newsletter';

export interface FilterState {
  minPrice?: number;
  maxPrice?: number;
  bedrooms?: number[];
  bathrooms?: number[];
  minArea?: number;
  maxArea?: number;
}

const mockProjects = [
  {
    id: '22303',
    title: 'Modern 2 Bedroom Apartment Block',
    price: 511,
    image: '/placeholder-house-1.jpg',
    bedrooms: 2,
    bathrooms: 2,
    floors: 1,
    area: 120,
  },
  {
    id: '22304',
    title: 'Luxury Villa with Pool',
    price: 1200,
    image: '/placeholder-house-2.jpg',
    bedrooms: 4,
    bathrooms: 3,
    floors: 2,
    area: 350,
  },
  {
    id: '22305',
    title: 'Cozy 1 Bedroom Studio',
    price: 300,
    image: '/placeholder-house-3.jpg',
    bedrooms: 1,
    bathrooms: 1,
    floors: 1,
    area: 60,
  },
];

const Page = () => {
  const [projects, setProjects] = useState(mockProjects);

  const handleFilterChange = (filters: FilterState) => {
    // TODO: Implement filtering logic
    console.log('Filters changed:', filters);
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <div className="flex flex-1">
        <Sidebar onFilterChange={handleFilterChange} />
        <main className="flex-1 p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <HouseProjectCard key={project.id} project={project} />
          ))}
        </main>
      </div>
      <Newsletter />
    </div>
  );
};

export default Page;
