import React from "react";
import AnalyticsCard from "./AnalyticsCard";

/**
 * AcademicSummaryCard
 * 
 * Reusable panel outlining school-wide exam completion percentages and pass rates.
 */
const AcademicSummaryCard = ({ 
  title = "Academic Health Indicator", 
  passRate = "98%", 
  examCount = 4, 
  toppersCount = 5,
  classScores = [] 
}) => {
  return (
    <AnalyticsCard 
      title={title}
      subtitle="Evaluates exam cycles averages and section performance grids."
    >
      <div className="space-y-4">
        {/* Metric circle benchmarks */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 text-center border-b border-[#caf0f8]/30 pb-3.5">
          <div className="space-y-0.5">
            <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest">
              Pass Rate
            </span>
            <span className="block text-sm font-black text-emerald-600">
              {passRate}
            </span>
          </div>
          <div className="space-y-0.5 border-x border-[#caf0f8]/30">
            <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest">
              Exam Cycles
            </span>
            <span className="block text-sm font-black text-[#03045e]">
              {examCount} cycles
            </span>
          </div>
          <div className="space-y-0.5">
            <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest">
              A+ Toppers
            </span>
            <span className="block text-sm font-black text-[#0077b6]">
              {toppersCount} students
            </span>
          </div>
        </div>

        {/* Section ranks table preview */}
        <div className="space-y-2">
          <h4 className="text-[9px] font-black text-[#03045e] uppercase tracking-widest">
            Class Section Performance Benchmark
          </h4>
          <div className="divide-y divide-[#caf0f8]/30">
            {classScores.slice(0, 3).map((cs, idx) => (
              <div key={idx} className="flex justify-between items-center py-2 text-xs font-bold text-gray-700">
                <span className="text-gray-500 font-semibold">{cs.name}</span>
                <div className="flex items-center gap-2">
                  <span className="text-gray-400 text-[10px] font-medium">Avg Grade:</span>
                  <span className="text-[#0077b6] font-black">{cs.averageGrade}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AnalyticsCard>
  );
};

export default React.memo(AcademicSummaryCard);
