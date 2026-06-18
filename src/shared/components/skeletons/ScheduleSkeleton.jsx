import React from "react";
import MainCard from "../../../components/MainCard";

const ScheduleSkeleton = () => {
  return (
    <MainCard className="p-6 border border-gray-100 bg-white relative overflow-hidden animate-pulse">
      <div className="flex items-center justify-between pb-3 border-b border-gray-50 mb-5">
        <div className="space-y-2">
          <div className="h-4 w-36 bg-gray-200 rounded-md" />
          <div className="h-3 w-48 bg-gray-200 rounded-md" />
        </div>
        <div className="h-8 w-24 bg-gray-200 rounded-xl" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-1 sm:grid-cols-2 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="flex gap-4 p-4 border border-gray-50 rounded-2xl bg-gray-50/50">
            <div className="w-12 h-12 bg-gray-200 rounded-xl" />
            <div className="flex-1 space-y-2.5">
              <div className="h-3.5 w-1/2 bg-gray-200 rounded-md" />
              <div className="h-3 w-1/3 bg-gray-200 rounded-md" />
              <div className="h-2.5 w-1/4 bg-gray-200 rounded-md" />
            </div>
          </div>
        ))}
      </div>
    </MainCard>
  );
};

export default ScheduleSkeleton;

