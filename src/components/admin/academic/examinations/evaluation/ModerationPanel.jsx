import React, { useState, useMemo } from "react";
import { ShieldAlert, Award, ArrowUpRight, CheckCircle, Lock, Edit } from "lucide-react";
import GradeOverrideDrawer from "./GradeOverrideDrawer";
import { getDataProvider } from "../../../../../data";

export default function ModerationPanel({
  examCycle,
  papers,
  classes,
  subjects,
  teachers,
  students,
  onRefresh,
}) {
  const [selectedPaperId, setSelectedPaperId] = useState("");
  const [activeOverrideStudent, setActiveOverrideStudent] = useState(null);
  const [isOverrideDrawerOpen, setIsOverrideDrawerOpen] = useState(false);
  const [success, setSuccess] = useState("");

  const sessionPapers = useMemo(() => {
    if (!examCycle) return [];
    return papers.filter((p) => p.examSessionId === examCycle.id);
  }, [papers, examCycle]);

  const activePaper = useMemo(() => {
    return sessionPapers.find((p) => p.id === selectedPaperId) || null;
  }, [sessionPapers, selectedPaperId]);

  const evaluationRecords = useMemo(() => {
    if (!examCycle || !selectedPaperId) return [];
    const stored = localStorage.getItem(`exam_op_state_${examCycle.id}_evaluation_records`) || "[]";
    const allRecords = JSON.parse(stored);
    return allRecords.filter((r) => r.paperId === selectedPaperId);
  }, [examCycle, selectedPaperId, success]);

  const mappedStudentMarks = useMemo(() => {
    if (!activePaper) return [];
    const classStudents = students.filter((s) => s.classId === activePaper.classId);

    return classStudents.map((stud) => {
      const record = evaluationRecords.find((r) => r.studentId === stud.id);
      return {
        student: stud,
        record: record || null,
      };
    });
  }, [activePaper, students, evaluationRecords]);

  const handleApplyOverride = (overrideData) => {
    if (!examCycle || !selectedPaperId) return;

    try {
      const stored = localStorage.getItem(`exam_op_state_${examCycle.id}_evaluation_records`) || "[]";
      let allRecords = JSON.parse(stored);

      // Find the index of the existing record to override
      const idx = allRecords.findIndex(
        (r) => r.paperId === selectedPaperId && r.studentId === overrideData.studentId
      );

      const totalVal = overrideData.theoryMarks + overrideData.practicalMarks;
      const maxTotal = (activePaper.theoryMarks || 40) + (activePaper.practicalMarks || 0);
      const percent = maxTotal > 0 ? (totalVal / maxTotal) * 100 : 0;
      let grade = "C";
      if (percent >= 90) grade = "A+";
      else if (percent >= 80) grade = "A";
      else if (percent >= 70) grade = "B+";
      else if (percent >= 60) grade = "B";

      const updatedRecord = {
        ...(idx !== -1 ? allRecords[idx] : {}),
        id: `${selectedPaperId}_${overrideData.studentId}`,
        examCycleId: examCycle.id,
        paperId: selectedPaperId,
        studentId: overrideData.studentId,
        classId: activePaper.classId,
        marksObtained: totalVal,
        theoryMarks: overrideData.theoryMarks,
        practicalMarks: overrideData.practicalMarks,
        grade,
        overrideReason: overrideData.overrideReason,
        status: "moderated",
        moderatedBy: "coord-001",
        moderatedAt: new Date().toISOString(),
      };

      if (idx !== -1) {
        allRecords[idx] = updatedRecord;
      } else {
        allRecords.push(updatedRecord);
      }

      localStorage.setItem(`exam_op_state_${examCycle.id}_evaluation_records`, JSON.stringify(allRecords));

      // Append to timeline feed
      const timelineStr = localStorage.getItem(`exam_op_state_${examCycle.id}_evaluation_timeline`) || "[]";
      const timeline = JSON.parse(timelineStr);
      timeline.unshift({
        timestamp: new Date().toISOString(),
        message: `Marks overriden for ${activeOverrideStudent?.name} in ${subjects.find(s => s.id === activePaper.subjectId)?.name || "Subject"}: ${overrideData.overrideReason}`,
        type: "warning",
      });
      localStorage.setItem(`exam_op_state_${examCycle.id}_evaluation_timeline`, JSON.stringify(timeline));

      setSuccess("Grade override successfully applied!");
      setTimeout(() => setSuccess(""), 4000);
    } catch (err) {
      console.error(err);
    }
  };

  const handleNormalizeGrades = () => {
    if (!examCycle || !selectedPaperId || !activePaper) return;

    if (!confirm("Apply +5 Grace Marks to all graded students for normalization?")) return;

    try {
      const stored = localStorage.getItem(`exam_op_state_${examCycle.id}_evaluation_records`) || "[]";
      let allRecords = JSON.parse(stored);

      const maxTotal = (activePaper.theoryMarks || 40) + (activePaper.practicalMarks || 0);

      allRecords = allRecords.map((r) => {
        if (r.paperId !== selectedPaperId) return r;
        if (r.isAbsent) return r;

        const originalMarks = r.marksObtained;
        const normalizedMarks = Math.min(maxTotal, originalMarks + 5);

        const percent = maxTotal > 0 ? (normalizedMarks / maxTotal) * 100 : 0;
        let grade = "C";
        if (percent >= 90) grade = "A+";
        else if (percent >= 80) grade = "A";
        else if (percent >= 70) grade = "B+";
        else if (percent >= 60) grade = "B";

        return {
          ...r,
          marksObtained: normalizedMarks,
          theoryMarks: Math.min(activePaper.theoryMarks || 40, r.theoryMarks + 5),
          grade,
          overrideReason: "Institutional Grade Normalization (+5 grace marks applied)",
          status: "moderated",
          moderatedBy: "coord-001",
          moderatedAt: new Date().toISOString(),
        };
      });

      localStorage.setItem(`exam_op_state_${examCycle.id}_evaluation_records`, JSON.stringify(allRecords));

      // Timeline Log
      const timelineStr = localStorage.getItem(`exam_op_state_${examCycle.id}_evaluation_timeline`) || "[]";
      const timeline = JSON.parse(timelineStr);
      timeline.unshift({
        timestamp: new Date().toISOString(),
        message: `Grade normalization (+5 grace marks) applied to all students in ${subjects.find(s => s.id === activePaper.subjectId)?.name || "Subject"}`,
        type: "success",
      });
      localStorage.setItem(`exam_op_state_${examCycle.id}_evaluation_timeline`, JSON.stringify(timeline));

      setSuccess("Grace marks normalization successfully applied to all papers!");
      setTimeout(() => setSuccess(""), 4000);
    } catch (err) {
      console.error(err);
    }
  };

  const handleLockScorecard = async () => {
    if (!examCycle || !selectedPaperId || !activePaper) return;

    if (
      !confirm(
        "⚠️ CRITICAL ACTION: Locking this scorecard is permanent and will cascade these final marks directly into the central official ERP results repository! Continue?"
      )
    ) {
      return;
    }

    try {
      const stored = localStorage.getItem(`exam_op_state_${examCycle.id}_evaluation_records`) || "[]";
      let allRecords = JSON.parse(stored);

      // 1. Lock all records for this paper
      allRecords = allRecords.map((r) => {
        if (r.paperId !== selectedPaperId) return r;
        return {
          ...r,
          status: "locked",
          lockedAt: new Date().toISOString(),
        };
      });

      localStorage.setItem(`exam_op_state_${examCycle.id}_evaluation_records`, JSON.stringify(allRecords));

      // 2. Cascade directly into official Results db!
      const provider = getDataProvider();
      const currentResults = await provider.getResults();

      for (const mapItem of mappedStudentMarks) {
        if (!mapItem.record) continue;

        const record = mapItem.record;
        const officialResult = {
          studentId: record.studentId,
          classId: record.classId,
          subjectId: activePaper.subjectId,
          examId: examCycle.id,
          marksObtained: record.marksObtained,
          maxMarks: (activePaper.theoryMarks || 40) + (activePaper.practicalMarks || 0),
          remarks: record.overrideReason || record.moderationNotes || "Approved under moderation",
          grade: record.grade,
          teacherId: "coord-001",
        };

        const existingIdx = currentResults.findIndex(
          (r) =>
            r.studentId === officialResult.studentId &&
            r.examId === officialResult.examId &&
            r.subjectId === officialResult.subjectId
        );

        if (existingIdx !== -1) {
          await provider.updateResult(currentResults[existingIdx].id, officialResult);
        } else {
          await provider.createResult(officialResult);
        }
      }

      // Update paper status to locked in DB
      await provider.updateExamPaper(selectedPaperId, {
        ...activePaper,
        status: "locked",
      });

      // Timeline Log
      const timelineStr = localStorage.getItem(`exam_op_state_${examCycle.id}_evaluation_timeline`) || "[]";
      const timeline = JSON.parse(timelineStr);
      timeline.unshift({
        timestamp: new Date().toISOString(),
        message: `${subjects.find(s => s.id === activePaper.subjectId)?.name || "Subject"} for Class ${classes.find(c => c.id === activePaper.classId)?.displayName || "Class"} locked and published to official ERP database`,
        type: "danger",
      });
      localStorage.setItem(`exam_op_state_${examCycle.id}_evaluation_timeline`, JSON.stringify(timeline));

      setSuccess("Scorecard locked and relationally published to ERP results database!");
      setTimeout(() => setSuccess(""), 4000);
      onRefresh();
    } catch (err) {
      console.error(err);
    }
  };

  const activePaperClass = classes.find((c) => c.id === activePaper?.classId);
  const activePaperSubject = subjects.find((s) => s.id === activePaper?.subjectId);

  const isLocked = evaluationRecords.some((r) => r.status === "locked");

  return (
    <div className="space-y-6">
      <div className="bg-white p-5 rounded-3xl border border-gray-100 grid grid-cols-1 md:grid-cols-1 md:grid-cols-2 gap-6 items-center">
        <div className="space-y-2">
          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
            Select Paper for Moderation
          </label>
          <select
            value={selectedPaperId}
            onChange={(e) => setSelectedPaperId(e.target.value)}
            className="w-full p-3.5 rounded-xl border border-gray-100 bg-gray-50/50 text-[#03045e] font-bold outline-none cursor-pointer"
          >
            <option value="">Select Paper</option>
            {sessionPapers.map((p) => {
              const cls = classes.find((c) => c.id === p.classId);
              const sub = subjects.find((s) => s.id === p.subjectId);
              return (
                <option key={p.id} value={p.id}>
                  {sub?.name || p.subjectId} ({cls?.displayName || p.classId})
                </option>
              );
            })}
          </select>
        </div>

        {activePaper && (
          <div className="flex flex-wrap gap-2.5 justify-end mt-4 md:mt-0">
            {isLocked ? (
              <span className="px-4 py-2 rounded-2xl bg-[#ade8f4]/30 border border-[#caf0f8] text-[#03045e] font-black text-[10px] uppercase tracking-wider flex items-center gap-1.5 shadow-sm">
                <Lock size={13} />
                <span>OFFICIALLY LOCKED & PUBLISHED</span>
              </span>
            ) : (
              <>
                <button
                  onClick={handleNormalizeGrades}
                  disabled={evaluationRecords.length === 0}
                  className="flex items-center gap-1.5 bg-[#ade8f4] hover:bg-[#ade8f4]/85 text-[#03045e] px-4.5 py-2.5 rounded-xl text-[10px] font-black tracking-wider uppercase transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ArrowUpRight size={13} />
                  <span>NORMALIZATION (+5 GRACE)</span>
                </button>
                <button
                  onClick={handleLockScorecard}
                  disabled={evaluationRecords.length === 0}
                  className="flex items-center gap-1.5 bg-[#03045e] hover:bg-[#023e8a] text-white px-5 py-2.5 rounded-xl text-[10px] font-black tracking-wider uppercase transition-all shadow-md disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed"
                >
                  <Lock size={13} />
                  <span>LOCK SCORECARD</span>
                </button>
              </>
            )}
          </div>
        )}
      </div>

      {success && (
        <div className="p-4 bg-emerald-50 border border-emerald-100 text-emerald-700 font-bold text-xs rounded-2xl flex items-center gap-2">
          <CheckCircle size={15} />
          <span>{success}</span>
        </div>
      )}

      {activePaper ? (
        <div className="space-y-4">
          <div className="px-2">
            <h4 className="text-xs font-black text-[#03045e] uppercase tracking-wider">
              Scorecard Moderation Queue: {activePaperSubject?.name} (Class {activePaperClass?.displayName})
            </h4>
            <p className="text-[9px] text-gray-400 font-bold uppercase mt-0.5">
              Review entered scores, flag anomalies, and trigger override workflows
            </p>
          </div>

          <div className="overflow-x-auto rounded-3xl border border-gray-100 bg-white">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100 text-[10px] font-black uppercase text-gray-400 tracking-wider">
                  <th className="p-4 w-28">Admission No</th>
                  <th className="p-4 w-52">Student Name</th>
                  <th className="p-4 w-32">Status</th>
                  <th className="p-4 w-36">Theory Score</th>
                  {activePaper.practicalMarks > 0 && <th className="p-4 w-36">Practical Score</th>}
                  <th className="p-4 w-28">Final Grade</th>
                  <th className="p-4">Override Audit Reason</th>
                  <th className="p-4 text-center w-24">Action</th>
                </tr>
              </thead>
              <tbody>
                {mappedStudentMarks.map(({ student, record }) => {
                  const hasFailed = record && record.marksObtained < ((activePaper.theoryMarks || 40) + (activePaper.practicalMarks || 0)) * 0.33;

                  return (
                    <tr
                      key={student.id}
                      className="border-b border-gray-50 text-xs font-bold text-[#03045e] hover:bg-slate-50/50 transition-colors"
                    >
                      <td className="p-4 text-gray-400 font-extrabold">{student.admissionNo}</td>
                      <td className="p-4">{student.name}</td>
                      <td className="p-4">
                        {record ? (
                          <span
                            className={`inline-block px-2.5 py-0.5 rounded text-[8px] font-black uppercase tracking-wider ${
                              record.status === "locked"
                                ? "bg-emerald-50 border border-emerald-100 text-emerald-600"
                                : record.status === "moderated"
                                  ? "bg-indigo-50 border border-indigo-100 text-indigo-600"
                                  : "bg-amber-50 border border-amber-100 text-amber-600"
                            }`}
                          >
                            {record.status}
                          </span>
                        ) : (
                          <span className="inline-block px-2.5 py-0.5 rounded text-[8px] font-black uppercase tracking-wider bg-gray-100 text-gray-400">
                            UNGRADED
                          </span>
                        )}
                      </td>
                      <td className="p-4">
                        {record ? (record.isAbsent ? <span className="text-rose-500">ABSENT</span> : record.theoryMarks) : "—"}
                      </td>
                      {activePaper.practicalMarks > 0 && (
                        <td className="p-4">
                          {record ? (record.isAbsent ? <span className="text-rose-500">ABSENT</span> : record.practicalMarks) : "—"}
                        </td>
                      )}
                      <td className="p-4">
                        {record ? (
                          <span
                            className={`px-1.5 py-0.5 rounded font-black uppercase text-[10px] ${
                              hasFailed ? "bg-rose-50 text-rose-600" : "bg-[#caf0f8] text-[#0077b6]"
                            }`}
                          >
                            {record.grade}
                          </span>
                        ) : (
                          "—"
                        )}
                      </td>
                      <td className="p-4 text-gray-400 font-medium italic truncate max-w-xs">
                        {record?.overrideReason || "None entered"}
                      </td>
                      <td className="p-4 text-center">
                        {!isLocked && (
                          <button
                            onClick={() => {
                              setActiveOverrideStudent(student);
                              setIsOverrideDrawerOpen(true);
                            }}
                            className="p-2 rounded-xl text-rose-500 hover:bg-rose-50 transition-colors"
                            aria-label="Override Grade"
                          >
                            <Edit size={14} />
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="p-8 text-center bg-gray-50 border border-gray-100 rounded-2xl text-gray-400 font-bold uppercase tracking-wider text-xs">
          Select a scheduled paper above to access its scorecard moderation panel
        </div>
      )}

      {/* Override drawer */}
      <GradeOverrideDrawer
        isOpen={isOverrideDrawerOpen}
        onClose={() => {
          setIsOverrideDrawerOpen(false);
          setActiveOverrideStudent(null);
        }}
        student={activeOverrideStudent}
        paper={activePaper}
        currentRecord={evaluationRecords.find((r) => r.studentId === activeOverrideStudent?.id)}
        onOverride={handleApplyOverride}
      />
    </div>
  );
}
