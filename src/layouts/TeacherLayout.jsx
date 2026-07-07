import React from "react";
import BaseLayout from "./BaseLayout";
import { ROLES } from "../auth/roles";
import ProtectedRoute from "../routes/ProtectedRoute";
import MainCard from "../components/MainCard";
import { Monitor } from "lucide-react";
import { useAuth } from "../context/AuthContext";

const PortalInDevelopment = ({ title }) => (
  <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
    <MainCard className="p-12 flex flex-col items-center max-w-md">
      <div className="w-20 h-20 bg-[#caf0f8] rounded-[2rem] flex items-center justify-center text-[#0077b6] mb-8">
        <Monitor size={40} />
      </div>
      <h2 className="text-2xl font-black text-[#03045e] mb-4">{title}</h2>
      <p className="text-gray-500 font-bold mb-8 leading-relaxed">
        The {title} is currently under construction. Future updates will include attendance management, marks upload, and staff administration.
      </p>
      <div className="flex gap-2">
        <div className="w-2 h-2 rounded-full bg-[#00b4d8] animate-bounce" style={{ animationDelay: "0s" }} />
        <div className="w-2 h-2 rounded-full bg-[#00b4d8] animate-bounce" style={{ animationDelay: "0.2s" }} />
        <div className="w-2 h-2 rounded-full bg-[#00b4d8] animate-bounce" style={{ animationDelay: "0.4s" }} />
      </div>
    </MainCard>
  </div>
);

const TeacherLayout = ({ children, navItems, ...props }) => {
  const { user } = useAuth();

  const filteredNavItems = React.useMemo(() => {
    if (!user) return navItems;
    return navItems.filter(item => {
      if (item.id === "teacher_exit_tracking") {
        return user.isClassTeacher === true;
      }
      return true;
    });
  }, [navItems, user]);

  return (
    <ProtectedRoute allowedRoles={[ROLES.TEACHER]}>
      <BaseLayout navItems={filteredNavItems} {...props}>
        {children}
      </BaseLayout>
    </ProtectedRoute>
  );
};

export default TeacherLayout;
