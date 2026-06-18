import React from "react";
import MainCard from "../../MainCard";
import { Users, BookOpen, Star } from "lucide-react";

/**
 * ClubOverviewCard
 * 
 * Reusable panel presenting school activity clubs, categories, and student rosters count.
 */
const ClubOverviewCard = ({ 
  name, 
  category = "Co-Curricular", 
  coordinator, 
  membersCount = 0, 
  nextActivity,
  onDetails 
}) => {
  return (
    <MainCard className="p-5 hover:shadow-md transition-shadow bg-white border border-[#caf0f8]/55 shadow-sm relative flex flex-col justify-between">
      <div className="absolute top-0 right-0 p-3">
        <span className="inline-block px-2 py-0.5 rounded-full text-[8px] font-black text-[#0077b6] bg-[#caf0f8]/40 border border-[#caf0f8] uppercase tracking-wider">
          {category}
        </span>
      </div>

      <div>
        <h4 className="text-xs font-black text-[#03045e] uppercase tracking-wider">Activity Club</h4>
        <h3 className="text-sm font-black text-gray-800 tracking-tight mt-1 truncate w-full flex-1 min-w-0 md:max-w-[150px]">
          {name}
        </h3>
        
        <div className="mt-4 space-y-2 text-xs font-semibold text-gray-500">
          <p>Coordinator: <strong className="text-[#03045e] font-black">{coordinator}</strong></p>
          {nextActivity && (
            <p className="text-[10px] text-amber-600 font-bold bg-amber-50 p-1.5 rounded-lg border border-amber-100/40 truncate">
              🎯 Next: {nextActivity}
            </p>
          )}
        </div>
      </div>

      <div className="mt-5 border-t border-[#caf0f8]/50 pt-3 flex items-center justify-between text-[10px] font-black text-[#03045e]">
        <span className="flex items-center gap-1">
          <Users size={12} className="text-[#00b4d8]" />
          {membersCount} Enrolled
        </span>
        {onDetails && (
          <button 
            onClick={onDetails}
            className="text-[#0077b6] hover:text-[#03045e] transition-colors"
          >
            VIEW ROSTER
          </button>
        )}
      </div>
    </MainCard>
  );
};

export default React.memo(ClubOverviewCard);
