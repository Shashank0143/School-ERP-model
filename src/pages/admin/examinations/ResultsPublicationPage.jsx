import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FileText, CheckCircle, Search, FileCheck, AlertCircle, Eye, Printer, 
  X, Check, Lock, Send, Download, BarChart2, User
} from "lucide-react";
import AdminPageHeader from "../../../components/admin/AdminPageHeader";
import MainCard from "../../../components/MainCard";
import ExaminationWorkspaceNav from "./components/ExaminationWorkspaceNav";
import {
  getExams,
  getExamPapers,
  submitMarks,
  getParticipatingClasses,
  getScheduledExamPapers
} from "../../../services/examService";
import { getDataProvider } from "../../../data";
import EmptyState from "../../../components/common/EmptyState";
import SearchFilterBar from "../../../components/common/SearchFilterBar";
import StatusBadge from "../../../components/common/StatusBadge";
import ProgressCard from "../../../components/common/ProgressCard";
import Drawer from "../../../components/common/Drawer";
import Modal from "../../../components/common/Modal";

const ResultsPublicationPage = () => {
  const [sessions, setSessions] = useState([]);
  const [papers, setPapers] = useState([]);
  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [students, setStudents] = useState([]);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);

  // Selectors
  const [activeSessionId, setActiveSessionId] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  // Modals
  const [reportCardPreviewOpen, setReportCardPreviewOpen] = useState(false);
  const [reportCardStudentId, setReportCardStudentId] = useState(null);
  const [publishConfirmOpen, setPublishConfirmOpen] = useState(false);

  const fetchBaseData = async () => {
    setLoading(true);
    try {
      const provider = getDataProvider();
      const [allSessions, allPapers, allClasses, allSubjects, allStudents, allResults] = await Promise.all([
        getExams(),
        getExamPapers(),
        provider.getClasses(),
        provider.getSubjects(),
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
      setStudents(allStudents || []);
      setResults(allResults || []);
      
      const pubSessions = normalizedSessions.filter(s => ['evaluation', 'published'].includes(s.status));
      if (pubSessions.length > 0 && !activeSessionId) {
        // Prefer evaluation sessions first, then published
        const evalSession = pubSessions.find(s => s.status === 'evaluation');
        setActiveSessionId(evalSession ? evalSession.id : pubSessions[0].id);
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

  const hasActiveExam = sessions.some(s => ["ongoing", "evaluation", "scheduled", "published"].includes(s.status));
  const activeSession = useMemo(() => sessions.find(s => s.id === activeSessionId), [sessions, activeSessionId]);
  
  // Published sessions for bottom table
  const publishedSessions = useMemo(() => sessions.filter(s => s.status === 'published'), [sessions]);

  // Derived Readiness Data
  const readinessData = useMemo(() => {
    if (!activeSessionId) return null;

    const sessionPapers = getScheduledExamPapers(activeSession, papers, subjects);
    let totalExpectedMarks = 0;
    let totalReceivedMarks = 0;
    let missingMarksList = [];

    // Figure out expected students for each paper based on class
    sessionPapers.forEach(paper => {
      const classStudents = students.filter(s => s.classId === paper.classId);
      totalExpectedMarks += classStudents.length;

      const paperResults = results.filter(r => r.examId === activeSessionId && r.subjectId === paper.subjectId && r.classId === paper.classId);
      totalReceivedMarks += paperResults.length;

      // Find missing students for reporting
      classStudents.forEach(student => {
        if (!paperResults.find(r => r.studentId === student.id)) {
          const cls = classes.find(c => c.id === paper.classId);
          const sub = subjects.find(s => s.id === paper.subjectId);
          const nameToDisplay = student.name || `${student.firstName || ''} ${student.lastName || ''}`.trim() || 'Unknown Student';
          missingMarksList.push({
            studentName: nameToDisplay,
            className: cls ? cls.name : paper.classId,
            subjectName: sub ? sub.name : paper.subjectId
          });
        }
      });
    });

    const isEvaluationCompleted = missingMarksList.length === 0 && totalExpectedMarks > 0;
    const isReadyForPublication = isEvaluationCompleted;
    
    // Total students involved
    const involvedClassIds = new Set(sessionPapers.map(p => p.classId));
    const totalStudentsInvolved = students.filter(s => involvedClassIds.has(s.classId)).length;

    return {
      totalExpectedMarks,
      totalReceivedMarks,
      missingMarksList,
      isEvaluationCompleted,
      isReadyForPublication,
      totalStudentsInvolved,
      overallReadiness: totalExpectedMarks === 0 ? 0 : Math.round((totalReceivedMarks / totalExpectedMarks) * 100),
      isPublished: activeSession?.status === 'published',
      isFrozen: activeSession?.isFrozen || false,
      publishedAt: activeSession?.publishedAt,
      sessionPapers
    };
  }, [activeSessionId, papers, classes, subjects, students, results, activeSession]);


  // Summary Table Data
  // Summary Table Data
  const summaryData = useMemo(() => {
    if (!readinessData || !activeSession) return [];
    
    const participatingClasses = getParticipatingClasses(activeSession, classes);

    // Group by class
    const classMap = new Map();
    
    // Initialize map with ALL participating classes
    participatingClasses.forEach(cls => {
      classMap.set(cls.id, {
        classId: cls.id,
        className: cls.name,
        papersCount: 0,
        expectedMarks: 0,
        receivedMarks: 0,
        students: students.filter(s => s.classId === cls.id)
      });
    });

    readinessData.sessionPapers.forEach(paper => {
      if(!classMap.has(paper.classId)) return;
      
      const c = classMap.get(paper.classId);
      c.papersCount++;
      c.expectedMarks += c.students.length;
      
      const paperResults = results.filter(r => r.examId === activeSessionId && r.subjectId === paper.subjectId && r.classId === paper.classId);
      c.receivedMarks += paperResults.length;
    });

    return Array.from(classMap.values()).filter(d => {
      if (searchQuery) {
        return d.className.toLowerCase().includes(searchQuery.toLowerCase());
      }
      return true;
    });
  }, [readinessData, classes, students, results, activeSessionId, searchQuery]);


  // Report Card Preview Logic
  const handleOpenReportCardPreview = (studentId) => {
    setReportCardStudentId(studentId);
    setReportCardPreviewOpen(true);
  };

  const reportCardData = useMemo(() => {
    if (!reportCardStudentId || !activeSessionId) return null;

    const stud = students.find((s) => s.id === reportCardStudentId);
    const cls = classes.find((c) => c.id === stud?.classId);
    const studResults = results.filter(
      (r) => r.studentId === reportCardStudentId && r.examId === activeSessionId
    );

    const scoredRows = studResults.map((r) => {
      const sub = subjects.find((s) => s.id === r.subjectId);
      return {
        subjectName: sub?.name || r.subjectId,
        marksObtained: r.marksObtained,
        maxMarks: r.maxMarks,
        grade: r.grade,
        remarks: r.remarks,
      };
    });

    const totalMax = scoredRows.reduce((sum, r) => sum + Number(r.maxMarks || 0), 0);
    const totalObtained = scoredRows.reduce((sum, r) => sum + Number(r.marksObtained || 0), 0);
    const overallPercentage = totalMax > 0 ? ((totalObtained / totalMax) * 100).toFixed(1) : "0.0";

    return {
      studentName: stud ? (stud.name || `${stud.firstName || ''} ${stud.lastName || ''}`.trim() || 'Unknown Student') : "Unknown Student",
      admissionNo: stud ? stud.rollNumber : "Unknown",
      className: cls ? cls.name : "Unknown Class",
      scoredRows,
      totalMax,
      totalObtained,
      overallPercentage
    };
  }, [results, activeSessionId, students, reportCardStudentId, classes, subjects]);


  // Publication Actions
  const handlePublish = async () => {
    try {
      const provider = getDataProvider();
      await provider.updateExam(activeSessionId, { 
        ...activeSession, 
        status: 'published', 
        publishedAt: new Date().toISOString() 
      });
      await fetchBaseData();
      setPublishConfirmOpen(false);
    } catch (err) {
      console.error("Failed to publish", err);
    }
  };

  const handleFreeze = async () => {
    try {
      const provider = getDataProvider();
      await provider.updateExam(activeSessionId, { 
        ...activeSession, 
        isFrozen: true 
      });
      await fetchBaseData();
    } catch (err) {
      console.error("Failed to freeze", err);
    }
  };


  // --- EARLY RETURN FOR EMPTY STATE ---
  if (!loading && (!activeSessionId || sessions.filter(s => ['evaluation', 'published'].includes(s.status)).length === 0)) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6 pb-12">
        <AdminPageHeader
          title="Results & Publication"
          subtitle="Verify evaluation readiness, preview report cards, and publish results"
          icon={<FileCheck className="text-[#0077b6]" size={28} />}
        />
        <ExaminationWorkspaceNav activeTab="results" hasActiveExam={hasActiveExam} />
        <MainCard className="h-[400px] flex items-center justify-center bg-white border border-dashed border-gray-300">
          <EmptyState 
            icon={AlertCircle}
            title="No Examinations Ready"
            description="Results Publication becomes available when an examination enters the Evaluation or Published stage."
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
      <div className="print:hidden space-y-6">
        <AdminPageHeader
          title="Results & Publication"
          subtitle="Verify evaluation readiness, preview report cards, and publish results"
          icon={<FileCheck className="text-[#0077b6]" size={28} />}
          onRefresh={fetchBaseData}
        />
        <ExaminationWorkspaceNav activeTab="results" hasActiveExam={hasActiveExam} />

      {/* --- ACTIVE CYCLE SELECTOR --- */}
      <div className="bg-white rounded-2xl p-4 flex flex-col md:flex-row items-center gap-4 border border-gray-100 shadow-sm">
        <div className="flex-1">
          <label className="text-[10px] uppercase font-black text-gray-500 tracking-wider">Evaluation / Published Cycle</label>
          <select
            value={activeSessionId}
            onChange={(e) => setActiveSessionId(e.target.value)}
            className="w-full mt-1.5 p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold text-[#03045e] focus:outline-none focus:ring-2 focus:ring-[#0077b6]/20"
          >
            {sessions.filter(s => ['evaluation', 'published'].includes(s.status)).map(s => (
              <option key={s.id} value={s.id}>{s.name} ({s.academicYear}) - {s.status.toUpperCase()}</option>
            ))}
          </select>
        </div>
      </div>

      {readinessData && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* LEFT: MAIN PUBLICATION DASHBOARD */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <ProgressCard title="Students" value={readinessData.totalStudentsInvolved} icon={User} colorClass="blue" />
              <ProgressCard title="Ready Marks" value={readinessData.totalReceivedMarks} icon={CheckCircle} colorClass="emerald" />
              <ProgressCard title="Pending" value={readinessData.totalExpectedMarks - readinessData.totalReceivedMarks} icon={AlertCircle} colorClass="rose" />
              <ProgressCard title="Readiness" value={`${readinessData.overallReadiness}%`} icon={BarChart2} colorClass="blue" />
            </div>

            {/* Summary Table */}
            <MainCard className="bg-white border border-gray-100 overflow-hidden shadow-sm">
              <div className="px-6 py-4 border-b border-gray-50 flex justify-between items-center bg-gray-50/50">
                <h3 className="text-sm font-black text-[#03045e] uppercase tracking-wider flex items-center gap-2">
                  <BarChart2 size={16} className="text-blue-500"/> Result Summary By Class
                </h3>
                <div className="relative w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                  <input
                    type="text"
                    placeholder="Search class..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-8 pr-4 py-1.5 bg-white border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-[#0077b6]/20"
                  />
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-gray-50/50 text-gray-400 uppercase text-[10px] font-black tracking-wider border-b border-gray-100">
                    <tr>
                      <th className="px-6 py-4">Class</th>
                      <th className="px-6 py-4">Students</th>
                      <th className="px-6 py-4">Papers</th>
                      <th className="px-6 py-4">Evaluation Progress</th>
                      <th className="px-6 py-4 text-right">Preview</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {summaryData.map(data => {
                      const p = data.expectedMarks === 0 ? 0 : Math.round((data.receivedMarks / data.expectedMarks) * 100);
                      const isComplete = p === 100;
                      return (
                        <tr key={data.classId} className="hover:bg-gray-50/50 transition-colors">
                          <td className="px-6 py-4">
                            <div className="font-bold text-[#03045e]">{data.className}</div>
                          </td>
                          <td className="px-6 py-4 font-semibold text-gray-600">{data.students.length}</td>
                          <td className="px-6 py-4 font-semibold text-gray-600">{data.papersCount}</td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-full h-1.5 bg-gray-100 rounded-full max-w-[100px] overflow-hidden">
                                <div className={`h-full rounded-full ${isComplete ? 'bg-emerald-500' : 'bg-blue-500'}`} style={{width: `${p}%`}} />
                              </div>
                              <span className="text-xs font-bold text-gray-500">{data.receivedMarks}/{data.expectedMarks}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-right">
                            {data.students.length > 0 ? (
                              <button 
                                onClick={() => handleOpenReportCardPreview(data.students[0].id)}
                                className="text-blue-600 font-bold text-[10px] uppercase tracking-wider hover:text-blue-800 transition-colors inline-flex items-center gap-1"
                              >
                                <Eye size={12}/> Sample
                              </button>
                            ) : (
                              <span className="text-[10px] text-gray-400 font-medium">N/A</span>
                            )}
                          </td>
                        </tr>
                      )
                    })}
                    {summaryData.length === 0 && (
                      <tr>
                        <td colSpan="5" className="p-0">
                          <EmptyState 
                            icon={BarChart2} 
                            title="No Classes Found" 
                            description="No classes found." 
                          />
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </MainCard>
          </div>

          {/* RIGHT: READINESS & PUBLICATION ACTION */}
          <div className="space-y-6">
            
            {/* Readiness Checklist */}
            <MainCard className="bg-white border border-gray-100 overflow-hidden shadow-sm">
              <div className="px-5 py-4 border-b border-gray-50 bg-gray-50/50">
                <h3 className="text-xs font-black text-[#03045e] uppercase tracking-wider flex items-center gap-2">
                  <CheckCircle size={14} className="text-emerald-500"/> Publication Readiness
                </h3>
              </div>
              <div className="p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-gray-700">Evaluation Completed</span>
                  {readinessData.isEvaluationCompleted ? (
                    <Check className="text-emerald-500" size={18} />
                  ) : (
                    <X className="text-red-500" size={18} />
                  )}
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-gray-700">Missing Marks</span>
                  <span className={`text-sm font-black ${readinessData.missingMarksList.length > 0 ? 'text-red-500' : 'text-emerald-500'}`}>
                    {readinessData.missingMarksList.length}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-gray-700">Override Pending</span>
                  <span className="text-sm font-black text-emerald-500">0</span>
                </div>
                
                <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
                  <span className="text-sm font-black text-[#03045e] uppercase tracking-wider">Ready for Publication</span>
                  <span className={`text-sm font-black uppercase tracking-wider ${readinessData.isReadyForPublication ? 'text-emerald-500' : 'text-red-500'}`}>
                    {readinessData.isReadyForPublication ? 'YES' : 'NO'}
                  </span>
                </div>

                {!readinessData.isReadyForPublication && readinessData.missingMarksList.length > 0 && (
                  <div className="mt-4 p-3 bg-red-50 border border-red-100 rounded-lg text-xs text-red-700 font-medium">
                    {readinessData.missingMarksList.length} students still have missing marks. Please complete evaluation before publishing.
                  </div>
                )}
              </div>
            </MainCard>

            {/* Publication Panel */}
            <MainCard className="bg-white border border-gray-100 overflow-hidden shadow-sm">
              <div className="px-5 py-4 border-b border-gray-50 bg-gray-50/50">
                <h3 className="text-xs font-black text-[#03045e] uppercase tracking-wider flex items-center gap-2">
                  <Send size={14} className="text-blue-500"/> Publication Actions
                </h3>
              </div>
              <div className="p-5">
                {readinessData.isPublished ? (
                  <div className="space-y-4">
                    <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-xl flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
                        <Check size={20} />
                      </div>
                      <div>
                        <h4 className="text-sm font-black text-emerald-800 uppercase">Results Published</h4>
                        <p className="text-[10px] text-emerald-600 font-bold mt-0.5">
                          Date: {new Date(readinessData.publishedAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    {!readinessData.isFrozen ? (
                      <button 
                        onClick={handleFreeze}
                        className="w-full py-3 rounded-xl bg-amber-50 text-amber-700 font-black text-sm hover:bg-amber-100 transition-colors border border-amber-200 flex items-center justify-center gap-2"
                      >
                        <Lock size={16} /> Freeze Results
                      </button>
                    ) : (
                      <div className="p-3 bg-gray-100 border border-gray-200 rounded-xl flex items-center justify-center gap-2 text-gray-500 text-sm font-bold">
                        <Lock size={16} /> Frozen (Read Only)
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-4">
                    <p className="text-xs text-gray-500 font-medium leading-relaxed">
                      Publishing results makes them visible on the Student and Parent portals. Ensure all evaluations are verified.
                    </p>
                    <button
                      disabled={!readinessData.isReadyForPublication}
                      onClick={() => setPublishConfirmOpen(true)}
                      className={`w-full py-3.5 rounded-xl font-black text-sm uppercase tracking-wider transition-all shadow-md flex items-center justify-center gap-2 ${
                        readinessData.isReadyForPublication 
                          ? 'bg-[#03045e] text-white hover:bg-[#023e8a]' 
                          : 'bg-gray-200 text-gray-400 cursor-not-allowed shadow-none'
                      }`}
                    >
                      <Send size={16} /> Publish Results
                    </button>
                  </div>
                )}
              </div>
            </MainCard>
          </div>
        </div>
      )}

      {/* --- PUBLISHED SESSIONS HISTORY TABLE --- */}
      <MainCard className="bg-white border border-gray-100 overflow-hidden shadow-sm mt-8">
        <div className="px-6 py-4 border-b border-gray-50 flex justify-between items-center bg-gray-50/50">
          <h3 className="text-sm font-black text-[#03045e] uppercase tracking-wider flex items-center gap-2">
            <CheckCircle size={16} className="text-emerald-500"/> Published Sessions History
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50/50 text-gray-400 uppercase text-[10px] font-black tracking-wider border-b border-gray-100">
              <tr>
                <th className="px-6 py-4">Exam Name</th>
                <th className="px-6 py-4">Academic Year</th>
                <th className="px-6 py-4">Published Date</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {publishedSessions.map(session => (
                <tr key={session.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4 font-bold text-[#03045e]">{session.name}</td>
                  <td className="px-6 py-4 font-semibold text-gray-600">{session.academicYear}</td>
                  <td className="px-6 py-4 text-xs font-semibold text-gray-500">
                    {session.publishedAt ? new Date(session.publishedAt).toLocaleDateString() : 'N/A'}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-2 py-1 rounded text-[10px] font-black uppercase tracking-wider ${
                      session.isFrozen ? 'bg-amber-50 text-amber-600 border border-amber-200' : 'bg-emerald-50 text-emerald-600 border border-emerald-200'
                    }`}>
                      {session.isFrozen ? 'Frozen' : 'Published'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button 
                      onClick={() => setActiveSessionId(session.id)}
                      className="text-blue-600 font-bold text-[10px] uppercase tracking-wider hover:text-blue-800 transition-colors inline-flex items-center gap-1"
                    >
                      <Eye size={12}/> View Details
                    </button>
                  </td>
                </tr>
              ))}
              {publishedSessions.length === 0 && (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-gray-400 font-medium">
                    No published sessions found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </MainCard>
      </div>


      {/* ── MODALS ── */}

      {/* REPORT CARD INST PREVIEW */}
      <Modal
        isOpen={reportCardPreviewOpen}
        onClose={() => setReportCardPreviewOpen(false)}
        title="Institutional Report Card Preview"
        subtitle={`Printable Sheet Generation | ${activeSession?.name}`}
        maxWidth="lg:max-w-2xl"
      >
        {reportCardData && (
          <div className="flex flex-col h-full max-h-[85vh] print:max-h-none">
              {/* Printable sheet container */}
              <div id="print-area" className="p-8 space-y-6 overflow-y-auto flex-1 bg-neutral-50/50 custom-scrollbar print:p-0 print:bg-white print:overflow-visible">
                <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-6 font-serif text-[#03045e] print:border-none print:shadow-none print:p-0">
                  {/* Institutional Header */}
                  <div className="text-center space-y-1 pb-4 border-b border-double border-gray-300">
                    <h2 className="text-base font-black uppercase tracking-widest font-sans">
                      SPRINGDALE SENIOR SECONDARY SCHOOL
                    </h2>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider font-sans">
                      Affiliated with CBSE, New Delhi | Institutional Campus
                    </p>
                    <h3 className="text-xs font-black uppercase tracking-widest underline pt-2 text-[#0077b6] font-sans">
                      REPORT SHEET: {activeSession?.name?.toUpperCase()}
                    </h3>
                  </div>

                  {/* Student Specs */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-bold font-sans">
                    <div className="space-y-1">
                      <p className="text-gray-400 font-medium">Student Name:</p>
                      <p className="text-sm font-black text-[#03045e]">{reportCardData.studentName}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-gray-400 font-medium">Admission Number:</p>
                      <p className="text-sm font-black text-[#03045e]">{reportCardData.admissionNo}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-gray-400 font-medium">Academic Class:</p>
                      <p className="text-sm font-black text-[#03045e]">{reportCardData.className}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-gray-400 font-medium">Academic Year:</p>
                      <p className="text-sm font-black text-[#03045e]">{activeSession?.academicYear}</p>
                    </div>
                  </div>

                  {/* Grades board */}
                  <div className="overflow-x-auto w-full">
                    <table className="w-full border-collapse text-left text-xs font-sans">
                      <thead>
                        <tr className="bg-gray-50 border-b border-t border-gray-200 text-gray-500 uppercase tracking-widest font-black text-[10px]">
                          <th className="py-3 px-4">Subject</th>
                          <th className="py-3 px-4 text-center">Max Marks</th>
                          <th className="py-3 px-4 text-center">Obtained</th>
                          <th className="py-3 px-4 text-center">Grade</th>
                          <th className="py-3 px-4">Remarks</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {reportCardData.scoredRows.map((row, idx) => (
                          <tr key={idx} className="hover:bg-gray-50/50">
                            <td className="py-3 px-4 font-bold text-gray-800">{row.subjectName}</td>
                            <td className="py-3 px-4 text-center font-medium text-gray-500">{row.maxMarks}</td>
                            <td className="py-3 px-4 text-center font-black text-[#0077b6]">{row.marksObtained}</td>
                            <td className="py-3 px-4 text-center">
                              <span className="px-2 py-0.5 bg-gray-100 rounded text-gray-700 font-black">{row.grade}</span>
                            </td>
                            <td className="py-3 px-4 text-[10px] text-gray-500 italic">{row.remarks}</td>
                          </tr>
                        ))}
                        {reportCardData.scoredRows.length === 0 && (
                          <tr>
                            <td colSpan={5} className="py-8 text-center text-gray-400 font-sans">
                              No results available.
                            </td>
                          </tr>
                        )}
                      </tbody>
                      {reportCardData.scoredRows.length > 0 && (
                        <tfoot>
                          <tr className="border-t border-b border-gray-200 bg-gray-50">
                            <td className="py-3 px-4 font-black text-[#03045e] uppercase tracking-wider">Grand Total</td>
                            <td className="py-3 px-4 text-center font-black text-gray-700">{reportCardData.totalMax}</td>
                            <td className="py-3 px-4 text-center font-black text-[#03045e]">{reportCardData.totalObtained}</td>
                            <td colSpan={2} className="py-3 px-4 text-right">
                              <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mr-2">Overall %</span>
                              <span className="text-lg font-black text-emerald-600">{reportCardData.overallPercentage}%</span>
                            </td>
                          </tr>
                        </tfoot>
                      )}
                    </table>
                  </div>

                  <div className="flex justify-between items-end pt-12 pb-4 font-sans text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                    <div className="border-t border-gray-300 w-32 text-center pt-2">Class Teacher</div>
                    <div className="border-t border-gray-300 w-32 text-center pt-2">Principal</div>
                    <div className="border-t border-gray-300 w-32 text-center pt-2">Parent/Guardian</div>
                  </div>
                </div>
              </div>

              <div className="p-6 bg-gray-50 border-t border-gray-100 flex justify-end gap-3 shrink-0 print:hidden">
                <button
                  onClick={() => window.print()}
                  className="px-6 py-2.5 rounded-xl bg-blue-50 text-blue-600 font-bold hover:bg-blue-100 transition-colors text-sm flex items-center gap-2"
                >
                  <Printer size={16} /> Print Report
                </button>
                <button
                  onClick={() => setReportCardPreviewOpen(false)}
                  className="px-6 py-2.5 rounded-xl bg-gray-200 text-gray-700 font-bold hover:bg-gray-300 transition-colors text-sm"
                >
                  Close Preview
                </button>
              </div>
          </div>
        )}
      </Modal>

      {/* PUBLISH CONFIRMATION DIALOG */}
      <Modal
        isOpen={publishConfirmOpen}
        onClose={() => setPublishConfirmOpen(false)}
        maxWidth="max-w-sm"
      >
          <div className="text-center">
              <div className="p-6 pt-10">
                <div className="w-16 h-16 bg-[#03045e] rounded-full flex items-center justify-center mx-auto mb-4 text-white shadow-lg">
                  <Send size={28} />
                </div>
                <h3 className="text-xl font-black text-[#03045e] mb-2">Publish Results?</h3>
                <p className="text-sm text-gray-500 font-medium leading-relaxed px-4">
                  Once published, students and parents will be able to view their results immediately on their portals.
                </p>
              </div>
              <div className="p-4 bg-gray-50 flex gap-3">
                <button
                  onClick={() => setPublishConfirmOpen(false)}
                  className="flex-1 py-3 rounded-xl bg-white border border-gray-200 text-gray-600 font-bold text-sm hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handlePublish}
                  className="flex-1 py-3 rounded-xl bg-[#03045e] text-white font-black text-sm shadow-md hover:bg-[#023e8a] transition-colors"
                >
                  Publish
                </button>
              </div>
          </div>
      </Modal>

    </motion.div>
  );
};

export default ResultsPublicationPage;
