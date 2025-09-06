import React from 'react';

export function Skeleton({ className = '', rounded = 'rounded-md' }) {
  return <div className={`bg-gray-200 animate-pulse ${rounded} ${className}`} />;
}

export function SkeletonText({ lines = 3, className = '' }) {
  return (
    <div className={`space-y-2 ${className}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <div key={i} className="h-3 bg-gray-200 animate-pulse rounded">
          {/* line */}
        </div>
      ))}
    </div>
  );
}

export function SkeletonEventCard() {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <Skeleton className="w-full h-40 sm:h-48" rounded="" />
      <div className="p-4">
        <div className="h-5 w-3/4 bg-gray-200 animate-pulse rounded mb-2" />
        <div className="space-y-2 mb-4">
          <div className="h-3 w-full bg-gray-200 animate-pulse rounded" />
          <div className="h-3 w-5/6 bg-gray-200 animate-pulse rounded" />
        </div>
        <div className="flex items-center gap-4">
          <div className="h-4 w-32 bg-gray-200 animate-pulse rounded" />
          <div className="h-4 w-24 bg-gray-200 animate-pulse rounded" />
        </div>
      </div>
    </div>
  );
}

export function SkeletonGrid({ count = 6 }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonEventCard key={i} />
      ))}
    </div>
  );
}

export default Skeleton;

