import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Building2,
  User,
  Calendar,
  Users,
  Shield,
  Check,
} from "lucide-react";
import PropTypes from "prop-types";

const DepartmentDetailsModal = ({ isOpen, onClose, department }) => {
  const [activePermissionTab, setActivePermissionTab] = useState("academic");

  if (!department) return null;

  const permissionCategories = {
    academic: {
      title: "Academic Permissions",
      permissions: [
        { id: "student_mgmt", label: "Student Management", enabled: true },
        { id: "attendance", label: "Attendance Access", enabled: true },
        { id: "exam_control", label: "Examination Control", enabled: true },
        { id: "timetable", label: "Timetable Access", enabled: true },
        { id: "grade_review", label: "Grade Review", enabled: false },
      ],
    },
    financial: {
      title: "Financial Permissions",
      permissions: [
        { id: "fee_visibility", label: "Fee Visibility", enabled: false },
        { id: "budget_approval", label: "Budget Approval", enabled: false },
        { id: "expense_tracking", label: "Expense Tracking", enabled: true },
        { id: "invoice_gen", label: "Invoice Generation", enabled: false },
      ],
    },
    administrative: {
      title: "Administrative Permissions",
      permissions: [
        { id: "staff_mgmt", label: "Staff Management", enabled: true },
        { id: "report_gen", label: "Report Generation", enabled: true },
        { id: "audit_access", label: "Audit Access", enabled: false },
        { id: "system_config", label: "System Configuration", enabled: false },
      ],
    },
  };

  const currentCategory = permissionCategories[activePermissionTab];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop + flex centering wrapper */}
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={onClose}
          >
            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3 }}
              className="w-full w-[95vw] md:w-[90vw] lg:max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-[#caf0f8]/60 bg-gradient-to-r from-[#03045e] to-[#0077b6]">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                    <Building2 size={20} className="text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-white">
                      {department.name}
                    </h3>
                    <p className="text-[10px] text-white/70 font-semibold uppercase tracking-wider">
                      {department.code}
                    </p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 rounded-lg hover:bg-white/20 transition-colors"
                >
                  <X size={18} className="text-white" />
                </button>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {/* Department Information */}
                <div className="grid grid-cols-1 md:grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 rounded-2xl bg-[#caf0f8]/20 border border-[#caf0f8]/40">
                    <div className="flex items-center gap-2 mb-2">
                      <User size={14} className="text-[#0077b6]" />
                      <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">
                        Department Head
                      </p>
                    </div>
                    <p className="text-xs font-extrabold text-[#03045e]">
                      {department.head}
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-[#caf0f8]/20 border border-[#caf0f8]/40">
                    <div className="flex items-center gap-2 mb-2">
                      <Calendar size={14} className="text-[#0077b6]" />
                      <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">
                        Created Date
                      </p>
                    </div>
                    <p className="text-xs font-extrabold text-[#03045e]">
                      {department.createdDate}
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-[#caf0f8]/20 border border-[#caf0f8]/40">
                    <div className="flex items-center gap-2 mb-2">
                      <Users size={14} className="text-[#0077b6]" />
                      <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">
                        Total Staff
                      </p>
                    </div>
                    <p className="text-xs font-extrabold text-[#03045e]">
                      {department.members} Members
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-[#caf0f8]/20 border border-[#caf0f8]/40">
                    <div className="flex items-center gap-2 mb-2">
                      <Shield size={14} className="text-[#0077b6]" />
                      <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">
                        Status
                      </p>
                    </div>
                    <span
                      className={`inline-block px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${
                        department.status === "active"
                          ? "bg-emerald-50 text-emerald-600 border border-emerald-100"
                          : department.status === "under_review"
                            ? "bg-amber-50 text-amber-600 border border-amber-100"
                            : "bg-rose-50 text-rose-600 border border-rose-100"
                      }`}
                    >
                      {department.status === "active"
                        ? "Active"
                        : department.status === "under_review"
                          ? "Under Review"
                          : "Restricted"}
                    </span>
                  </div>
                </div>

                {/* Role Structure */}
                <div>
                  <h4 className="text-xs font-black text-[#03045e] uppercase tracking-wider mb-3">
                    Role Structure
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {department.roles.map((role, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1.5 rounded-xl bg-[#03045e] text-white text-[10px] font-black"
                      >
                        {role}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Permission Categories */}
                <div>
                  <h4 className="text-xs font-black text-[#03045e] uppercase tracking-wider mb-3">
                    Permission Categories
                  </h4>

                  {/* Tab Navigation */}
                  <div className="flex gap-2 mb-4">
                    {Object.keys(permissionCategories).map((key) => (
                      <button
                        key={key}
                        onClick={() => setActivePermissionTab(key)}
                        className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-colors ${
                          activePermissionTab === key
                            ? "bg-[#03045e] text-white"
                            : "bg-[#caf0f8]/40 text-[#03045e] hover:bg-[#caf0f8]/60"
                        }`}
                      >
                        {permissionCategories[key].title}
                      </button>
                    ))}
                  </div>

                  {/* Permission List */}
                  <div className="space-y-2">
                    {currentCategory.permissions.map((perm) => (
                      <div
                        key={perm.id}
                        className="flex items-center justify-between p-3 rounded-xl bg-white border border-[#caf0f8]/60 hover:border-[#0077b6] transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-5 h-5 rounded-md flex items-center justify-center transition-colors ${
                              perm.enabled ? "bg-emerald-500" : "bg-gray-200"
                            }`}
                          >
                            {perm.enabled && (
                              <Check size={12} className="text-white" />
                            )}
                          </div>
                          <span className="text-xs font-bold text-[#03045e]">
                            {perm.label}
                          </span>
                        </div>
                        <button
                          className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider transition-colors ${
                            perm.enabled
                              ? "bg-emerald-50 text-emerald-600 border border-emerald-100"
                              : "bg-gray-50 text-gray-400 border border-gray-200"
                          }`}
                        >
                          {perm.enabled ? "Enabled" : "Disabled"}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="px-6 py-4 border-t border-[#caf0f8]/60 bg-gray-50">
                <div className="flex items-center justify-end gap-3">
                  <button
                    onClick={onClose}
                    className="px-5 py-2.5 rounded-2xl text-xs font-black text-[#03045e] hover:bg-[#caf0f8] transition-colors"
                  >
                    Close
                  </button>
                  <button className="px-5 py-2.5 rounded-2xl bg-[#0077b6] hover:bg-[#0096c7] text-white text-xs font-black transition-colors">
                    Save Changes
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};

DepartmentDetailsModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  department: PropTypes.object,
};

export default DepartmentDetailsModal;
