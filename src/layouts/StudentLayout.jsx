import React from "react";
import BaseLayout from "./BaseLayout";
import { ROLES } from "../auth/roles";
import ProtectedRoute from "../routes/ProtectedRoute";

const StudentLayout = ({ children, ...props }) => (
  <ProtectedRoute allowedRoles={[ROLES.STUDENT]}>
    <BaseLayout {...props}>
      {children}
    </BaseLayout>
  </ProtectedRoute>
);

export default StudentLayout;
