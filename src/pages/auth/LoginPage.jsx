import React, { useState, useEffect } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { ROLES } from "../../auth/roles";
import { 
  getLoginStudentPreviews, 
  getLoginParentPreviews, 
  getLoginTeacherPreviews 
} from "../../services/authService";
import MainCard from "../../components/MainCard";
import { motion, AnimatePresence } from "framer-motion";
import { GraduationCap, Users, User, ShieldCheck, Check } from "lucide-react";

const LoginOption = ({ role, icon: Icon, title, description, color, onClick, children, isOpen }) => (
  <div className="w-full space-y-2">
    <motion.button
      whileHover={{ y: -2, scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
      onClick={() => onClick(role)}
      className="w-full text-left group"
    >
      <MainCard className={`p-5 transition-all duration-300 ${isOpen ? 'border-[#00b4d8] ring-2 ring-[#00b4d8]/10' : 'group-hover:border-[#00b4d8]/30 group-hover:shadow-lg'}`}>
        <div className="flex items-center gap-5">
          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-colors ${color}`}>
            <Icon size={28} />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-black text-[#03045e] mb-0.5">{title}</h3>
            <p className="text-xs font-bold text-gray-400 leading-tight uppercase tracking-widest">{description}</p>
          </div>
          <div className="w-9 h-9 rounded-full bg-gray-50 flex items-center justify-center text-gray-300 group-hover:bg-[#00b4d8] group-hover:text-white transition-all">
            <ShieldCheck size={18} />
          </div>
        </div>
      </MainCard>
    </motion.button>
    {children}
  </div>
);

const COLOR_MAP = {
  blue: {
    selected: "bg-blue-600 text-white shadow-md",
    hover: "hover:bg-blue-100 text-[#03045e]",
    border: "border-blue-100",
    label: "text-blue-400"
  },
  emerald: {
    selected: "bg-emerald-600 text-white shadow-md",
    hover: "hover:bg-emerald-100 text-[#03045e]",
    border: "border-emerald-100",
    label: "text-emerald-400"
  },
  purple: {
    selected: "bg-purple-600 text-white shadow-md",
    hover: "hover:bg-purple-100 text-[#03045e]",
    border: "border-purple-100",
    label: "text-purple-400"
  }
};

const IdentityPicker = ({ items, onSelect, activeId, color }) => {
  const styles = COLOR_MAP[color] || COLOR_MAP.blue;
  
  return (
    <motion.div
      initial={{ height: 0, opacity: 0 }}
      animate={{ height: "auto", opacity: 1 }}
      exit={{ height: 0, opacity: 0 }}
      className="overflow-hidden"
    >
      <div className={`bg-white/50 backdrop-blur-sm rounded-2xl p-3 border ${styles.border} mt-2 grid grid-cols-1 gap-2`}>
        <p className={`text-[10px] font-black ${styles.label} uppercase tracking-widest px-2 mb-1`}>Select Identity</p>
        {items.map((item) => (
          <button
            key={item.id}
            onClick={() => onSelect(item.id)}
            className={`flex items-center justify-between p-3 rounded-xl text-sm font-bold transition-all ${
              activeId === item.id 
                ? styles.selected
                : styles.hover
            }`}
          >
            <div className="flex flex-col items-start">
              <span>{item.name}</span>
              {item.sub && <span className={`text-[10px] opacity-70 ${activeId === item.id ? 'text-white' : 'text-gray-400'}`}>{item.sub}</span>}
            </div>
            {activeId === item.id && <Check size={16} />}
          </button>
        ))}
      </div>
    </motion.div>
  );
};

const LoginPage = () => {
  const { login, isAuthenticated, role } = useAuth();
  const navigate = useNavigate();
  const [openSection, setOpenSection] = useState(null); // 'student', 'teacher', 'parent'
  const [selectedId, setSelectedId] = useState({ student: 'student', teacher: 'teacher', parent: 'parent' });

  if (isAuthenticated && role) {
    return <Navigate to={`/${role.toLowerCase()}/dashboard`} replace />;
  }
  const [identities, setIdentities] = useState({
    [ROLES.STUDENT]: [],
    [ROLES.TEACHER]: [],
    [ROLES.PARENT]: []
  });

  useEffect(() => {
    const loadIdentities = async () => {
      try {
        const [studentsList, parentsList, teachersList] = await Promise.all([
          getLoginStudentPreviews(),
          getLoginParentPreviews(),
          getLoginTeacherPreviews()
        ]);

        setIdentities({
          [ROLES.STUDENT]: studentsList,
          [ROLES.PARENT]: parentsList,
          [ROLES.TEACHER]: teachersList
        });

        // Set dynamic default selected IDs
        setSelectedId({
          student: studentsList[0]?.id || "student",
          parent: parentsList[0]?.id || "parent",
          teacher: teachersList[0]?.id || "teacher"
        });
      } catch (err) {
        console.error("Failed to load dynamic login identities:", err);
      }
    };

    loadIdentities();
  }, []);

  const toggleSection = (section) => {
    setOpenSection(openSection === section ? null : section);
  };

  const handleLogin = (role, username) => {
    const finalUsername = username || selectedId[role.toLowerCase()];
    login(role, finalUsername);
    navigate(`/${role.toLowerCase()}/dashboard`, { replace: true });
  };

  return (
    <div className="min-h-screen bg-[#caf0f8] flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-xl">
        <div className="text-center mb-10">
          <motion.div 
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-20 h-20 bg-[#03045e] rounded-[2rem] flex items-center justify-center text-white mx-auto mb-6 shadow-2xl shadow-[#03045e]/30"
          >
            <GraduationCap size={40} />
          </motion.div>
          <h1 className="text-4xl font-black text-[#03045e] mb-3 tracking-tight">EduDash ERP</h1>
          <p className="text-gray-500 font-bold text-lg">Select your portal to continue</p>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {/* Student Portal */}
          <LoginOption 
            role={ROLES.STUDENT}
            icon={User}
            title="Student Portal"
            description="Manage your learning & growth"
            color="bg-blue-50 text-blue-600"
            isOpen={openSection === 'student'}
            onClick={() => toggleSection('student')}
          >
            <AnimatePresence>
              {openSection === 'student' && (
                <IdentityPicker 
                  items={identities[ROLES.STUDENT]} 
                  color="blue"
                  activeId={selectedId.student}
                  onSelect={(id) => {
                    setSelectedId(prev => ({ ...prev, student: id }));
                    handleLogin(ROLES.STUDENT, id);
                  }}
                />
              )}
            </AnimatePresence>
          </LoginOption>

          {/* Parent Portal */}
          <LoginOption 
            role={ROLES.PARENT}
            icon={Users}
            title="Parent Portal"
            description="Track student performance"
            color="bg-emerald-50 text-emerald-600"
            isOpen={openSection === 'parent'}
            onClick={() => toggleSection('parent')}
          >
            <AnimatePresence>
              {openSection === 'parent' && (
                <IdentityPicker 
                  items={identities[ROLES.PARENT]} 
                  color="emerald"
                  activeId={selectedId.parent}
                  onSelect={(id) => {
                    setSelectedId(prev => ({ ...prev, parent: id }));
                    handleLogin(ROLES.PARENT, id);
                  }}
                />
              )}
            </AnimatePresence>
          </LoginOption>

          {/* Teacher Portal */}
          <LoginOption 
            role={ROLES.TEACHER}
            icon={User}
            title="Teacher Portal"
            description="Administer classes & marks"
            color="bg-purple-50 text-purple-600"
            isOpen={openSection === 'teacher'}
            onClick={() => toggleSection('teacher')}
          >
            <AnimatePresence>
              {openSection === 'teacher' && (
                <IdentityPicker 
                  items={identities[ROLES.TEACHER]} 
                  color="purple"
                  activeId={selectedId.teacher}
                  onSelect={(id) => {
                    setSelectedId(prev => ({ ...prev, teacher: id }));
                    handleLogin(ROLES.TEACHER, id);
                  }}
                />
              )}
            </AnimatePresence>
          </LoginOption>

          {/* Admin Portal */}
          <LoginOption 
            role={ROLES.ADMIN}
            icon={ShieldCheck}
            title="Admin Portal"
            description="System-wide administration"
            color="bg-rose-50 text-rose-600"
            onClick={() => handleLogin(ROLES.ADMIN, 'admin')}
          />
        </div>

        <div className="mt-10 pt-8 border-t border-blue-100">
          <div className="flex items-center justify-between">
            <p className="text-gray-400 text-xs font-bold uppercase tracking-widest">
              Relational Ecosystem v3.0
            </p>
            <div className="flex gap-2 text-[#03045e]">
               <Check size={14} className="text-green-500" />
               <span className="text-[10px] font-black uppercase tracking-widest">Enterprise Ready</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
