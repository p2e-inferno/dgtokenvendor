import React from "react";

export const ProfilePageSkeleton = () => (
  <div className="flex flex-col items-center animate-pulse w-full">
    {/* Skeleton for Header */}
    <div className="text-center mb-8 max-w-2xl w-full">
      <div className="h-10 bg-gray-300 rounded-md w-3/4 mx-auto mb-4"></div>
      <div className="h-6 bg-gray-300 rounded-md w-full mx-auto"></div>
    </div>

    {/* Skeleton for UserProfile area */}
    <div className="w-full max-w-4xl">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-gray-200 p-6 rounded-xl h-72">
          <div className="h-6 bg-gray-300 rounded-md w-1/2 mb-6"></div>
          <div className="h-4 bg-gray-300 rounded-md w-3/4 mb-3"></div>
          <div className="h-4 bg-gray-300 rounded-md w-full mb-3"></div>
          <div className="h-4 bg-gray-300 rounded-md w-2/3 mb-3"></div>
          <div className="h-4 bg-gray-300 rounded-md w-full mb-3"></div>
          <div className="h-4 bg-gray-300 rounded-md w-3/4"></div>
        </div>
        <div className="bg-gray-200 p-6 rounded-xl h-72">
          <div className="h-6 bg-gray-300 rounded-md w-1/2 mb-6"></div>
          <div className="h-4 bg-gray-300 rounded-md w-3/4 mb-3"></div>
          <div className="h-4 bg-gray-300 rounded-md w-full mb-3"></div>
          <div className="h-4 bg-gray-300 rounded-md w-2/3 mb-3"></div>
          <div className="h-4 bg-gray-300 rounded-md w-full mb-3"></div>
          <div className="h-4 bg-gray-300 rounded-md w-3/4"></div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-4">
        <div className="bg-gray-200 p-6 rounded-xl h-72">
          <div className="h-6 bg-gray-300 rounded-md w-1/2 mb-6"></div>
          <div className="h-4 bg-gray-300 rounded-md w-3/4 mb-3"></div>
          <div className="h-4 bg-gray-300 rounded-md w-full mb-3"></div>
          <div className="h-4 bg-gray-300 rounded-md w-2/3 mb-3"></div>
          <div className="h-4 bg-gray-300 rounded-md w-full mb-3"></div>
          <div className="h-4 bg-gray-300 rounded-md w-3/4"></div>
        </div>
        <div className="bg-gray-200 p-6 rounded-xl h-72">
          <div className="h-6 bg-gray-300 rounded-md w-1/2 mb-6"></div>
          <div className="h-4 bg-gray-300 rounded-md w-3/4 mb-3"></div>
          <div className="h-4 bg-gray-300 rounded-md w-full mb-3"></div>
          <div className="h-4 bg-gray-300 rounded-md w-2/3 mb-3"></div>
          <div className="h-4 bg-gray-300 rounded-md w-full mb-3"></div>
          <div className="h-4 bg-gray-300 rounded-md w-3/4"></div>
        </div>
      </div>
    </div>
  </div>
);
