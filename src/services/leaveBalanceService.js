import { getLeaveTypes } from "./leavePortfolioService";
import { getLeaveRequests } from "./leaveService";

/**
 * leaveBalanceService.js
 * Implicit Role-Based Allocation Logic.
 * Computes leave balances on the fly based on the user's role portfolio and their approved leave history.
 */

export const getBalanceByUser = async (userId, userType) => {
  const allLeaveTypes = await getLeaveTypes();
  const activeTypesForRole = allLeaveTypes.filter(t => t.isActive && t.applicableTo.includes(userType.toLowerCase()));

  // If no leave types apply to this role, return empty
  if (activeTypesForRole.length === 0) return [];

  const allRequests = await getLeaveRequests();
  // Filter for this user's requests that have been APPROVED
  const userApprovedRequests = allRequests.filter(r => 
    r.applicantId === userId && 
    (r.status === "Approved" || r.status === "APPROVED")
  );

  const dynamicBalances = activeTypesForRole.map(type => {
    // Sum requested days for this specific leave type
    const usedDays = userApprovedRequests
      .filter(r => r.leaveTypeId === type.leaveTypeId)
      .reduce((sum, r) => sum + (Number(r.requestedDays) || 0), 0);

    const allocated = Number(type.defaultAllocation) || 0;
    const remaining = allocated - usedDays;

    return {
      balanceId: `${userId}_${type.leaveTypeId}`, // synthetic ID
      userId,
      userType: userType.toLowerCase(),
      leaveTypeId: type.leaveTypeId,
      leaveTypeName: type.leaveTypeName,
      description: type.description,
      defaultAllocation: type.defaultAllocation,
      sortOrder: type.sortOrder || 999,
      allocated,
      used: usedDays,
      remaining
    };
  });

  return dynamicBalances.sort((a, b) => a.sortOrder - b.sortOrder);
};

export const getBalanceSummaryByUser = async (userId, userType) => {
  const userBalances = await getBalanceByUser(userId, userType);
  const totalAllocatedDays = userBalances.reduce((sum, b) => sum + (Number(b.allocated) || 0), 0);
  const totalUsedDays = userBalances.reduce((sum, b) => sum + (Number(b.used) || 0), 0);
  const totalRemainingDays = userBalances.reduce((sum, b) => sum + (Number(b.remaining) || 0), 0);
  
  return {
    totalAllocatedDays,
    totalUsedDays,
    totalRemainingDays
  };
};

export const getBalanceSnapshotForUser = async (userId, userType, leaveTypeId) => {
  const balances = await getBalanceByUser(userId, userType);
  return balances.find(b => b.leaveTypeId === leaveTypeId) || null;
};

export const getApprovalBalancePreview = async (userId, userType, leaveTypeId, requestedDays) => {
  const balance = await getBalanceSnapshotForUser(userId, userType, leaveTypeId);
  
  if (!balance) {
    return {
      isValid: false,
      beforeBalance: 0,
      requestedDays: Number(requestedDays),
      afterBalance: null,
      error: "No allocation policy exists."
    };
  }

  const beforeBalance = Number(balance.remaining);
  const reqDays = Number(requestedDays);
  
  if (reqDays > beforeBalance) {
    return {
      isValid: false,
      beforeBalance,
      requestedDays: reqDays,
      afterBalance: null,
      error: "Insufficient Balance"
    };
  }

  return {
    isValid: true,
    beforeBalance,
    requestedDays: reqDays,
    afterBalance: beforeBalance - reqDays
  };
};
