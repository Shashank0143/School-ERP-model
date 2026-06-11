import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Shield,
  Users,
  Check,
  FileText,
  Search,
  Filter,
  CheckCircle,
  AlertTriangle,
} from "lucide-react";
import AdminPageHeader from "../../components/admin/AdminPageHeader";
import MainCard from "../../components/MainCard";
import employeeService from "../../services/employeeService";
import moduleOwnershipService from "../../services/moduleOwnershipService";
import {
  ACCESS_LEVELS,
  getAccessLevelBadgeColor,
} from "../../constants/accessLevels";

// Mock audit logs (In a real app, this would come from an event bus or backend)
const ACTIVITY_LOGS_SEED = [
  {
    id: 1,
    user: "Deepak Joshi",
    employeeId: "EMP-001",
    action: "Updated Module Ownership",
    module: "Leave Management",
    timestamp: "2023-10-24 10:30 AM",
    status: "success",
  },
  {
    id: 2,
    user: "Vijay Patel",
    employeeId: "EMP-004",
    action: "Modified Route R-001",
    module: "Transport",
    timestamp: "2023-10-24 09:15 AM",
    status: "success",
  },
  {
    id: 3,
    user: "Ramesh Chand",
    employeeId: "EMP-011",
    action: "Closed Support Request",
    module: "Support Center",
    timestamp: "2023-10-23 04:45 PM",
    status: "success",
  },
  {
    id: 4,
    user: "Amit Verma",
    employeeId: "EMP-002",
    action: "Updated Access Profile",
    module: "System Administration",
    timestamp: "2023-10-23 11:20 AM",
    status: "success",
  },
];

