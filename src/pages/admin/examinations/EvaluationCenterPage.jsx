import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  BookOpen, CheckCircle, Search, Activity, User, Edit, X, FileText, ChevronRight, ChevronDown, CheckCircle2, ShieldAlert
} from "lucide-react";
import AdminPageHeader from "../../../components/admin/AdminPageHeader";
import MainCard from "../../../components/MainCard";
import ExaminationWorkspaceNav from "./components/ExaminationWorkspaceNav";
import { getExams, getExamPapers, submitMarks, getTargetClasses, getScheduledExamPapers } from "../../../services/examService";
import { getDataProvider } from "../../../data";
import EmptyState from "../../../components/common/EmptyState";
import SearchFilterBar from "../../../components/common/SearchFilterBar";
import StatusBadge from "../../../components/common/StatusBadge";
import ProgressCard from "../../../components/common/ProgressCard";
import Drawer from "../../../components/common/Drawer";
import Modal from "../../../components/common/Modal";

const STATUS_CONFIG = {
  not_started: { label: "Not Started", color: "bg-red-50 text-red-700 border-red-200" },
  in_progress: { label: "In Progress", color: "bg-amber-50 text-amber-700 border-amber-200" },
  submitted: { label: "Submitted", color: "bg-emerald-50 text-emerald-700 border-emerald-200" }
};

