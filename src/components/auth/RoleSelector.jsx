import React from 'react';
import { GraduationCap, Users, Briefcase, ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';

const RoleSelector = ({ selectedRole, onSelectRole }) => {
  const roles = [
    { id: 'STUDENT', label: 'Student', icon: GraduationCap, color: '#03045e' },
    { id: 'PARENT', label: 'Parent', icon: Users, color: '#00b4d8' },
    { id: 'TEACHER', label: 'Teacher', icon: Briefcase, color: '#0077b6' },
    { id: 'ADMIN', label: 'Admin', icon: ShieldCheck, color: '#7209b7' }
  ];

  return (
    <div className="w-full space-y-3 mb-6">
      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">
        Select Institutional Role
      </label>
      <div className="grid grid-cols-1 md:grid-cols-2 sm:grid-cols-4 gap-2.5 p-1.5 bg-gray-50 rounded-2xl border border-gray-150 relative">
        {roles.map((r) => {
          const isActive = selectedRole === r.id;
          const Icon = r.icon;
          
          return (
            <button
              key={r.id}
              type="button"
              onClick={() => onSelectRole(r.id)}
              className={`relative py-3.5 px-3 rounded-xl flex flex-col sm:flex-row items-center justify-center gap-2 transition-all duration-300 outline-none select-none z-10 ${
                isActive 
                  ? 'text-white shadow-md font-bold' 
                  : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100/50 font-semibold'
              }`}
            >
              {isActive && (
                <motion.div
                  layoutId="activeRoleBg"
                  className="absolute inset-0 rounded-xl z-[-1]"
                  style={{ backgroundColor: r.color }}
                  transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                />
              )}
              <Icon size={16} className="flex-shrink-0" />
              <span className="text-[11px] uppercase tracking-wider">{r.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default RoleSelector;
