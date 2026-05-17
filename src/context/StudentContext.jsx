import React, { createContext, useContext, useState, useEffect, useMemo } from "react";
import { useAuth } from "./AuthContext";
import { getChildren } from "../services/parentService";
import { ROLES } from "../auth/roles";

const StudentContext = createContext(null);

/**
 * StudentProvider
 * 
 * Implements the Scoped Child Context Architecture.
 * For Parents: Manages which linked child is currently being viewed.
 * For Students: Locked to their own ID.
 * 
 * This ensures the authenticated identity remains constant (Parent)
 * while the data-viewing scope changes.
 */
export function StudentProvider({ children }) {
  const { user, role, isParent, isStudent } = useAuth();
  const [activeStudentId, setActiveStudentId] = useState(null);
  const [childrenList, setChildrenList] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch linked children for Parents
  useEffect(() => {
    let isMounted = true;
    
    const fetchChildren = async () => {
      if (!isParent || !user?.linkedEntityId) {
        setLoading(false);
        return;
      }

      try {
        const list = await getChildren(user.linkedEntityId);
        if (isMounted) {
          setChildrenList(list);
          // Default to the first child if none selected
          if (list.length > 0 && !activeStudentId) {
            setActiveStudentId(list[0].id);
          }
        }
      } catch (error) {
        console.error("Failed to fetch children:", error);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchChildren();
    return () => { isMounted = false; };
  }, [isParent, user?.linkedEntityId]);

  // For Students, the active ID is always their own
  useEffect(() => {
    if (isStudent && user?.linkedEntityId) {
      setActiveStudentId(user.linkedEntityId);
      setLoading(false);
    }
  }, [isStudent, user?.linkedEntityId]);

  const activeStudent = useMemo(() => {
    if (isStudent) return user?.profile;
    return childrenList.find(c => c.id === activeStudentId);
  }, [isStudent, user?.profile, childrenList, activeStudentId]);

  const [isSwitching, setIsSwitching] = useState(false);

  const handleSwitchStudent = (newId) => {
    if (newId === activeStudentId) return;
    setIsSwitching(true);
    setActiveStudentId(newId);
    
    // Premium transition duration for visual smooth switching
    setTimeout(() => {
      setIsSwitching(false);
    }, 850);
  };

  const value = useMemo(() => ({
    activeStudentId,
    activeStudent,
    childrenList,
    setActiveStudentId: handleSwitchStudent,
    isLoading: loading,
    isSwitching,
    isMultiChild: childrenList.length > 1
  }), [activeStudentId, activeStudent, childrenList, loading, isSwitching]);

  return (
    <StudentContext.Provider value={value}>
      {children}
    </StudentContext.Provider>
  );
}

export function useStudent() {
  const context = useContext(StudentContext);
  if (!context) {
    throw new Error("useStudent must be used within a StudentProvider");
  }
  return context;
}