const EvaluationCenterPage = () => {
  const [sessions, setSessions] = useState([]);
  const [papers, setPapers] = useState([]);
  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [teacherAssignments, setTeacherAssignments] = useState([]);
  const [students, setStudents] = useState([]);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);

  // Selectors
  const [activeSessionId, setActiveSessionId] = useState("");
  
  // Search & Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedPaper, setSelectedPaper] = useState(null);
  const [overrideOpen, setOverrideOpen] = useState(false);
  const [overrideStudentMarks, setOverrideStudentMarks] = useState([]);
  const [overrideError, setOverrideError] = useState("");
  const [historyDrawerOpen, setHistoryDrawerOpen] = useState(false);
  const [selectedHistoryStudent, setSelectedHistoryStudent] = useState(null);
  const [expandedClasses, setExpandedClasses] = useState({});

  const toggleClass = (classId) => {
    setExpandedClasses(prev => ({
      ...prev,
      [classId]: !prev[classId]
    }));
  };

  const fetchBaseData = async () => {
    setLoading(true);
    try {
      const provider = getDataProvider();
      const [allSessions, allPapers, allClasses, allSubjects, allTeachers, allAssignments, allStudents, allResults] = await Promise.all([
        getExams(),
        getExamPapers(),
        provider.getClasses(),
        provider.getSubjects(),
        provider.getTeachers(),
        provider.getTeacherSubjectAssignments(),
        provider.getStudents(),
        provider.getResults()
      ]);
      const normalizedSessions = (allSessions || []).map(session => ({
        ...session,
        id: session.id || session.examId,
        name: session.name || session.examName,
        type: session.type || session.examType,
        status: (session.status === "Completed") ? "published" : session.status || "draft",
      }));
      setSessions(normalizedSessions);
      setPapers(allPapers || []);
      setClasses(allClasses || []);
      setSubjects(allSubjects || []);
      setTeachers(allTeachers || []);
      setTeacherAssignments(allAssignments || []);
      setStudents(allStudents || []);
      setResults(allResults || []);
      
      const evalSessions = normalizedSessions.filter(s => s.status === 'evaluation');
      if (evalSessions.length > 0 && !activeSessionId) {
        setActiveSessionId(evalSessions[0].id);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBaseData();
  }, []);

  const hasActiveExam = sessions.some(s => ["ongoing", "evaluation", "scheduled"].includes(s.status));
  const activeSession = useMemo(() => sessions.find(s => s.id === activeSessionId), [sessions, activeSessionId]);

// Derived Data for the active session
  const evaluationData = useMemo(() => {
    if (!activeSessionId || !activeSession) return [];

    const activePapers = getScheduledExamPapers(activeSession, papers, subjects);

    const evalData = activePapers.map(paper => {
      // Find class and subject
      const clsObj = classes.find(c => c.id === paper.classId) || { id: paper.classId, name: paper.classId, classLevel: paper.classId.replace('class-', '').replace(/[a-z]/i, '') };
      const subObj = subjects.find(s => s.id === paper.subjectId) || { id: paper.subjectId, name: paper.subjectId };

      const classStudents = students.filter(s => s.classId === paper.classId);
      const totalStudents = classStudents.length;

      // Find evaluator (from paper invigilator -> subject assignment -> class teacher)
      let evaluator = null;
      if (paper.invigilatorTeacherIds?.[0]) {
         evaluator = teachers.find(t => t.id === paper.invigilatorTeacherIds[0]);
      }
      if (!evaluator) {
         const assignment = teacherAssignments.find(a => a.classId === paper.classId && (a.subjectId === subObj.id || a.subjectId === subObj.subjectId));
         if (assignment && assignment.teacherId) {
           evaluator = teachers.find(t => t.id === assignment.teacherId);
         }
      }
      if (!evaluator && clsObj.classTeacherId) {
         evaluator = teachers.find(t => t.id === clsObj.classTeacherId);
      }

      // Evaluated students
      const paperResults = results.filter(r => r.examId === activeSessionId && (r.subjectId === subObj.id || r.subjectId === subObj.subjectId) && r.classId === paper.classId);
      
      const submittedCount = paperResults.filter(r => r.isSubmitted).length;
      const draftedCount = paperResults.length - submittedCount;
      const evaluatedStudents = submittedCount || draftedCount;
      const isClassSubmitted = submittedCount > 0 && submittedCount === totalStudents;

      let progress = totalStudents === 0 ? 0 : Math.round((evaluatedStudents / totalStudents) * 100);
      if (progress > 100) progress = 100;
      
      let status = "not_started";
      if (isClassSubmitted) status = "submitted";
      else if (evaluatedStudents > 0) status = "in_progress";

      return {
         id: paper.id,
         examSessionId: activeSessionId,
         classId: paper.classId,
         className: clsObj.name || clsObj.id,
         subjectId: subObj.id || subObj.subjectId,
         subjectName: subObj.name || subObj.subjectName || subObj.subjectId,
         evaluatorName: evaluator ? (evaluator.name || evaluator.teacherName) : "Unassigned",
         evaluatorId: evaluator ? evaluator.id : null,
         totalStudents,
         evaluatedStudents,
         progress,
         evaluationStatus: status,
         classStudents,
         paperResults,
         status: paper.status || "scheduled"
      };
    });

    return evalData;
  }, [activeSessionId, activeSession, papers, classes, subjects, teachers, teacherAssignments, students, results]);

  // Statistics
  const stats = useMemo(() => {
    if (evaluationData.length === 0) return { total: 0, pending: 0, completed: 0, teachers: 0, progress: 0 };
    
    const total = evaluationData.length;
    const completed = evaluationData.filter(d => d.evaluationStatus === 'submitted').length;
    const pending = total - completed;
    
    const uniqueTeachers = new Set(evaluationData.map(d => d.evaluatorId).filter(Boolean));
    
    let totalExpected = 0;
    let totalEvaluated = 0;
    evaluationData.forEach(d => {
      totalExpected += d.totalStudents;
      totalEvaluated += d.evaluatedStudents;
    });
    
    const progress = totalExpected === 0 ? 0 : Math.round((totalEvaluated / totalExpected) * 100);

    return { total, pending, completed, teachers: uniqueTeachers.size, progress };
  }, [evaluationData]);

  // Filtered
  const filteredData = useMemo(() => {
    return evaluationData.filter(d => {
      let visible = true;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        visible = d.subjectName.toLowerCase().includes(q) || 
                  d.className.toLowerCase().includes(q) || 
                  d.evaluatorName.toLowerCase().includes(q);
      }
      if (statusFilter !== 'all' && d.evaluationStatus !== statusFilter) visible = false;
      return visible;
    });
  }, [evaluationData, searchQuery, statusFilter]);

  const groupedData = useMemo(() => {
    const groups = {};
    filteredData.forEach(item => {
      if (!groups[item.classId]) {
        groups[item.classId] = {
          classId: item.classId,
          className: item.className,
          items: [],
          totalStudents: 0,
          evaluatedStudents: 0,
          progress: 0,
          status: "not_started"
        };
      }
      groups[item.classId].items.push(item);
      groups[item.classId].totalStudents += item.totalStudents;
      groups[item.classId].evaluatedStudents += item.evaluatedStudents;
    });
    
    Object.values(groups).forEach(group => {
      group.progress = group.totalStudents === 0 ? 0 : Math.round((group.evaluatedStudents / group.totalStudents) * 100);
      if (group.progress === 100 && group.items.every(i => i.evaluationStatus === 'submitted')) group.status = "submitted";
      else if (group.progress > 0) group.status = "in_progress";
    });
    
    return Object.values(groups).sort((a, b) => a.className.localeCompare(b.className));
  }, [filteredData]);


  // Open Override Dialog
  const handleOpenOverride = () => {
    if (!selectedPaper) return;
    
    // Prepare override list
    const overrideList = selectedPaper.classStudents.map(student => {
      const existingResult = selectedPaper.paperResults.find(r => r.studentId === student.id);
      return {
        studentId: student.id,
        name: student.name || `${student.firstName || ''} ${student.lastName || ''}`.trim(),
        rollNumber: student.rollNumber,
        admissionNo: student.admissionNo,
        initialMarks: existingResult ? (existingResult.effectiveMarks?.toString() ?? existingResult.marksObtained?.toString() ?? "") : "",
        marksObtained: existingResult ? (existingResult.effectiveMarks?.toString() ?? existingResult.marksObtained?.toString() ?? "") : "",
        initialRemarks: existingResult ? existingResult.remarks : "",
        remarks: existingResult ? existingResult.remarks : "",
        overrideReason: existingResult?.overrideReason || "",
        marksHistory: existingResult ? existingResult.marksHistory || [] : []
      };
    }).sort((a, b) => (a.rollNumber || "").localeCompare(b.rollNumber || ""));

    setOverrideStudentMarks(overrideList);
    setOverrideError("");
    setOverrideOpen(true);
  };

  const handleSaveMarksOverride = async () => {
    // Validation
    let hasError = false;
    const marksToSubmit = overrideStudentMarks.filter(o => o.marksObtained !== "").map(o => {
      const isModified = o.initialMarks !== "" && parseFloat(o.marksObtained) !== parseFloat(o.initialMarks);
      if (isModified && !o.overrideReason?.trim()) {
        hasError = true;
      }
      return {
        studentId: o.studentId,
        marks: o.marksObtained,
        maxMarks: activeSession?.type === "TERM" ? 100 : 40,
        remarks: o.remarks,
        overrideReason: o.overrideReason,
        isAbsent: false, // For simplicity in admin override, assuming present if they have marks
        practicalMarks: 0,
      };
    });

    if (hasError) {
      setOverrideError("Override Reason is strictly required for changed marks.");
      return;
    }

    try {
      await submitMarks(
        "Admin",
        "Admin",
        selectedPaper.classId,
        selectedPaper.subjectId,
        activeSessionId,
        marksToSubmit
      );

      await fetchBaseData();
      setOverrideOpen(false);
      
      // Close drawer because selectedPaper reference will be stale
      setDrawerOpen(false);
      setSelectedPaper(null); 
    } catch (err) {
      console.error("Override marks failed:", err);
      setOverrideError(err.message || "Failed to save overrides.");
    }
  };


  // --- EARLY RETURN FOR EMPTY STATE ---
  if (!loading && (!activeSessionId || sessions.filter(s => s.status === 'evaluation').length === 0)) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6 pb-12">
        <AdminPageHeader
          title="Evaluation Center"
          subtitle="Supervise examination evaluation progress and marks entry"
          icon={<FileText className="text-[#0077b6]" size={28} />}
        />
        <ExaminationWorkspaceNav activeTab="evaluation" hasActiveExam={hasActiveExam} />
        <MainCard className="h-[400px] flex items-center justify-center bg-white border border-dashed border-gray-300">
          <EmptyState 
            icon={ShieldAlert}
            title="No Examination Under Evaluation"
            description="The Evaluation Center becomes available once an examination moves from the Ongoing stage to the Evaluation stage."
          />
        </MainCard>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6 pb-12"
    >
      <AdminPageHeader
        title="Evaluation Center"
        subtitle="Supervise examination evaluation progress and marks entry"
        icon={<FileText className="text-[#0077b6]" size={28} />}
        onRefresh={fetchBaseData}
      />
      <ExaminationWorkspaceNav activeTab="evaluation" hasActiveExam={hasActiveExam} />

      {/* --- ACTIVE CYCLE SELECTOR --- */}
      <div className="bg-white rounded-2xl p-4 flex flex-col md:flex-row items-center gap-4 border border-gray-100 shadow-sm">
        <div className="flex-1">
          <label className="text-[10px] uppercase font-black text-gray-500 tracking-wider">Active Evaluation Cycle</label>
          <select
            value={activeSessionId}
            onChange={(e) => setActiveSessionId(e.target.value)}
            className="w-full mt-1.5 p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold text-[#03045e] focus:outline-none focus:ring-2 focus:ring-[#0077b6]/20"
          >
            {sessions.filter(s => s.status === 'evaluation').map(s => (
              <option key={s.id} value={s.id}>{s.name} ({s.academicYear})</option>
            ))}
          </select>
        </div>
        <div className="md:w-64 bg-gradient-to-r from-emerald-500 to-emerald-600 p-4 rounded-xl text-white flex items-center justify-between shadow-md">
          <div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-100">Overall Progress</div>
            <div className="text-xl font-black">{stats.progress}%</div>
          </div>
          <Activity size={24} className="text-emerald-200 opacity-80" />
        </div>
      </div>

      {/* --- QUICK STATISTICS --- */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <ProgressCard title="Total Papers" value={stats.total} icon={FileText} colorClass="blue" />
        <ProgressCard title="Completed" value={stats.completed} icon={CheckCircle2} colorClass="emerald" />
        <ProgressCard title="Pending" value={stats.pending} icon={Activity} colorClass="amber" />
        <ProgressCard title="Teachers Assigned" value={stats.teachers} icon={User} colorClass="gray" />
      </div>

      <div>
        
        {/* FILTERS & MAIN TABLE */}
        <div className="space-y-6">
          <SearchFilterBar
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            searchPlaceholder="Search subject, class, teacher..."
            filters={[
              {
                value: statusFilter,
                onChange: setStatusFilter,
                options: [
                  { value: "all", label: "All Statuses" },
                  { value: "not_started", label: "Not Started" },
                  { value: "in_progress", label: "In Progress" },
                  { value: "submitted", label: "Submitted" }
                ]
              }
            ]}
          />

          <MainCard className="bg-white border border-gray-100 overflow-hidden shadow-sm">
            <div className="px-6 py-4 border-b border-gray-50 flex justify-between items-center bg-gray-50/50">
              <h3 className="text-sm font-black text-[#03045e] uppercase tracking-wider flex items-center gap-2">
                <FileText size={16} className="text-blue-500"/> Pending Evaluations
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-50/50 text-gray-400 uppercase text-[10px] font-black tracking-wider border-b border-gray-100">
                  <tr>
                    <th className="px-6 py-4">Paper Details</th>
                    <th className="px-6 py-4">Teacher</th>
                    <th className="px-6 py-4">Progress</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {groupedData.map(group => {
                    const isExpanded = expandedClasses[group.classId];
                    const groupStatusConf = STATUS_CONFIG[group.status];
                    
                    return (
                      <React.Fragment key={group.classId}>
                        {/* Class Header Row */}
                        <tr 
                          className="hover:bg-gray-50/80 transition-colors cursor-pointer bg-gray-50/30"
                          onClick={() => toggleClass(group.classId)}
                        >
                          <td className="px-6 py-4 font-black text-[#03045e] flex items-center gap-2">
                            {isExpanded ? <ChevronDown size={16} className="text-gray-400" /> : <ChevronRight size={16} className="text-gray-400" />}
                            Class {group.className}
                            <span className="ml-2 px-2 py-0.5 bg-white border border-gray-200 rounded-full text-[10px] text-gray-500 font-bold">
                              {group.items.length} Subjects
                            </span>
                          </td>
                          <td className="px-6 py-4 text-xs font-semibold text-gray-500">
                            -
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-full h-1.5 bg-gray-200 rounded-full max-w-[100px] overflow-hidden">
                                <div className={`h-full rounded-full ${group.progress === 100 ? 'bg-emerald-500' : 'bg-blue-500'}`} style={{width: `${group.progress}%`}} />
                              </div>
                              <span className="text-xs font-bold text-gray-500">{group.evaluatedStudents}/{group.totalStudents}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <StatusBadge status={group.status} text={groupStatusConf?.label} />
                          </td>
                          <td className="px-6 py-4 text-right">
                          </td>
                        </tr>

                        {/* Subject Rows (Expanded) */}
                        <AnimatePresence>
                          {isExpanded && group.items.map(data => {
                            const statusConf = STATUS_CONFIG[data.evaluationStatus];
                            return (
                              <motion.tr 
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                exit={{ opacity: 0, height: 0 }}
                                key={data.id} 
                                className="hover:bg-blue-50/30 transition-colors cursor-pointer group bg-white" 
                                onClick={() => setSelectedPaper(data)}
                              >
                                <td className="px-6 py-3 pl-12">
                                  <div className="font-bold text-[#03045e] group-hover:text-blue-600 transition-colors flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 rounded-full bg-blue-300"></div>
                                    {data.subjectName}
                                  </div>
                                </td>
                                <td className="px-6 py-3">
                                  <div className="font-semibold text-sm text-gray-700 flex items-center gap-2">
                                    <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-[10px] font-bold text-gray-500">
                                      {data.evaluatorName?.charAt(0) || "?"}
                                    </div>
                                    {data.evaluatorName}
                                  </div>
                                </td>
                                <td className="px-6 py-3">
                                  <div className="flex items-center gap-3">
                                    <div className="w-full h-1 bg-gray-100 rounded-full max-w-[100px] overflow-hidden">
                                      <div className={`h-full rounded-full ${data.progress === 100 ? 'bg-emerald-500' : 'bg-blue-400'}`} style={{width: `${data.progress}%`}} />
                                    </div>
                                    <span className="text-xs font-bold text-gray-500">{data.evaluatedStudents}/{data.totalStudents}</span>
                                  </div>
                                </td>
                                <td className="px-6 py-3">
                                  <StatusBadge status={data.evaluationStatus} text={statusConf?.label} />
                                </td>
                                <td className="px-6 py-3 text-right">
                                  <button className="text-blue-600 font-bold text-xs transition-opacity flex items-center justify-end gap-1 w-full">
                                    Review <ChevronRight size={14}/>
                                  </button>
                                </td>
                              </motion.tr>
                            )
                          })}
                        </AnimatePresence>
                      </React.Fragment>
                    );
                  })}
                  {filteredData.length === 0 && (
                    <tr>
                      <td colSpan="5" className="p-0">
                        <EmptyState 
                          icon={FileText} 
                          title="No Evaluations Found" 
                          description="No evaluations matching the current filters." 
                        />
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </MainCard>
        </div>


      </div>

      {/* --- EVALUATION REVIEW DRAWER --- */}
      <Drawer
        isOpen={!!selectedPaper}
        onClose={() => setSelectedPaper(null)}
        title={selectedPaper?.subjectName || "Subject"}
        subtitle={`${selectedPaper?.className || "Class"} | Progress: ${selectedPaper?.progress || 0}%`}
        width="md:w-[450px]"
      >
        {selectedPaper && (
          <div className="flex flex-col h-full bg-gray-50">
            <div className="flex-1 overflow-y-auto p-0">
                <div className="p-4 border-b border-gray-200 bg-white">
                   <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Evaluator</div>
                   <div className="flex items-center gap-3">
                     <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${selectedPaper.evaluatorName === 'Unassigned' ? 'bg-gray-100 text-gray-500' : 'bg-blue-100 text-blue-600'}`}>
                       {selectedPaper.evaluatorName === "Unassigned" ? "?" : selectedPaper.evaluatorName?.charAt(0) || "?"}
                     </div>
                     <div className="font-bold text-gray-800">{selectedPaper.evaluatorName}</div>
                   </div>
                </div>

                <div className="p-4">
                  <h4 className="text-xs font-black uppercase tracking-wider text-gray-400 mb-3 flex items-center gap-2">
                    <CheckCircle2 size={14} /> Marks Review ({selectedPaper.evaluatedStudents}/{selectedPaper.totalStudents})
                  </h4>
                  
                  <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 uppercase font-bold">
                        <tr>
                          <th className="px-4 py-3">Student</th>
                          <th className="px-4 py-3 text-right">Marks</th>
                          <th className="px-4 py-3 text-center">Grade</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {selectedPaper.classStudents.map(student => {
                          const result = selectedPaper.paperResults.find(r => r.studentId === student.id);
                          return (
                            <tr key={student.id} className="hover:bg-gray-50">
                              <td className="px-4 py-3">
                                <div className="font-bold text-gray-800">{student.name}</div>
                                <div className="text-[10px] text-gray-400">Admn: {student.admissionNo}</div>
                              </td>
                              <td className="px-4 py-3 text-right font-bold text-[#0077b6]">
                                {result ? result.marksObtained : '-'}
                              </td>
                              <td className="px-4 py-3 text-center">
                                {result ? (
                                  <span className="px-2 py-0.5 bg-gray-100 rounded text-gray-600 font-bold">{result.grade}</span>
                                ) : (
                                  <span className="px-2 py-0.5 bg-red-50 text-red-500 rounded font-bold">Pending</span>
                                )}
                              </td>
                            </tr>
                          )
                        })}
                        {selectedPaper.classStudents.length === 0 && (
                          <tr><td colSpan="3" className="px-4 py-8 text-center text-gray-400">No students found.</td></tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
            </div>

            <div className="p-4 bg-white border-t border-gray-200 shrink-0">
              <button
                onClick={() => {
                   // Optional: implement a direct view overriding function or keep handleOpenOverride as is.
                   // Wait, the original code had:
                   // onClick={handleOpenOverride}
                   handleOpenOverride();
                }}
                className="w-full bg-red-50 border-2 border-red-100 text-red-600 py-3 rounded-xl font-bold hover:border-red-300 hover:bg-red-100 transition-colors flex items-center justify-center gap-2"
              >
                <Edit size={16} /> Admin Marks Override
              </button>
              <p className="text-[10px] text-center text-gray-400 mt-2 font-medium">
                Modifying marks overrides teacher inputs directly.
              </p>
            </div>
          </div>
        )}
      </Drawer>

      {/* --- ADMIN MARKS OVERRIDE DIALOG --- */}
      <Modal
        isOpen={overrideOpen}
        onClose={() => setOverrideOpen(false)}
        title="Scorecard Admin Override"
        subtitle={selectedPaper ? `Class: ${selectedPaper.className} | Subject: ${selectedPaper.subjectName}` : ""}
        maxWidth="md:w-[90vw] lg:max-w-3xl"
        headerGradient="from-red-600 to-red-800"
      >
        {selectedPaper && (
          <div className="flex flex-col h-full max-h-[85vh]">
              <div className="p-6 bg-red-50 border-b border-red-100 shrink-0 flex items-start gap-3">
                 <ShieldAlert size={20} className="text-red-500 mt-0.5 shrink-0" />
                 <div className="flex-1">
                   <h4 className="text-xs font-black text-red-800 uppercase">Warning: Direct Database Override</h4>
                   <p className="text-xs text-red-600 mt-1">You are modifying marks outside of the normal teacher evaluation flow. This action is logged. Enter marks for students you wish to override and leave others as they are.</p>
                   {overrideError && (
                     <div className="mt-2 p-2 bg-red-100 text-red-700 text-xs font-bold rounded border border-red-200">
                       {overrideError}
                     </div>
                   )}
                 </div>
              </div>

              <div className="flex-1 overflow-y-auto p-6 bg-gray-50 custom-scrollbar">
                <table className="w-full text-left text-sm">
                  <thead className="bg-gray-100 text-gray-500 uppercase text-[10px] font-black tracking-wider rounded-lg border-b border-gray-200">
                    <tr>
                      <th className="p-4 rounded-tl-lg">Student</th>
                      <th className="p-4 w-40">Marks</th>
                      <th className="p-4">Academic Remarks</th>
                      <th className="p-4 w-48">Override Reason *</th>
                      <th className="p-4 rounded-tr-lg"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 bg-white">
                    {overrideStudentMarks.map((override, idx) => {
                      const isModified = override.initialMarks !== "" && parseFloat(override.marksObtained || 0) !== parseFloat(override.initialMarks);
                      const historyCount = override.marksHistory?.length || 0;
                      
                      return (
                      <tr key={override.studentId} className="hover:bg-gray-50 transition-colors">
                        <td className="p-4">
                          <div className="font-bold text-gray-800">{override.name}</div>
                          <div className="text-[10px] text-gray-400 font-medium">Admn: {override.admissionNo}</div>
                        </td>
                        <td className="p-4">
                          {isModified && (
                            <div className="text-[10px] font-bold text-gray-400 mb-1 flex items-center justify-center gap-1">
                              <span className="line-through">{override.initialMarks}</span>
                              <span>→</span>
                            </div>
                          )}
                          <input
                            type="number"
                            min="0"
                            max={activeSession?.type === "TERM" ? 100 : 40}
                            value={override.marksObtained}
                            onChange={(e) => {
                              const newList = [...overrideStudentMarks];
                              newList[idx].marksObtained = e.target.value;
                              setOverrideStudentMarks(newList);
                            }}
                            className={`w-full p-2 border rounded-lg text-sm focus:outline-none focus:ring-2 font-bold text-center ${isModified ? 'border-amber-300 bg-amber-50 focus:ring-amber-200' : 'border-gray-200 focus:ring-red-200'}`}
                            placeholder="-"
                          />
                        </td>
                        <td className="p-4">
                          <input
                            type="text"
                            value={override.remarks}
                            onChange={(e) => {
                              const newList = [...overrideStudentMarks];
                              newList[idx].remarks = e.target.value;
                              setOverrideStudentMarks(newList);
                            }}
                            className="w-full p-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-200"
                            placeholder="e.g. Good performance"
                          />
                        </td>
                        <td className="p-4">
                          <div className="flex flex-col gap-1">
                            <input
                              type="text"
                              disabled={!isModified}
                              value={override.overrideReason || ""}
                              onChange={(e) => {
                                const newList = [...overrideStudentMarks];
                                newList[idx].overrideReason = e.target.value;
                                setOverrideStudentMarks(newList);
                              }}
                              className={`w-full p-2 border rounded-lg text-sm focus:outline-none focus:ring-2 transition-all disabled:bg-gray-50 disabled:text-gray-400
                                ${isModified && !override.overrideReason?.trim() 
                                  ? 'bg-rose-50 border-rose-300 focus:ring-rose-200' 
                                  : 'bg-white border-gray-200 focus:ring-red-200'}`
                              }
                              placeholder={isModified ? "Reason..." : "N/A"}
                            />
                            {isModified && !override.overrideReason?.trim() && (
                              <span className="text-[10px] font-black text-rose-500 uppercase tracking-wider text-right">Required *</span>
                            )}
                          </div>
                        </td>
                        <td className="p-4 text-right">
                          {historyCount > 0 && (
                            <button
                              onClick={() => {
                                setSelectedHistoryStudent({
                                  id: override.studentId,
                                  name: override.name,
                                  admissionNo: override.admissionNo,
                                  marks: override.marksObtained, // current
                                  marksHistory: override.marksHistory
                                });
                                setHistoryDrawerOpen(true);
                              }}
                              className="text-xs font-bold text-blue-600 hover:text-blue-800 bg-blue-50 px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors"
                            >
                              History ({historyCount})
                            </button>
                          )}
                        </td>
                      </tr>
                    )})}
                  </tbody>
                </table>
              </div>

              <div className="p-5 bg-white border-t border-gray-200 flex justify-end gap-3 shrink-0">
                <button
                  onClick={() => setOverrideOpen(false)}
                  className="px-6 py-2.5 rounded-xl text-sm font-bold text-gray-600 hover:bg-gray-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveMarksOverride}
                  className="bg-red-600 text-white px-8 py-2.5 rounded-xl text-sm font-bold shadow-lg hover:bg-red-700 transition-all flex items-center gap-2"
                >
                  Save Overrides
                </button>
              </div>
          </div>
        )}
      </Modal>

      {/* History Drawer */}
      <AnimatePresence>
        {historyDrawerOpen && selectedHistoryStudent && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[60]"
              onClick={() => setHistoryDrawerOpen(false)}
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", bounce: 0, duration: 0.4 }}
              className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-white shadow-2xl z-[70] flex flex-col border-l border-gray-100"
            >
              <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                <div>
                  <h3 className="text-xl font-black text-[#03045e]">Marks History</h3>
                  <p className="text-sm font-bold text-gray-400 mt-1">{selectedHistoryStudent.name} ({selectedHistoryStudent.admissionNo})</p>
                </div>
                <button
                  onClick={() => setHistoryDrawerOpen(false)}
                  className="p-2 hover:bg-gray-200 rounded-full transition-colors"
                >
                  <X size={20} className="text-gray-500" />
                </button>
              </div>
              <div className="p-6 overflow-y-auto flex-1 bg-[#f8fdff]">
                <div className="mb-6 flex justify-between items-center p-4 bg-white rounded-xl shadow-sm border border-gray-100">
                  <span className="text-xs font-black uppercase text-gray-400 tracking-wider">Current Marks</span>
                  <span className="text-2xl font-black text-[#00b4d8]">{selectedHistoryStudent.marks}</span>
                </div>
                <div className="space-y-4 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-gray-200 before:to-transparent">
                  {selectedHistoryStudent.marksHistory?.map((h, i) => (
                    <div key={i} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                      <div className="flex items-center justify-center w-10 h-10 rounded-full border border-white bg-[#caf0f8] text-[#00b4d8] shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow-sm">
                        <span className="text-xs font-black">{i + 1}</span>
                      </div>
                      <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-xl border border-gray-100 bg-white shadow-sm">
                        <div className="flex justify-between items-start mb-2">
                          <span className={`text-[10px] font-black tracking-wider uppercase px-2 py-1 rounded-md ${h.role === 'Admin' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'}`}>
                            {h.role}
                          </span>
                          <span className="text-[10px] font-bold text-gray-400">
                            {new Date(h.timestamp).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-sm font-bold text-gray-500">Marks:</span>
                          {h.previousMarks !== null && (
                            <>
                              <span className="text-sm font-medium text-gray-400 line-through">{h.previousMarks}</span>
                              <span className="text-gray-300">→</span>
                            </>
                          )}
                          <span className="text-lg font-black text-[#03045e]">{h.newMarks}</span>
                        </div>
                        <div className="text-sm">
                          <span className="font-bold text-gray-500 block mb-0.5">Reason:</span>
                          <p className="text-gray-700 font-medium">{h.overrideReason}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

    </motion.div>
  );
};

export default EvaluationCenterPage;
