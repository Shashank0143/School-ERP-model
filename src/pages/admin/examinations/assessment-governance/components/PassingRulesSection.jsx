import React, { useState } from "react";
import { Ruler, Save, AlertTriangle } from "lucide-react";
import MainCard from "../../../../../components/MainCard";

const PassingRulesSection = ({ governance, onUpdate }) => {
  const [passingRules, setPassingRules] = useState(governance.passingRules || { overallPercentage: 33 });
  const [error, setError] = useState("");

  const handleSave = () => {
    const overall = Number(passingRules.overallPercentage);
    if (isNaN(overall) || overall < 0 || overall > 100) {
      setError("Passing percentage must be between 0 and 100.");
      return;
    }
    
    setError("");
    onUpdate({ passingRules: { ...passingRules, overallPercentage: overall } });
  };

  return (
    <MainCard className="bg-white border border-gray-100 overflow-hidden shadow-sm">
      <div className="px-6 py-4 border-b border-gray-50 bg-gray-50/50 flex justify-between items-center">
        <h3 className="text-sm font-black text-[#03045e] uppercase tracking-wider flex items-center gap-2">
          <Ruler size={16} className="text-blue-500"/> Passing Rules
        </h3>
      </div>

      <div className="p-6 space-y-6">
        {error && (
          <div className="text-xs font-bold text-red-600 bg-red-50 p-3 rounded-lg flex items-center gap-2">
            <AlertTriangle size={14} />
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-xs font-black text-gray-500 uppercase tracking-wider">Overall Passing Percentage</label>
            <div className="relative">
              <input
                type="number"
                min="0"
                max="100"
                value={passingRules.overallPercentage}
                onChange={(e) => {
                  setPassingRules({ ...passingRules, overallPercentage: e.target.value });
                  setError("");
                }}
                className="w-full pl-4 pr-8 py-3 bg-gray-50 border border-gray-200 rounded-xl text-lg font-black text-[#03045e] focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">%</span>
            </div>
            <p className="text-[10px] text-gray-400 font-medium mt-1">
              The minimum percentage required to pass an examination cycle.
            </p>
          </div>
        </div>

        <div className="flex justify-end pt-4 border-t border-gray-50">
          <button
            onClick={handleSave}
            className="px-6 py-2.5 rounded-xl text-sm font-black tracking-wider uppercase transition-all shadow-md flex items-center gap-2 bg-[#03045e] text-white hover:bg-[#023e8a] hover:-translate-y-0.5"
          >
            <Save size={16} /> Save Passing Rules
          </button>
        </div>
      </div>
    </MainCard>
  );
};

export default PassingRulesSection;
