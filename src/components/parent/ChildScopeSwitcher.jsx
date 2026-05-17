import React from "react";
import { Users } from "lucide-react";
import { useStudent } from "../../context/StudentContext";
import { useAuth } from "../../context/AuthContext";
import { useLanguage } from "../../context/LanguageContext";
import { motion } from "framer-motion";

/**
 * ChildScopeSwitcher
 * 
 * High-density, chip-based switcher for Parent Portal.
 * Implements Scoped Child Context filtering without global identity switching.
 */
const ChildScopeSwitcher = ({ className = "" }) => {
  const { isParent } = useAuth();
  const { activeStudentId, childrenList, setActiveStudentId } = useStudent();
  const { t } = useLanguage();

  if (!isParent || !childrenList || childrenList.length <= 1) return null;

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className="flex items-center gap-2 px-3 py-1.5 bg-[#03045e] rounded-xl text-white">
        <Users size={14} />
        <span className="text-[9px] font-black uppercase tracking-widest whitespace-nowrap">{t("parent.selectChild")}:</span>
      </div>
      
      <div className="flex items-center gap-1.5">
        {childrenList.map((child) => {
          const isActive = activeStudentId === child.id;
          return (
            <motion.button
              key={child.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setActiveStudentId(child.id)}
              className={`
                px-3.5 py-1.5 rounded-xl text-[10px] font-black transition-all border
                ${isActive 
                  ? "bg-white border-[#03045e] text-[#03045e] shadow-sm" 
                  : "bg-gray-50 border-gray-100 text-gray-400 hover:bg-white hover:text-[#0077b6] hover:border-[#caf0f8]"
                }
              `}
            >
              {child.name}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
};

export default ChildScopeSwitcher;
