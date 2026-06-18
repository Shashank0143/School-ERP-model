import React from "react";
import MainCard from "../../../components/MainCard";

const DashboardCardSkeleton = () => {
  return (
    <MainCard className="p-6 border border-gray-100 bg-white relative overflow-hidden animate-pulse">
      <div className="flex items-center justify-between border-b border-gray-50 pb-3 mb-4">
        <div className="space-y-2">
          <div className="h-3 w-16 bg-gray-200 rounded-md" />
          <div className="h-5 w-32 bg-gray-200 rounded-md" />
        </div>
        <div className="h-6 w-12 bg-gray-200 rounded-md" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="space-y-2">
            <div className="h-3 w-8 bg-gray-200 rounded-md mx-auto" />
            <div className="h-5 w-12 bg-gray-200 rounded-md mx-auto" />
          </div>
        ))}
      </div>
    </MainCard>
  );
};

export default DashboardCardSkeleton;

