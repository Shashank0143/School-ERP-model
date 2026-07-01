import React, { lazy } from 'react';
import StaffExtensionRegistry from '../../shared/registries/StaffExtensionRegistry';
import { BookOpen } from 'lucide-react';

// Register the Academic Extension
StaffExtensionRegistry.registerExtension({
  id: "academic",
  order: 20,
  route: "academic",
  component: lazy(() => import("./AcademicExtension")),
  visibilityRules: { capabilities: ["ACADEMIC"] }
});

StaffExtensionRegistry.registerSidebar("academic", {
  title: "Academic & Teaching",
  icon: BookOpen,
  route: "academic",
  order: 20,
  visibilityRules: { capabilities: ["ACADEMIC"] }
});

StaffExtensionRegistry.registerWidget("academic", {
  id: "academic-workload",
  component: lazy(() => import("./widgets/WorkloadWidget")),
  order: 10,
  visibilityRules: { capabilities: ["ACADEMIC"] }
});
