import React from "react";
import AnalyticsCard from "./AnalyticsCard";
import TrendChart from "./TrendChart";

/**
 * AttendanceTrendCard
 * 
 * High-visibility analytics block plotting student attendance curves.
 */
const AttendanceTrendCard = ({ 
  points = [92, 94, 91, 95, 96, 92, 94], 
  labels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
  avgRate = "93.4%",
  actionsSlot = null 
}) => {
  return (
    <AnalyticsCard 
      title="Student Roster Attendance Trend"
      subtitle="Weekly calendar check curves plotting present rates."
      actionsSlot={actionsSlot}
    >
      <div className="space-y-4">
        <TrendChart points={points} labels={labels} />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-[#caf0f8]/30 pt-3">
          <div className="p-3 bg-gray-50 rounded-2xl">
            <span className="block text-[8px] font-black text-gray-400 uppercase tracking-widest">
              AVERAGE COMPLIANCE RATE
            </span>
            <span className="text-sm font-black text-emerald-600">
              {avgRate}
            </span>
          </div>
          <div className="p-3 bg-[#caf0f8]/20 rounded-2xl">
            <span className="block text-[8px] font-black text-gray-400 uppercase tracking-widest">
              ROSTER AUDIT STATUS
            </span>
            <span className="text-sm font-black text-[#03045e]">
              Optimal Health
            </span>
          </div>
        </div>
      </div>
    </AnalyticsCard>
  );
};

export default React.memo(AttendanceTrendCard);
