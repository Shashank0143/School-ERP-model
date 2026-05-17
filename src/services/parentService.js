import { MockDB } from "../mockDB";

/**
 * parentService.js
 * 
 * Logic for parent-specific operations in the ERP.
 */

export const getParentProfile = async (parentId) => {
  return MockDB.parents.findById(parentId);
};

export const getChildren = async (parentId) => {
  const parent = await MockDB.parents.findById(parentId);
  if (!parent || !parent.childIds) return [];
  
  // Resolve each child entity
  const children = await Promise.all(
    parent.childIds.map(id => MockDB.students.findById(id))
  );
  
  return children;
};
