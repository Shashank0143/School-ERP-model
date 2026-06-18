import React, { useState, useMemo } from "react";
import { Lock, Unlock, Users, AlertCircle, FileText, Check } from "lucide-react";

const AttendanceLockPanel = ({
  papers,
  subjects,
  classes,
  students,
  attendanceLocks,
  paperAttendance,
  onToggleLock,
  onUpdateAttendance,
}) => {
  const [selectedPaperId, setSelectedPaperId] = useState("");

  const selectedPaper = useMemo(() => {
    return papers.find((p) => p.id === selectedPaperId) || papers[0] || null;
  }, [papers, selectedPaperId]);

  // Set default selection on load
  React.useEffect(() => {
    if (papers.length > 0 && !selectedPaperId) {
      setSelectedPaperId(papers[0].id);
    }
  }, [papers, selectedPaperId]);

  const classObj = useMemo(() => {
    if (!selectedPaper) return null;
    return classes.find((c) => c.id === selectedPaper.classId);
  }, [selectedPaper, classes]);

  const subjectObj = useMemo(() => {
    if (!selectedPaper) return null;
    return subjects.find((s) => s.id === selectedPaper.subjectId);
  }, [selectedPaper, subjects]);

  // Filter students by class
  const classStudents = useMemo(() => {
    if (!selectedPaper) return [];
    return students.filter((s) => s.classId === selectedPaper.classId);
  }, [selectedPaper, students]);

  const isLocked = useMemo(() => {
    if (!selectedPaper) return false;
    return !!attendanceLocks[selectedPaper.id];
  }, [selectedPaper, attendanceLocks]);

  // Resolve attendance states
  const activeAttendance = useMemo(() => {
    if (!selectedPaper) return {};
    return paperAttendance[selectedPaper.id] || {};
  }, [selectedPaper, paperAttendance]);

  const stats = useMemo(() => {
    const total = classStudents.length;
    const present = classStudents.filter((s) => activeAttendance[s.id] !== "Absent").length;
    const absent = total - present;
    return { total, present, absent };
  }, [classStudents, activeAttendance]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* Papers Sidebar Selector */}
      <div className="lg:col-span-4 bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col gap-4">
        <div>
          <h4 className="text-xs font-black text-[#03045e] uppercase tracking-wider flex items-center gap-1.5">
            <FileText size={14} className="text-[#0077b6]" />
            <span>Select Scheduled Paper</span>
          </h4>
          <p className="text-[9px] text-gray-400 font-bold uppercase mt-0.5">
            Manage attendance lock per examination paper
          </p>
        </div>

        <div className="space-y-2 max-h-[420px] overflow-y-auto pr-1">
          {papers.map((p) => {
            const sub = subjects.find((s) => s.id === p.subjectId);
            const cls = classes.find((c) => c.id === p.classId);
            const paperLocked = !!attendanceLocks[p.id];

            return (
              <button
                key={p.id}
                onClick={() => setSelectedPaperId(p.id)}
                className={`w-full text-left p-3.5 rounded-xl border transition-all flex items-center justify-between gap-3 ${
                  selectedPaperId === p.id
                    ? "bg-[#0077b6]/5 border-[#0077b6]/20 text-[#03045e]"
                    : "bg-white border-gray-100 hover:border-gray-200 text-gray-500"
                }`}
              >
                <div className="space-y-1">
                  <h5 className="text-xs font-black leading-none">
                    {sub?.name || p.subjectId}
                  </h5>
                  <span className="text-[9px] font-bold text-gray-400 block uppercase">
                    {cls?.displayName || cls?.name || p.classId} • {p.startTime}
                  </span>
                </div>

                <span className={`p-1.5 rounded-lg border shrink-0 ${paperLocked ? "bg-rose-50 border-rose-100 text-rose-500" : "bg-gray-50 border-gray-100 text-gray-400"}`}>
                  {paperLocked ? <Lock size={12} /> : <Unlock size={12} />}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Student Attendance List */}
      <div className="lg:col-span-8 bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col gap-4">
        {selectedPaper ? (
          <>
            {/* Header with quick stats & lock toggle */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-50 pb-4">
              <div>
                <h4 className="text-sm font-black text-[#03045e] tracking-tight">
                  {subjectObj?.name || selectedPaper.subjectId} — Class {classObj?.displayName || classObj?.name || selectedPaper.classId}
                </h4>
                <div className="flex items-center gap-3 text-[10px] uppercase font-bold text-gray-400 mt-1">
                  <span>Total: {stats.total}</span>
                  <span className="text-emerald-500">Present: {stats.present}</span>
                  <span className="text-rose-500">Absent: {stats.absent}</span>
                </div>
              </div>

              <button
                onClick={() => onToggleLock(selectedPaper.id)}
                className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl border font-black text-[10px] transition-all uppercase shrink-0 shadow-sm ${
                  isLocked
                    ? "bg-rose-600 border-rose-500 hover:bg-rose-700 text-white"
                    : "bg-white border-gray-200 hover:bg-gray-50 text-gray-700"
                }`}
              >
                {isLocked ? (
                  <>
                    <Lock size={12} />
                    <span>🔐 LOCK ACTIVE (FREEZE)</span>
                  </>
                ) : (
                  <>
                    <Unlock size={12} />
                    <span>🔒 FREEZE EXAM ATTENDANCE</span>
                  </>
                )}
              </button>
            </div>

            {/* Locked Info Alert */}
            {isLocked && (
              <div className="p-3.5 bg-rose-50/50 border border-rose-100 rounded-xl flex gap-2.5 text-rose-800 animate-fade-in">
                <Lock size={14} className="shrink-0 mt-0.5 text-rose-500" />
                <p className="text-[10px] font-semibold leading-relaxed">
                  <strong>Exam Attendance Frozen:</strong> Submissions are locked for invigilators and parents. Portal modifications are disabled to guarantee secure record-keeping.
                </p>
              </div>
            )}

            {/* Students Table */}
            <div className="overflow-x-auto overflow-y-auto max-h-[380px] w-full pr-1">
              <table className="w-full min-w-[800px] text-left text-xs font-bold text-gray-700">
                <thead>
                  <tr className="border-b border-gray-100 text-[9px] uppercase font-black text-gray-400 tracking-wider">
                    <th className="pb-3 w-32">Admission No</th>
                    <th className="pb-3">Student Name</th>
                    <th className="pb-3 text-right pr-6 w-48">Attendance Register</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {classStudents.map((stud) => {
                    const status = activeAttendance[stud.id] || "Present";
                    return (
                      <tr key={stud.id} className="hover:bg-gray-50/20">
                        <td className="py-3.5 text-gray-400 font-medium">{stud.admissionNo}</td>
                        <td className="py-3.5 text-[#03045e] font-black">{stud.name}</td>
                        <td className="py-3.5 text-right">
                          <div className="inline-flex gap-1.5 p-1 bg-gray-50 rounded-lg border border-gray-100">
                            <button
                              disabled={isLocked}
                              onClick={() => onUpdateAttendance(selectedPaper.id, stud.id, "Present")}
                              className={`px-3 py-1 rounded-md text-[9px] font-black uppercase transition-all ${
                                status === "Present"
                                  ? "bg-emerald-500 text-white shadow-sm"
                                  : "text-gray-400 hover:text-gray-600 disabled:opacity-50"
                              }`}
                            >
                              Present
                            </button>
                            <button
                              disabled={isLocked}
                              onClick={() => onUpdateAttendance(selectedPaper.id, stud.id, "Absent")}
                              className={`px-3 py-1 rounded-md text-[9px] font-black uppercase transition-all ${
                                status === "Absent"
                                  ? "bg-rose-500 text-white shadow-sm"
                                  : "text-gray-400 hover:text-gray-600 disabled:opacity-50"
                              }`}
                            >
                              Absent
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}

                  {classStudents.length === 0 && (
                    <tr>
                      <td colSpan={3} className="text-center py-8 text-gray-400 font-bold uppercase text-[10px]">
                        No students enrolled in this class level
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <AlertCircle size={28} className="text-gray-300 mb-2" />
            <h5 className="text-xs font-black text-gray-400 uppercase">No Papers Scheduled</h5>
            <p className="text-[9px] text-gray-400 max-w-xs mt-1 leading-normal">
              You must schedule exam slots before managing operations attendance logs.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AttendanceLockPanel;
