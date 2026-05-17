import React from "react";
import MainCard from "../MainCard";
import { ClipboardList, AlertCircle, CheckCircle2, ChevronRight, Activity } from "lucide-react";
import { motion } from "framer-motion";

const ParentAssignmentInsight = ({ timeline, onNavigate }) => {
  const overdueCount = timeline?.overdue?.length || 0;
  const upcomingCount = timeline?.upcoming?.length || 0;
  const pendingCount = overdueCount + upcomingCount;

  return (
    <MainCard className="p-6 overflow-hidden relative border-l-4 border-l-[#03045e]">
      {/* Background Decorative Element */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-bl-[5rem] -mr-8 -mt-8 pointer-events-none" />

      <div className="flex flex-col lg:flex-row gap-8 items-center relative z-10">
        <div className="flex flex-wrap items-center gap-8 flex-1">
          {/* Metric 1: Assignments */}
          <div className="flex items-center gap-4 min-w-[160px]">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600 shadow-sm">
              <ClipboardList size={24} />
            </div>
            <div>
              <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Assignments</p>
              <p className="text-xl font-black text-[#03045e]">{pendingCount} Pending</p>
            </div>
          </div>

          {/* Metric 2: Status */}
          <div className="flex items-center gap-4 min-w-[160px]">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm ${overdueCount > 0 ? "bg-rose-50 text-rose-600" : "bg-emerald-50 text-emerald-600"}`}>
              {overdueCount > 0 ? <AlertCircle size={24} /> : <CheckCircle2 size={24} />}
            </div>
            <div>
              <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Work Status</p>
              <p className={`text-xl font-black ${overdueCount > 0 ? "text-rose-600" : "text-emerald-600"}`}>
                {overdueCount > 0 ? `${overdueCount} Overdue` : "All on Track"}
              </p>
            </div>
          </div>

          {/* Metric 3: Completion Insight (Simulated) */}
          <div className="hidden xl:flex items-center gap-4 min-w-[160px]">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-600 shadow-sm">
              <Activity size={24} />
            </div>
            <div>
              <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Recent Activity</p>
              <p className="text-xl font-black text-[#03045e]">85% Done</p>
            </div>
          </div>
        </div>

        {/* Action Call */}
        <div className="w-full lg:w-auto flex justify-end">
          <motion.button 
            whileHover={{ x: 4 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onNavigate("assignments")}
            className="w-full lg:w-auto flex items-center justify-center gap-2 text-[10px] font-black text-[#03045e] uppercase tracking-widest bg-gray-100 px-6 py-3 rounded-2xl hover:bg-[#03045e] hover:text-white transition-all shadow-sm"
          >
            Review Assignments
            <ChevronRight size={14} />
          </motion.button>
        </div>
      </div>
    </MainCard>
  );
};

export default ParentAssignmentInsight;
