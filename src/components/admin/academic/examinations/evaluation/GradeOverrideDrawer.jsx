import React, { useState } from "react";
import { X, ShieldAlert, Award } from "lucide-react";

export default function GradeOverrideDrawer({
  isOpen,
  onClose,
  student,
  paper,
  currentRecord,
  onOverride,
}) {
  const [newTheoryMarks, setNewTheoryMarks] = useState(
    currentRecord ? currentRecord.theoryMarks?.toString() ?? "" : ""
  );
  const [newPracticalMarks, setNewPracticalMarks] = useState(
    currentRecord ? currentRecord.practicalMarks?.toString() ?? "" : ""
  );
  const [overrideReason, setOverrideReason] = useState("");
  const [error, setError] = useState("");

  if (!isOpen || !student || !paper) return null;

  const maxTheory = paper.theoryMarks || 40;
  const maxPractical = paper.practicalMarks || 0;

  const handleSave = () => {
    if (!overrideReason.trim()) {
      setError("An override reason is strictly MANDATORY for the coordinator audit logs.");
      return;
    }

    const thVal = parseFloat(newTheoryMarks);
    if (isNaN(thVal) || thVal < 0 || thVal > maxTheory) {
      setError(`Theory marks must be between 0 and ${maxTheory}.`);
      return;
    }

    let prVal = 0;
    if (maxPractical > 0) {
      prVal = parseFloat(newPracticalMarks);
      if (isNaN(prVal) || prVal < 0 || prVal > maxPractical) {
        setError(`Practical marks must be between 0 and ${maxPractical}.`);
        return;
      }
    }

    setError("");
    onOverride({
      studentId: student.id,
      theoryMarks: thVal,
      practicalMarks: prVal,
      overrideReason: overrideReason.trim(),
    });
    setOverrideReason("");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-sm animate-fade-in">
      <div className="w-full w-[95vw] md:w-[90vw] lg:max-w-md bg-white h-full p-6 flex flex-col justify-between shadow-2xl relative animate-slide-in">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-xl text-gray-400 hover:bg-slate-50 transition-colors"
        >
          <X size={18} />
        </button>

        <div className="space-y-6">
          <div>
            <div className="p-2.5 bg-rose-50 text-rose-500 rounded-2xl w-fit flex items-center justify-center border border-rose-100">
              <ShieldAlert size={24} />
            </div>
            <h3 className="text-base font-black text-[#03045e] uppercase tracking-wider mt-4">
              Grade Override Console
            </h3>
            <p className="text-[10px] text-gray-400 font-bold uppercase mt-0.5">
              Controlled overrides with mandatory audit trailing
            </p>
          </div>

          <div className="bg-slate-50 p-4.5 rounded-2xl border border-slate-200/50 space-y-2 text-xs font-bold text-[#03045e]">
            <div className="flex justify-between">
              <span className="text-gray-400 uppercase text-[9px]">Student</span>
              <span>{student.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400 uppercase text-[9px]">Admission No</span>
              <span>{student.admissionNo}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400 uppercase text-[9px]">Subject</span>
              <span>{paper.subjectId}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400 uppercase text-[9px]">Current Marks</span>
              <span className="text-indigo-600 font-black">
                {currentRecord ? `${currentRecord.marksObtained} (Theory: ${currentRecord.theoryMarks}, Practical: ${currentRecord.practicalMarks})` : "Not Graded"}
              </span>
            </div>
          </div>

          {error && (
            <div className="p-3.5 bg-rose-50 border border-rose-100 text-rose-700 font-bold text-xs rounded-xl flex gap-1.5 items-start">
              <ShieldAlert size={14} className="shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">
                Override Theory Marks (Max: {maxTheory})
              </label>
              <input
                type="number"
                min="0"
                max={maxTheory}
                value={newTheoryMarks}
                onChange={(e) => setNewTheoryMarks(e.target.value)}
                placeholder="0.00"
                className="w-full p-3 rounded-xl border border-gray-100 bg-gray-50/50 text-[#03045e] font-black outline-none"
              />
            </div>

            {maxPractical > 0 && (
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">
                  Override Practical Marks (Max: {maxPractical})
                </label>
                <input
                  type="number"
                  min="0"
                  max={maxPractical}
                  value={newPracticalMarks}
                  onChange={(e) => setNewPracticalMarks(e.target.value)}
                  placeholder="0.00"
                  className="w-full p-3 rounded-xl border border-gray-100 bg-gray-50/50 text-[#03045e] font-black outline-none"
                />
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">
                Override Reason <strong className="text-rose-500">*</strong>
              </label>
              <textarea
                value={overrideReason}
                onChange={(e) => setOverrideReason(e.target.value)}
                placeholder="Must specify institutional reason (e.g. Grade moderation approval or Medical leave normalization)..."
                rows={3}
                className="w-full p-3.5 rounded-xl border border-gray-100 bg-gray-50/50 text-[#03045e] font-bold outline-none text-xs leading-relaxed"
              />
            </div>
          </div>
        </div>

        <div className="flex gap-3 pt-6 border-t border-gray-50">
          <button
            onClick={onClose}
            className="flex-1 py-3 border border-gray-150 hover:bg-slate-50 text-slate-500 rounded-xl font-black text-xs uppercase tracking-wider transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!overrideReason.trim()}
            className="flex-1 py-3 bg-[#03045e] hover:bg-[#023e8a] text-white rounded-xl font-black text-xs uppercase tracking-wider transition-all disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed shadow-md"
          >
            Apply Override
          </button>
        </div>
      </div>
    </div>
  );
}
