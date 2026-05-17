import React, { useState } from "react";
import TeacherModuleHeader from "../../components/teacher/TeacherModuleHeader";
import MainCard from "../../components/MainCard";
import { Plus, Users, BookOpen, Clock, ChevronRight, Filter, Search } from "lucide-react";
import { motion } from "framer-motion";

const AssignmentsManagementPage = () => {
  const [activeTab, setActiveTab] = useState("active");

  const MOCK_TEACHER_ASSIGNMENTS = [
    { id: 1, title: "Quantum Mechanics Worksheet", subject: "Physics", class: "11-A", dueDate: "2024-05-20", submissions: 24, total: 32 },
    { id: 2, title: "Optics Lab Report", subject: "Physics", class: "11-A", dueDate: "2024-05-15", submissions: 32, total: 32 },
    { id: 3, title: "Thermodynamics Quiz", subject: "Physics", class: "11-B", dueDate: "2024-05-25", submissions: 12, total: 28 },
  ];

  return (
    <div className="space-y-8 pb-12">
      <TeacherModuleHeader 
        titleKey="Assignments Management"
        descriptionKey="Create, manage and track student assignments and submissions."
        helperContentEn="Create new assignments for your classes, set deadlines, and monitor student submission progress in real-time."
        helperContentHi="अपनी कक्षाओं के लिए नए असाइनमेंट बनाएं, समय सीमा निर्धारित करें और वास्तविक समय में छात्र सबमिशन प्रगति की निगरानी करें।"
      />

      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="flex gap-2 bg-gray-100 p-1 rounded-2xl w-fit">
          {["active", "past", "drafts"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                activeTab === tab ? "bg-[#03045e] text-white shadow-lg" : "text-gray-400 hover:text-gray-600"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <button className="w-full md:w-auto bg-[#03045e] text-white px-6 py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-xl shadow-[#03045e]/20 flex items-center justify-center gap-2 hover:scale-[1.02] transition-all">
          <Plus size={16} />
          Create New Assignment
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {MOCK_TEACHER_ASSIGNMENTS.map((asgn) => (
          <MainCard key={asgn.id} className="p-6 group hover:border-primary/30 transition-all border-l-4 border-l-[#00b4d8]">
            <div className="flex flex-col lg:flex-row gap-6 items-center">
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 bg-blue-50 text-blue-600 rounded text-[9px] font-black uppercase tracking-tighter">
                    {asgn.subject}
                  </span>
                  <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">
                    Class {asgn.class}
                  </span>
                </div>
                <h3 className="text-xl font-black text-[#03045e] group-hover:text-primary transition-colors">
                  {asgn.title}
                </h3>
                <div className="flex items-center gap-6 pt-2">
                  <div className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                    <Clock size={14} className="text-amber-500" />
                    Due: {asgn.dueDate}
                  </div>
                  <div className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                    <Users size={14} className="text-[#00b4d8]" />
                    Submissions: {asgn.submissions}/{asgn.total}
                  </div>
                </div>
              </div>

              <div className="w-full lg:w-48">
                <div className="flex justify-between items-end mb-2">
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Progress</span>
                  <span className="text-xs font-black text-[#03045e]">{Math.round((asgn.submissions/asgn.total)*100)}%</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${(asgn.submissions/asgn.total)*100}%` }}
                    className="h-full bg-[#00b4d8]"
                  />
                </div>
              </div>

              <button className="p-4 rounded-2xl bg-gray-50 text-gray-400 group-hover:bg-[#03045e] group-hover:text-white transition-all shadow-sm">
                <ChevronRight size={20} />
              </button>
            </div>
          </MainCard>
        ))}
      </div>
    </div>
  );
};

export default AssignmentsManagementPage;
