import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import employeeService from '../services/employeeService';
import departmentService from '../services/departmentService';
import { ProjectionFactory, ProjectionTypes } from '../services/projections/ProjectionFactory';
import { useAuth } from './AuthContext';
import { toast } from 'react-toastify';

const StaffContext = createContext(null);

export const StaffWorkspaceProvider = ({ children }) => {
  const { id } = useParams();
  const { user } = useAuth(); // Get the current viewer's auth context
  
  const [staff, setStaff] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchStaff = useCallback(async () => {
    try {
      setLoading(true);
      const rawData = await employeeService.getEmployee(id);
      if (!rawData) {
        throw new Error("Staff member not found");
      }
      
      const departments = await departmentService.getDepartments();
      const dept = departments.find(d => d.departmentId === rawData.departmentId);
      if (dept) {
        rawData.departmentName = dept.departmentName;
      }

      const projection = ProjectionFactory.create(ProjectionTypes.WORKSPACE, rawData);
      setStaff(projection);
      setError(null);
    } catch (err) {
      console.error("Failed to fetch staff context:", err);
      setError(err.message || "Failed to load staff details.");
      toast.error("Failed to load staff details.");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (id) {
      fetchStaff();
    }
  }, [id, fetchStaff]);

  const value = useMemo(() => {
    if (!staff) return { loading, error, refresh: fetchStaff };

    return {
      staff, // The frozen projection
      employeeId: staff.id,
      category: staff.employment.category,
      status: staff.employment.status,
      department: staff.employment.departmentId,
      designation: staff.employment.designation,
      portal: staff.identity.portalAccess,
      identity: staff.identity.linkedAuthUserId,
      capabilities: staff.capabilities,
      // Pass down the current user's permissions so extensions can determine what to show
      viewerPermissions: user?.permissions || [], 
      loading,
      error,
      refresh: fetchStaff,
      dispatch: (action) => {
        // Future: Handle timeline events or complex local state mutations
        console.log("StaffContext dispatch:", action);
      }
    };
  }, [staff, loading, error, fetchStaff, user]);

  if (loading) {
    return <div className="p-8 text-center text-gray-500 animate-pulse">Loading Staff Workspace...</div>;
  }

  if (error) {
    return (
      <div className="p-8 text-center">
        <h2 className="text-xl font-semibold text-red-600 mb-2">Error Loading Workspace</h2>
        <p className="text-gray-600">{error}</p>
        <button onClick={fetchStaff} className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
          Retry
        </button>
      </div>
    );
  }

  return (
    <StaffContext.Provider value={value}>
      {children}
    </StaffContext.Provider>
  );
};

export const useStaffContext = () => {
  const context = useContext(StaffContext);
  if (!context) {
    throw new Error("useStaffContext must be used within a StaffWorkspaceProvider");
  }
  return context;
};