const SystemAdministrationPage = () => {
  const [activeTab, setActiveTab] = useState("access_profiles");
  const [employees, setEmployees] = useState([]);
  const [filteredEmployees, setFilteredEmployees] = useState([]);
  const [ownershipSettings, setOwnershipSettings] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  // Fetch initial data
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        const empData = await employeeService.getEmployees();
        setEmployees(empData);
        setFilteredEmployees(empData);

        const ownershipData =
          await moduleOwnershipService.getModuleOwnershipSettings();
        setOwnershipSettings(ownershipData);
      } catch (error) {
        console.error("Failed to load admin data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  // Filter employees
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredEmployees(employees);
      return;
    }
    const lower = searchTerm.toLowerCase();
    const filtered = employees.filter(
      (emp) =>
        emp.employeeName.toLowerCase().includes(lower) ||
        emp.employeeId.toLowerCase().includes(lower) ||
        (emp.accessLevel && emp.accessLevel.toLowerCase().includes(lower)),
    );
    setFilteredEmployees(filtered);
  }, [searchTerm, employees]);

  // Handlers
  const handleUpdateAccessLevel = async (employeeId, newLevel) => {
    try {
      const updatedEmp = await employeeService.updateEmployee(employeeId, {
        accessLevel: newLevel,
      });
      setEmployees((prev) =>
        prev.map((e) => (e.employeeId === employeeId ? updatedEmp : e)),
      );
    } catch (error) {
      console.error("Failed to update access level:", error);
    }
  };

  const handleUpdateOwnership = async (moduleName, newApproverId) => {
    try {
      const updatedSettings =
        await moduleOwnershipService.updateModuleOwnershipSetting(moduleName, {
          approverEmployeeId: newApproverId,
        });
      setOwnershipSettings(updatedSettings);
    } catch (error) {
      console.error("Failed to update module ownership:", error);
    }
  };

  const getStatusBadge = (status) => {
    return status === "active" ? (
      <span className="px-2 py-1 rounded-md bg-emerald-50 text-emerald-700 text-[9px] font-black uppercase tracking-wider border border-emerald-200">
        Active
      </span>
    ) : (
      <span className="px-2 py-1 rounded-md bg-red-50 text-red-700 text-[9px] font-black uppercase tracking-wider border border-red-200">
        Inactive
      </span>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6 pb-12"
    >
      <AdminPageHeader
        title="System Administration"
        description="Manage employee access profiles, operational module ownership, and view audit logs."
        breadcrumbs={["Admin Portal", "System Administration"]}
      />

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          {
            label: "Total Employees",
            value: employees.length,
            icon: Users,
            color: "text-[#0077b6]",
          },
          {
            label: "Super Admins",
            value: employees.filter((e) => e.accessLevel === "Super Admin")
              .length,
            icon: Shield,
            color: "text-red-600",
          },
          {
            label: "Managed Modules",
            value: ownershipSettings.length,
            icon: Check,
            color: "text-[#03045e]",
          },
        ].map((stat, i) => (
          <MainCard key={i} className="p-4 border border-[#caf0f8]/60">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider">
                  {stat.label}
                </p>
                <p className="text-lg font-black text-[#03045e] mt-1">
                  {stat.value}
                </p>
              </div>
              <div className={`p-3 rounded-xl bg-[#caf0f8] ${stat.color}`}>
                <stat.icon size={20} />
              </div>
            </div>
          </MainCard>
        ))}
      </div>

      {/* Tab Navigation */}
      <MainCard className="p-2 border border-[#caf0f8]/60">
        <div className="flex flex-wrap items-center gap-1">
          {[
            {
              id: "access_profiles",
              label: "Employee Access Profiles",
              icon: Users,
            },
            {
              id: "module_ownership",
              label: "Module Ownership & Approvals",
              icon: Shield,
            },
            { id: "activity_logs", label: "Activity Logs", icon: FileText },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black transition-all ${
                activeTab === tab.id
                  ? "bg-[#03045e] text-white shadow-sm"
                  : "text-gray-500 hover:text-[#03045e] hover:bg-gray-50"
              }`}
            >
              <tab.icon size={14} />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </MainCard>

      {/* 1. Employee Access Profiles Tab */}
      {activeTab === "access_profiles" && (
        <MainCard className="border border-[#caf0f8]/60 overflow-hidden">
          <div className="p-4 border-b border-gray-100 bg-white">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h3 className="text-sm font-black text-[#03045e]">
                  Employee Access Profiles
                </h3>
                <p className="text-[10px] text-gray-500 mt-1">
                  Assign operational access levels to employees. This serves as
                  the single source of truth for administrative access.
                </p>
              </div>
              <div className="relative max-w-sm w-full">
                <Search
                  size={14}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                />
                <input
                  type="text"
                  placeholder="Search by name, ID, or access level..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 rounded-xl border border-gray-200 text-xs font-bold text-[#03045e] outline-none focus:border-[#0077b6] transition-colors"
                />
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px]">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="text-left py-3 px-4 text-[10px] font-black text-gray-400 uppercase tracking-wider">
                    Employee Details
                  </th>
                  <th className="text-left py-3 px-4 text-[10px] font-black text-gray-400 uppercase tracking-wider">
                    Designation
                  </th>
                  <th className="text-left py-3 px-4 text-[10px] font-black text-gray-400 uppercase tracking-wider">
                    Access Level
                  </th>
                  <th className="text-left py-3 px-4 text-[10px] font-black text-gray-400 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan="4" className="py-8 text-center text-xs font-bold text-gray-400">
                      Loading profiles...
                    </td>
                  </tr>
                ) : filteredEmployees.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="py-8 text-center text-xs font-bold text-gray-400">
                      No employees found.
                    </td>
                  </tr>
                ) : (
                  filteredEmployees.map((emp) => (
                    <tr
                      key={emp.employeeId}
                      className="border-b border-gray-50 hover:bg-[#caf0f8]/10 transition-colors"
                    >
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-[#03045e] text-white flex items-center justify-center text-xs font-black shrink-0">
                            {emp.employeeName.charAt(0)}
                          </div>
                          <div>
                            <p className="text-xs font-black text-[#03045e]">
                              {emp.employeeName}
                            </p>
                            <p className="text-[10px] font-bold text-gray-400">
                              {emp.employeeId}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-xs font-bold text-gray-600">
                        {emp.designation || "N/A"}
                      </td>
                      <td className="py-3 px-4">
                        <select
                          value={emp.accessLevel || "Standard Employee"}
                          onChange={(e) =>
                            handleUpdateAccessLevel(emp.employeeId, e.target.value)
                          }
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold outline-none cursor-pointer border transition-colors ${getAccessLevelBadgeColor(
                            emp.accessLevel || "Standard Employee",
                          )}`}
                        >
                          {ACCESS_LEVELS.map((level) => (
                            <option key={level} value={level}>
                              {level}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="py-3 px-4">{getStatusBadge(emp.status)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </MainCard>
      )}

      {/* 2. Module Ownership & Approvals Tab */}
      {activeTab === "module_ownership" && (
        <MainCard className="border border-[#caf0f8]/60 overflow-hidden">
          <div className="p-4 border-b border-gray-100 bg-white">
            <h3 className="text-sm font-black text-[#03045e]">
              Module Ownership & Approvals
            </h3>
            <p className="text-[10px] text-gray-500 mt-1">
              Configure which employee is the primary handler or approving
              authority for operational modules.
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[600px]">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="text-left py-3 px-4 text-[10px] font-black text-gray-400 uppercase tracking-wider">
                    Module Name
                  </th>
                  <th className="text-left py-3 px-4 text-[10px] font-black text-gray-400 uppercase tracking-wider w-1/2">
                    Primary Handler / Approving Authority
                  </th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan="2" className="py-8 text-center text-xs font-bold text-gray-400">
                      Loading ownership settings...
                    </td>
                  </tr>
                ) : ownershipSettings.length === 0 ? (
                  <tr>
                    <td colSpan="2" className="py-8 text-center text-xs font-bold text-gray-400">
                      No modules configured.
                    </td>
                  </tr>
                ) : (
                  ownershipSettings.map((setting, i) => (
                    <tr
                      key={i}
                      className="border-b border-gray-50 hover:bg-[#caf0f8]/10 transition-colors"
                    >
                      <td className="py-4 px-4 text-xs font-bold text-[#03045e]">
                        {setting.moduleName}
                      </td>
                      <td className="py-4 px-4">
                        <select
                          value={setting.approverEmployeeId || ""}
                          onChange={(e) =>
                            handleUpdateOwnership(
                              setting.moduleName,
                              e.target.value || null,
                            )
                          }
                          className="w-full max-w-md px-3 py-2 rounded-xl border border-gray-200 text-xs font-bold text-[#03045e] outline-none focus:border-[#0077b6] cursor-pointer"
                        >
                          <option value="">-- Unassigned (No Handler) --</option>
                          {employees.map((emp) => (
                            <option key={emp.employeeId} value={emp.employeeId}>
                              {emp.employeeName} - {emp.designation}
                            </option>
                          ))}
                        </select>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </MainCard>
      )}

      {/* 3. Activity Logs Tab */}
      {activeTab === "activity_logs" && (
        <MainCard className="border border-[#caf0f8]/60 overflow-hidden">
          <div className="p-4 border-b border-gray-100 bg-white">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-black text-[#03045e]">
                  Activity Logs
                </h3>
                <p className="text-[10px] text-gray-500 mt-1">
                  Chronological audit feed of administrative actions.
                </p>
              </div>
              <button className="flex items-center gap-2 px-4 py-2 rounded-xl border border-[#caf0f8] text-xs font-bold text-[#03045e] hover:border-[#0077b6] transition-colors bg-gray-50">
                <Filter size={14} />
                <span>Filter</span>
              </button>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px]">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="text-left py-3 px-4 text-[10px] font-black text-gray-400 uppercase tracking-wider">
                    Timestamp
                  </th>
                  <th className="text-left py-3 px-4 text-[10px] font-black text-gray-400 uppercase tracking-wider">
                    Employee
                  </th>
                  <th className="text-left py-3 px-4 text-[10px] font-black text-gray-400 uppercase tracking-wider">
                    Action
                  </th>
                  <th className="text-left py-3 px-4 text-[10px] font-black text-gray-400 uppercase tracking-wider">
                    Module
                  </th>
                  <th className="text-left py-3 px-4 text-[10px] font-black text-gray-400 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody>
                {ACTIVITY_LOGS_SEED.map((log) => (
                  <tr
                    key={log.id}
                    className="border-b border-gray-50 hover:bg-[#caf0f8]/10 transition-colors"
                  >
                    <td className="py-3 px-4 text-[10px] text-gray-400 font-mono whitespace-nowrap">
                      {log.timestamp}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex flex-col">
                        <span className="text-xs font-bold text-[#03045e]">
                          {log.user}
                        </span>
                        <span className="text-[9px] text-gray-400">
                          {log.employeeId}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-xs font-bold text-gray-600">
                      {log.action}
                    </td>
                    <td className="py-3 px-4 text-[10px] font-black text-[#0077b6] uppercase">
                      {log.module}
                    </td>
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[9px] font-black border border-emerald-200">
                        <CheckCircle size={10} />
                        {log.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </MainCard>
      )}
    </motion.div>
  );
};

export default SystemAdministrationPage;
