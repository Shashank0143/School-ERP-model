import { getDataProvider } from "../data/providers/providerFactory";
import { normalizeGender } from "../utils/genderUtils";
import authUserService from "./authUserService";

const employeeService = {
  getEmployees: () => getDataProvider().getEmployees(),

  getEmployee: async (id) => {
    const provider = getDataProvider();
    const employees = await provider.getEmployees();
    let emp = employees.find(e => e.employeeId === id || e.id === id);
    if (!emp) {
      const teachers = await provider.getTeachers();
      emp = teachers.find(t => t.teacherId === id || t.id === id);
    }
    return emp;
  },

  createEmployee: async (data) => {
    if (data.gender) data.gender = normalizeGender(data.gender);

    const { authUsername, authPassword, authStatus, systemAccess, portalAccess, ...employeeData } = data;

    // 1. Create the employee
    const newEmployee = await getDataProvider().createEmployee({ ...employeeData, systemAccess, portalAccess });

    return newEmployee;
  },

  updateEmployee: async (id, data) => {
    if (data.gender !== undefined) data.gender = normalizeGender(data.gender);

    const { authUsername, authPassword, authStatus, systemAccess, portalAccess, ...employeeData } = data;
    return await getDataProvider().updateEmployee(id, { ...employeeData, systemAccess, portalAccess });
  },

  deleteEmployee: async (id) => {
    const employee = await getDataProvider().getEmployees().then(emps => emps.find(e => e.employeeId === id || e.id === id));
    if (employee && employee.linkedAuthUserId) {
      // Soft-delete the admin user to preserve audit history and traces
      await authUserService.updateAdminUser(employee.linkedAuthUserId, { status: "INACTIVE" });
    }
    return getDataProvider().deleteEmployee(id);
  },

  // === OPERATIONAL PROFILES ===
  getOperationalProfiles: async () => {
    return await getDataProvider().getOperationalProfiles();
  },

  togglePortalAccess: async (employeeId, enabled) => {
    const provider = getDataProvider();
    const employee = await employeeService.getEmployee(employeeId);
    if (!employee) throw new Error("Employee not found");

    let result = { employee: null, credentials: null };

    if (enabled) {
      if (employee.linkedAuthUserId) {
        await authUserService.updateAdminUser(employee.linkedAuthUserId, { status: "ACTIVE" });
        result.employee = await employeeService.updateEmployee(employeeId, { portalAccess: true });
      } else {
        const { default: identityService } = await import("./identityProvisioningService");
        const username = await identityService.generateUsername(employee);
        const tempPassword = identityService.generateTemporaryPassword();
        
        const authUserPayload = {
          username: username,
          password: tempPassword,
          role: "ADMIN",
          status: "ACTIVE",
          employeeId: employee.employeeId,
          isSuperAdmin: false,
          manualOverrides: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          lastLogin: null
        };
        const authUser = await provider.createAuthUser(authUserPayload);
        result.employee = await employeeService.updateEmployee(employeeId, { 
          portalAccess: true, 
          linkedAuthUserId: authUser.id,
          identityStatus: "PROVISIONED"
        });
        result.credentials = { username, password: tempPassword };
      }
    } else {
      if (employee.linkedAuthUserId) {
        await authUserService.updateAdminUser(employee.linkedAuthUserId, { status: "INACTIVE" });
      }
      result.employee = await employeeService.updateEmployee(employeeId, { portalAccess: false });
    }
    return result;
  },

  getOperationalProfile: async (employeeId) => {
    return await getDataProvider().getOperationalProfileByEmployeeId(employeeId);
  },

  createOperationalProfile: async (data) => {
    return await getDataProvider().createOperationalProfile(data);
  },

  updateOperationalProfile: async (id, data) => {
    return await getDataProvider().updateOperationalProfile(id, data);
  },
};

export const getDepartmentCapacityMetrics = async () => {
  const provider = getDataProvider();
  const departments = await provider.getDepartments();
  const employees = await provider.getEmployees();

  return departments.map(dept => {
    const requiredStaff = dept.requiredStaff || 0;
    const currentStaff = employees.filter(emp => emp.departmentId === dept.departmentId).length;
    const vacantPositions = Math.max(0, requiredStaff - currentStaff);
    const occupancyPercent = requiredStaff > 0 ? Math.round((currentStaff / requiredStaff) * 100) : 100;

    return {
      departmentId: dept.departmentId,
      departmentName: dept.departmentName,
      requiredStaff,
      currentStaff,
      vacantPositions,
      occupancyPercent
    };
  });
};

export default employeeService;
