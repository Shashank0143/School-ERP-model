import localProvider from "../data/providers/localProvider";

const moduleOwnershipService = {
  getModuleOwnershipSettings: () => localProvider.getApprovalSettings(),
  updateModuleOwnershipSetting: (moduleName, data) => localProvider.updateApprovalSetting(moduleName, data),
};

export default moduleOwnershipService;
