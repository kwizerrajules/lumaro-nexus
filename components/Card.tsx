import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
}

const Card: React.FC<CardProps> = ({ children, className = '', hover = false }) => {
  return (
    <div className={`
      bg-white rounded-lg border border-brand-line shadow-sm
      ${hover ? 'hover:shadow-md hover:border-amber-300 transition-all duration-300' : ''}
      ${className}
    `}>
      {children}
    </div>
  );
};

export default Card;