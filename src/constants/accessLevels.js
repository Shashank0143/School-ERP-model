/**
 * Defines the standard access levels for employees.
 * This prevents arbitrary strings and ensures consistency across the Administrative Reference module.
 */
export const ACCESS_LEVELS = [
  "Super Admin",
  "Administrator",
  "Finance Admin",
  "Transport Admin",
  "Support Officer",
  "HR Officer",
  "Standard Employee",
];

// Helper to determine badge colors based on access level
export const getAccessLevelBadgeColor = (level) => {
  switch (level) {
    case "Super Admin":
      return "bg-red-50 text-red-700 border-red-200";
    case "Administrator":
      return "bg-[#03045e]/10 text-[#03045e] border-[#03045e]/20";
    case "Finance Admin":
      return "bg-emerald-50 text-emerald-700 border-emerald-200";
    case "Transport Admin":
      return "bg-amber-50 text-amber-700 border-amber-200";
    case "Support Officer":
      return "bg-purple-50 text-purple-700 border-purple-200";
    case "HR Officer":
      return "bg-blue-50 text-blue-700 border-blue-200";
    case "Standard Employee":
    default:
      return "bg-gray-50 text-gray-600 border-gray-200";
  }
};
