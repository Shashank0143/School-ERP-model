import React, { useMemo, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { StaffWorkspaceProvider, useStaffContext } from '../context/StaffContext';
import StaffExtensionRegistry from '../shared/registries/StaffExtensionRegistry';
import ErrorBoundary from '../components/ErrorBoundary';

const StaffProfilePage = lazy(() => import('../pages/admin/staff/StaffProfilePage'));

// The Inner Layout that consumes the context
const StaffWorkspaceInner = () => {
  const staffContext = useStaffContext();
  const { staff } = staffContext;

  // Get dynamic extensions for routing
  const extensions = useMemo(() => {
    return StaffExtensionRegistry.getExtensionsForEmployee(staffContext);
  }, [staffContext]);

  if (!staff) return null;

  return (
    <div className="flex flex-col h-full bg-gray-50 min-h-screen">
      <main className="flex-1 w-full max-w-[1600px] mx-auto overflow-y-auto">
        <ErrorBoundary>
          <Routes>
            {/* The root of the layout renders the consolidated StaffProfilePage */}
            <Route path="/" element={
              <React.Suspense fallback={
                <div className="flex items-center justify-center min-h-[400px]">
                  <div className="w-10 h-10 border-4 border-[#00b4d8] border-t-transparent rounded-full animate-spin" />
                </div>
              }>
                <StaffProfilePage />
              </React.Suspense>
            } />
            
            {/* Dynamic Extension Routes */}
            {extensions.map(ext => (
              <Route 
                key={ext.id} 
                path={ext.route} 
                element={<React.Suspense fallback={
                  <div className="flex items-center justify-center min-h-[400px]">
                    <div className="w-10 h-10 border-4 border-[#00b4d8] border-t-transparent rounded-full animate-spin" />
                  </div>
                }>
                  <ext.component />
                </React.Suspense>} 
              />
            ))}
            {/* Legacy fallback to handle /overview and other deprecated routes */}
            <Route path="*" element={<Navigate to={`/admin/staff/${staff.id}`} replace />} />
          </Routes>
        </ErrorBoundary>
      </main>
    </div>
  );
};

// The wrapper that injects the Provider
export default function StaffWorkspaceLayout() {
  return (
    <StaffWorkspaceProvider>
      <StaffWorkspaceInner />
    </StaffWorkspaceProvider>
  );
}
