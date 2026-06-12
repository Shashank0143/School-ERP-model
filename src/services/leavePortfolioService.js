import leavePortfolioProvider from "../data/providers/leavePortfolioProvider";
import { LEAVE_APPLICABLE_TYPES } from "../constants/leaveConstants";

/**
 * leavePortfolioService.js
 * Business logic and validations for Leave Types Master Data.
 */

export const getLeaveTypes = async () => {
  const portfolios = leavePortfolioProvider.getLeavePortfolios();
  // Ensure we sort by sortOrder
  return portfolios.sort((a, b) => (a.sortOrder || 99) - (b.sortOrder || 99));
};

export const getActiveLeaveTypes = async () => {
  const portfolios = await getLeaveTypes();
  return portfolios.filter(p => p.isActive);
};

export const getLeaveTypeById = async (id) => {
  const portfolios = await getLeaveTypes();
  return portfolios.find(p => p.leaveTypeId === id);
};

export const getLeavePortfolioSummary = async () => {
  const portfolios = await getLeaveTypes();
  const activeCount = portfolios.filter(p => p.isActive).length;
  return {
    totalLeaveTypes: portfolios.length,
    activeLeaveTypes: activeCount,
    inactiveLeaveTypes: portfolios.length - activeCount
  };
};

const validateNameUnique = async (name, excludeId = null) => {
  const trimmedLowerName = name.trim().toLowerCase();
  const portfolios = await getLeaveTypes();
  
  const duplicate = portfolios.find(p => 
    p.leaveTypeName.trim().toLowerCase() === trimmedLowerName && 
    p.leaveTypeId !== excludeId
  );
  
  if (duplicate) {
    throw new Error(`A leave type with the name "${name.trim()}" already exists.`);
  }
};

const validateApplicableTo = (applicableTo) => {
  if (!Array.isArray(applicableTo) || applicableTo.length === 0) {
    throw new Error("At least one applicable entity must be selected.");
  }
  
  const invalid = applicableTo.filter(type => !LEAVE_APPLICABLE_TYPES.includes(type));
  if (invalid.length > 0) {
    throw new Error(`Invalid applicable types: ${invalid.join(", ")}`);
  }
};

export const createLeaveType = async (data) => {
  if (!data.leaveTypeName || !data.leaveTypeName.trim()) {
    throw new Error("Leave Type Name is required.");
  }
  if (data.defaultAllocation < 0 || isNaN(data.defaultAllocation)) {
    throw new Error("Default Allocation must be zero or a positive number.");
  }
  
  validateApplicableTo(data.applicableTo || []);
  await validateNameUnique(data.leaveTypeName);

  const newId = `LT${Date.now()}`;
  const portfolios = await getLeaveTypes();
  const nextSortOrder = portfolios.length > 0 ? Math.max(...portfolios.map(p => p.sortOrder || 0)) + 1 : 1;

  const portfolioData = {
    leaveTypeId: newId,
    leaveTypeName: data.leaveTypeName.trim(),
    applicableTo: data.applicableTo,
    description: data.description ? data.description.trim() : "",
    defaultAllocation: Number(data.defaultAllocation) || 0,
    sortOrder: data.sortOrder || nextSortOrder,
    isSystemDefined: false, // User created leaves are never system defined
    isActive: data.isActive !== undefined ? data.isActive : true
  };

  return leavePortfolioProvider.createLeavePortfolio(portfolioData);
};

export const updateLeaveType = async (id, data) => {
  const existing = await getLeaveTypeById(id);
  if (!existing) {
    throw new Error("Leave type not found.");
  }

  // Prevent modifying core identity
  const updates = { ...data };
  delete updates.leaveTypeId;
  delete updates.isSystemDefined;

  if (updates.leaveTypeName !== undefined) {
    if (!updates.leaveTypeName.trim()) {
      throw new Error("Leave Type Name cannot be empty.");
    }
    await validateNameUnique(updates.leaveTypeName, id);
    updates.leaveTypeName = updates.leaveTypeName.trim();
  }

  if (updates.defaultAllocation !== undefined) {
    if (updates.defaultAllocation < 0 || isNaN(updates.defaultAllocation)) {
      throw new Error("Default Allocation must be zero or a positive number.");
    }
    updates.defaultAllocation = Number(updates.defaultAllocation);
  }

  if (updates.applicableTo !== undefined) {
    validateApplicableTo(updates.applicableTo);
  }
  
  if (updates.description !== undefined) {
    updates.description = updates.description.trim();
  }

  return leavePortfolioProvider.updateLeavePortfolio(id, updates);
};

export const deactivateLeaveType = async (id) => {
  const existing = await getLeaveTypeById(id);
  if (!existing) {
    throw new Error("Leave type not found.");
  }

  if (existing.isSystemDefined) {
    // We allow deactivation of system defined leaves, but we don't allow DELETION
    // Wait, the prompt says "Admin can: Edit Allocation, Edit Description, Deactivate. But cannot: Delete ID, Change Core Type Identity"
    // So deactivating a system defined leaf IS allowed.
  }

  return leavePortfolioProvider.updateLeavePortfolio(id, { isActive: false });
};

export const reactivateLeaveType = async (id) => {
  const existing = await getLeaveTypeById(id);
  if (!existing) {
    throw new Error("Leave type not found.");
  }

  return leavePortfolioProvider.updateLeavePortfolio(id, { isActive: true });
};
