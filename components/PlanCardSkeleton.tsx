import React from 'react';

const PlanCardSkeleton: React.FC<{ count?: number }> = ({ count = 8 }) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 xl:gap-5">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="overflow-hidden border border-brand-line bg-white"
          aria-hidden
        >
          <div className="skeleton h-36 sm:h-44 xl:h-40 w-full rounded-none" />
          <div className="p-3 sm:p-4 space-y-2.5">
            <div className="skeleton h-4 w-3/4" />
            <div className="grid grid-cols-2 gap-2">
              <div className="skeleton h-3 w-full" />
              <div className="skeleton h-3 w-full" />
            </div>
            <div className="skeleton h-9 w-full" />
          </div>
        </div>
      ))}
    </div>
  );
};

export default PlanCardSkeleton;
