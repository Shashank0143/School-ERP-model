import React from "react";
import MainCard from "../../MainCard";
import { Briefcase, BookOpen, Clock } from "lucide-react";

/**
 * WorkloadCard
 * 
 * Reusable panel summarizing teacher weekly schedules, classes allocated, and hours metrics.
 */
const WorkloadCard = ({ 
  teacherName, 
  classesCount = 0, 
  subjectsList = [], 
  weeklyHours = 18 
}) => {
  // Max standard weekly workload is 24 hours in Indian CBSE schools
  const percentageLoad = Math.min((weeklyHours / 24) * 100, 100);

  return (
    <MainCard className="p-5 border border-[#caf0f8]/50 shadow-sm bg-white hover:shadow-md transition-shadow">
      <div>
        <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest">PORTFOLIO WORKLOAD</h4>
        <h3 className="text-xs font-black text-[#03045e] mt-1 tracking-tight truncate">
          {teacherName}
        </h3>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 my-4 border-y border-[#caf0f8]/30 py-3 text-center">
        <div className="space-y-0.5">
          <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest flex items-center justify-center gap-0.5">
            <Briefcase size={8} /> Classes
          </span>
          <span className="text-xs font-black text-gray-800">{classesCount}</span>
        </div>
        <div className="space-y-0.5 border-x border-[#caf0f8]/30">
          <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest flex items-center justify-center gap-0.5">
            <BookOpen size={8} /> Subjects
          </span>
          <span className="text-xs font-black text-gray-800">{subjectsList.length}</span>
        </div>
        <div className="space-y-0.5">
          <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest flex items-center justify-center gap-0.5">
            <Clock size={8} /> Load Hours
          </span>
          <span className="text-xs font-black text-[#0077b6]">{weeklyHours}h/wk</span>
        </div>
      </div>

      {/* Progress Bar of Weekly Load Capacity */}
      <div className="space-y-1">
        <div className="flex justify-between items-center text-[9px] font-bold text-gray-400">
          <span>Weekly load balancing rate</span>
          <span className={percentageLoad >= 90 ? "text-amber-600 font-black" : "text-gray-500"}>
            {percentageLoad.toFixed(0)}%
          </span>
        </div>
        <div className="w-full h-1.5 rounded-full bg-gray-100 overflow-hidden">
          <div 
            className={`h-full rounded-full transition-all duration-500 ${
              percentageLoad >= 90 ? "bg-amber-400" : "bg-[#00b4d8]"
            }`}
            style={{ width: `${percentageLoad}%` }}
          />
        </div>
      </div>
    </MainCard>
  );
};

export default React.memo(WorkloadCard);
