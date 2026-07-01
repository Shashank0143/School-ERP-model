import React from 'react';
import { Building2 } from 'lucide-react';

const IDCardHeader = ({ schoolName, schoolLogo, title }) => {
  return (
    <div className="bg-[#03045e] text-white p-3 flex flex-col items-center justify-center rounded-t-xl relative overflow-hidden">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-transparent"></div>
      
      <div className="relative z-10 flex items-center gap-2 mb-1">
        {schoolLogo ? (
          <img src={schoolLogo} alt="School Logo" className="w-8 h-8 object-contain" />
        ) : (
          <Building2 size={24} className="text-white opacity-90" />
        )}
        <h2 className="font-bold text-sm tracking-wide uppercase text-center leading-tight">
          {schoolName || 'EduDash Academy'}
        </h2>
      </div>
      
      <div className="relative z-10 bg-white/20 px-3 py-0.5 rounded-full text-[10px] font-medium tracking-widest uppercase mt-1 backdrop-blur-sm shadow-sm">
        {title || 'Identity Card'}
      </div>
    </div>
  );
};

export default IDCardHeader;
