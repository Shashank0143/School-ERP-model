import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus, Search, Filter, RefreshCw, X, Edit, Trash2, Archive, Calendar, CalendarDays, ClipboardList,
  MoreVertical, CheckCircle, Clock, BookOpen, AlertCircle, Eye, ShieldAlert
} from "lucide-react";
import AdminPageHeader from "../../../components/admin/AdminPageHeader";
import MainCard from "../../../components/MainCard";
import ExaminationWorkspaceNav from "./components/ExaminationWorkspaceNav";
import {
  getExams,
  createExamSession,
  updateExamSession,
  deleteExamSession,
  getTargetClasses,
  validateExamSave,
  validateClassRemoval,
  transitionExamCycleStatus
} from "../../../services/examService";
import { getAssessmentGovernance } from "../../../services/assessmentGovernanceService";
import { getDataProvider } from "../../../data";
import SearchFilterBar from "../../../components/common/SearchFilterBar";
import StatusBadge from "../../../components/common/StatusBadge";
import EmptyState from "../../../components/common/EmptyState";
import Modal from "../../../components/common/Modal";
import Drawer from "../../../components/common/Drawer";

// Status definitions mapping to colors and labels
const STATUS_CONFIG = {
  draft: { label: "Draft", color: "bg-gray-100 text-gray-700 border-gray-200" },
  ready_for_scheduling: { label: "Ready for Scheduling", color: "bg-yellow-100 text-yellow-800 border-yellow-200" },
  scheduled: { label: "Scheduled", color: "bg-blue-100 text-blue-800 border-blue-200" },
  ongoing: { label: "Ongoing", color: "bg-indigo-100 text-indigo-800 border-indigo-200" },
  evaluation: { label: "Evaluation", color: "bg-purple-100 text-purple-800 border-purple-200" },
  published: { label: "Published", color: "bg-green-100 text-green-800 border-green-200" },
  archived: { label: "Archived", color: "bg-stone-100 text-stone-700 border-stone-200" }
};

/**
 * Generates a rolling window of academic years centered on the current year.
 * Returns labels like "2024-25", "2025-26" — never hardcoded.
 */
const generateAcademicYears = () => {
  const currentYear = new Date().getFullYear();
  const years = [];
  for (let y = currentYear - 2; y <= currentYear + 3; y++) {
    const short = String(y + 1).slice(-2);
    years.push(`${y}-${short}`);
  }
  return years;
};
const ACADEMIC_YEARS = generateAcademicYears();
const DEFAULT_ACADEMIC_YEAR = ACADEMIC_YEARS[2]; // Current year is index 2 (offset -2)

