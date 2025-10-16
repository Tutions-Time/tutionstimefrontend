'use client';

import React from 'react';

interface LoadingStateProps {
  isLoading: boolean;
  children: React.ReactNode;
  loadingText?: string;
  size?: 'sm' | 'md' | 'lg';
  fullScreen?: boolean;
}

export function LoadingState({
  isLoading,
  children,
  loadingText = 'Loading...',
  size = 'md',
  fullScreen = false,
}: LoadingStateProps) {
  if (!isLoading) {
    return <>{children}</>;
  }

  const spinnerSizes = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
  };

  const textSizes = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
  };

  const LoadingSpinner = () => (
    <div className="flex flex-col items-center justify-center space-y-2">
      <div className={`animate-spin rounded-full border-t-2 border-b-2 border-indigo-600 ${spinnerSizes[size]}`}></div>
      {loadingText && <p className={`${textSizes[size]} text-gray-600`}>{loadingText}</p>}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-white bg-opacity-80 z-50">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="relative min-h-[100px] flex items-center justify-center">
      <div className="absolute inset-0 bg-white bg-opacity-70 flex items-center justify-center z-10">
        <LoadingSpinner />
      </div>
      <div className="opacity-40">{children}</div>
    </div>
  );
}