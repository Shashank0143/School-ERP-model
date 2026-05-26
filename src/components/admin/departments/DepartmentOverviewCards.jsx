import React from "react";
import PropTypes from "prop-types";
import AdminStatCard from "../AdminStatCard";
import { Building2, Briefcase, Shield, Layers } from "lucide-react";

const DepartmentOverviewCards = ({ departments }) => {
  const activeDepartments = departments.filter(
    (d) => d.status === "active",
  ).length;
  const assignedHeads = departments.filter((d) => d.head).length;
  const totalRoles = departments.reduce(
    (acc, dept) => acc + dept.roles.length,
    0,
  );
  const pendingReviews = departments.filter(
    (d) => d.status === "under_review",
  ).length;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      <AdminStatCard
        title="Total Departments"
        value={departments.length.toString()}
        badgeText="Institutional"
        badgeType="info"
        icon={Building2}
      />
      <AdminStatCard
        title="Active Departments"
        value={activeDepartments.toString()}
        badgeText="Operational"
        badgeType="success"
        icon={Building2}
        color="#0096c7"
        bg="#ade8f4"
      />
      <AdminStatCard
        title="Active Department Heads"
        value={`${assignedHeads} / ${departments.length}`}
        badgeText="Leadership"
        badgeType="success"
        icon={Briefcase}
        color="#03045e"
        bg="#e0f2fe"
      />
      <AdminStatCard
        title="Role Structures"
        value={totalRoles.toString()}
        badgeText="Permission Groups"
        badgeType="info"
        icon={Layers}
        color="#48cae4"
        bg="#90e0ef"
      />
      {pendingReviews > 0 && (
        <AdminStatCard
          title="Pending Reviews"
          value={pendingReviews.toString()}
          badgeText="Action Required"
          badgeType="warning"
          icon={Shield}
          color="#f59e0b"
          bg="#fef3c7"
        />
      )}
    </div>
  );
};

DepartmentOverviewCards.propTypes = {
  departments: PropTypes.array.isRequired,
};

export default React.memo(DepartmentOverviewCards);
