import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import MainCard from "../../components/MainCard";
import { ShieldCheck, User, Mail, Phone, Calendar, Key, AlertTriangle, Contact, MapPin, Smartphone, GraduationCap, Briefcase } from "lucide-react";
import { IDCard } from "../../components/common/id-card";
import IDCardPreviewModal from "../../components/common/id-card/IDCardPreviewModal";
import { useAuth } from "../../context/AuthContext";
import employeeService from "../../services/employeeService";

const AdminProfilePage = () => {
  const { user } = useAuth();
  const [adminData, setAdminData] = useState(null);
  const [idCardModalOpen, setIdCardModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        if (user?.employeeId) {
          const data = await employeeService.getEmployee(user.employeeId);
          setAdminData(data);
        }
      } catch (error) {
        console.error("Failed to load admin profile:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchAdminData();
  }, [user]);

  const idCardData = React.useMemo(() => {
    if (!adminData) return {};
    return {
      name: adminData.name || adminData.employeeName || user?.name || "System Administrator",
      id: adminData.employeeId || user?.employeeId || "ADM-001",
      designation: adminData.designation || "Administrator",
      department: adminData.department || "Administration",
      role: "Administrator",
      status: "Active",
      phone: adminData.phoneNumber || adminData.phone || "N/A",
      email: adminData.email || "N/A",
      schoolName: "EduDash Academy"
    };
  }, [adminData, user]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-10 h-10 border-4 border-[#03045e] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6 pb-12"
    >
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-[#03045e] tracking-tight">Administrator Profile</h1>
          <p className="text-gray-500 font-semibold mt-1">Manage institutional administrative credentials, security settings, and access tokens.</p>
        </div>
      </header>

      {/* Roster Strengths */}
      <div>
        
        {/* Profile Card & Info */}
        <div className="space-y-6">
          <MainCard className="p-6">
            <h2 className="text-lg font-black text-[#03045e] border-b border-[#caf0f8] pb-4 mb-6">
              Administrative Credentials
            </h2>
            
            <div className="flex flex-col md:flex-row items-center gap-6 mb-8 bg-[#caf0f8]/20 p-6 rounded-3xl border border-[#caf0f8]/50">
              <div className="w-24 h-24 rounded-[2rem] bg-gradient-to-br from-[#03045e] to-[#0077b6] flex items-center justify-center text-white text-3xl font-black shadow-md border-4 border-white">
                {user?.avatarInitials || "AD"}
              </div>
              <div className="text-center md:text-left">
                <h3 className="text-xl font-black text-[#03045e]">{adminData?.name || adminData?.employeeName || user?.name || "System Administrator"}</h3>
                <p className="text-xs font-bold text-[#0077b6] mt-1">{adminData?.designation || "Administrator"}</p>
                <div className="flex flex-wrap justify-center md:justify-start gap-2 mt-3">
                  <span className="px-2.5 py-0.5 rounded-full text-[9px] font-black text-emerald-600 bg-emerald-50 border border-emerald-100 uppercase tracking-wider">
                    Full Access Token
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full text-[9px] font-black text-blue-600 bg-blue-50 border border-blue-100 uppercase tracking-wider">
                    Security Mapped
                  </span>
                  <button 
                    onClick={() => setIdCardModalOpen(true)}
                    className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[9px] font-black text-indigo-600 bg-indigo-50 border border-indigo-200 uppercase tracking-wider hover:bg-indigo-100 transition-colors"
                  >
                    <Contact size={10} /> View ID Card
                  </button>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                { label: "Primary Administrator Name", value: adminData?.name || adminData?.employeeName || user?.name || "School Principal Office", icon: User },
                { label: "Administrative Email Address", value: adminData?.email || "admin@edu.dash", icon: Mail },
                { label: "Primary Direct Line", value: adminData?.phoneNumber || adminData?.phone || "N/A", icon: Smartphone },
                { label: "Emergency Contact", value: adminData?.emergencyContact || "N/A", icon: Phone },
                { label: "Gender", value: adminData?.gender || "N/A", icon: User },
                { label: "Date of Birth", value: adminData?.dob || "N/A", icon: Calendar },
                { label: "Highest Qualification", value: adminData?.qualification || "N/A", icon: GraduationCap },
                { label: "Professional Experience", value: adminData?.experience || "N/A", icon: Briefcase },
                { label: "Term Mapped Since", value: adminData?.joiningDate || "June 2018", icon: Calendar },
                { label: "Correspondence Address", value: adminData?.address || "N/A", icon: MapPin, fullWidth: true },
              ].map((info, idx) => {
                const Icon = info.icon;
                return (
                  <div key={idx} className={`flex gap-4 items-start p-3 bg-gray-50/60 rounded-2xl border border-gray-100/80 ${info.fullWidth ? 'md:col-span-2 lg:col-span-3' : ''}`}>
                    <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-[#0077b6] shadow-sm border border-[#caf0f8] shrink-0">
                      <Icon size={18} />
                    </div>
                    <div>
                      <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">{info.label}</p>
                      <p className="text-xs font-black text-gray-700 mt-1 break-words">{info.value}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </MainCard>
        </div>

      </div>

      {/* ID Card Modal */}
      <IDCardPreviewModal 
        isOpen={idCardModalOpen} 
        onClose={() => setIdCardModalOpen(false)}
      >
        <IDCard variant="staff" data={idCardData} />
      </IDCardPreviewModal>
    </motion.div>
  );
};

export default AdminProfilePage;
