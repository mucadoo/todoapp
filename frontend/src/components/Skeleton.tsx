import React from 'react';
import { clsx } from 'clsx';

interface SkeletonProps {
  className?: string;
}

export const Skeleton: React.FC<SkeletonProps> = ({ className }) => {
  return (
    <div className={clsx("animate-pulse bg-gray-200 rounded", className)} />
  );
};

export const TaskCardSkeleton: React.FC = () => {
  return (
    <div className="bg-white border rounded-lg p-4 shadow-sm space-y-4">
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-3 w-full">
          <Skeleton className="w-5 h-5 mt-1 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <div className="flex items-center space-x-2 mt-3 pt-1">
              <Skeleton className="h-5 w-16" />
              <Skeleton className="h-5 w-16" />
              <Skeleton className="h-4 w-24" />
            </div>
          </div>
        </div>
        <div className="flex space-x-1">
          <Skeleton className="w-6 h-6" />
          <Skeleton className="w-6 h-6" />
          <Skeleton className="w-6 h-6" />
        </div>
      </div>
    </div>
  );
};

export const SidebarItemSkeleton: React.FC = () => {
  return (
    <div className="flex items-center space-x-3 px-3 py-2">
      <Skeleton className="w-5 h-5 rounded" />
      <Skeleton className="h-4 w-24" />
    </div>
  );
};
