import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { getTeacherWorkload, getStudentsInClass } from "../../services/teacherService";
import { getExams, getClassAnalytics } from "../../services/examService";
import { getSubjects } from "../../services/academicsService";
import TeacherModuleHeader from "../../components/teacher/TeacherModuleHeader";
import MainCard from "../../components/teacher/../MainCard";
import { motion } from "framer-motion";
import { TrendingUp, Award, AlertCircle, PieChart } from "lucide-react";

const StudentPerfPage = () => {
  const { user } = useAuth();
  
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");
  const [selectedExam, setSelectedExam] = useState("");
  
  const [workload, setWorkload] = useState(null);
  const [exams, setExams] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [workloadData, examData, subjectData] = await Promise.all([
          getTeacherWorkload(user.linkedEntityId),
          getExams(),
          getSubjects()
        ]);
        setWorkload(workloadData);
        setExams(examData);
        setSubjects(subjectData);
        
        if (workloadData?.classes?.length > 0) setSelectedClass(workloadData.classes[0].id);
        if (workloadData?.profile?.subjectIds?.length > 0) setSelectedSubject(workloadData.profile.subjectIds[0]);
        if (examData.length > 0) setSelectedExam(examData[0].id);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user.linkedEntityId]);

  useEffect(() => {
    if (!selectedClass || !selectedSubject || !selectedExam) return;

    const fetchAnalytics = async () => {
      setLoading(true);
      try {
        const data = await getClassAnalytics(selectedClass, selectedSubject, selectedExam);
        setAnalytics(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [selectedClass, selectedSubject, selectedExam]);

  return (
    <div className="space-y-8 pb-12">
      <TeacherModuleHeader 
        titleKey="nav.student_perf"
        descriptionKey="Enterprise academic intelligence and performance analytics."
        helperContentEn="Monitor class averages, identify toppers, and detect students who may need additional support."
        helperContentHi="कक्षा के औसत की निगरानी करें, टॉपर्स की पहचान करें, और उन छात्रों का पता लगाएं जिन्हें अतिरिक्त सहायता की आवश्यकता हो सकती है।"
      />

      {/* Filters */}
      <MainCard className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Class</label>
            <select 
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="w-full p-3 rounded-xl border border-gray-100 bg-gray-50/50 text-[#03045e] font-bold focus:outline-none appearance-none cursor-pointer"
            >
              {workload?.classes?.map(c => <option key={c.id} value={c.id}>{c.name} - {c.section}</option>)}
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Subject</label>
            <select 
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="w-full p-3 rounded-xl border border-gray-100 bg-gray-50/50 text-[#03045e] font-bold focus:outline-none appearance-none cursor-pointer"
            >
              {workload?.profile?.subjectIds?.map(subId => {
                const sub = subjects.find(s => s.id === subId);
                return (
                  <option key={subId} value={subId}>{sub?.name || subId}</option>
                );
              })}
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Exam</label>
            <select 
              value={selectedExam}
              onChange={(e) => setSelectedExam(e.target.value)}
              className="w-full p-3 rounded-xl border border-gray-100 bg-gray-50/50 text-[#03045e] font-bold focus:outline-none appearance-none cursor-pointer"
            >
              {exams.map(ex => <option key={ex.id} value={ex.id}>{ex.name}</option>)}
            </select>
          </div>
        </div>
      </MainCard>

      {/* Analytics Grid */}
      {analytics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard 
            title="Class Average" 
            value={`${analytics.average}%`} 
            icon={<TrendingUp className="text-blue-500" />} 
            color="bg-blue-50"
          />
          <StatCard 
            title="Class Topper" 
            value={analytics.topper.name} 
            subValue={`Score: ${analytics.topper.marks}/100`}
            icon={<Award className="text-yellow-500" />} 
            color="bg-yellow-50"
          />
          <StatCard 
            title="Participation" 
            value="100%" 
            icon={<PieChart className="text-green-500" />} 
            color="bg-green-50"
          />
          <StatCard 
            title="Academic Alert" 
            value="2 Students" 
            subValue="Below 40% threshold"
            icon={<AlertCircle className="text-red-500" />} 
            color="bg-red-50"
          />
        </div>
      )}

      {/* Placeholder for deeper analytics */}
      <MainCard className="p-12 text-center border-dashed border-2 border-gray-100">
        <p className="text-gray-400 font-bold italic">Detailed performance charts and trend analysis will appear here as more data is collected.</p>
      </MainCard>
    </div>
  );
};

const StatCard = ({ title, value, subValue, icon, color }) => (
  <motion.div 
    whileHover={{ y: -5 }}
    className={`${color} p-6 rounded-[2rem] border border-white/50 shadow-sm`}
  >
    <div className="p-3 bg-white w-fit rounded-2xl mb-4 shadow-sm">
      {icon}
    </div>
    <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{title}</h4>
    <div className="text-2xl font-black text-[#03045e]">{value}</div>
    {subValue && <div className="text-[10px] font-bold text-gray-500 mt-1">{subValue}</div>}
  </motion.div>
);

export default StudentPerfPage;
