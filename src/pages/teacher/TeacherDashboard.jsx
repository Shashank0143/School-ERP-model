import React from "react";
import TeacherModuleHeader from "../../components/teacher/TeacherModuleHeader";
import MainCard from "../../components/MainCard";
import { 
  CheckSquare, 
  ClipboardList, 
  FileEdit, 
  Users, 
  BarChart2, 
  MessageSquare 
} from "lucide-react";

/**
 * TeacherDashboard
 * 
 * The operational command center for teachers.
 */
const TeacherDashboard = () => {
  const stats = [
    { label: "Today's Classes", value: "4", icon: ClipboardList, color: "#00b4d8" },
    { label: "Attendance Marked", value: "2/4", icon: CheckSquare, color: "#059669" },
    { label: "Pending Gradings", value: "12", icon: FileEdit, color: "#D97706" },
    { label: "Student Alerts", value: "3", icon: Users, color: "#DC2626" },
  ];

  return (
    <div className="space-y-8 pb-12">
      <TeacherModuleHeader 
        titleKey="nav.teacher_home"
        descriptionKey="Welcome to your operational dashboard. Track your classes and student performance."
        helperContentEn="The Teacher Dashboard provides a high-level overview of your daily tasks, including class schedules, attendance status, and pending gradings."
        helperContentHi="शिक्षक डैशबोर्ड आपके दैनिक कार्यों का एक उच्च-स्तरीय अवलोकन प्रदान करता है, जिसमें कक्षा कार्यक्रम, उपस्थिति की स्थिति और लंबित ग्रेडिंग शामिल हैं।"
      />

      {/* Analytics Summary Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, idx) => (
          <MainCard key={idx} className="p-6 border-l-4" style={{ borderLeftColor: stat.color }}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{stat.label}</p>
                <p className="text-3xl font-black text-[#03045e]">{stat.value}</p>
              </div>
              <div className="p-3 rounded-2xl bg-[#caf0f8]/50 text-[#03045e]">
                <stat.icon size={24} style={{ color: stat.color }} />
              </div>
            </div>
          </MainCard>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <MainCard className="lg:col-span-2 p-8 h-80 flex flex-col items-center justify-center border-2 border-dashed border-[#caf0f8]">
          <BarChart2 size={48} className="text-gray-200 mb-4" />
          <p className="text-gray-400 font-bold italic">Operational Overview Analytics (Coming Soon)</p>
        </MainCard>
        
        <MainCard className="p-8 h-80 flex flex-col items-center justify-center border-2 border-dashed border-[#caf0f8]">
          <MessageSquare size={48} className="text-gray-200 mb-4" />
          <p className="text-gray-400 font-bold italic">Recent Communications (Coming Soon)</p>
        </MainCard>
      </div>
    </div>
  );
};

export default TeacherDashboard;
