import React from "react";
import BaseLayout from "./BaseLayout";
import { ROLES } from "../auth/roles";
import ProtectedRoute from "../routes/ProtectedRoute";

const ParentLayout = ({ children, ...props }) => (
  <ProtectedRoute allowedRoles={[ROLES.PARENT]}>
    <BaseLayout {...props}>
      {children}
    </BaseLayout>
  </ProtectedRoute>
);

export default ParentLayout;
