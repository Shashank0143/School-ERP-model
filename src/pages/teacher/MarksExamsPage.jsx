import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useAuth } from "../../context/AuthContext";
import { 
  getTeacherWorkload, 
  getStudentsInClass, 
  getMarksForClass, 
  submitMarks 
} from "../../services/teacherService";
import { getExams } from "../../services/examService";
import { getSubjects } from "../../services/academicsService";
import TeacherModuleHeader from "../../components/teacher/TeacherModuleHeader";
import MainCard from "../../components/teacher/../MainCard";
import TeacherDataTable from "../../components/teacher/TeacherDataTable";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, Save, AlertCircle } from "lucide-react";

/**
 * MarksExamsPage
 * 
 * Production-grade ERP marks entry system.
 * Implements a relational mutation loop for academic results.
 */
const MarksExamsPage = () => {
  const { user } = useAuth();
  
  // Selection State
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");
  const [selectedExam, setSelectedExam] = useState("");

  // Data State
  const [workload, setWorkload] = useState(null);
  const [exams, setExams] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [students, setStudents] = useState([]);
  const [marks, setMarks] = useState({}); // { studentId: { marks: '', remarks: '' } }
  
  // UI State
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState({ type: null, message: "" });

  // Initial Fetch
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
        
        // Auto-select first class/subject/exam if available
        if (workloadData?.classes?.length > 0) {
          setSelectedClass(workloadData.classes[0].id);
        }
        if (workloadData?.profile?.subjectIds?.length > 0) {
          setSelectedSubject(workloadData.profile.subjectIds[0]);
        }
        if (examData.length > 0) {
          setSelectedExam(examData[0].id);
        }
      } catch (err) {
        console.error("Failed to fetch teacher data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user.linkedEntityId]);

  // Fetch students and existing marks when selection changes
  useEffect(() => {
    if (!selectedClass || !selectedSubject || !selectedExam) return;

    const fetchStudentsAndMarks = async () => {
      setLoading(true);
      try {
        const [studentList, existingMarks] = await Promise.all([
          getStudentsInClass(selectedClass),
          getMarksForClass(selectedClass, selectedSubject, selectedExam)
        ]);
        
        setStudents(studentList);
        
        // Transform existing marks into our grid state
        const marksMap = {};
        studentList.forEach(s => {
          const m = existingMarks.find(em => em.studentId === s.id);
          marksMap[s.id] = {
            marks: m ? m.marksObtained : "",
            remarks: m ? m.remarks : ""
          };
        });
        setMarks(marksMap);
      } catch (err) {
        console.error("Failed to fetch class data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchStudentsAndMarks();
  }, [selectedClass, selectedSubject, selectedExam]);

  // Handlers
  const handleMarkChange = (studentId, field, value) => {
    setMarks(prev => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        [field]: value
      }
    }));
  };

  const handleSave = async () => {
    setSubmitting(true);
    setStatus({ type: null, message: "" });
    
    try {
      const marksList = students.map(s => ({
        studentId: s.id,
        marks: marks[s.id]?.marks,
        remarks: marks[s.id]?.remarks,
        maxMarks: 100 // Default for now
      }));

      await submitMarks(
        user.linkedEntityId,
        selectedClass,
        selectedSubject,
        selectedExam,
        marksList
      );

      setStatus({ type: "success", message: "Marks uploaded successfully to ERP database." });
      
      // Clear status after 3 seconds
      setTimeout(() => setStatus({ type: null, message: "" }), 3000);
    } catch (err) {
      setStatus({ type: "error", message: "Failed to upload marks. Please try again." });
    } finally {
      setSubmitting(false);
    }
  };

  // Table Columns
  const columns = [
    {
      header: "Roll No",
      accessor: "admissionNo",
      className: "w-24"
    },
    {
      header: "Student Name",
      accessor: "name",
      className: "w-64"
    },
    {
      header: "Marks (100)",
      render: (row) => (
        <input 
          type="number"
          min="0"
          max="100"
          value={marks[row.id]?.marks || ""}
          onChange={(e) => handleMarkChange(row.id, 'marks', e.target.value)}
          placeholder="0.00"
          className="w-24 px-3 py-2 bg-[#f8fdff] border border-[#caf0f8] rounded-lg text-[#03045e] font-bold focus:outline-none focus:ring-2 focus:ring-[#00b4d8]/20 transition-all"
        />
      ),
      className: "w-32"
    },
    {
      header: "Academic Remarks",
      render: (row) => (
        <input 
          type="text"
          value={marks[row.id]?.remarks || ""}
          onChange={(e) => handleMarkChange(row.id, 'remarks', e.target.value)}
          placeholder="e.g. Excellent progress"
          className="w-full px-3 py-2 bg-[#f8fdff] border border-[#caf0f8] rounded-lg text-[#03045e] font-medium focus:outline-none focus:ring-2 focus:ring-[#00b4d8]/20 transition-all placeholder:text-[#90e0ef]"
        />
      )
    }
  ];

  return (
    <div className="space-y-8 pb-12">
      <TeacherModuleHeader 
        titleKey="nav.marks_exams"
        descriptionKey="Enterprise examination management and mark entry terminal."
        helperContentEn="Select your class and subject to enter examination marks. All data is saved to the central ERP repository in real-time."
        helperContentHi="परीक्षा के अंक दर्ज करने के लिए अपनी कक्षा और विषय चुनें। सभी डेटा वास्तविक समय में केंद्रीय ERP रिपॉजिटरी में सहेजा जाता है।"
      />

      {/* Filters */}
      <MainCard className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Class Selector */}
          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Target Class</label>
            <select 
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="w-full p-3 rounded-xl border border-gray-100 bg-gray-50/50 text-[#03045e] font-bold focus:outline-none focus:ring-2 focus:ring-primary/20 appearance-none transition-all cursor-pointer"
            >
              <option value="">Select Class</option>
              {workload?.classes?.map(c => (
                <option key={c.id} value={c.id}>{c.name} - {c.section}</option>
              ))}
            </select>
          </div>

          {/* Subject Selector */}
          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Subject Terminal</label>
            <select 
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="w-full p-3 rounded-xl border border-gray-100 bg-gray-50/50 text-[#03045e] font-bold focus:outline-none focus:ring-2 focus:ring-primary/20 appearance-none transition-all cursor-pointer"
            >
              <option value="">Select Subject</option>
              {workload?.profile?.subjectIds?.map(subId => {
                const sub = subjects.find(s => s.id === subId);
                return (
                  <option key={subId} value={subId}>{sub?.name || subId}</option>
                );
              })}
            </select>
          </div>

          {/* Exam Selector */}
          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Examination Type</label>
            <select 
              value={selectedExam}
              onChange={(e) => setSelectedExam(e.target.value)}
              className="w-full p-3 rounded-xl border border-gray-100 bg-gray-50/50 text-[#03045e] font-bold focus:outline-none focus:ring-2 focus:ring-primary/20 appearance-none transition-all cursor-pointer"
            >
              <option value="">Select Examination</option>
              {exams.map(ex => (
                <option key={ex.id} value={ex.id}>{ex.name}</option>
              ))}
            </select>
          </div>
        </div>
      </MainCard>

      {/* Marks Entry Grid */}
      <AnimatePresence mode="wait">
        {selectedClass && selectedSubject && selectedExam && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            <div className="flex justify-between items-center px-2">
              <div>
                <h3 className="text-xl font-black text-[#03045e]">Academic Scoreboard</h3>
                <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">Entry terminal for {students.length} students</p>
              </div>
              
              <button 
                onClick={handleSave}
                disabled={submitting || loading}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-black text-sm tracking-widest uppercase transition-all shadow-lg ${
                  submitting 
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                    : 'bg-[#03045e] text-white hover:bg-[#023e8a] hover:-translate-y-1 active:translate-y-0'
                }`}
              >
                {submitting ? 'Committing...' : (
                  <>
                    <Save className="w-4 h-4" />
                    Publish to ERP
                  </>
                )}
              </button>
            </div>

            {status.type && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className={`p-4 rounded-2xl flex items-center gap-3 font-bold text-sm ${
                  status.type === 'success' 
                    ? 'bg-green-50 text-green-700 border border-green-100' 
                    : 'bg-red-50 text-red-700 border border-red-100'
                }`}
              >
                {status.type === 'success' ? <CheckCircle className="shrink-0" /> : <AlertCircle className="shrink-0" />}
                {status.message}
              </motion.div>
            )}

            <TeacherDataTable 
              columns={columns}
              data={students}
              loading={loading}
              emptyMessage="Select class criteria to load students."
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MarksExamsPage;
