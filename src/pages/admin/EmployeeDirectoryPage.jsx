import React, { useState, useMemo, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Users,
  Plus,
  Edit,
  Trash2,
  CheckCircle2,
  ChevronRight,
  MoreVertical,
  Mail,
  Phone,
  Calendar,
  Building2,
  Shield,
  UserPlus,
  Search
} from "lucide-react";
import AdminPageHeader from "../../components/admin/AdminPageHeader";
import MainCard from "../../components/MainCard";
import employeeService from "../../services/employeeService";
import departmentService from "../../services/departmentService";

import { GENDER_OPTIONS, DEFAULT_GENDER } from "../../constants/genderConstants";

// We import the seeds to cross-reference roles since they aren't fully in localProvider yet
import { ROLE_NAVIGATION } from "../../auth/navigation";
import StaffOnboardingEngine from "../../components/admin/staff/StaffOnboardingEngine";
const MOCK_ROLES = [
  { id: "role-vice-principal", name: "Vice Principal" },
  { id: "role-academic-coordinator", name: "Academic Coordinator" },
  { id: "role-exam-controller", name: "Examination Controller" },
  { id: "role-hr-manager", name: "HR Manager" },
  { id: "role-class-teacher", name: "Class Teacher" },
  { id: "role-subject-teacher", name: "Subject Teacher" },
  { id: "role-librarian", name: "Librarian" },
  { id: "role-transport-manager", name: "Transport Manager" },
  { id: "role-accountant", name: "Accountant" },
  { id: "role-receptionist", name: "Receptionist" },
];

