import React from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const tabs = [
  { id: "cycles", label: "Exam Cycles", path: "/admin/examinations/cycles" },
  { id: "datesheets", label: "Date Sheets", path: "/admin/examinations/datesheets" },
  { id: "evaluation", label: "Evaluation Center", path: "/admin/examinations/evaluation" },
  { id: "results", label: "Results & Publication", path: "/admin/examinations/results" },
];

const ExaminationWorkspaceNav = ({ activeTab, hasActiveExam = false }) => {
  const navigate = useNavigate();

  const visibleTabs = [...tabs];
  if (hasActiveExam) {
    visibleTabs.splice(2, 0, { id: "ongoing", label: "Live Operations", path: "/admin/examinations/ongoing" });
  }

  return (
    <div className="bg-white p-2 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-2 overflow-x-auto custom-scrollbar mb-6">
      {visibleTabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => navigate(tab.path)}
          className={`relative px-4 py-2.5 rounded-xl font-bold text-sm transition-all whitespace-nowrap ${
            activeTab === tab.id
              ? "text-[#03045e]"
              : "text-gray-400 hover:text-gray-600 hover:bg-gray-50"
          }`}
        >
          {activeTab === tab.id && (
            <motion.div
              layoutId="examNavBubble"
              className="absolute inset-0 bg-[#0077b6]/10 border border-[#0077b6]/20 rounded-xl"
              transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
            />
          )}
          <span className="relative z-10">{tab.label}</span>
        </button>
      ))}
    </div>
  );
};

export default ExaminationWorkspaceNav;
