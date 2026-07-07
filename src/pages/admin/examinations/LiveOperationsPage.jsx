import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Activity, Calendar, Clock, MapPin, User, Search, Filter, ShieldAlert, AlertTriangle, Send, Bell, CheckCircle2, AlertCircle, X, ChevronRight, FileText
} from "lucide-react";
import AdminPageHeader from "../../../components/admin/AdminPageHeader";
import MainCard from "../../../components/MainCard";
import ExaminationWorkspaceNav from "./components/ExaminationWorkspaceNav";
import { 
  getExams, 
  getExamPapers, 
  getScheduledExamPapers, 
  getExamPaperStatus 
} from "../../../services/examService";
import { getDataProvider } from "../../../data";
import { formatDate } from "../../../shared/utils/formatters";
import EmptyState from "../../../components/common/EmptyState";
import SearchFilterBar from "../../../components/common/SearchFilterBar";
import StatusBadge from "../../../components/common/StatusBadge";
import ProgressCard from "../../../components/common/ProgressCard";
import Drawer from "../../../components/common/Drawer";

const STATUS_CONFIG = {
  upcoming: { label: "Upcoming", color: "bg-blue-50 text-blue-700 border-blue-200", dot: "bg-blue-500" },
  running: { label: "Running", color: "bg-emerald-50 text-emerald-700 border-emerald-200", dot: "bg-emerald-500", pulse: true },
  completed: { label: "Completed", color: "bg-gray-50 text-gray-700 border-gray-200", dot: "bg-gray-400" }
};

