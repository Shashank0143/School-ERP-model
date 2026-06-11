import localProvider from "../data/providers/localProvider";

const employeeService = {
  getEmployees: () => localProvider.getEmployees(),
  createEmployee: (data) => localProvider.createEmployee(data),
  updateEmployee: (id, data) => localProvider.updateEmployee(id, data),
  deleteEmployee: (id) => localProvider.deleteEmployee(id),
};

export default employeeService;
