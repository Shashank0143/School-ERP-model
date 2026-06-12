/**
 * leavePortfolioSeed.js
 * Default seed data for the Leave Portfolio catalog.
 */

export const leavePortfolioSeed = [
  {
    leaveTypeId: "LT001",
    leaveTypeName: "Paid Leave",
    applicableTo: ["teacher", "employee"],
    description: "Standard paid leave allocation for staff.",
    defaultAllocation: 12,
    sortOrder: 1,
    isSystemDefined: true,
    isActive: true,
  },
  {
    leaveTypeId: "LT002",
    leaveTypeName: "Maternity Leave",
    applicableTo: ["teacher", "employee"],
    description: "Maternity leave for expecting mothers.",
    defaultAllocation: 180,
    sortOrder: 2,
    isSystemDefined: true,
    isActive: true,
  },
  {
    leaveTypeId: "LT003",
    leaveTypeName: "Paternity Leave",
    applicableTo: ["teacher", "employee"],
    description: "Paternity leave for new fathers.",
    defaultAllocation: 15,
    sortOrder: 3,
    isSystemDefined: true,
    isActive: true,
  },
  {
    leaveTypeId: "LT004",
    leaveTypeName: "Other",
    applicableTo: ["teacher", "employee", "student"],
    description: "Other types of leaves without a fixed predefined balance.",
    defaultAllocation: 0,
    sortOrder: 4,
    isSystemDefined: true,
    isActive: true,
  },
];
