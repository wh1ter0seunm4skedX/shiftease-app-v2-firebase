import React from 'react';

export default function Spinner({
  label = 'Loading…',
  size = 48,
  overlay = false,
}) {
  const spinner = (
    <div className="flex flex-col items-center justify-center gap-3 text-gray-600">
      <div
        className="relative"
        style={{ width: size, height: size }}
        aria-hidden="true"
      >
        {/* Outer ring */}
        <div
          className="absolute inset-0 rounded-full border-4 border-gray-200"
          style={{ opacity: 0.6 }}
        />
        {/* Animated gradient arc */}
        <div
          className="absolute inset-0 rounded-full border-4 border-transparent animate-spin"
          style={{
            borderTopColor: '#7c3aed',
            borderRightColor: '#7c3aed',
          }}
        />
        {/* Center dot */}
        <div className="absolute inset-0 m-auto h-2 w-2 rounded-full bg-purple-500" />
      </div>
      {label && (
        <div className="text-sm font-medium text-gray-600 select-none" role="status" aria-live="polite">
          {label}
        </div>
      )}
    </div>
  );

  if (!overlay) return spinner;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/30 backdrop-blur-[2px]">
      {spinner}
    </div>
  );
}