const ExamCyclesPage = () => {
  const [sessions, setSessions] = useState([]);
  const [classes, setClasses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [academicYearFilter, setAcademicYearFilter] = useState("all");

  // Modals & Drawers
  const [createSessionOpen, setCreateSessionOpen] = useState(false);
  const [selectedCycle, setSelectedCycle] = useState(null); // For drawer

  // Form State
  const [sessionForm, setSessionForm] = useState({
    id: null,
    name: "",
    academicYear: DEFAULT_ACADEMIC_YEAR,
    description: "",
    startDate: "",
    endDate: "",
    targetClasses: {}, // { classId: { selected: boolean, sections: [] } }
    guidelines: "",
    instructions: "",
    notificationTemplate: "",
    assessmentCategoryId: "",
    status: "draft"
  });

  const fetchBaseData = async () => {
    setLoading(true);
    try {
      const provider = getDataProvider();
      const [fetchedSessions, fetchedClasses, governance] = await Promise.all([
        getExams(),
        provider.getClasses(),
        getAssessmentGovernance()
      ]);
      const activeCategories = (governance?.categories || []).filter(c => c.isActive);
      setCategories(activeCategories);
      const normalizedSessions = (fetchedSessions || []).map(session => ({
        ...session,
        id: session.id || session.examId,
        name: session.name || session.examName,
        type: session.type || session.examType,
        status: (session.status === "Completed") ? "published" : session.status || "draft",
      }));
      setSessions(normalizedSessions);
      setClasses(fetchedClasses || []);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBaseData();
  }, []);

  // Filtered Sessions
  const filteredSessions = useMemo(() => {
    return sessions.filter(session => {
      const matchesSearch = (session.name || "").toLowerCase().includes((searchQuery || "").toLowerCase());
      const matchesStatus = statusFilter === "all" || session.status === statusFilter;
      const matchesYear = academicYearFilter === "all" || session.academicYear === academicYearFilter;
      // Also default to not showing archived unless specifically requested or "all"
      return matchesSearch && matchesStatus && matchesYear;
    });
  }, [sessions, searchQuery, statusFilter, academicYearFilter]);

  // Statistics
  const stats = useMemo(() => {
    return {
      total: sessions.length,
      draft: sessions.filter(s => s.status === "draft").length,
      scheduled: sessions.filter(s => s.status === "scheduled").length,
      completed: sessions.filter(s => s.status === "published").length,
      archived: sessions.filter(s => s.status === "archived").length
    };
  }, [sessions]);

  const hasActiveExam = sessions.some(s => ["ongoing", "evaluation", "scheduled"].includes(s.status));

  // --- Handlers ---
  
  const handleOpenCreate = () => {
    setSessionForm({
      id: null,
      name: "",
      academicYear: DEFAULT_ACADEMIC_YEAR,
      description: "",
      startDate: "",
      endDate: "",
      targetClasses: {},
      guidelines: "",
      instructions: "",
      notificationTemplate: "",
      assessmentCategoryId: "",
      status: "draft"
    });
    setCreateSessionOpen(true);
  };

  const handleOpenEdit = (session) => {
    setSessionForm({
      id: session.id,
      name: session.name || "",
      academicYear: session.academicYear || DEFAULT_ACADEMIC_YEAR,
      description: session.description || "",
      startDate: session.startDate || "",
      endDate: session.endDate || "",
      targetClasses: session.targetClasses || {},
      guidelines: session.guidelines || "",
      instructions: session.instructions || "",
      notificationTemplate: session.notificationTemplate || "",
      assessmentCategoryId: session.assessmentCategoryId || "",
      status: session.status || "draft"
    });
    setCreateSessionOpen(true);
  };

  const handleSaveSession = async () => {
    try {
      const validation = validateExamSave(sessionForm);
      if (!validation.valid) {
        alert(validation.message);
        return;
      }

      if (sessionForm.id) {
        await updateExamSession(sessionForm.id, sessionForm);
      } else {
        await createExamSession(sessionForm);
      }
      await fetchBaseData();
      setCreateSessionOpen(false);
    } catch (e) {
      console.error(e);
      alert("Failed to save exam cycle");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Deleting this Exam Cycle will remove all locally stored prototype data associated with it.\nThis action cannot be undone.")) {
      await deleteExamSession(id);
      await fetchBaseData();
      if (selectedCycle?.id === id) setSelectedCycle(null);
    }
  };

  const handleArchive = async (id) => {
    if (window.confirm("Are you sure you want to archive this cycle? It will become read-only.")) {
      await updateExamSession(id, { status: "archived" });
      await fetchBaseData();
      if (selectedCycle?.id === id) setSelectedCycle(null);
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      await transitionExamCycleStatus({ sessionId: id, fromStatus: selectedCycle?.status, toStatus: newStatus });
      await fetchBaseData();
      // Sync the drawer's selectedCycle immediately so the UI reflects
      // the persisted status without requiring a close/reopen.
      setSelectedCycle(prev => prev ? { ...prev, status: newStatus } : prev);
    } catch (e) {
      console.error(e);
      alert(e.message || "Failed to change status");
    }
  };

  // Group classes by level for the target classes UI
  const classesByLevel = useMemo(() => {
    const grouped = {
      foundation: [],
      primary: [],
      middle: [],
      secondary: [],
      senior_secondary: []
    };
    classes.forEach(c => {
      if (grouped[c.stage]) {
        grouped[c.stage].push(c);
      } else {
        // Fallback or custom stage
        if (!grouped['other']) grouped['other'] = [];
        grouped['other'].push(c);
      }
    });
    return grouped;
  }, [classes]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6 pb-12"
    >
      <AdminPageHeader
        title="Examination Management"
        subtitle="Manage exam cycles, scheduling, evaluation, and results publication"
        icon={<BookOpen className="text-[#00b4d8]" size={28} />}
        onRefresh={fetchBaseData}
      />
      <ExaminationWorkspaceNav activeTab="cycles" hasActiveExam={hasActiveExam} />

      {/* --- STATISTICS SECTION --- */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <MainCard className="p-4 flex flex-col justify-center items-center bg-white border border-[#caf0f8]/50">
          <span className="text-3xl font-black text-[#03045e]">{stats.total}</span>
          <span className="text-[10px] uppercase font-bold text-gray-500 mt-1 tracking-wider">Total Cycles</span>
        </MainCard>
        <MainCard className="p-4 flex flex-col justify-center items-center bg-white border border-[#caf0f8]/50">
          <span className="text-3xl font-black text-gray-600">{stats.draft}</span>
          <span className="text-[10px] uppercase font-bold text-gray-500 mt-1 tracking-wider">Draft</span>
        </MainCard>
        <MainCard className="p-4 flex flex-col justify-center items-center bg-white border border-[#caf0f8]/50">
          <span className="text-3xl font-black text-[#0077b6]">{stats.scheduled}</span>
          <span className="text-[10px] uppercase font-bold text-gray-500 mt-1 tracking-wider">Scheduled</span>
        </MainCard>
        <MainCard className="p-4 flex flex-col justify-center items-center bg-white border border-[#caf0f8]/50">
          <span className="text-3xl font-black text-emerald-600">{stats.completed}</span>
          <span className="text-[10px] uppercase font-bold text-gray-500 mt-1 tracking-wider">Completed</span>
        </MainCard>
        <MainCard className="p-4 flex flex-col justify-center items-center bg-white border border-[#caf0f8]/50">
          <span className="text-3xl font-black text-stone-600">{stats.archived}</span>
          <span className="text-[10px] uppercase font-bold text-gray-500 mt-1 tracking-wider">Archived</span>
        </MainCard>
      </div>

      {/* --- TOOLBAR --- */}
      <SearchFilterBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Search cycles..."
        filters={[
          {
            value: statusFilter,
            onChange: setStatusFilter,
            options: [
              { value: "all", label: "All Statuses" },
              ...Object.entries(STATUS_CONFIG).map(([key, conf]) => ({ value: key, label: conf.label }))
            ]
          },
          {
            value: academicYearFilter,
            onChange: setAcademicYearFilter,
            options: [
              { value: "all", label: "All Years" },
              { value: "2024-25", label: "2024-25" },
              { value: "2025-26", label: "2025-26" }
            ]
          }
        ]}
        actions={
          <button
            onClick={handleOpenCreate}
            className="bg-[#03045e] hover:bg-[#0077b6] text-white px-5 py-3 rounded-xl font-bold text-xs uppercase tracking-widest flex items-center gap-2 hover:shadow-lg transition-all"
          >
            <Plus size={16} />
            Create Cycle
          </button>
        }
      />

      {/* --- EXAM CYCLE TABLE --- */}
      <MainCard className="bg-white border border-[#caf0f8]/50 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-gray-500 uppercase text-[10px] font-black tracking-wider border-b border-gray-100">
              <tr>
                <th className="px-6 py-4">Exam Name</th>
                <th className="px-6 py-4">Academic Year</th>
                <th className="px-6 py-4">Assessment Category</th>
                <th className="px-6 py-4">Target Classes</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Created On</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredSessions.map((session) => {
                const targetClassesCount = getTargetClasses(session).length;
                const statusConf = STATUS_CONFIG[session.status || "draft"];

                return (
                  <tr key={session.id} className="hover:bg-gray-50/50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="font-bold text-[#03045e]">{session.name}</div>
                      <div className="text-xs text-gray-400 truncate max-w-[200px]">{session.description || "No description"}</div>
                    </td>
                    <td className="px-6 py-4 font-medium text-gray-600">
                      {session.academicYear}
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-md text-[10px] font-bold">
                        {categories.find(c => c.id === session.assessmentCategoryId)?.name || "Uncategorized"}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-medium text-gray-600">
                      {targetClassesCount} Classes
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={session.status || "draft"} />
                    </td>
                    <td className="px-6 py-4 text-xs text-gray-500">
                      {new Date(session.createdAt || Date.now()).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button 
                          onClick={() => setSelectedCycle(session)}
                          className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="View Details"
                        >
                          <Eye size={16} />
                        </button>
                        {session.status !== 'archived' && (
                          <>
                            <button 
                              onClick={() => handleOpenEdit(session)}
                              className="p-1.5 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                              title="Edit"
                            >
                              <Edit size={16} />
                            </button>
                            <button 
                              onClick={() => handleArchive(session.id)}
                              className="p-1.5 text-yellow-600 hover:bg-yellow-50 rounded-lg transition-colors"
                              title="Archive"
                            >
                              <Archive size={16} />
                            </button>
                          </>
                        )}
                        <button 
                          onClick={() => handleDelete(session.id)}
                          className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
              {filteredSessions.length === 0 && (
                <tr>
                  <td colSpan="7" className="p-0">
                    <EmptyState 
                      icon={RefreshCw} 
                      title="No exam cycles found" 
                      description="No exam cycles found matching your criteria." 
                    />
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </MainCard>

      {/* --- CREATE / EDIT MODAL --- */}
      {/* --- ADD/EDIT CYCLE MODAL --- */}
      <Modal
        isOpen={createSessionOpen}
        onClose={() => setCreateSessionOpen(false)}
        title={sessionForm.id ? "Edit Exam Cycle" : "Create New Exam Cycle"}
        subtitle="Administrative Configuration Only"
        maxWidth="md:w-[90vw] lg:max-w-4xl"
      >
        <div className="flex flex-col h-full max-h-[80vh]">
          <div className="p-6 overflow-y-auto flex-1 custom-scrollbar bg-gray-50/30">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Left Column */}
                  <div className="space-y-6">
                    <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm space-y-4">
                      <h4 className="text-xs font-black uppercase text-gray-400 tracking-wider flex items-center gap-2 mb-2"><BookOpen size={14}/> General Information</h4>
                      
                      <div className="space-y-1.5">
                        <label className="text-[10px] uppercase font-bold text-gray-500">Cycle Name</label>
                        <input
                          type="text"
                          value={sessionForm.name}
                          onChange={(e) => setSessionForm(prev => ({...prev, name: e.target.value}))}
                          placeholder="e.g. Term 1 Examination"
                          className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0077b6]/20"
                        />
                      </div>
                      
                      <div className="grid grid-cols-1 gap-4">
                        <div className="space-y-1.5">
                          <label className="text-[10px] uppercase font-bold text-gray-500">Academic Year</label>
                          <select
                            value={sessionForm.academicYear}
                            onChange={(e) => setSessionForm(prev => ({...prev, academicYear: e.target.value}))}
                            className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none"
                          >
                            {ACADEMIC_YEARS.map(y => (
                              <option key={y} value={y}>{y}</option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[10px] uppercase font-bold text-gray-500">Assessment Category</label>
                        <select
                          value={sessionForm.assessmentCategoryId}
                          onChange={(e) => setSessionForm(prev => ({...prev, assessmentCategoryId: e.target.value}))}
                          className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none"
                        >
                          <option value="">Select a category</option>
                          {categories.map(cat => (
                            <option key={cat.id} value={cat.id}>{cat.name}</option>
                          ))}
                        </select>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[10px] uppercase font-bold text-gray-500">Description</label>
                        <textarea
                          value={sessionForm.description}
                          onChange={(e) => setSessionForm(prev => ({...prev, description: e.target.value}))}
                          placeholder="Brief description of this exam cycle..."
                          rows={2}
                          className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0077b6]/20 resize-none"
                        />
                      </div>
                    </div>

                    <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm space-y-4">
                      <h4 className="text-xs font-black uppercase text-gray-400 tracking-wider flex items-center gap-2 mb-2"><CalendarDays size={14}/> Timeline</h4>
                      <p className="text-xs text-gray-500">Set the overall examination window (start and end dates for the entire cycle).</p>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="text-[10px] uppercase font-bold text-gray-500">Start Date</label>
                          <input
                            type="date"
                            value={sessionForm.startDate}
                            onChange={(e) => setSessionForm(prev => ({...prev, startDate: e.target.value}))}
                            className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-[10px] uppercase font-bold text-gray-500">End Date</label>
                          <input
                            type="date"
                            value={sessionForm.endDate}
                            onChange={(e) => setSessionForm(prev => ({...prev, endDate: e.target.value}))}
                            className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right Column */}
                  <div className="space-y-6">
                    <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm space-y-4">
                      <h4 className="text-xs font-black uppercase text-gray-400 tracking-wider flex items-center gap-2 mb-2"><RefreshCw size={14}/> Target Classes</h4>
                      
                      <div className="max-h-48 overflow-y-auto space-y-1 pr-1 custom-scrollbar">
                        {Object.entries(classesByLevel).map(([stage, classList]) => {
                          if (!classList.length) return null;
                          return (
                            <div key={stage} className="mb-2">
                              <div className="text-[10px] font-bold uppercase text-[#0077b6] mb-1">{stage.replace('_', ' ')}</div>
                              <div className="grid grid-cols-2 gap-2">
                                {classList.map(cls => {
                                  const isSelected = sessionForm.targetClasses[cls.id]?.selected;
                                  return (
                                    <label key={cls.id} className={`flex items-center gap-2 p-2 rounded-lg border cursor-pointer transition-colors ${isSelected ? 'bg-blue-50 border-blue-200' : 'bg-gray-50 border-gray-100 hover:bg-gray-100'}`}>
                                      <input
                                        type="checkbox"
                                        checked={!!isSelected}
                                        onChange={async (e) => {
                                          const checked = e.target.checked;
                                          
                                          if (!checked && sessionForm.id) {
                                            const validation = await validateClassRemoval(sessionForm.id, cls.id);
                                            if (!validation.canRemove) {
                                              alert(validation.message);
                                              e.preventDefault();
                                              return;
                                            }
                                          }
                                          
                                          setSessionForm(prev => {
                                            const newTargets = { ...prev.targetClasses };
                                            if (checked) {
                                              newTargets[cls.id] = { selected: true, sections: [cls.section] };
                                            } else {
                                              delete newTargets[cls.id];
                                            }
                                            return { ...prev, targetClasses: newTargets };
                                          });
                                        }}
                                        className="rounded text-blue-600 focus:ring-blue-500"
                                      />
                                      <span className="text-xs font-medium text-gray-700">{cls.name}</span>
                                    </label>
                                  )
                                })}
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </div>

                    <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm space-y-4">
                      <h4 className="text-xs font-black uppercase text-gray-400 tracking-wider flex items-center gap-2 mb-2"><ClipboardList size={14}/> Guidelines & Instructions</h4>
                      
                      <div className="space-y-1.5">
                        <label className="text-[10px] uppercase font-bold text-gray-500">Teacher Guidelines (One per line)</label>
                        <textarea
                          value={sessionForm.guidelines}
                          onChange={(e) => setSessionForm(prev => ({...prev, guidelines: e.target.value}))}
                          placeholder="e.g. Collect answer sheets 5 mins before end..."
                          rows={3}
                          className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0077b6]/20 resize-none"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[10px] uppercase font-bold text-gray-500">Student Instructions (Shown in portal)</label>
                        <textarea
                          value={sessionForm.instructions}
                          onChange={(e) => setSessionForm(prev => ({...prev, instructions: e.target.value}))}
                          placeholder="e.g. Bring Admit Card\nReach 30 minutes early"
                          rows={3}
                          className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0077b6]/20 resize-none"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[10px] uppercase font-bold text-gray-500">Notification Templates</label>
                        <textarea
                          value={sessionForm.notificationTemplate}
                          onChange={(e) => setSessionForm(prev => ({...prev, notificationTemplate: e.target.value}))}
                          placeholder="Template text for announcements..."
                          rows={2}
                          className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0077b6]/20 resize-none"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-5 bg-white border-t border-gray-100 flex justify-end gap-3 shrink-0">
                <button
                  onClick={() => setCreateSessionOpen(false)}
                  className="px-5 py-2 rounded-xl text-sm font-bold text-gray-600 hover:bg-gray-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveSession}
                  className="bg-gradient-to-r from-[#03045e] to-[#0077b6] text-white px-8 py-2 rounded-xl text-sm font-bold shadow-lg hover:shadow-xl transition-all"
                >
                  Save Configuration
                </button>
              </div>
            </div>
      </Modal>

      {/* --- DETAILS DRAWER --- */}
      <Drawer
        isOpen={!!selectedCycle}
        onClose={() => setSelectedCycle(null)}
        title={selectedCycle?.name}
        subtitle="Cycle Metadata"
        width="md:w-[450px]"
      >
        {selectedCycle && (
          <div className="flex flex-col h-full">
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
                
                {/* Lifecycle Timeline */}
                <div>
                  <h4 className="text-xs font-black uppercase tracking-wider text-gray-400 mb-4">Lifecycle Status</h4>
                  <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
                    <div className="flex items-center justify-between text-xs font-bold text-gray-600 mb-2">
                      <span>Current Phase:</span>
                      <span className={`px-2 py-1 rounded border ${STATUS_CONFIG[selectedCycle.status]?.color || STATUS_CONFIG.draft.color}`}>
                        {STATUS_CONFIG[selectedCycle.status]?.label || "Draft"}
                      </span>
                    </div>
                    {selectedCycle.status !== 'archived' && (
                      <div className="mt-4 flex flex-col gap-2">
                        <select
                          value={selectedCycle.status}
                          onChange={(e) => handleStatusChange(selectedCycle.id, e.target.value)}
                          className="w-full p-2 bg-white border border-gray-200 rounded-lg text-sm outline-none"
                        >
                          {Object.entries(STATUS_CONFIG).map(([k, v]) => (
                             <option key={k} value={k}>{v.label}</option>
                          ))}
                        </select>
                        <p className="text-[9px] text-gray-400">Change status to reflect real-world progression. This does not trigger workflows directly.</p>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <h4 className="text-xs font-black uppercase tracking-wider text-gray-400 mb-4">General Information</h4>
                  <div className="space-y-3 bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="text-[10px] text-gray-400 font-bold uppercase">Type</div>
                        <div className="text-sm font-medium text-gray-700">{selectedCycle.type}</div>
                      </div>
                      <div>
                        <div className="text-[10px] text-gray-400 font-bold uppercase">Academic Year</div>
                        <div className="text-sm font-medium text-gray-700">{selectedCycle.academicYear}</div>
                      </div>
                      <div>
                        <div className="text-[10px] text-gray-400 font-bold uppercase">Start Date</div>
                        <div className="text-sm font-medium text-gray-700">{selectedCycle.startDate || 'Not Set'}</div>
                      </div>
                      <div>
                        <div className="text-[10px] text-gray-400 font-bold uppercase">End Date</div>
                        <div className="text-sm font-medium text-gray-700">{selectedCycle.endDate || 'Not Set'}</div>
                      </div>
                    </div>
                    {selectedCycle.description && (
                      <div className="pt-2 border-t border-gray-50">
                        <div className="text-[10px] text-gray-400 font-bold uppercase">Description</div>
                        <div className="text-sm text-gray-600 mt-1">{selectedCycle.description}</div>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <h4 className="text-xs font-black uppercase tracking-wider text-gray-400 mb-4">Targeted Classes</h4>
                  <div className="flex flex-wrap gap-2">
                    {getTargetClasses(selectedCycle).length > 0 ? (
                      getTargetClasses(selectedCycle).map(id => {
                        const cls = classes.find(c => c.id === id);
                        return cls ? (
                          <span key={id} className="px-2.5 py-1 bg-blue-50 text-blue-700 rounded-lg text-xs font-bold border border-blue-100">
                            {cls.name}
                          </span>
                        ) : null;
                      })
                    ) : (
                      <span className="text-xs text-gray-400 italic">No classes targeted</span>
                    )}
                  </div>
                </div>

                <div>
                  <h4 className="text-xs font-black uppercase tracking-wider text-gray-400 mb-4">Instructions & Guidelines</h4>
                  <div className="space-y-4">
                    <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
                      <div className="text-[10px] text-gray-500 font-bold uppercase mb-1">Teacher Guidelines</div>
                      <p className="text-sm text-gray-700 whitespace-pre-wrap">{selectedCycle.guidelines || 'None provided'}</p>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
                      <div className="text-[10px] text-gray-500 font-bold uppercase mb-1">Student Instructions</div>
                      <p className="text-sm text-gray-700 whitespace-pre-wrap">{selectedCycle.instructions || 'None provided'}</p>
                    </div>
                  </div>
                </div>

              </div>
              
              {selectedCycle.status !== 'archived' && (
                <div className="p-4 bg-gray-50 border-t border-gray-100 shrink-0">
                  <button
                    onClick={() => {
                      handleOpenEdit(selectedCycle);
                      setSelectedCycle(null);
                    }}
                    className="w-full bg-white border-2 border-gray-200 text-gray-700 py-2.5 rounded-xl font-bold hover:border-[#0077b6] hover:text-[#0077b6] transition-colors"
                  >
                    Edit Cycle Configuration
                  </button>
                </div>
              )}
            </div>
        )}
      </Drawer>
    </motion.div>
  );
};

export default ExamCyclesPage;
