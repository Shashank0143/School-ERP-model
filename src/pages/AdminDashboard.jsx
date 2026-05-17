import React from "react";
import MainCard from "../components/MainCard";

/**
 * AdminDashboard (Skeleton)
 * Phase 2 Architectural Placeholder
 */
const AdminDashboard = () => {
  return (
    <div className="space-y-6">
      <header className="mb-8">
        <h1 className="text-3xl font-black text-[#03045e]">Admin Portal</h1>
        <p className="text-gray-500 font-medium">Full institutional control, analytics, and system administration.</p>
      </header>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MainCard className="p-6 h-32 flex items-center justify-center border-dashed">
          <p className="text-gray-400 text-sm font-bold italic text-center">Analytics (Soon)</p>
        </MainCard>
        <MainCard className="p-6 h-32 flex items-center justify-center border-dashed">
          <p className="text-gray-400 text-sm font-bold italic text-center">Fee Admin (Soon)</p>
        </MainCard>
        <MainCard className="p-6 h-32 flex items-center justify-center border-dashed">
          <p className="text-gray-400 text-sm font-bold italic text-center">User Management (Soon)</p>
        </MainCard>
        <MainCard className="p-6 h-32 flex items-center justify-center border-dashed">
          <p className="text-gray-400 text-sm font-bold italic text-center">System Settings (Soon)</p>
        </MainCard>
      </div>
    </div>
  );
};

export default AdminDashboard;
