import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Calendar as CalendarIcon, Clock, MapPin, UserCheck, X, Edit, Trash2, 
  Search, Shuffle, ArrowRight, Eye, Play, Plus, BookOpen, User, CheckCircle2, AlertCircle
} from "lucide-react";
import AdminPageHeader from "../../../components/admin/AdminPageHeader";
import MainCard from "../../../components/MainCard";
import ExaminationWorkspaceNav from "./components/ExaminationWorkspaceNav";
import { 
  getExams, 
  getExamPapers, 
  createExamPaper,
  updateExamPaper,
  deleteExamPaper,
  getTargetClasses,
  getParticipatingClasses,
  getAcademicSubjects,
  getCycleBasedDate,
  parseCycleDateLocal,
  toLocalISOString
} from "../../../services/examService";
import { getDataProvider } from "../../../data";
import SearchFilterBar from "../../../components/common/SearchFilterBar";
import StatusBadge from "../../../components/common/StatusBadge";
import EmptyState from "../../../components/common/EmptyState";
import { getSubjectsForClassLevel, getCoreSubjectsForStream, OPTIONAL_SUBJECTS } from "../../../data/subjectArchitecture";
import ScheduleCard from "../../../components/examinations/ScheduleCard";
import Modal from "../../../components/common/Modal";
import Drawer from "../../../components/common/Drawer";

// Status definitions mapping to colors and labels
const STATUS_CONFIG = {
  draft: { label: "Draft", color: "bg-gray-100 text-gray-700 border-gray-200" },
  ready_for_scheduling: { label: "Ready for Scheduling", color: "bg-yellow-100 text-yellow-800 border-yellow-200" },
  scheduled: { label: "Scheduled", color: "bg-blue-100 text-blue-800 border-blue-200" },
};

