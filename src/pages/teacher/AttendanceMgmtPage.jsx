import React, { useState, useEffect, useCallback } from "react";
import TeacherModuleHeader from "../../components/teacher/TeacherModuleHeader";
import TeacherDataTable from "../../components/teacher/TeacherDataTable";
import MainCard from "../../components/MainCard";
import { useAuth } from "../../context/AuthContext";
import { 
  getTeacherWorkload, 
  getStudentsInClass, 
  getAttendanceForClass, 
  submitAttendance 
} from "../../services/teacherService";
import { Check, X, Clock, Save, RotateCcw, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

/**
 * AttendanceMgmtPage
 * 
 * First full ERP mutation workflow.
 * Allows teachers to mark attendance for their assigned classes.
 */
const AttendanceMgmtPage = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  
  // Selection State
  const [workload, setWorkload] = useState(null);
  const [selectedClassId, setSelectedClassId] = useState("");
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);
  
  // Data State
  const [students, setStudents] = useState([]);
  const [attendanceMap, setAttendanceMap] = useState({}); // { studentId: 'present' | 'absent' | 'late' }

  // 1. Fetch Teacher Workload
  useEffect(() => {
    const loadWorkload = async () => {
      const data = await getTeacherWorkload(user?.linkedEntityId);
      setWorkload(data);
      if (data?.classes?.length > 0) {
        setSelectedClassId(data.classes[0].id);
      }
    };
    loadWorkload();
  }, [user]);

  // 2. Fetch Class Students & Existing Attendance
  const loadClassData = useCallback(async () => {
    if (!selectedClassId) return;
    setLoading(true);
    
    const [studentList, existingAttendance] = await Promise.all([
      getStudentsInClass(selectedClassId),
      getAttendanceForClass(selectedClassId, selectedDate)
    ]);
    
    setStudents(studentList);
    
    // Map existing attendance to state
    const map = {};
    existingAttendance.forEach(a => {
      map[a.studentId] = a.status;
    });
    setAttendanceMap(map);
    
    setLoading(false);
  }, [selectedClassId, selectedDate]);

  useEffect(() => {
    loadClassData();
  }, [loadClassData]);

  // 3. Status Toggles
  const toggleStatus = (studentId, status) => {
    setAttendanceMap(prev => ({
      ...prev,
      [studentId]: prev[studentId] === status ? undefined : status
    }));
  };

  const markAllPresent = () => {
    const map = {};
    students.forEach(s => map[s.id] = 'present');
    setAttendanceMap(map);
  };

  // 4. Submission
  const handleSubmit = async () => {
    const list = Object.entries(attendanceMap)
      .filter(([_, status]) => !!status)
      .map(([studentId, status]) => ({ studentId, status }));

    if (list.length < students.length) {
      if (!confirm("Some students have no status. Continue?")) return;
    }

    setSubmitting(true);
    try {
      await submitAttendance(user.linkedEntityId, selectedClassId, list);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error(err);
      alert("Failed to submit attendance.");
    } finally {
      setSubmitting(false);
    }
  };

  const columns = [
    { 
      header: "Student Name", 
      render: (row) => (
        <div className="flex flex-col">
          <span className="font-black text-[#03045e]">{row.name}</span>
          <span className="text-[10px] text-gray-400 font-bold uppercase">Adm: {row.admissionNo}</span>
        </div>
      )
    },
    {
      header: "Attendance Status",
      className: "text-right",
      render: (row) => {
        const status = attendanceMap[row.id];
        return (
          <div className="flex items-center justify-end gap-2">
            <StatusButton 
              active={status === 'present'} 
              type="present" 
              onClick={() => toggleStatus(row.id, 'present')} 
            />
            <StatusButton 
              active={status === 'absent'} 
              type="absent" 
              onClick={() => toggleStatus(row.id, 'absent')} 
            />
            <StatusButton 
              active={status === 'late'} 
              type="late" 
              onClick={() => toggleStatus(row.id, 'late')} 
            />
          </div>
        );
      }
    }
  ];

  return (
    <div className="space-y-8 pb-12">
      <TeacherModuleHeader 
        titleKey="nav.attendance_mgmt"
        descriptionKey="Mark and manage daily attendance for your assigned classes."
        helperContentEn="Select a class and date to mark attendance. You can also review and modify previously marked attendance."
        helperContentHi="उपस्थिति दर्ज करने के लिए कक्षा और तिथि चुनें। आप पहले से दर्ज उपस्थिति की समीक्षा और संशोधन भी कर सकते हैं।"
      />

      {/* Filter Toolbar */}
      <MainCard className="p-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Select Class</label>
            <select 
              value={selectedClassId}
              onChange={(e) => setSelectedClassId(e.target.value)}
              className="bg-[#caf0f8]/30 border-none rounded-xl px-4 py-2 text-sm font-bold text-[#03045e] focus:ring-2 focus:ring-[#00b4d8] transition-all"
            >
              {workload?.classes?.map(c => (
                <option key={c.id} value={c.id}>{c.name} - {c.section}</option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Date</label>
            <input 
              type="date" 
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="bg-[#caf0f8]/30 border-none rounded-xl px-4 py-2 text-sm font-bold text-[#03045e] focus:ring-2 focus:ring-[#00b4d8] transition-all"
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
           <button 
             onClick={markAllPresent}
             className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-600 rounded-xl text-xs font-black hover:bg-emerald-100 transition-colors"
           >
             <Check size={14} /> MARK ALL PRESENT
           </button>
           <button 
             onClick={loadClassData}
             className="p-2 text-gray-400 hover:text-[#03045e] transition-colors"
             title="Reset"
           >
             <RotateCcw size={18} />
           </button>
        </div>
      </MainCard>

      {/* Attendance Table */}
      <div className="relative">
        <TeacherDataTable 
          columns={columns}
          data={students}
          loading={loading}
          emptyMessage="No students found in this class."
        />

        {/* Floating Submit Bar */}
        <AnimatePresence>
          {students.length > 0 && !loading && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50"
            >
              <button 
                onClick={handleSubmit}
                disabled={submitting}
                className={`flex items-center gap-3 px-8 py-4 rounded-3xl shadow-2xl transition-all font-black text-sm tracking-tight ${
                  success 
                    ? "bg-emerald-500 text-white" 
                    : "bg-[#03045e] text-white hover:bg-[#0077b6] active:scale-95"
                } disabled:opacity-50 disabled:scale-100`}
              >
                {submitting ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : success ? (
                  <>
                    <CheckCircle2 size={20} />
                    ATTENDANCE SAVED
                  </>
                ) : (
                  <>
                    <Save size={20} />
                    SUBMIT ATTENDANCE
                  </>
                )}
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

const StatusButton = ({ active, type, onClick }) => {
  const configs = {
    present: { color: "#10b981", icon: Check, label: "P" },
    absent: { color: "#ef4444", icon: X, label: "A" },
    late: { color: "#f59e0b", icon: Clock, label: "L" }
  };
  const config = configs[type];
  const Icon = config.icon;

  return (
    <button 
      onClick={onClick}
      className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all border-2 ${
        active 
          ? `bg-white border-transparent shadow-md scale-110` 
          : `bg-transparent border-[#caf0f8] text-gray-300 hover:border-[#00b4d8]/30`
      }`}
      style={active ? { color: config.color, borderColor: config.color } : {}}
    >
      <Icon size={18} />
    </button>
  );
};

export default AttendanceMgmtPage;
