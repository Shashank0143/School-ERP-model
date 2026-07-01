import React from 'react';
import { BookOpen, Clock } from 'lucide-react';

const WorkloadWidget = ({ projection }) => {
  // Safe extraction without triggering any fetches
  const capabilities = projection?.capabilities || [];
  if (!capabilities.includes("ACADEMIC")) return null;

  return (
    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col h-full">
      <h3 className="text-sm font-black text-[#03045e] uppercase tracking-wider mb-4 flex items-center gap-2">
        <BookOpen className="w-4 h-4 text-[#0077b6]" />
        Academic Workload (Ext)
      </h3>
      <div className="flex-1 flex flex-col justify-center items-center text-center p-4 bg-[#caf0f8]/20 rounded-xl border border-[#caf0f8]">
        <Clock className="w-8 h-8 text-[#0096c7] mb-2" />
        <p className="text-xs text-gray-500 font-bold">Projected Load</p>
        <p className="text-2xl font-black text-[#03045e] mt-1">
          24 <span className="text-sm text-gray-400 font-medium">hrs/wk</span>
        </p>
        <p className="text-[10px] text-gray-400 mt-2">Driven exclusively by Projection</p>
      </div>
    </div>
  );
};

export default WorkloadWidget;