const DateSheetsPage = () => {
  const [sessions, setSessions] = useState([]);
  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [papers, setPapers] = useState([]);
  const [teacherAssignments, setTeacherAssignments] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters & State
  const [activeSessionId, setActiveSessionId] = useState("");
  const [activeClassId, setActiveClassId] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [roomFilter, setRoomFilter] = useState("all");
  const [invigilatorFilter, setInvigilatorFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all"); // scheduled, unscheduled

  // Modals & Drawers
  const [createPaperOpen, setCreatePaperOpen] = useState(false);
  const [selectedPaper, setSelectedPaper] = useState(null);
  const [schedulePaperOpen, setSchedulePaperOpen] = useState(false);
  const [conflictModalOpen, setConflictModalOpen] = useState(false);
  const [selectedPaperForDrawer, setSelectedPaperForDrawer] = useState(null);

  // Form State
  const [paperForm, setPaperForm] = useState({
    id: null,
    examSessionId: "",
    classId: "",
    subjectId: "",
    date: "",
    startTime: "09:00",
    endTime: "10:00",
    roomId: "",
    invigilatorTeacherIds: [],
    remarks: "",
    status: "scheduled"
  });

  const fetchBaseData = async () => {
    setLoading(true);
    try {
      const provider = getDataProvider();
      const [allSessions, allPapers, allClasses, allSubjects, allTeachers, allRooms, allAssignments] = await Promise.all([
        getExams(),
        getExamPapers(),
        provider.getClasses(),
        provider.getSubjects(),
        provider.getEmployees(), // Assuming teachers are among employees
        provider.getRooms ? provider.getRooms() : [],
        provider.getTeacherSubjectAssignments ? provider.getTeacherSubjectAssignments() : []
      ]);

      const SCHEDULEABLE = ["draft", "ready_for_scheduling", "scheduled"];
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
      setSubjects(getAcademicSubjects(allSubjects || []));
      setTeachers((allTeachers || []).filter(e => e.designation && e.designation.toLowerCase().includes('teacher')));
      setRooms(allRooms || []);
      setTeacherAssignments(allAssignments || []);
      
      // Auto-select first SCHEDULEABLE session only — so it always appears in the dropdown
      if (!activeSessionId) {
        const active = normalizedSessions.find(s => SCHEDULEABLE.includes(s.status));
        if (active) setActiveSessionId(active.id);
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

  const activeSession = useMemo(() => sessions.find(s => s.id === activeSessionId), [sessions, activeSessionId]);
  
  const participatingClasses = useMemo(() => {
    return getParticipatingClasses(activeSession, classes);
  }, [activeSession, classes]);

  const hasActiveExam = sessions.some(s => ["ongoing", "evaluation", "scheduled"].includes(s.status));

  // Determine subjects for the selected class using Teacher Subject Assignments.
  // This is the stream-correct approach: the TSA seed already encodes which subjects
  // belong to which class/stream, so we never need to re-derive stream membership
  // from a separate streamApplicability field.
  const classSubjects = useMemo(() => {
    if (!activeClassId) return [];

    // Get subject IDs assigned to this class via TSA
    const assignedSubjectIds = teacherAssignments
      .filter(a => a.classId === activeClassId)
      .map(a => a.subjectId);

    if (assignedSubjectIds.length === 0) {
      // Fallback: use global subject filter if TSA is empty (edge case for new classes)
      const cls = classes.find(c => c.id === activeClassId);
      if (!cls) return [];
      return subjects.filter(sub => {
        if (sub.applicableClasses && !sub.applicableClasses.includes(cls.classLevel)) return false;
        if (["11", "12"].includes(cls.classLevel) && cls.streamId) {
          if (sub.streamApplicability && sub.streamApplicability.length > 0) {
            return sub.streamApplicability.includes(cls.streamId);
          }
          // Sub with empty streamApplicability = applicable to all streams in senior secondary
          return true;
        }
        return true;
      });
    }

    // Resolve full subject objects, filtering to academic subjects only
    return subjects.filter(sub => assignedSubjectIds.includes(sub.id || sub.subjectId));
  }, [subjects, activeClassId, classes, teacherAssignments]);

  // Combine subjects with their scheduled papers
  const scheduleMatrix = useMemo(() => {
    if (!activeSessionId || !activeClassId) return [];
    
    return classSubjects.map(sub => {
      const paper = papers.find(p => p.examSessionId === activeSessionId && p.classId === activeClassId && p.subjectId === sub.id);
      
      let isVisible = true;
      if (searchQuery && !sub.name.toLowerCase().includes(searchQuery.toLowerCase())) isVisible = false;
      if (statusFilter === "scheduled" && !paper) isVisible = false;
      if (statusFilter === "unscheduled" && paper) isVisible = false;
      if (roomFilter !== "all" && paper?.roomId !== roomFilter) isVisible = false;
      if (invigilatorFilter !== "all" && (!paper || !paper.invigilatorTeacherIds?.includes(invigilatorFilter))) isVisible = false;
      
      return { subject: sub, paper, isVisible };
    }).filter(row => row.isVisible);
  }, [classSubjects, papers, activeSessionId, activeClassId, searchQuery, statusFilter, roomFilter, invigilatorFilter]);

  // --- Helpers ---
  const formatDateDisplay = (dateStr) => {
    if (!dateStr) return '-';
    const [y, m, d] = dateStr.split('-');
    return `${d} ${m} ${y}`;
  };

  // --- Handlers ---
  
  const handleOpenSchedule = (subjectId, existingPaper = null) => {
    if (existingPaper) {
      setPaperForm({
        id: existingPaper.id,
        examSessionId: existingPaper.examSessionId,
        classId: existingPaper.classId,
        subjectId: existingPaper.subjectId,
        date: existingPaper.date || "",
        startTime: existingPaper.startTime || "09:00",
        endTime: existingPaper.endTime || "10:00",
        roomId: existingPaper.roomId || "",
        invigilatorTeacherIds: existingPaper.invigilatorTeacherIds || [],
        remarks: existingPaper.remarks || "",
        status: existingPaper.status || "scheduled"
      });
    } else {
      setPaperForm({
        id: null,
        examSessionId: activeSessionId,
        classId: activeClassId,
        subjectId: subjectId,
        date: "",
        startTime: "09:00",
        endTime: "10:00",
        roomId: "",
        invigilatorTeacherIds: [],
        remarks: "",
        status: "scheduled"
      });
    }
    setSchedulePaperOpen(true);
  };

  const handleSavePaper = async () => {
    if (!paperForm.date || !paperForm.startTime || !paperForm.roomId) {
      alert("Please fill in Date, Time, and Room.");
      return;
    }
    try {
      if (paperForm.id) {
        await updateExamPaper(paperForm.id, paperForm);
      } else {
        await createExamPaper(paperForm);
      }
      await fetchBaseData();
      setSchedulePaperOpen(false);
    } catch (e) {
      console.error(e);
      alert(e.message || "Failed to save paper schedule");
    }
  };

  // Bulk Actions
  const handleAutoSchedule = async () => {
    if (!window.confirm("Auto-schedule all unscheduled subjects consecutively?")) return;
    
    const session = sessions.find(s => s.id === activeSessionId);
    let currentDate = getCycleBasedDate(session);
    if (!session?.startDate) currentDate.setDate(currentDate.getDate() + 1);

    const endDate = session?.endDate ? parseCycleDateLocal(session.endDate) : null;

    for (const row of scheduleMatrix) {
      if (!row.paper) {
        // Skip Sundays
        while (currentDate.getDay() === 0) {
          currentDate.setDate(currentDate.getDate() + 1);
        }
        
        if (endDate && currentDate > endDate) {
          alert("Auto-scheduling exceeded the exam cycle end date. Please adjust dates manually.");
          break; // Stop auto-scheduling if we pass the end date
        }
        
        const dateStr = toLocalISOString(currentDate);
        
        await createExamPaper({
          examSessionId: activeSessionId,
          classId: activeClassId,
          subjectId: row.subject.id,
          date: dateStr,
          startTime: "09:00",
          endTime: "11:00",
          roomId: rooms[0]?.id || "",
          invigilatorTeacherIds: [],
          status: "scheduled"
        });
        
        currentDate.setDate(currentDate.getDate() + 1); // next day
      }
    }
    await fetchBaseData();
  };

  const handleAvoidSundays = async () => {
    let changed = false;
    const session = sessions.find(s => s.id === activeSessionId);
    const endDate = session?.endDate ? parseCycleDateLocal(session.endDate) : null;

    for (const row of scheduleMatrix) {
      if (row.paper && row.paper.date) {
        const d = parseCycleDateLocal(row.paper.date);
        if (d.getDay() === 0) { // Sunday
          d.setDate(d.getDate() + 1); // Move to Monday
          if (endDate && d > endDate) {
            alert(`Cannot shift ${row.subject.name} to Monday as it exceeds the exam end date.`);
            continue;
          }
          await updateExamPaper(row.paper.id, { date: toLocalISOString(d) });
          changed = true;
        }
      }
    }
    if (changed) await fetchBaseData();
  };

  const handleShiftDates = async (days) => {
    const session = sessions.find(s => s.id === activeSessionId);
    const endDate = session?.endDate ? parseCycleDateLocal(session.endDate) : null;
    let exceeded = false;

    for (const row of scheduleMatrix) {
      if (row.paper && row.paper.date) {
        const d = parseCycleDateLocal(row.paper.date);
        d.setDate(d.getDate() + days);
        if (endDate && d > endDate) {
          exceeded = true;
          continue;
        }
        await updateExamPaper(row.paper.id, { date: toLocalISOString(d) });
      }
    }
    if (exceeded) alert("Some dates were not shifted because they would exceed the exam cycle end date.");
    await fetchBaseData();
  };

  const handleAutoGap = async () => {
    if (!window.confirm("Insert a 1-day gap between all scheduled papers for this class?")) return;
    
    const scheduledRows = scheduleMatrix.filter(r => r.paper && r.paper.date)
      .sort((a, b) => parseCycleDateLocal(a.paper.date) - parseCycleDateLocal(b.paper.date));
      
    if (scheduledRows.length < 2) return;
    
    const session = sessions.find(s => s.id === activeSessionId);
    const endDate = session?.endDate ? parseCycleDateLocal(session.endDate) : null;

    let currentBaseline = parseCycleDateLocal(scheduledRows[0].paper.date);
    let exceeded = false;
    
    for (let i = 1; i < scheduledRows.length; i++) {
      currentBaseline.setDate(currentBaseline.getDate() + 2); // 1 day gap
      // skip sundays
      if (currentBaseline.getDay() === 0) currentBaseline.setDate(currentBaseline.getDate() + 1);
      
      if (endDate && currentBaseline > endDate) {
        exceeded = true;
        break; // stop applying gaps if we hit the limit
      }
      
      await updateExamPaper(scheduledRows[i].paper.id, { date: toLocalISOString(currentBaseline) });
    }
    if (exceeded) alert("Auto-gap was halted because the schedule would exceed the exam cycle end date.");
    await fetchBaseData();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6 pb-12"
    >
      <AdminPageHeader
        title="Date Sheet Management"
        subtitle="Schedule examinations, assign rooms, and manage invigilators"
        icon={<CalendarIcon className="text-[#0077b6]" size={28} />}
        onRefresh={fetchBaseData}
      />
      <ExaminationWorkspaceNav activeTab="datesheets" hasActiveExam={hasActiveExam} />

      {/* --- SELECTORS & FILTERS --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Exam Cycle Selector */}
        <div className="space-y-1.5">
          <label className="text-[10px] uppercase font-black text-gray-500 tracking-wider">Active Exam Cycle</label>
          <select
            value={activeSessionId}
            onChange={(e) => {
              setActiveSessionId(e.target.value);
              setActiveClassId(""); // Reset class when cycle changes
            }}
            className="w-full p-2.5 bg-white border border-gray-200 rounded-xl text-sm font-bold text-[#03045e] focus:outline-none focus:ring-2 focus:ring-[#0077b6]/20 shadow-sm"
          >
            <option value="" disabled>Select an Exam Cycle</option>
            {sessions.filter(s => ["draft", "ready_for_scheduling", "scheduled"].includes(s.status)).map(s => (
              <option key={s.id} value={s.id}>{`${s.name} (${s.academicYear})`}</option>
            ))}
          </select>
        </div>

        {/* Class Selector */}
        <div className="space-y-1.5">
          <label className="text-[10px] uppercase font-black text-gray-500 tracking-wider">Target Class</label>
          <select
            value={activeClassId}
            onChange={(e) => setActiveClassId(e.target.value)}
            className="w-full p-2.5 bg-white border border-gray-200 rounded-xl text-sm font-bold text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#0077b6]/20 shadow-sm"
            disabled={!activeSessionId || participatingClasses.length === 0}
          >
            <option value="" disabled>{!activeSessionId ? "Select an Exam Cycle first" : participatingClasses.length === 0 ? "No classes in this cycle" : "Select a Class"}</option>
            {participatingClasses.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
      </div>

      {activeSessionId && activeClassId ? (
        <>
          {/* --- BULK ACTIONS --- */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <button
              onClick={handleAutoSchedule}
              className="group flex items-start gap-3 p-4 bg-white border border-[#caf0f8]/50 rounded-2xl hover:border-blue-200 hover:shadow-md transition-all text-left"
            >
              <span className="p-2 rounded-xl bg-blue-50 text-blue-500 group-hover:bg-blue-100 transition-colors">
                <Shuffle size={16} />
              </span>
              <div>
                <strong className="text-xs font-black text-slate-700 block tracking-wide">Auto Schedule</strong>
                <span className="text-[10px] text-slate-400 font-bold block mt-0.5">Fill empty slots sequentially</span>
              </div>
            </button>
            <button
              onClick={handleAvoidSundays}
              className="group flex items-start gap-3 p-4 bg-white border border-[#caf0f8]/50 rounded-2xl hover:border-orange-200 hover:shadow-md transition-all text-left"
            >
              <span className="p-2 rounded-xl bg-orange-50 text-orange-500 group-hover:bg-orange-100 transition-colors">
                <CalendarIcon size={16} />
              </span>
              <div>
                <strong className="text-xs font-black text-slate-700 block tracking-wide">Avoid Sundays</strong>
                <span className="text-[10px] text-slate-400 font-bold block mt-0.5">Shift Sunday exams to Monday</span>
              </div>
            </button>
            <button
              onClick={() => handleShiftDates(1)}
              className="group flex items-start gap-3 p-4 bg-white border border-[#caf0f8]/50 rounded-2xl hover:border-emerald-200 hover:shadow-md transition-all text-left"
            >
              <span className="p-2 rounded-xl bg-emerald-50 text-emerald-500 group-hover:bg-emerald-100 transition-colors">
                <ArrowRight size={16} />
              </span>
              <div>
                <strong className="text-xs font-black text-slate-700 block tracking-wide">Shift Dates (+1)</strong>
                <span className="text-[10px] text-slate-400 font-bold block mt-0.5">Push schedule forward by 1 day</span>
              </div>
            </button>
            <button
              onClick={handleAutoGap}
              className="group flex items-start gap-3 p-4 bg-white border border-[#caf0f8]/50 rounded-2xl hover:border-purple-200 hover:shadow-md transition-all text-left"
            >
              <span className="p-2 rounded-xl bg-purple-50 text-purple-500 group-hover:bg-purple-100 transition-colors">
                <Clock size={16} />
              </span>
              <div>
                <strong className="text-xs font-black text-slate-700 block tracking-wide">Auto Gap</strong>
                <span className="text-[10px] text-slate-400 font-bold block mt-0.5">Insert 1-day gaps between exams</span>
              </div>
            </button>
          </div>

          {/* --- TOOLBAR FILTERS --- */}
          <SearchFilterBar
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            searchPlaceholder="Search subject..."
            filters={[
              {
                value: statusFilter,
                onChange: setStatusFilter,
                options: [
                  { value: "all", label: "All Status" },
                  { value: "scheduled", label: "Scheduled" },
                  { value: "unscheduled", label: "Unscheduled" }
                ]
              },
              {
                value: roomFilter,
                onChange: setRoomFilter,
                options: [
                  { value: "all", label: "All Rooms" },
                  ...rooms.map(r => ({ value: r.id, label: `${r.number} (${r.type})` }))
                ]
              },
              {
                value: invigilatorFilter,
                onChange: setInvigilatorFilter,
                options: [
                  { value: "all", label: "All Invigilators" },
                  ...teachers.map(t => ({ value: t.id, label: t.name }))
                ]
              }
            ]}
          />

          {/* --- SCHEDULE MATRIX --- */}
          <MainCard className="bg-white border border-[#caf0f8]/50 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-50 text-gray-500 uppercase text-[10px] font-black tracking-wider border-b border-gray-100">
                  <tr>
                    <th className="px-6 py-4">Subject</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">Date</th>
                    <th className="px-6 py-4">Time</th>
                    <th className="px-6 py-4">Room</th>
                    <th className="px-6 py-4">Invigilator</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {scheduleMatrix.map((row) => {
                    const isScheduled = !!row.paper;
                    
                    return (
                      <tr key={row.subject.id} className="hover:bg-gray-50/50 transition-colors group">
                        <td className="px-6 py-4">
                          <div className="font-bold text-[#03045e] flex items-center gap-2">
                            <BookOpen size={14} className="text-gray-400" />
                            {row.subject.name}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          {isScheduled ? (
                            <StatusBadge status="scheduled" />
                          ) : (
                            <StatusBadge status="draft" text="Unscheduled" />
                          )}
                        </td>
                        <td className="px-6 py-4 font-medium text-gray-700">
                          {isScheduled && row.paper.date ? formatDateDisplay(row.paper.date) : '-'}
                        </td>
                        <td className="px-6 py-4 font-medium text-gray-700">
                          {isScheduled && row.paper.startTime ? `${row.paper.startTime} - ${row.paper.endTime}` : '-'}
                        </td>
                        <td className="px-6 py-4 font-medium text-gray-700">
                          {isScheduled && row.paper.roomId ? rooms.find(r => r.id === row.paper.roomId)?.number || row.paper.roomId : '-'}
                        </td>
                        <td className="px-6 py-4 font-medium text-gray-700">
                          {isScheduled && row.paper.invigilatorTeacherIds?.length > 0 ? (
                            <div className="flex flex-col">
                              {row.paper.invigilatorTeacherIds.map(id => (
                                <span key={id} className="text-xs">{teachers.find(t => t.id === id)?.name || id}</span>
                              ))}
                            </div>
                          ) : '-'}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex justify-end gap-2 transition-opacity">
                            {isScheduled ? (
                              <>
                                <button 
                                  onClick={() => setSelectedPaperForDrawer(row.paper)}
                                  className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                  title="View Details"
                                >
                                  <Eye size={16} />
                                </button>
                                <button 
                                  onClick={() => handleOpenSchedule(row.subject.id, row.paper)}
                                  className="p-1.5 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                                  title="Edit Schedule"
                                >
                                  <Edit size={16} />
                                </button>
                                <button 
                                  onClick={async () => {
                                    if(window.confirm("Remove schedule for this subject?")) {
                                      await deleteExamPaper(row.paper.id);
                                      await fetchBaseData();
                                    }
                                  }}
                                  className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                  title="Remove Schedule"
                                >
                                  <Trash2 size={16} />
                                </button>
                              </>
                            ) : (
                              <button 
                                onClick={() => handleOpenSchedule(row.subject.id, null)}
                                className="px-3 py-1.5 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg text-xs font-bold transition-colors"
                              >
                                Schedule
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                  {scheduleMatrix.length === 0 && (
                    <tr>
                      <td colSpan="7" className="p-0">
                        <EmptyState 
                          icon={BookOpen} 
                          title="No subjects found" 
                          description="No subjects found for this class." 
                        />
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </MainCard>
        </>
      ) : (
        <EmptyState 
          icon={CalendarIcon} 
          title="Select Exam & Class" 
          description="Please select an Active Exam Cycle and a Target Class from the dropdowns above to begin scheduling." 
          className="bg-white"
        />
      )}

      {/* --- SCHEDULE PAPER MODAL --- */}
      <Modal
        isOpen={schedulePaperOpen}
        onClose={() => setSchedulePaperOpen(false)}
        title={paperForm.id ? "Edit Schedule" : "Schedule Paper"}
        subtitle={subjects.find(s => s.id === paperForm.subjectId)?.name || 'Subject'}
        maxWidth="md:w-[600px]"
      >
        <div className="flex flex-col h-full max-h-[80vh]">
          <div className="p-6 overflow-y-auto max-h-[70vh] custom-scrollbar space-y-6">
                {/* General Section */}
                <div className="space-y-4">
                  <h4 className="text-[10px] font-black uppercase text-gray-400 tracking-wider flex items-center gap-2 border-b border-gray-100 pb-2">
                    <Clock size={14}/> General Timing
                  </h4>
                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase font-bold text-gray-500">Exam Date *</label>
                    <input
                      type="date"
                      value={paperForm.date}
                      onChange={(e) => setPaperForm(prev => ({...prev, date: e.target.value}))}
                      min={activeSession?.startDate || ""}
                      max={activeSession?.endDate || ""}
                      className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0077b6]/20"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] uppercase font-bold text-gray-500">Start Time *</label>
                      <input
                        type="time"
                        value={paperForm.startTime}
                        onChange={(e) => setPaperForm(prev => ({...prev, startTime: e.target.value}))}
                        className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0077b6]/20"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] uppercase font-bold text-gray-500">End Time *</label>
                      <input
                        type="time"
                        value={paperForm.endTime}
                        onChange={(e) => setPaperForm(prev => ({...prev, endTime: e.target.value}))}
                        className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0077b6]/20"
                      />
                    </div>
                  </div>
                </div>

                {/* Room Section */}
                <div className="space-y-4">
                  <h4 className="text-[10px] font-black uppercase text-gray-400 tracking-wider flex items-center gap-2 border-b border-gray-100 pb-2">
                    <MapPin size={14}/> Examination Room
                  </h4>
                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase font-bold text-gray-500">Room *</label>
                    <input
                      type="text"
                      placeholder="e.g. Room 101, Exam Hall A"
                      value={paperForm.roomId}
                      onChange={(e) => setPaperForm(prev => ({...prev, roomId: e.target.value}))}
                      className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0077b6]/20"
                    />
                  </div>
                </div>

                {/* Invigilator Section */}
                <div className="space-y-4">
                  <h4 className="text-[10px] font-black uppercase text-gray-400 tracking-wider flex items-center gap-2 border-b border-gray-100 pb-2">
                    <UserCheck size={14}/> Invigilation
                  </h4>
                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase font-bold text-gray-500">Primary Invigilator</label>
                    <select
                      value={paperForm.invigilatorTeacherIds[0] || ""}
                      onChange={(e) => {
                        const newIds = [...paperForm.invigilatorTeacherIds];
                        if (e.target.value) {
                          newIds[0] = e.target.value;
                        } else {
                          newIds.shift();
                        }
                        setPaperForm(prev => ({...prev, invigilatorTeacherIds: newIds}));
                      }}
                      className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0077b6]/20"
                    >
                      <option value="">Select Primary Invigilator</option>
                      {teachers.map(t => (
                        <option key={t.id} value={t.id}>{t.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase font-bold text-gray-500">Secondary Invigilator (Optional)</label>
                    <select
                      value={paperForm.invigilatorTeacherIds[1] || ""}
                      onChange={(e) => {
                        const newIds = [...paperForm.invigilatorTeacherIds];
                        if (e.target.value) {
                          newIds[1] = e.target.value;
                        } else {
                          newIds.splice(1, 1);
                        }
                        setPaperForm(prev => ({...prev, invigilatorTeacherIds: newIds}));
                      }}
                      className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0077b6]/20"
                    >
                      <option value="">Select Secondary Invigilator</option>
                      {teachers.filter(t => t.id !== paperForm.invigilatorTeacherIds[0]).map(t => (
                        <option key={t.id} value={t.id}>{t.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Notes Section */}
                <div className="space-y-4">
                  <h4 className="text-[10px] font-black uppercase text-gray-400 tracking-wider flex items-center gap-2 border-b border-gray-100 pb-2">
                    <AlertCircle size={14}/> Notes
                  </h4>
                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase font-bold text-gray-500">Remarks</label>
                    <textarea
                      value={paperForm.remarks}
                      onChange={(e) => setPaperForm(prev => ({...prev, remarks: e.target.value}))}
                      placeholder="Optional remarks or special instructions..."
                      rows={2}
                      className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0077b6]/20 resize-none"
                    />
                  </div>
                </div>
              </div>

              <div className="p-5 bg-white border-t border-gray-100 flex justify-end gap-3 shrink-0">
                <button
                  onClick={() => setSchedulePaperOpen(false)}
                  className="px-5 py-2 rounded-xl text-sm font-bold text-gray-600 hover:bg-gray-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSavePaper}
                  className="bg-gradient-to-r from-[#03045e] to-[#0077b6] text-white px-8 py-2 rounded-xl text-sm font-bold shadow-lg hover:shadow-xl transition-all"
                >
                  Save Schedule
                </button>
              </div>
          </div>
      </Modal>

      {/* --- CONFLICT MODAL --- */}
      <Modal
        isOpen={conflictModalOpen}
        onClose={() => setConflictModalOpen(false)}
        title="Schedule Conflicts Detected"
        subtitle="Review and resolve before proceeding"
        maxWidth="md:w-[600px]"
        headerGradient="from-rose-600 to-rose-500"
      >
        <div className="flex flex-col h-full max-h-[80vh]">
          <div className="p-6 overflow-y-auto custom-scrollbar space-y-6 bg-rose-50/30">
            {/* Conflict list component goes here */}
          </div>
        </div>
      </Modal>

      {/* --- PAPER DETAILS DRAWER --- */}
      <Drawer
        isOpen={!!selectedPaperForDrawer}
        onClose={() => setSelectedPaperForDrawer(null)}
        title={subjects.find(s => s.id === selectedPaperForDrawer?.subjectId)?.name || "Subject"}
        subtitle="Paper Schedule Details"
        width="md:w-[400px]"
      >
        {selectedPaperForDrawer && (
          <div className="flex flex-col h-full">
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
                <div>
                  <h4 className="text-[10px] font-black uppercase text-gray-400 tracking-wider mb-3">Scheduling Details</h4>
                  <div className="bg-gray-50 rounded-2xl p-4 space-y-3">
                    <div className="flex justify-between">
                      <span className="text-xs text-gray-500 font-bold">Exam Date</span>
                      <span className="text-sm font-black text-[#03045e]">
                        {new Date(selectedPaperForDrawer.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-xs text-gray-500 font-bold">Time</span>
                      <span className="text-sm font-black text-[#03045e]">
                        {selectedPaperForDrawer.startTime} - {selectedPaperForDrawer.endTime}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-xs text-gray-500 font-bold">Duration</span>
                      <span className="text-sm font-black text-[#03045e]">
                        120 mins
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-xs font-black uppercase tracking-wider text-gray-400 mb-4">Location & Staff</h4>
                  <div className="space-y-3 bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
                    <div>
                      <div className="text-[10px] text-gray-400 font-bold uppercase">Examination Room</div>
                      <div className="text-sm font-medium text-gray-700">
                        {rooms.find(r => r.id === selectedPaperForDrawer.roomId)?.number || selectedPaperForDrawer.roomId || 'Not Assigned'}
                      </div>
                    </div>
                    <div className="pt-2 border-t border-gray-50">
                      <div className="text-[10px] text-gray-400 font-bold uppercase">Invigilators</div>
                      {selectedPaperForDrawer.invigilatorTeacherIds?.length > 0 ? (
                        <div className="flex flex-col gap-1 mt-1">
                          {selectedPaperForDrawer.invigilatorTeacherIds.map(id => (
                            <div key={id} className="text-sm font-medium text-gray-700 flex items-center gap-2">
                              <User size={14} className="text-gray-400"/>
                              {teachers.find(t => t.id === id)?.name || id}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-sm text-gray-400 italic">No invigilators assigned</div>
                      )}
                    </div>
                  </div>
                </div>

                {selectedPaperForDrawer.remarks && (
                  <div>
                    <h4 className="text-xs font-black uppercase tracking-wider text-gray-400 mb-4">Remarks</h4>
                    <div className="bg-amber-50 p-3 rounded-xl border border-amber-100 text-sm text-amber-800">
                      {selectedPaperForDrawer.remarks}
                    </div>
                  </div>
                )}
              </div>
              
              <div className="p-4 bg-gray-50 border-t border-gray-100 shrink-0">
                <button
                  onClick={() => {
                    handleOpenSchedule(selectedPaperForDrawer.subjectId, selectedPaperForDrawer);
                    setSelectedPaperForDrawer(null);
                  }}
                  className="w-full bg-white border-2 border-gray-200 text-gray-700 py-2.5 rounded-xl font-bold hover:border-[#0077b6] hover:text-[#0077b6] transition-colors flex items-center justify-center gap-2"
                >
                  <Edit size={16} /> Edit Schedule
                </button>
              </div>
          </div>
        )}
      </Drawer>
    </motion.div>
  );
};

export default DateSheetsPage;