const EmployeeDirectoryPage = () => {
  const navigate = useNavigate();
  const [employees, setEmployees] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  
  const [showOnboarding, setShowOnboarding] = useState(false);
  
  const [loadingToggle, setLoadingToggle] = useState(null);
  const [newCredentials, setNewCredentials] = useState(null);

  const [isLoading, setIsLoading] = useState(true);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const fetchedEmps = await employeeService.getEmployees();
      const fetchedDepts = await departmentService.getDepartments();
      setEmployees(fetchedEmps);
      setDepartments(fetchedDepts);
    } catch (error) {
      console.error("Error fetching data", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredEmployees = useMemo(() => {
    return employees.filter((emp) => {
      const matchesSearch =
        searchTerm === "" ||
        emp.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.employeeId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.email.toLowerCase().includes(searchTerm.toLowerCase());
        
      const matchesStatus =
        statusFilter === "all" || emp.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [employees, searchTerm, statusFilter]);

  const handleDelete = async (empId) => {
    if (window.confirm("Are you sure you want to delete this employee?")) {
      await employeeService.deleteEmployee(empId);
      fetchData();
    }
  };

  const getStatusBadge = (status) => {
    const isActive = status === "active";
    return (
      <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider border ${isActive ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-gray-50 text-gray-600 border-gray-200"}`}>
        {isActive ? "Active" : "Inactive"}
      </span>
    );
  };

  const handleTogglePortalAccess = async (emp) => {
    if (emp.status !== "active") return;
    
    const isEnabling = !emp.portalAccess;
    
    if (!isEnabling) {
      if (!window.confirm("Disable ERP Access?\nThe employee will no longer be able to log into EduDash.")) {
        return;
      }
    }
    
    setLoadingToggle(emp.employeeId);
    try {
      const result = await employeeService.togglePortalAccess(emp.employeeId, isEnabling);
      if (result.credentials) {
        setNewCredentials({ empId: emp.employeeId, ...result.credentials });
      } else if (!isEnabling && newCredentials?.empId === emp.employeeId) {
        setNewCredentials(null);
      }
      fetchData();
    } catch (error) {
      console.error("Error toggling portal access", error);
      alert("Failed to toggle access");
    } finally {
      setLoadingToggle(null);
    }
  };

  const getDeptName = (deptId) => {
    const d = departments.find(d => d.departmentId === deptId);
    return d ? d.departmentName : "Unassigned";
  };

  const getRoleName = (roleId) => {
    const r = MOCK_ROLES.find(r => r.id === roleId);
    return r ? r.name : "Unassigned";
  };

  if (isLoading) {
    return <div className="p-8 text-center text-gray-500 font-bold">Loading Employee Registry...</div>;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6 pb-12"
    >
      <AdminPageHeader
        title="Employee Directory"
        description="Single source of truth for all non-teaching and administrative staff"
        breadcrumbs={["Admin Portal", "User Management", "Employees"]}
        actionButton={
          <button
            onClick={() => setShowOnboarding(true)}
            className="flex items-center gap-2 bg-[#0077b6] hover:bg-[#03045e] text-white px-5 py-2.5 rounded-2xl shadow-lg shadow-[#0077b6]/20 text-xs font-black transition-all"
          >
            <Plus size={16} />
            <span>Onboard Staff</span>
          </button>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-1 md:grid-cols-2 gap-4">
        <MainCard className="p-4 border border-[#caf0f8]/60">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Total Staff</p>
              <p className="text-lg font-black text-[#03045e] mt-1">{employees.length}</p>
            </div>
            <div className="p-3 rounded-xl bg-[#caf0f8] text-[#0077b6]">
              <Users size={20} />
            </div>
          </div>
        </MainCard>
        <MainCard className="p-4 border border-[#caf0f8]/60">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Active Employees</p>
              <p className="text-lg font-black text-[#03045e] mt-1">
                {employees.filter((e) => e.status === "active").length}
              </p>
            </div>
            <div className="p-3 rounded-xl bg-emerald-50 text-emerald-600">
              <CheckCircle2 size={20} />
            </div>
          </div>
        </MainCard>
      </div>

      <MainCard className="p-4 border border-[#caf0f8]/60">
        <div className="flex flex-col md:flex-row items-center gap-4">
          <div className="flex-1 relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name, ID, or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#caf0f8] text-xs font-bold text-[#03045e] outline-none focus:border-[#0077b6] bg-white transition-colors"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2.5 rounded-xl border border-[#caf0f8] text-xs font-bold text-[#03045e] outline-none focus:border-[#0077b6] bg-white cursor-pointer"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </MainCard>

      <MainCard className="border border-[#caf0f8]/60 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left py-3 px-4 text-[10px] font-black text-gray-400 uppercase tracking-wider">Employee</th>
                <th className="text-left py-3 px-4 text-[10px] font-black text-gray-400 uppercase tracking-wider">Department</th>
                <th className="text-left py-3 px-4 text-[10px] font-black text-gray-400 uppercase tracking-wider">Role & Designation</th>
                <th className="text-left py-3 px-4 text-[10px] font-black text-gray-400 uppercase tracking-wider">Status</th>
                <th className="text-left py-3 px-4 text-[10px] font-black text-gray-400 uppercase tracking-wider">ERP Access</th>
                <th className="text-right py-3 px-4 text-[10px] font-black text-gray-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredEmployees.map((emp) => (
                <tr key={emp.employeeId} className="border-b border-gray-50 hover:bg-[#caf0f8]/20 transition-colors">
                  <td className="py-4 px-4">
                    <div>
                      <p className="text-xs font-black text-[#03045e]">{emp.employeeName}</p>
                      <p className="text-[10px] text-gray-400">{emp.employeeId}</p>
                    </div>
                  </td>
                  <td className="py-4 px-4 text-xs font-bold text-gray-600">{getDeptName(emp.departmentId)}</td>
                  <td className="py-4 px-4">
                    <div>
                      <p className="text-xs font-bold text-gray-700">{emp.designation}</p>
                      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">{emp.category}</p>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    {getStatusBadge(emp.status)}
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex flex-col gap-1 items-start">
                      <button
                        onClick={() => handleTogglePortalAccess(emp)}
                        disabled={emp.status !== "active" || loadingToggle === emp.employeeId}
                        className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                          emp.status !== "active"
                            ? "bg-gray-200 cursor-not-allowed"
                            : emp.portalAccess
                            ? "bg-emerald-500"
                            : "bg-gray-300"
                        }`}
                      >
                        <span
                          className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
                            emp.portalAccess ? "translate-x-5" : "translate-x-1"
                          }`}
                        />
                      </button>
                      
                      {emp.status !== "active" ? (
                        <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider mt-1">Unavailable</span>
                      ) : emp.portalAccess ? (
                        <span className="text-[9px] font-bold text-emerald-600 uppercase tracking-wider mt-1">
                          Provisioned
                        </span>
                      ) : (
                        <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider mt-1">Not Provisioned</span>
                      )}

                      {newCredentials && newCredentials.empId === emp.employeeId && (
                        <div className="mt-2 p-2 bg-blue-50 border border-blue-100 rounded-lg text-xs min-w-[140px]">
                          <p className="font-black text-[#0077b6] mb-1 text-[9px] uppercase tracking-wider">New Credentials</p>
                          <div className="space-y-1">
                            <p className="text-gray-600 text-[10px]">User: <span className="font-mono font-bold text-gray-900">{newCredentials.username}</span></p>
                            <p className="text-gray-600 text-[10px]">Pass: <span className="font-mono font-bold text-gray-900">{newCredentials.password}</span></p>
                          </div>
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="py-4 px-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => handleDelete(emp.employeeId)} className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors">
                        <Trash2 size={14} />
                      </button>
                      <button
                        onClick={() => navigate(`/admin/staff/${emp.id || emp.employeeId}/overview`)}
                        className="text-[#0077b6] hover:text-[#03045e] transition-colors p-1.5 hover:bg-[#caf0f8]/40 rounded-lg"
                        title="View Staff Profile"
                      >
                        <ChevronRight size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredEmployees.length === 0 && (
                <tr>
                  <td colSpan="6" className="py-8 text-center text-xs font-bold text-gray-400">
                    No employees found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </MainCard>



      {/* Lightweight Employee Details Modal Removed in UX Alignment */}

      {/* Staff Onboarding Engine */}
      {showOnboarding && (
        <StaffOnboardingEngine 
          onClose={() => setShowOnboarding(false)} 
          onComplete={() => {
            setShowOnboarding(false);
            fetchData();
          }}
        />
      )}
    </motion.div>
  );
};

export default EmployeeDirectoryPage;
