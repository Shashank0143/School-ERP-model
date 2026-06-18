import React, { useState, useEffect } from "react";
import { Award, Clock, CheckCircle, AlertCircle, Calendar, Users, BookOpen, ShieldAlert } from "lucide-react";
import AdminStatCard from "../../../AdminStatCard";
import MainCard from "../../../../MainCard";
import MarksEntryConsole from "./MarksEntryConsole";
import ModerationPanel from "./ModerationPanel";
import PendingEvaluationsPanel from "./PendingEvaluationsPanel";
import EvaluationTimelineFeed from "./EvaluationTimelineFeed";
import { getEvaluationProgress } from "../../../../../services/examService";

export default function EvaluationDashboard({
  examCycle,
  papers,
  classes,
  subjects,
  teachers,
  rooms,
  students,
  results,
  onRefresh,
}) {
  const [activeSubTab, setActiveSubTab] = useState("overview");
  const [progressStats, setProgressStats] = useState({
    totalPapers: 0,
    evaluatedPapers: 0,
    moderatedPapers: 0,
    lockedPapers: 0,
    pendingTeachers: 0,
    overdueEvaluations: 0,
    completionPercentage: 0,
  });

  const sessionPapers = papers.filter((p) => p.examSessionId === examCycle?.id);

  const [selectedPaperForEntry, setSelectedPaperForEntry] = useState(null);
  const [overviewClassFilter, setOverviewClassFilter] = useState("");
  const [entryClassFilter, setEntryClassFilter] = useState("");

  const fetchProgress = async () => {
    if (!examCycle) return;
    const progress = await getEvaluationProgress(examCycle.id);
    setProgressStats(progress);
  };

  useEffect(() => {
    fetchProgress();
  }, [examCycle, papers]);

  if (!examCycle) {
    return (
      <div className="p-8 text-center bg-gray-50 border border-gray-100 rounded-2xl text-gray-400 font-bold uppercase tracking-wider text-xs">
        No active exam cycle selected or available for evaluation
      </div>
    );
  }

  const subTabs = [
    { id: "overview", label: "Overview & Timeline" },
    { id: "entry", label: "Marks Entry Console" },
    { id: "moderation", label: "Moderation Queue" },
    { id: "pending", label: "Pending Tracker" },
  ];

  return (
    <div className="space-y-6">
      {/* Overview stats */}
      <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-fade-in">
        <AdminStatCard
          title="Grading Progress"
          value={`${progressStats.completionPercentage}%`}
          badgeText={`Evaluated ${progressStats.evaluatedPapers}/${progressStats.totalPapers}`}
          badgeType="success"
          icon={Award}
        />
        <AdminStatCard
          title="Moderated Papers"
          value={progressStats.moderatedPapers.toString()}
          badgeText="Pending Lock"
          badgeType="info"
          icon={BookOpen}
          color="#0096c7"
          bg="#ade8f4"
        />
        <AdminStatCard
          title="Locked Scorecards"
          value={progressStats.lockedPapers.toString()}
          badgeText="Published to official ERP"
          badgeType="success"
          icon={CheckCircle}
          color="#03045e"
          bg="#e0f2fe"
        />
        <AdminStatCard
          title="Pending Evaluators"
          value={progressStats.pendingTeachers.toString()}
          badgeText="Needs Attention"
          badgeType="warning"
          icon={Clock}
          color="#d97706"
          bg="#fef3c7"
        />
      </div>

      {/* Internal Navigation Tabs */}
      <div className="flex gap-1.5 border-b border-[#caf0f8]/30 pb-px">
        {subTabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveSubTab(tab.id)}
            className={`px-4 py-2.5 rounded-t-2xl text-[10px] font-black tracking-wider uppercase transition-colors relative ${
              activeSubTab === tab.id
                ? "bg-white border border-[#caf0f8] border-b-transparent text-[#0077b6]"
                : "text-gray-400 hover:text-gray-600"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="bg-white p-6 rounded-3xl border border-[#caf0f8]/50 shadow-sm animate-fade-in">
        {/* VIEW 1: OVERVIEW */}
        {activeSubTab === "overview" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                <div>
                  <h4 className="text-xs font-black text-[#03045e] uppercase tracking-wider">
                    Grading Completion Map
                  </h4>
                  <p className="text-[9px] text-gray-400 font-bold uppercase mt-0.5">
                    Select a paper to record or review marks directly
                  </p>
                </div>
                <select
                  value={overviewClassFilter}
                  onChange={(e) => setOverviewClassFilter(e.target.value)}
                  className="p-2 rounded-xl border border-gray-150 bg-gray-50 text-xs font-bold outline-none cursor-pointer min-w-[200px]"
                >
                  <option value="">All Classes</option>
                  {classes.filter(c => sessionPapers.some(p => p.classId === c.id)).map(c => (
                    <option key={c.id} value={c.id}>{c.displayName || c.name || c.id}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 gap-4">
                {sessionPapers
                  .filter(p => !overviewClassFilter || p.classId === overviewClassFilter)
                  .map((p) => {
                  const cls = classes.find((c) => c.id === p.classId);
                  const sub = subjects.find((s) => s.id === p.subjectId);

                  const allRecordsStr = localStorage.getItem(`exam_op_state_${examCycle.id}_evaluation_records`) || "[]";
                  const allRecords = JSON.parse(allRecordsStr);
                  const paperRecords = allRecords.filter((r) => r.paperId === p.id);
                  const isGraded = paperRecords.length > 0 && paperRecords.every(r => r.status !== "draft");
                  const isLocked = p.status === "locked" || paperRecords.every(r => r.status === "locked");

                  return (
                    <div
                      key={p.id}
                      onClick={() => {
                        setEntryClassFilter(p.classId);
                        setSelectedPaperForEntry(p);
                        setActiveSubTab("entry");
                      }}
                      className="p-4 rounded-2xl border border-gray-150 hover:border-[#0077b6]/30 cursor-pointer bg-white transition-all hover:shadow-sm space-y-3 flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex justify-between items-start">
                          <span className="text-[8px] font-black uppercase text-gray-400">
                            {p.id}
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-wider ${
                              isLocked
                                ? "bg-indigo-50 border border-indigo-100 text-indigo-600"
                                : isGraded
                                  ? "bg-emerald-50 border border-emerald-100 text-emerald-600"
                                  : "bg-amber-50 border border-amber-100 text-amber-600"
                            }`}
                          >
                            {isLocked ? "locked" : isGraded ? "graded" : "pending"}
                          </span>
                        </div>
                        <h5 className="text-xs font-black text-[#03045e] mt-1.5">
                          {sub?.name || p.subjectId}
                        </h5>
                        <p className="text-[10px] text-gray-500 font-bold uppercase mt-0.5">
                          {cls?.displayName || p.classId}
                        </p>
                      </div>

                      <div className="flex items-center justify-between text-[9px] font-black uppercase text-gray-400 pt-2 border-t border-gray-50 mt-1">
                        <span>Workspace</span>
                        <span className="text-[#0077b6] hover:underline flex items-center gap-0.5">
                          Open Scoresheet →
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="bg-slate-50/50 p-5 rounded-3xl border border-slate-200/50">
              <EvaluationTimelineFeed examCycle={examCycle} />
            </div>
          </div>
        )}

        {/* VIEW 2: MARKS ENTRY CONSOLE */}
        {activeSubTab === "entry" && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 pb-4 border-b border-gray-50">
              <div>
                <h4 className="text-xs font-black text-[#03045e] uppercase tracking-wider">
                  Academic Scores Entry
                </h4>
                <p className="text-[9px] text-gray-400 font-bold uppercase mt-0.5">
                  Record marks, check attendance, and enter remarks
                </p>
              </div>

              <div className="flex items-center gap-3">
                <select
                  value={entryClassFilter}
                  onChange={(e) => {
                    setEntryClassFilter(e.target.value);
                    setSelectedPaperForEntry(null);
                  }}
                  className="p-2 rounded-xl border border-gray-150 bg-gray-50 text-xs font-bold outline-none cursor-pointer min-w-[150px]"
                >
                  <option value="">Select Class</option>
                  {classes.filter(c => sessionPapers.some(p => p.classId === c.id)).map(c => (
                    <option key={c.id} value={c.id}>{c.displayName || c.name || c.id}</option>
                  ))}
                </select>

                <select
                  value={selectedPaperForEntry?.id || ""}
                  onChange={(e) => {
                    const paperObj = sessionPapers.find((p) => p.id === e.target.value);
                    setSelectedPaperForEntry(paperObj || null);
                  }}
                  disabled={!entryClassFilter}
                  className="p-2 rounded-xl border border-gray-150 bg-gray-50 text-xs font-bold outline-none cursor-pointer disabled:opacity-50 min-w-[180px]"
                >
                  <option value="">Select paper slot</option>
                  {sessionPapers
                    .filter(p => p.classId === entryClassFilter)
                    .map((p) => {
                      const sub = subjects.find((s) => s.id === p.subjectId);
                      return (
                        <option key={p.id} value={p.id}>
                          {sub?.name || p.subjectId}
                        </option>
                      );
                    })}
                </select>
              </div>
            </div>

            <MarksEntryConsole
              examCycle={examCycle}
              paper={selectedPaperForEntry}
              students={students}
              subjects={subjects}
              classes={classes}
              onSaveRecord={fetchProgress}
              onRefresh={onRefresh}
            />
          </div>
        )}

        {/* VIEW 3: MODERATION PANEL */}
        {activeSubTab === "moderation" && (
          <ModerationPanel
            examCycle={examCycle}
            papers={papers}
            classes={classes}
            subjects={subjects}
            teachers={teachers}
            students={students}
            onRefresh={() => {
              fetchProgress();
              onRefresh();
            }}
          />
        )}

        {/* VIEW 4: PENDING TRACKER */}
        {activeSubTab === "pending" && (
          <PendingEvaluationsPanel
            examCycle={examCycle}
            papers={papers}
            classes={classes}
            subjects={subjects}
            teachers={teachers}
            students={students}
          />
        )}
      </div>
    </div>
  );
}