const LiveOperationsPage = () => {
  const [sessions, setSessions] = useState([]);
  const [activeSessionId, setActiveSessionId] = useState("");
  const [papers, setPapers] = useState([]);
  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Notice State
  const [noticeForm, setNoticeForm] = useState({
    type: "Emergency",
    message: ""
  });
  const [noticeStatus, setNoticeStatus] = useState("");
  
  // Drawer
  const [selectedPaper, setSelectedPaper] = useState(null);

  const fetchBaseData = async () => {
    setLoading(true);
    try {
      const provider = getDataProvider();
      const [allSessions, allPapers, allClasses, allSubjects, allTeachers, allRooms] = await Promise.all([
        getExams(),
        getExamPapers(),
        provider.getClasses(),
        provider.getSubjects(),
        provider.getTeachers(),
        provider.getRooms ? provider.getRooms() : []
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
      setRooms(allRooms || []);
      const ongoingSessions = normalizedSessions.filter(s => s.status === 'ongoing');
      if (ongoingSessions.length > 0 && !activeSessionId) {
        setActiveSessionId(ongoingSessions[0].id);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBaseData();
    // Update time every minute to keep status badges accurate
    const interval = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(interval);
  }, []);

  // Compute ongoing session
  const ongoingSessions = useMemo(() => sessions.filter(s => s.status === "ongoing"), [sessions]);
  const ongoingSession = useMemo(() => sessions.find(s => s.id === activeSessionId), [sessions, activeSessionId]);
  const hasActiveExam = sessions.some(s => ["ongoing", "evaluation", "scheduled"].includes(s.status));

  // Determine "Today's" papers for the ongoing session
  // For prototyping, we will simulate "today" by selecting papers that match today's date, 
  // OR if no papers match today, we can just show ALL papers for the ongoing session so the UI isn't empty during testing.
  const todaysPapersRaw = useMemo(() => {
    if (!ongoingSession) return [];
    return getScheduledExamPapers(ongoingSession.id, papers, subjects);
  }, [ongoingSession, papers, subjects]);

  const todaysPapers = useMemo(() => {
    return todaysPapersRaw.map(p => {
      const cls = classes.find(c => c.id === p.classId);
      const sub = subjects.find(s => s.id === p.subjectId);
      const room = rooms.find(r => r.id === p.roomId);
      const invigilators = (p.invigilatorTeacherIds || []).map(id => teachers.find(t => t.id === id));
      
      return {
        ...p,
        className: cls ? cls.name : p.classId,
        subjectName: sub ? sub.name : p.subjectId,
        roomName: room ? room.number : (p.roomId || "Unassigned"),
        invigilatorNames: invigilators.length ? invigilators.map(t => t ? t.name : "Unknown").join(", ") : "Unassigned",
        operationalStatus: getExamPaperStatus(p, currentTime)
      };
    }).sort((a, b) => {
      if (a.date !== b.date) {
        return new Date(a.date) - new Date(b.date);
      }
      return a.startTime.localeCompare(b.startTime);
    });
  }, [todaysPapersRaw, classes, subjects, rooms, teachers, currentTime]);

  // Filtered
  const filteredPapers = useMemo(() => {
    return todaysPapers.filter(p => {
      let visible = true;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        visible = p.subjectName.toLowerCase().includes(q) || 
                  p.className.toLowerCase().includes(q) || 
                  p.roomName.toLowerCase().includes(q) || 
                  p.invigilatorNames.toLowerCase().includes(q);
      }
      if (statusFilter !== 'all' && p.operationalStatus !== statusFilter) visible = false;
      return visible;
    });
  }, [todaysPapers, searchQuery, statusFilter]);

  // Statistics
  const stats = useMemo(() => {
    const uniqueRooms = new Set(todaysPapers.map(p => p.roomId).filter(Boolean));
    const uniqueInvigilators = new Set();
    todaysPapers.forEach(p => (p.invigilatorTeacherIds || []).forEach(id => uniqueInvigilators.add(id)));
    const uniqueClasses = new Set(todaysPapers.map(p => p.classId).filter(Boolean));

    return {
      papersCount: todaysPapers.length,
      roomsCount: uniqueRooms.size,
      invigilatorsCount: uniqueInvigilators.size,
      classesCount: uniqueClasses.size,
      runningCount: todaysPapers.filter(p => p.operationalStatus === 'running').length
    };
  }, [todaysPapers]);

  // Handle Notice
  const handleSendNotice = async () => {
    if (!noticeForm.message) return;
    try {
      const provider = getDataProvider();
      const dateStr = new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
      
      await provider.createNotice({
        title: `${noticeForm.type} Notice - ${ongoingSession.name}`,
        titleEn: `${noticeForm.type} Notice - ${ongoingSession.name}`,
        content: noticeForm.message,
        contentEn: noticeForm.message,
        date: dateStr,
        isPinned: noticeForm.type === 'Emergency',
        status: "Published",
        category: "examination",
        priority: noticeForm.type === 'Emergency' ? 'urgent' : 'high',
        audience: { roles: ["student", "parent", "teacher"], classes: [] }
      });
      setNoticeStatus("Notice dispatched successfully!");
      setNoticeForm({ type: "Emergency", message: "" });
      setTimeout(() => setNoticeStatus(""), 3000);
    } catch (e) {
      console.error(e);
      setNoticeStatus("Failed to send notice.");
    }
  };

  // --- EARLY RETURN FOR EMPTY STATE ---
  if (!loading && !ongoingSession) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6 pb-12">
        <AdminPageHeader
          title="Live Examination Operations"
          subtitle="Real-time control room for active examinations"
          icon={<Activity className="text-[#0077b6]" size={28} />}
        />
        <ExaminationWorkspaceNav activeTab="ongoing" hasActiveExam={hasActiveExam} />
        <MainCard className="h-[400px] flex items-center justify-center bg-white border border-dashed border-gray-300">
          <EmptyState 
            icon={ShieldAlert}
            title="No Active Examination"
            description="This operational workspace becomes available only when an exam cycle enters the Ongoing stage."
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
        title="Live Examination Operations"
        subtitle="Real-time control room for active examinations"
        icon={<Activity className="text-[#0077b6]" size={28} />}
        onRefresh={fetchBaseData}
      />
      <ExaminationWorkspaceNav activeTab="ongoing" hasActiveExam={hasActiveExam} />

      {/* --- ACTIVE CYCLE HEADER --- */}
      <div className="bg-gradient-to-r from-[#03045e] to-[#0077b6] rounded-2xl p-6 text-white flex justify-between items-center shadow-lg">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-white/10 rounded-xl">
            <Activity size={24} className="text-[#caf0f8]" />
          </div>
          <div>
            <div className="text-[10px] uppercase font-bold text-blue-200 tracking-wider">Current Examination</div>
            {ongoingSessions.length > 1 ? (
              <select
                value={activeSessionId}
                onChange={(e) => setActiveSessionId(e.target.value)}
                className="bg-white/10 text-white text-2xl font-black rounded-lg border border-white/20 px-3 py-1 focus:outline-none focus:ring-2 focus:ring-white/50"
              >
                {ongoingSessions.map(s => (
                  <option key={s.id} value={s.id} className="text-gray-900 text-base">{s.name}</option>
                ))}
              </select>
            ) : (
              <h2 className="text-2xl font-black">{ongoingSession?.name}</h2>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-white/10 rounded-full border border-white/20 backdrop-blur-md">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-xs font-black uppercase tracking-wider text-white">Live Operations</span>
        </div>
      </div>

      {/* --- QUICK STATISTICS --- */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <ProgressCard title="Scheduled Papers" value={stats.papersCount} icon={FileText} colorClass="blue" />
        <ProgressCard title="Active Rooms" value={stats.roomsCount} icon={MapPin} colorClass="emerald" />
        <ProgressCard title="Invigilators" value={stats.invigilatorsCount} icon={User} colorClass="amber" />
        <ProgressCard title="Classes Appearing" value={stats.classesCount} icon={CheckCircle2} colorClass="gray" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LEFT COLUMN: ACTIVE PAPERS & FILTERS */}
        <div className="lg:col-span-2 space-y-6">
          <SearchFilterBar
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            searchPlaceholder="Search subject, class, room..."
            filters={[
              {
                value: statusFilter,
                onChange: setStatusFilter,
                options: [
                  { value: "all", label: "All Papers" },
                  { value: "upcoming", label: "Upcoming" },
                  { value: "running", label: "Running" },
                  { value: "completed", label: "Completed" }
                ]
              }
            ]}
          />

          <MainCard className="bg-white border border-gray-100 overflow-hidden shadow-sm">
            <div className="px-6 py-4 border-b border-gray-50 flex justify-between items-center bg-gray-50/50">
              <h3 className="text-sm font-black text-[#03045e] uppercase tracking-wider flex items-center gap-2">
                <Clock size={16} className="text-blue-500"/> Active Examinations (Full Cycle)
              </h3>
              <div className="text-xs font-bold text-gray-500">{currentTime.toLocaleTimeString()}</div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-50/50 text-gray-400 uppercase text-[10px] font-black tracking-wider border-b border-gray-100">
                  <tr>
                    <th className="px-6 py-4">Paper Details</th>
                    <th className="px-6 py-4">Schedule</th>
                    <th className="px-6 py-4">Location</th>
                    <th className="px-6 py-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filteredPapers.map(paper => {
                    const statusConf = STATUS_CONFIG[paper.operationalStatus];
                    return (
                      <tr key={paper.id} className="hover:bg-gray-50/50 transition-colors cursor-pointer group" onClick={() => setSelectedPaper(paper)}>
                        <td className="px-6 py-4">
                          <div className="font-bold text-[#03045e] group-hover:text-blue-600 transition-colors">{paper.subjectName}</div>
                          <div className="text-xs font-semibold text-gray-500">{paper.className}</div>
                        </td>
                        <td className="px-6 py-4">
                        <div className="font-semibold text-gray-700">{formatDate(paper.date)}</div>
                        <div className="font-semibold text-gray-600 mt-0.5">{paper.startTime} - {paper.endTime}</div>
                        <div className="text-[10px] text-gray-400 font-medium">Duration: {paper.duration} min</div>
                      </td>
                        <td className="px-6 py-4">
                          <div className="font-semibold text-gray-700">{paper.roomName}</div>
                          <div className="text-[10px] text-gray-500 font-medium truncate max-w-[150px]">{paper.invigilatorNames}</div>
                        </td>
                        <td className="px-6 py-4">
                          <StatusBadge status={statusConf?.label} />
                        </td>
                      </tr>
                    )
                  })}
                  {filteredPapers.length === 0 && (
                    <tr>
                      <td colSpan="4" className="p-0">
                        <EmptyState 
                          icon={Calendar} 
                          title="No Active Examinations" 
                          description="No active examinations found for today matching the filters." 
                        />
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </MainCard>


        </div>

        {/* RIGHT COLUMN: SIDEBAR */}
        <div className="space-y-6">
          {/* Emergency Notice */}
          <MainCard className="bg-white border border-red-100 overflow-hidden shadow-sm">
            <div className="px-5 py-3 border-b border-red-50 bg-red-50/50">
              <h3 className="text-xs font-black text-red-700 uppercase tracking-wider flex items-center gap-2">
                <AlertTriangle size={14} className="text-red-500"/> Operational Notice
              </h3>
            </div>
            <div className="p-5 space-y-4">
              <select
                value={noticeForm.type}
                onChange={e => setNoticeForm(prev => ({...prev, type: e.target.value}))}
                className="w-full p-2 bg-gray-50 border border-gray-200 rounded-lg text-xs font-bold text-gray-700 focus:outline-none"
              >
                <option value="Emergency">Emergency Alert</option>
                <option value="Delay">Schedule Delay</option>
                <option value="Room Change">Room Change</option>
                <option value="General">General Broadcast</option>
              </select>
              
              <textarea
                value={noticeForm.message}
                onChange={e => setNoticeForm(prev => ({...prev, message: e.target.value}))}
                placeholder="Type urgent operational message..."
                rows={3}
                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-200 resize-none"
              />
              
              <button
                onClick={handleSendNotice}
                disabled={!noticeForm.message}
                className="w-full bg-red-600 disabled:bg-red-300 text-white py-2.5 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-colors hover:bg-red-700"
              >
                <Send size={14} /> Dispatch Notice
              </button>
              
              {noticeStatus && (
                <div className="text-[10px] font-bold text-green-600 text-center bg-green-50 p-2 rounded-md">
                  {noticeStatus}
                </div>
              )}
            </div>
          </MainCard>


        </div>
      </div>

      {/* --- PAPER DETAILS DRAWER --- */}
      <Drawer
        isOpen={!!selectedPaper}
        onClose={() => setSelectedPaper(null)}
        title={selectedPaper?.subjectName || "Subject"}
        subtitle={selectedPaper?.className || "Class"}
        width="md:w-[400px]"
      >
        {selectedPaper && (
          <div className="flex flex-col h-full bg-gray-50">
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
                
                {/* Status Badge */}
                <div className="flex items-center justify-between bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                  <span className="text-xs font-bold text-gray-500 uppercase">Operational Status</span>
                  <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-black tracking-wider uppercase border ${STATUS_CONFIG[selectedPaper.operationalStatus].color}`}>
                    {STATUS_CONFIG[selectedPaper.operationalStatus].pulse ? (
                      <div className="relative flex h-2.5 w-2.5">
                        <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${STATUS_CONFIG[selectedPaper.operationalStatus].dot}`}></span>
                        <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${STATUS_CONFIG[selectedPaper.operationalStatus].dot}`}></span>
                      </div>
                    ) : (
                      <div className={`h-2.5 w-2.5 rounded-full ${STATUS_CONFIG[selectedPaper.operationalStatus].dot}`} />
                    )}
                    {STATUS_CONFIG[selectedPaper.operationalStatus].label}
                  </div>
                </div>

                <div>
                  <h4 className="text-xs font-black uppercase tracking-wider text-gray-400 mb-4">Timing Details</h4>
                  <div className="space-y-3 bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="text-[10px] text-gray-400 font-bold uppercase">Date</div>
                        <div className="text-sm font-medium text-gray-700">{selectedPaper.date ? new Date(selectedPaper.date).toLocaleDateString() : 'N/A'}</div>
                      </div>
                      <div>
                        <div className="text-[10px] text-gray-400 font-bold uppercase">Time</div>
                        <div className="text-sm font-medium text-gray-700">{selectedPaper.startTime} - {selectedPaper.endTime}</div>
                      </div>
                      <div>
                        <div className="text-[10px] text-gray-400 font-bold uppercase">Duration</div>
                        <div className="text-sm font-medium text-gray-700">{selectedPaper.duration} minutes</div>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-xs font-black uppercase tracking-wider text-gray-400 mb-4">Location & Staff</h4>
                  <div className="space-y-3 bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
                    <div>
                      <div className="text-[10px] text-gray-400 font-bold uppercase">Examination Room</div>
                      <div className="text-sm font-medium text-gray-700">
                        {selectedPaper.roomName}
                      </div>
                    </div>
                    <div className="pt-2 border-t border-gray-50">
                      <div className="text-[10px] text-gray-400 font-bold uppercase">Invigilators</div>
                      <div className="text-sm font-medium text-gray-700 mt-1">
                        {selectedPaper.invigilatorNames}
                      </div>
                    </div>
                  </div>
                </div>

                {selectedPaper.remarks && (
                  <div>
                    <h4 className="text-xs font-black uppercase tracking-wider text-gray-400 mb-4">Remarks</h4>
                    <div className="bg-amber-50 p-3 rounded-xl border border-amber-100 text-sm text-amber-800">
                      {selectedPaper.remarks}
                    </div>
                  </div>
                )}
            </div>
          </div>
        )}
      </Drawer>
    </motion.div>
  );
};

export default LiveOperationsPage;
