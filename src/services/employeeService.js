import localProvider from "../data/providers/localProvider";
import { normalizeGender } from "../utils/genderUtils";

const employeeService = {
  getEmployees: () => localProvider.getEmployees(),
  createEmployee: (data) => {
    if (data.gender) data.gender = normalizeGender(data.gender);
    return localProvider.createEmployee(data);
  },
  updateEmployee: (id, data) => {
    if (data.gender !== undefined) data.gender = normalizeGender(data.gender);
    return localProvider.updateEmployee(id, data);
  },
  deleteEmployee: (id) => localProvider.deleteEmployee(id),
};

export default employeeService;
