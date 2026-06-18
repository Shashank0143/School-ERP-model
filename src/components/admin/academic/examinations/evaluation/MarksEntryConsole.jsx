import React, { useState, useEffect } from "react";
import { Save, CheckCircle, AlertCircle, X, CornerDownRight } from "lucide-react";

export default function MarksEntryConsole({
  examCycle,
  paper,
  students,
  subjects,
  classes,
  onSaveRecord,
  onRefresh,
}) {
  const [localMarks, setLocalMarks] = useState([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const paperClass = classes.find((c) => c.id === paper?.classId);
  const paperSubject = subjects.find((s) => s.id === paper?.subjectId);
  const classStudents = students.filter((s) => s.classId === paper?.classId);

  useEffect(() => {
    if (!paper || !examCycle) return;

    // Load existing records for this paper
    const storedRecordsStr = localStorage.getItem(`exam_op_state_${examCycle.id}_evaluation_records`) || "[]";
    const allRecords = JSON.parse(storedRecordsStr);
    const paperRecords = allRecords.filter((r) => r.paperId === paper.id);

    const initialMarks = classStudents.map((stud) => {
      const record = paperRecords.find((r) => r.studentId === stud.id);
      return {
        studentId: stud.id,
        name: stud.name,
        admissionNo: stud.admissionNo,
        theoryMarks: record ? record.marksObtained ?? "" : "",
        practicalMarks: record ? record.practicalMarks ?? "" : "",
        isAbsent: record ? !!record.isAbsent : false,
        remarks: record ? record.moderationNotes ?? "" : "",
        status: record ? record.status : "draft",
      };
    });

    setLocalMarks(initialMarks);
    setError("");
    setSuccess("");
  }, [paper, examCycle, students]);

  if (!paper) {
    return (
      <div className="p-8 text-center bg-gray-50 border border-gray-100 rounded-2xl text-gray-400 font-bold uppercase tracking-wider text-xs">
        Select a paper from the list to unlock Marks Entry Console
      </div>
    );
  }

  const handleFieldChange = (studentId, field, value) => {
    setLocalMarks((prev) =>
      prev.map((item) => {
        if (item.studentId !== studentId) return item;
        const updated = { ...item, [field]: value };
        if (field === "isAbsent" && value === true) {
          updated.theoryMarks = "0";
          updated.practicalMarks = "0";
        }
        return updated;
      })
    );
  };

  const validateMarks = () => {
    const maxTheory = paper.theoryMarks || 40;
    const maxPractical = paper.practicalMarks || 0;

    for (const item of localMarks) {
      if (item.isAbsent) continue;

      const theoryNum = parseFloat(item.theoryMarks);
      if (isNaN(theoryNum) || theoryNum < 0 || theoryNum > maxTheory) {
        return `Theory marks for student "${item.name}" must be between 0 and ${maxTheory}.`;
      }

      if (maxPractical > 0) {
        const practicalNum = parseFloat(item.practicalMarks);
        if (isNaN(practicalNum) || practicalNum < 0 || practicalNum > maxPractical) {
          return `Practical marks for student "${item.name}" must be between 0 and ${maxPractical}.`;
        }
      }
    }
    return null;
  };

  const handleSave = async (submitStatus = "draft") => {
    const validationErr = validateMarks();
    if (validationErr) {
      setError(validationErr);
      setSuccess("");
      return;
    }

    try {
      const storedRecordsStr = localStorage.getItem(`exam_op_state_${examCycle.id}_evaluation_records`) || "[]";
      let allRecords = JSON.parse(storedRecordsStr);

      // Filter out existing records for this paper
      allRecords = allRecords.filter((r) => r.paperId !== paper.id);

      const updatedRecords = localMarks.map((item) => {
        const theoryVal = item.isAbsent ? 0 : parseFloat(item.theoryMarks) || 0;
        const practicalVal = item.isAbsent ? 0 : parseFloat(item.practicalMarks) || 0;
        const totalVal = theoryVal + practicalVal;

        // Determine grade based on total score percentage
        const maxTotal = (paper.theoryMarks || 40) + (paper.practicalMarks || 0);
        const percent = maxTotal > 0 ? (totalVal / maxTotal) * 100 : 0;
        let grade = "C";
        if (percent >= 90) grade = "A+";
        else if (percent >= 80) grade = "A";
        else if (percent >= 70) grade = "B+";
        else if (percent >= 60) grade = "B";

        return {
          id: `${paper.id}_${item.studentId}`,
          examCycleId: examCycle.id,
          paperId: paper.id,
          studentId: item.studentId,
          classId: paper.classId,
          marksObtained: totalVal,
          theoryMarks: theoryVal,
          practicalMarks: practicalVal,
          grade,
          isAbsent: item.isAbsent,
          moderationNotes: item.remarks,
          status: submitStatus,
          evaluatedBy: "teach-001",
          evaluatedAt: new Date().toISOString(),
        };
      });

      // Save to localStorage
      localStorage.setItem(
        `exam_op_state_${examCycle.id}_evaluation_records`,
        JSON.stringify([...allRecords, ...updatedRecords])
      );

      // Append to timeline feed
      const timelineStr = localStorage.getItem(`exam_op_state_${examCycle.id}_evaluation_timeline`) || "[]";
      const timeline = JSON.parse(timelineStr);
      const actionLabel = submitStatus === "evaluated" ? "submitted" : "saved as draft";
      timeline.unshift({
        timestamp: new Date().toISOString(),
        message: `${paperSubject?.name || "Subject"} for ${paperClass?.displayName || "Class"} evaluation ${actionLabel} by Teacher`,
        type: submitStatus === "evaluated" ? "success" : "info",
      });
      localStorage.setItem(`exam_op_state_${examCycle.id}_evaluation_timeline`, JSON.stringify(timeline));

      setError("");
      setSuccess(`Marks successfully ${actionLabel}!`);
      onSaveRecord();
    } catch (err) {
      console.error(err);
      setError("Failed to save evaluation records.");
    }
  };

  const isLocked = localMarks.some((m) => m.status === "locked" || m.status === "moderated");

  return (
    <div className="space-y-6">
      <div className="bg-[#caf0f8]/20 p-5 rounded-3xl border border-[#caf0f8]/50 flex flex-col sm:flex-row justify-between gap-4 sm:items-center">
        <div>
          <span className="text-[9px] font-black uppercase text-gray-400 tracking-wider">
            Subject Teacher Workspace
          </span>
          <h4 className="text-sm font-black text-[#03045e] mt-0.5">
            {paperSubject?.name} ({paperClass?.displayName})
          </h4>
          <div className="flex gap-4 text-[10px] text-gray-500 font-bold uppercase mt-1">
            <span>Max Theory: {paper.theoryMarks || 40}</span>
            {paper.practicalMarks > 0 && <span>Max Practical: {paper.practicalMarks}</span>}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isLocked ? (
            <span className="px-4 py-2 rounded-2xl bg-amber-50 text-amber-700 font-black text-[10px] uppercase tracking-wider border border-amber-100 flex items-center gap-1.5 shadow-sm">
              <AlertCircle size={13} />
              <span>LOCKED FOR MODERATION</span>
            </span>
          ) : (
            <>
              <button
                onClick={() => handleSave("draft")}
                className="flex items-center gap-1.5 bg-[#ade8f4] hover:bg-[#ade8f4]/80 text-[#03045e] px-4 py-2.5 rounded-xl text-[10px] font-black tracking-wider uppercase transition-colors"
              >
                <Save size={13} />
                <span>SAVE DRAFT</span>
              </button>
              <button
                onClick={() => handleSave("evaluated")}
                className="flex items-center gap-1.5 bg-[#03045e] hover:bg-[#023e8a] text-white px-5 py-2.5 rounded-xl text-[10px] font-black tracking-wider uppercase transition-all shadow-md"
              >
                <CheckCircle size={13} />
                <span>SUBMIT MARKS</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Notifications */}
      {error && (
        <div className="p-4 bg-rose-50 border border-rose-100 text-rose-700 font-bold text-xs rounded-2xl flex items-center gap-2">
          <AlertCircle size={15} />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="p-4 bg-emerald-50 border border-emerald-100 text-emerald-700 font-bold text-xs rounded-2xl flex items-center gap-2">
          <CheckCircle size={15} />
          <span>{success}</span>
        </div>
      )}

      {/* Score entry grid */}
      <div className="overflow-x-auto rounded-3xl border border-gray-100">
        <table className="w-full border-collapse bg-white text-left">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100 text-[10px] font-black uppercase text-gray-400 tracking-wider">
              <th className="p-4 w-28">Admission No</th>
              <th className="p-4 w-52">Student Name</th>
              <th className="p-4 w-32">Absent</th>
              <th className="p-4 w-36">Theory Marks ({paper.theoryMarks || 40})</th>
              {paper.practicalMarks > 0 && (
                <th className="p-4 w-36">Practical Marks ({paper.practicalMarks})</th>
              )}
              <th className="p-4">Academic Remarks</th>
            </tr>
          </thead>
          <tbody>
            {localMarks.map((item) => (
              <tr
                key={item.studentId}
                className="border-b border-gray-50 text-xs font-bold text-[#03045e] hover:bg-slate-50/50 transition-colors"
              >
                <td className="p-4 text-gray-400 font-extrabold">{item.admissionNo}</td>
                <td className="p-4">{item.name}</td>
                <td className="p-4">
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="checkbox"
                      disabled={isLocked}
                      checked={item.isAbsent}
                      onChange={(e) => handleFieldChange(item.studentId, "isAbsent", e.target.checked)}
                      className="w-4 h-4 rounded border-gray-300 text-rose-600 focus:ring-rose-500 cursor-pointer disabled:opacity-50"
                    />
                    <span className="text-[10px] font-black text-rose-500 uppercase">Absent</span>
                  </label>
                </td>
                <td className="p-4">
                  <input
                    type="number"
                    min="0"
                    max={paper.theoryMarks || 40}
                    disabled={isLocked || item.isAbsent}
                    value={item.isAbsent ? "" : item.theoryMarks}
                    onChange={(e) => handleFieldChange(item.studentId, "theoryMarks", e.target.value)}
                    placeholder={item.isAbsent ? "ABS" : "0.00"}
                    className="w-24 px-3 py-2 bg-[#f8fdff] border border-[#caf0f8] rounded-xl text-[#03045e] font-black focus:outline-none focus:ring-2 focus:ring-[#00b4d8]/20 transition-all disabled:bg-gray-50 disabled:text-gray-400"
                  />
                </td>
                {paper.practicalMarks > 0 && (
                  <td className="p-4">
                    <input
                      type="number"
                      min="0"
                      max={paper.practicalMarks}
                      disabled={isLocked || item.isAbsent}
                      value={item.isAbsent ? "" : item.practicalMarks}
                      onChange={(e) => handleFieldChange(item.studentId, "practicalMarks", e.target.value)}
                      placeholder={item.isAbsent ? "ABS" : "0.00"}
                      className="w-24 px-3 py-2 bg-[#f8fdff] border border-[#caf0f8] rounded-xl text-[#03045e] font-black focus:outline-none focus:ring-2 focus:ring-[#00b4d8]/20 transition-all disabled:bg-gray-50 disabled:text-gray-400"
                    />
                  </td>
                )}
                <td className="p-4">
                  <input
                    type="text"
                    disabled={isLocked}
                    value={item.remarks}
                    onChange={(e) => handleFieldChange(item.studentId, "remarks", e.target.value)}
                    placeholder="e.g. Excellent progress"
                    className="w-full px-3 py-2 bg-[#f8fdff] border border-[#caf0f8] rounded-xl text-[#03045e] font-medium focus:outline-none focus:ring-2 focus:ring-[#00b4d8]/20 transition-all placeholder:text-[#90e0ef] disabled:bg-gray-50 disabled:text-gray-400"
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
