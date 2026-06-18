import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShieldAlert,
  Lock,
  Unlock,
  MapPin,
  Megaphone,
  Clock,
  CheckCircle2,
  Users,
  ChevronRight,
  TrendingUp,
} from "lucide-react";
import MalpracticeConsole from "./MalpracticeConsole";
import AttendanceLockPanel from "./AttendanceLockPanel";
import RoomSupervisionPanel from "./RoomSupervisionPanel";
import EmergencyBroadcastPanel from "./EmergencyBroadcastPanel";
import MainCard from "../../../MainCard";

const OngoingOperationsDashboard = ({
  activeExamCycle,
  papers,
  subjects,
  classes,
  students,
  teachers,
  rooms,
  onSendEmergencyBroadcast, // function to bubble up notice creation if needed
}) => {
  const [activeSubTab, setActiveSubTab] = useState("malpractice");

  // Operational State synced to localStorage
  const examCycleId = activeExamCycle.id;
  const storagePrefix = `exam_op_state_${examCycleId}`;

  const [incidents, setIncidents] = useState([]);
  const [attendanceLocks, setAttendanceLocks] = useState({});
  const [paperAttendance, setPaperAttendance] = useState({});
  const [timeline, setTimeline] = useState([]);
  const [broadcasts, setBroadcasts] = useState([]);

  // Load from LocalStorage on mount/exam cycle change
  useEffect(() => {
    try {
      const storedIncidents = localStorage.getItem(`${storagePrefix}_incidents`);
      const storedLocks = localStorage.getItem(`${storagePrefix}_locks`);
      const storedAttendance = localStorage.getItem(`${storagePrefix}_attendance`);
      const storedTimeline = localStorage.getItem(`${storagePrefix}_timeline`);
      const storedBroadcasts = localStorage.getItem(`${storagePrefix}_broadcasts`);

      setIncidents(storedIncidents ? JSON.parse(storedIncidents) : [
        {
          id: `mc-1`,
          examCycleId,
          paperId: papers[0]?.id || "paper-001",
          studentId: "stud-001",
          severity: "Medium",
          incidentDetails: "Possession of loose sheets with formula notes scribbled in margins.",
          disciplinaryAction: "Scribbled sheets confiscated. Official warning recorded.",
          reportedBy: "admin-001",
          reportedAt: new Date(Date.now() - 3600000 * 2.5).toISOString(), // 2.5 hrs ago
          status: "reviewed",
        },
        {
          id: `mc-2`,
          examCycleId,
          paperId: papers[1]?.id || "paper-002",
          studentId: "stud-002",
          severity: "Low",
          incidentDetails: "Repeated attempts to whisper answers across row during MCQs.",
          disciplinaryAction: "Seat reassigned to front desk. Strict invigilator warning.",
          reportedBy: "admin-001",
          reportedAt: new Date(Date.now() - 3600000 * 1.2).toISOString(), // 1.2 hrs ago
          status: "reported",
        }
      ]);

      setAttendanceLocks(storedLocks ? JSON.parse(storedLocks) : {});
      setPaperAttendance(storedAttendance ? JSON.parse(storedAttendance) : {});
      setTimeline(storedTimeline ? JSON.parse(storedTimeline) : [
        {
          id: "t-1",
          time: new Date(Date.now() - 3600000 * 3).toISOString(),
          message: "Live operations initiated. Operational control locks established.",
          type: "system",
        },
        {
          id: "t-2",
          time: new Date(Date.now() - 3600000 * 2.5).toISOString(),
          message: "Malpractice infraction logged for student: Rahul Sharma in English Paper.",
          type: "malpractice",
        },
        {
          id: "t-3",
          time: new Date(Date.now() - 3600000 * 1.2).toISOString(),
          message: "Malpractice infraction logged for student: Priya Patel in Science Paper.",
          type: "malpractice",
        }
      ]);
      setBroadcasts(storedBroadcasts ? JSON.parse(storedBroadcasts) : []);
    } catch (e) {
      console.error("Failed to load operations state:", e);
    }
  }, [examCycleId, storagePrefix, papers]);

  // Sync to localStorage helpers
  const saveIncidents = (updated) => {
    setIncidents(updated);
    localStorage.setItem(`${storagePrefix}_incidents`, JSON.stringify(updated));
  };

  const saveLocks = (updated) => {
    setAttendanceLocks(updated);
    localStorage.setItem(`${storagePrefix}_locks`, JSON.stringify(updated));
  };

  const saveAttendance = (updated) => {
    setPaperAttendance(updated);
    localStorage.setItem(`${storagePrefix}_attendance`, JSON.stringify(updated));
  };

  const saveTimeline = (updated) => {
    setTimeline(updated);
    localStorage.setItem(`${storagePrefix}_timeline`, JSON.stringify(updated));
  };

  const saveBroadcasts = (updated) => {
    setBroadcasts(updated);
    localStorage.setItem(`${storagePrefix}_broadcasts`, JSON.stringify(updated));
  };

  // Add Incident handler
  const handleAddIncident = (newIncident) => {
    const report = {
      id: `mc-${Date.now()}`,
      examCycleId,
      reportedBy: "admin-001",
      reportedAt: new Date().toISOString(),
      status: "reported",
      ...newIncident,
    };

    const updated = [report, ...incidents];
    saveIncidents(updated);

    // Update timeline
    const student = students.find((s) => s.id === newIncident.studentId);
    const paper = papers.find((p) => p.id === newIncident.paperId);
    const sub = paper ? subjects.find((s) => s.id === paper.subjectId) : null;
    const studentName = student ? student.name : "Student";
    const subName = sub ? sub.name : "Subject";

    const log = {
      id: `t-${Date.now()}`,
      time: new Date().toISOString(),
      message: `Malpractice infraction logged for ${studentName} (${subName} Paper).`,
      type: "malpractice",
    };
    saveTimeline([log, ...timeline]);
  };

  // Update Malpractice Status
  const handleUpdateMalpracticeStatus = (id, status) => {
    const updated = incidents.map((inc) => (inc.id === id ? { ...inc, status } : inc));
    saveIncidents(updated);

    const inc = incidents.find((i) => i.id === id);
    const student = inc ? students.find((s) => s.id === inc.studentId) : null;
    const studentName = student ? student.name : "Student";

    const log = {
      id: `t-${Date.now()}`,
      time: new Date().toISOString(),
      message: `Malpractice report for ${studentName} updated status to ${status.toUpperCase()}.`,
      type: "system",
    };
    saveTimeline([log, ...timeline]);
  };

  // Toggle Attendance Lock
  const handleToggleAttendanceLock = (paperId) => {
    const isCurrentlyLocked = !!attendanceLocks[paperId];
    const updated = {
      ...attendanceLocks,
      [paperId]: !isCurrentlyLocked,
    };
    saveLocks(updated);

    const paper = papers.find((p) => p.id === paperId);
    const sub = paper ? subjects.find((s) => s.id === paper.subjectId) : null;
    const subName = sub ? sub.name : "Subject";
    const cls = paper ? classes.find((c) => c.id === paper.classId) : null;
    const className = cls?.displayName || cls?.name || "Class";

    const log = {
      id: `t-${Date.now()}`,
      time: new Date().toISOString(),
      message: `Exam Attendance registration ${!isCurrentlyLocked ? "LOCKED" : "UNLOCKED"} for ${subName} (${className}).`,
      type: "lock",
    };
    saveTimeline([log, ...timeline]);
  };

  // Update per-student attendance
  const handleUpdateStudentAttendance = (paperId, studentId, status) => {
    const active = paperAttendance[paperId] || {};
    const updated = {
      ...paperAttendance,
      [paperId]: {
        ...active,
        [studentId]: status,
      },
    };
    saveAttendance(updated);
  };

  // Send Emergency Broadcast
  const handleSendBroadcast = async (broadcastData) => {
    const newBroadcast = {
      id: `bc-${Date.now()}`,
      createdAt: new Date().toISOString(),
      ...broadcastData,
    };

    saveBroadcasts([newBroadcast, ...broadcasts]);

    const log = {
      id: `t-${Date.now()}`,
      time: new Date().toISOString(),
      message: `Emergency exam circular broadcasted: "${broadcastData.title}".`,
      type: "broadcast",
    };
    saveTimeline([log, ...timeline]);

    // Bubble up to Notice system
    if (onSendEmergencyBroadcast) {
      await onSendEmergencyBroadcast(broadcastData);
    }
  };

  // Calculate quick metrics
  const activeRoomsCount = useMemo(() => {
    return new Set(papers.map((p) => p.roomId).filter(Boolean)).size;
  }, [papers]);

  const lockedPapersCount = useMemo(() => {
    return Object.values(attendanceLocks).filter(Boolean).length;
  }, [attendanceLocks]);

  return (
    <div className="space-y-6">
      {/* Top Operations Quick Metrics & Timeline Bar */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Quick Info Grid */}
        <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-2 sm:grid-cols-4 gap-6">
          <MainCard className="p-4 flex flex-col justify-between border-l-4 border-rose-500">
            <div className="space-y-0.5">
              <span className="text-[9px] uppercase font-bold text-gray-400">Total Infractions</span>
              <h4 className="text-xl font-black text-rose-600">{incidents.length}</h4>
            </div>
            <span className="text-[8px] font-black uppercase text-rose-500 tracking-wider">Active Malpractice Feed</span>
          </MainCard>

          <MainCard className="p-4 flex flex-col justify-between border-l-4 border-amber-500">
            <div className="space-y-0.5">
              <span className="text-[9px] uppercase font-bold text-gray-400">Frozen Registers</span>
              <h4 className="text-xl font-black text-amber-600">
                {lockedPapersCount} / {papers.length}
              </h4>
            </div>
            <span className="text-[8px] font-black uppercase text-amber-500 tracking-wider">Per-Paper Attendance Locks</span>
          </MainCard>

          <MainCard className="p-4 flex flex-col justify-between border-l-4 border-sky-500">
            <div className="space-y-0.5">
              <span className="text-[9px] uppercase font-bold text-gray-400">Supervised Rooms</span>
              <h4 className="text-xl font-black text-sky-600">{activeRoomsCount}</h4>
            </div>
            <span className="text-[8px] font-black uppercase text-sky-500 tracking-wider">Active Occupancy Maps</span>
          </MainCard>

          <MainCard className="p-4 flex flex-col justify-between border-l-4 border-purple-500">
            <div className="space-y-0.5">
              <span className="text-[9px] uppercase font-bold text-gray-400">Circular Alerts</span>
              <h4 className="text-xl font-black text-purple-600">{broadcasts.length}</h4>
            </div>
            <span className="text-[8px] font-black uppercase text-purple-500 tracking-wider">Dispatched Broadcasts</span>
          </MainCard>
        </div>

        {/* Live Timeline Feed */}
        <div className="lg:col-span-4 bg-white p-4 rounded-3xl border border-gray-100 shadow-sm flex flex-col gap-3 max-h-[140px] overflow-hidden">
          <div className="flex justify-between items-center">
            <h5 className="text-[10px] font-black text-[#03045e] uppercase tracking-wider flex items-center gap-1">
              <Clock size={11} className="text-sky-500" />
              <span>Live Operations Timeline</span>
            </h5>
            <span className="text-[8px] font-black text-[#0077b6] uppercase tracking-widest bg-[#0077b6]/5 px-2 py-0.5 rounded animate-pulse">
              Live Feed
            </span>
          </div>

          <div className="space-y-2 overflow-y-auto pr-1 flex-1">
            {timeline.map((log) => (
              <div key={log.id} className="flex gap-2 text-[10px] font-medium leading-relaxed border-l-2 border-gray-100 pl-2">
                <span className="text-gray-400 shrink-0">
                  {new Date(log.time).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </span>
                <span className="text-[#03045e]">
                  {log.message}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Console Tab Selectors */}
      <div className="flex gap-1 bg-gray-50 border border-gray-200/60 p-1.5 rounded-2xl max-w-2xl">
        {[
          { id: "malpractice", label: "Malpractice Console", icon: ShieldAlert, color: "text-rose-500" },
          { id: "attendance", label: "Exam Attendance locks", icon: Lock, color: "text-amber-500" },
          { id: "supervision", label: "Room Supervision", icon: MapPin, color: "text-sky-500" },
          { id: "emergency", label: "Emergency Broadcasts", icon: Megaphone, color: "text-purple-500" },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeSubTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id)}
              className={`flex-1 flex items-center justify-center gap-1.5 py-3.5 px-3 rounded-xl font-black text-[10px] uppercase tracking-wider transition-all border ${
                isActive
                  ? "bg-white border-gray-200/80 text-[#03045e] shadow-sm font-black"
                  : "bg-transparent border-transparent text-gray-400 hover:text-gray-600"
              }`}
            >
              <Icon size={12} className={isActive ? tab.color : "text-gray-400"} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Active Panel Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeSubTab}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.15 }}
          className="bg-neutral-50/20 p-1.5 rounded-3xl"
        >
          {activeSubTab === "malpractice" && (
            <MalpracticeConsole
              students={students}
              papers={papers}
              subjects={subjects}
              classes={classes}
              incidents={incidents}
              onAddIncident={handleAddIncident}
              onUpdateStatus={handleUpdateMalpracticeStatus}
            />
          )}

          {activeSubTab === "attendance" && (
            <AttendanceLockPanel
              papers={papers}
              subjects={subjects}
              classes={classes}
              students={students}
              attendanceLocks={attendanceLocks}
              paperAttendance={paperAttendance}
              onToggleLock={handleToggleAttendanceLock}
              onUpdateAttendance={handleUpdateStudentAttendance}
            />
          )}

          {activeSubTab === "supervision" && (
            <RoomSupervisionPanel
              papers={papers}
              rooms={rooms}
              teachers={teachers}
              students={students}
              classes={classes}
            />
          )}

          {activeSubTab === "emergency" && (
            <EmergencyBroadcastPanel
              broadcasts={broadcasts}
              onSendBroadcast={handleSendBroadcast}
            />
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default OngoingOperationsDashboard;
