import React from "react";
import { CheckCircle2, XCircle, GraduationCap, Users } from "lucide-react";

/**
 * StudentStatusBadge
 * 
 * Standardized student lifecycle status indicator across the ERP.
 * Strictly separates lifecycle status from Exit Workflow statuses.
 */
const StudentStatusBadge = ({ 
  status, 
  size = "md", // "sm" | "md" | "lg"
  showIcon = true,
  className = ""
}) => {
  // Legacy handler for undefined or false values
  const normalizedStatus = status === false ? "Inactive" : (status || "Active");

  // Lifecycle Status Styles & Icons
  // Active: Green
  // Withdrawn: Red
  // School Completed: Blue
  // Alumni: Purple (Reserved)
  // Inactive: Gray (Legacy mapping)
  
  const getBadgeConfig = () => {
    switch (normalizedStatus) {
      case "Active":
        return {
          style: "bg-emerald-50 text-emerald-600 border-emerald-100",
          Icon: CheckCircle2
        };
      case "Withdrawn":
        return {
          style: "bg-rose-50 text-rose-600 border-rose-100",
          Icon: XCircle
        };
      case "School Completed":
        return {
          style: "bg-blue-50 text-[#0077b6] border-blue-100",
          Icon: GraduationCap
        };
      case "Alumni":
        return {
          style: "bg-purple-50 text-purple-600 border-purple-100",
          Icon: Users
        };
      case "Inactive":
      default:
        return {
          style: "bg-gray-100 text-gray-500 border-gray-200",
          Icon: XCircle
        };
    }
  };

  const { style, Icon } = getBadgeConfig();

  // Size variations
  const sizeStyles = {
    sm: "px-2 py-0.5 text-[9px] gap-1",
    md: "px-2.5 py-1 text-[10px] gap-1.5",
    lg: "px-3 py-1.5 text-xs gap-2"
  };

  return (
    <span 
      className={`inline-flex items-center justify-center rounded-full font-black uppercase tracking-wider border ${sizeStyles[size] || sizeStyles.md} ${style} ${className}`}
    >
      {showIcon && <Icon size={size === "sm" ? 10 : size === "md" ? 12 : 14} />}
      {normalizedStatus}
    </span>
  );
};

export default React.memo(StudentStatusBadge);
