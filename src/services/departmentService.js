import localProvider from "../data/providers/localProvider";

const departmentService = {
  getDepartments: () => localProvider.getDepartments(),
  createDepartment: (data) => localProvider.createDepartment(data),
  updateDepartment: (id, data) => localProvider.updateDepartment(id, data),
  deleteDepartment: (id) => localProvider.deleteDepartment(id),
};

export default departmentService;
