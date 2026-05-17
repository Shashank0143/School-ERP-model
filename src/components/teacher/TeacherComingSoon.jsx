import React from "react";
import MainCard from "../MainCard";
import { Hammer } from "lucide-react";

/**
 * TeacherComingSoon
 * 
 * Scalable placeholder for teacher modules in development.
 */
const TeacherComingSoon = ({ moduleName }) => {
  return (
    <MainCard className="p-12 flex flex-col items-center justify-center border-2 border-dashed border-[#caf0f8] bg-[#caf0f8]/10 text-center">
      <div className="w-16 h-16 rounded-3xl bg-[#caf0f8] flex items-center justify-center mb-6 shadow-sm">
        <Hammer size={32} className="text-[#03045e]" />
      </div>
      <h3 className="text-xl font-black text-[#03045e] mb-2">
        {moduleName} Module Under Construction
      </h3>
      <p className="text-gray-500 font-bold max-w-sm">
        This enterprise-grade workspace is being prepared for operation. 
        Soon you will be able to manage data and workflows directly from here.
      </p>
      
      <div className="mt-8 flex gap-2">
        <div className="w-2 h-2 rounded-full bg-[#00b4d8] animate-bounce" style={{ animationDelay: '0s' }} />
        <div className="w-2 h-2 rounded-full bg-[#00b4d8] animate-bounce" style={{ animationDelay: '0.2s' }} />
        <div className="w-2 h-2 rounded-full bg-[#00b4d8] animate-bounce" style={{ animationDelay: '0.4s' }} />
      </div>
    </MainCard>
  );
};

export default React.memo(TeacherComingSoon);
