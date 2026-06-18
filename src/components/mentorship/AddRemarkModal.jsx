import React, { useState } from "react";
import { X, Send, AlertTriangle, MessageSquare, Clipboard } from "lucide-react";
import { addMentorRemark } from "../../services/mentorshipService";
import { motion, AnimatePresence } from "framer-motion";

export default function AddRemarkModal({ isOpen, onClose, student, teacherId, onAddSuccess }) {
  const [category, setCategory] = useState("ACADEMIC");
  const [title, setTitle] = useState("");
  const [note, setNote] = useState("");
  const [visibility, setVisibility] = useState("INTERNAL");
  const [priority, setPriority] = useState("NORMAL");
  const [followUpRequired, setFollowUpRequired] = useState(false);
  const [tagsInput, setTagsInput] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!isOpen || !student) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!title.trim() || !note.trim()) {
      setError("Please fill out both the title and observation details.");
      return;
    }

    setLoading(true);
    try {
      // Parse comma separated tags
      const tags = tagsInput
        .split(",")
        .map(t => t.trim())
        .filter(t => t.length > 0);

      await addMentorRemark({
        studentId: student.id,
        teacherId,
        classId: student.classId,
        category,
        title,
        note,
        visibility,
        priority,
        followUpRequired,
        tags
      });

      // Reset
      setTitle("");
      setNote("");
      setTagsInput("");
      setCategory("ACADEMIC");
      setVisibility("INTERNAL");
      setPriority("NORMAL");
      setFollowUpRequired(false);

      if (onAddSuccess) onAddSuccess();
      onClose();
    } catch (err) {
      setError(err.message || "Failed to add mentorship record.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full w-[95vw] md:w-[90vw] lg:max-w-xl bg-white rounded-[2.5rem] border border-gray-100 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Header bar */}
        <div className="p-6 border-b border-gray-50 flex justify-between items-center bg-gray-50/50">
          <div>
            <span className="text-[9px] font-black text-indigo-500 uppercase tracking-widest">Guidance & Observations</span>
            <h3 className="text-sm font-black text-[#03045e] uppercase tracking-wider mt-0.5">
              Add Remark: {student.name}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-xl hover:bg-gray-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable form body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-100 text-rose-700 rounded-xl text-xs font-bold flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-500" />
              <span>{error}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 gap-4">
            {/* Category selection */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-gray-100 bg-gray-50/50 text-[#03045e] font-bold text-xs focus:outline-none cursor-pointer"
              >
                <option value="ACADEMIC">Academic Progress</option>
                <option value="ATTENDANCE">Attendance Alert</option>
                <option value="BEHAVIOR">Behavioral Observation</option>
                <option value="PARENT_MEETING">Parent Interaction Log</option>
                <option value="COUNSELING">Counseling Remark</option>
                <option value="POSITIVE_FEEDBACK">Positive Feedback</option>
              </select>
            </div>

            {/* Priority selection */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Priority</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-gray-100 bg-gray-50/50 text-[#03045e] font-bold text-xs focus:outline-none cursor-pointer"
              >
                <option value="LOW">Low</option>
                <option value="NORMAL">Normal</option>
                <option value="IMPORTANT">Important</option>
              </select>
            </div>

            {/* Visibility selection */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Portal Visibility</label>
              <select
                value={visibility}
                onChange={(e) => setVisibility(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-gray-100 bg-gray-50/50 text-[#03045e] font-bold text-xs focus:outline-none cursor-pointer"
              >
                <option value="INTERNAL">Staff Internal Only</option>
                <option value="PARENT_VISIBLE">Parent Visible</option>
              </select>
            </div>

            {/* Tags input */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Related Tags</label>
              <input
                type="text"
                placeholder="Physics, Attendance, Punctual"
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-gray-100 bg-gray-50/50 text-[#03045e] font-bold text-xs focus:outline-none"
              />
            </div>
          </div>

          {/* Title */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Observation Title</label>
            <input
              type="text"
              placeholder="e.g. Sudden Dip in Quiz Grades, Punctuality concerns..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-gray-100 bg-gray-50/50 text-[#03045e] font-bold text-xs focus:outline-none"
              maxLength={80}
              required
            />
          </div>

          {/* Details Note */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Academic Note / Observation Remarks</label>
            <textarea
              rows="4"
              placeholder="Describe your guidance remarks or details of behavioral observations professional and constructively..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full p-3 rounded-2xl border border-gray-100 bg-gray-50/50 text-[#03045e] font-bold text-xs focus:outline-none resize-none"
              required
            />
          </div>

          {/* Follow up Required Checkbox */}
          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="followUpCheck"
              checked={followUpRequired}
              onChange={(e) => setFollowUpRequired(e.target.checked)}
              className="rounded text-indigo-600 focus:ring-indigo-200 border-gray-200 cursor-pointer w-4 h-4"
            />
            <label htmlFor="followUpCheck" className="text-xs font-bold text-[#03045e] cursor-pointer select-none">
              Requires subsequent follow-up action / review
            </label>
          </div>

          {/* Submit Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-[#03045e] rounded-xl text-xs font-black uppercase tracking-wider transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !title.trim() || !note.trim()}
              className="px-5 py-2 bg-[#03045e] hover:bg-indigo-900 text-white rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              <span>{loading ? "Recording..." : "Record Entry"}</span>
              <Send className="w-3.5 h-3.5" />
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
