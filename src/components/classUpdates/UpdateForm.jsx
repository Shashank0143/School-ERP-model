import React, { useState, useEffect } from "react";
import { getItem } from "../../persistence/storage";
import { STORAGE_KEYS } from "../../persistence/storageKeys";
import { createClassUpdate } from "../../services/classUpdatesService";
import { Send, AlertCircle, CheckCircle2 } from "lucide-react";

export default function UpdateForm({ teacherProfile, onPublishSuccess }) {
  const teacherId = teacherProfile?.id || "teach-001";

  // Form Fields
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");
  const [category, setCategory] = useState("HOMEWORK");
  const [priority, setPriority] = useState("NORMAL");
  const [visibleToStudents, setVisibleToStudents] = useState(true);
  const [visibleToParents, setVisibleToParents] = useState(false);

  // Entities mapped to teacher workload
  const [classesList, setClassesList] = useState([]);
  const [subjectsList, setSubjectsList] = useState([]);

  // UI Status
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const loadTeacherRoster = () => {
      try {
        const allCls = getItem(STORAGE_KEYS.CLASSES, []);
        const allSubs = getItem(STORAGE_KEYS.SUBJECTS, []);
        const allAssignments = getItem(STORAGE_KEYS.TEACHER_SUBJECT_ASSIGNMENTS, []);

        const assignments = allAssignments.filter(a => a.teacherId === teacherId);
        const uniqueClassIds = [...new Set(assignments.map(a => a.classId))];
        const teacherClassIds = new Set([
          ...uniqueClassIds,
          ...(teacherProfile?.homeroomClass?.id ? [teacherProfile.homeroomClass.id] : [])
        ]);

        const filteredClasses = allCls.filter(c => teacherClassIds.has(c.id));
        setClassesList(filteredClasses);

        if (filteredClasses.length > 0) {
          const initialClassId = filteredClasses[0].id;
          setSelectedClass(initialClassId);
          
          // Filter subjects for the selected initial class
          const classAssignments = assignments.filter(a => a.classId === initialClassId);
          const assignedSubjectIds = classAssignments.map(a => a.subjectId);
          let classSubjects = allSubs.filter(s => assignedSubjectIds.includes(s.id));

          const isHomeroom = teacherProfile?.homeroomClass?.id === initialClassId;
          if (isHomeroom) {
            classSubjects = [
              { id: "general", name: "General / Homeroom Notice" },
              ...classSubjects
            ];
          }

          setSubjectsList(classSubjects);
          if (classSubjects.length > 0) {
            setSelectedSubject(classSubjects[0].id);
          }
        }
      } catch (err) {
        console.error("Failed to load teacher workload rosters:", err);
      }
    };

    if (teacherProfile) {
      loadTeacherRoster();
    }
  }, [teacherProfile, teacherId]);

  const handleClassChange = (classId) => {
    setSelectedClass(classId);
    try {
      const allSubs = getItem(STORAGE_KEYS.SUBJECTS, []);
      const allAssignments = getItem(STORAGE_KEYS.TEACHER_SUBJECT_ASSIGNMENTS, []);
      const assignments = allAssignments.filter(a => a.teacherId === teacherId);
      
      const classAssignments = assignments.filter(a => a.classId === classId);
      const assignedSubjectIds = classAssignments.map(a => a.subjectId);
      let classSubjects = allSubs.filter(s => assignedSubjectIds.includes(s.id));

      const isHomeroom = teacherProfile?.homeroomClass?.id === classId;
      if (isHomeroom) {
        classSubjects = [
          { id: "general", name: "General / Homeroom Notice" },
          ...classSubjects
        ];
      }

      setSubjectsList(classSubjects);
      if (classSubjects.length > 0) {
        setSelectedSubject(classSubjects[0].id);
      } else {
        setSelectedSubject("");
      }
    } catch (err) {
      console.error("Failed to update subjects for class:", err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!title.trim() || !message.trim()) {
      setError("Please fill out both the title and update message.");
      return;
    }

    if (!selectedClass || !selectedSubject) {
      setError("Please select a target class and subject.");
      return;
    }

    const visibility = [];
    if (visibleToStudents) visibility.push("STUDENT");
    if (visibleToParents) visibility.push("PARENT");

    if (visibility.length === 0) {
      setError("Please select at least one visibility scope (Students or Parents).");
      return;
    }

    setLoading(true);
    try {
      await createClassUpdate({
        teacherId,
        classId: selectedClass,
        subjectId: selectedSubject,
        title,
        message,
        category,
        visibility,
        priority
      });

      setTitle("");
      setMessage("");
      setSuccess("Class update published successfully!");
      if (onPublishSuccess) onPublishSuccess();
    } catch (err) {
      setError(err.message || "Failed to publish class update.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-[2rem] border border-indigo-100 shadow-sm space-y-5">
      <div className="border-b pb-2">
        <h3 className="text-sm font-black text-[#03045e] uppercase tracking-wider">
          Publish Class Academic Update
        </h3>
        <p className="text-[10px] font-bold text-gray-400 mt-0.5">
          Academic notices are sent directly to the targeted student and parent feeds.
        </p>
      </div>

      {error && (
        <div className="p-3 bg-rose-50 border border-rose-100 text-rose-700 rounded-xl text-xs font-bold flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-500" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="p-3 bg-emerald-50 border border-emerald-100 text-emerald-700 rounded-xl text-xs font-bold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          <span>{success}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-1 md:grid-cols-2 gap-4">
        {/* Class Selection */}
        <div className="space-y-1.5">
          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Target Class</label>
          <select
            value={selectedClass}
            onChange={(e) => handleClassChange(e.target.value)}
            className="w-full p-2.5 rounded-xl border border-gray-100 bg-gray-50/50 text-[#03045e] font-bold text-xs focus:outline-none appearance-none cursor-pointer"
            required
          >
            {classesList.map(c => (
              <option key={c.id} value={c.id}>
                Class {c.name} - {c.section}
              </option>
            ))}
          </select>
        </div>

        {/* Subject Selection */}
        <div className="space-y-1.5">
          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Subject</label>
          <select
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            className="w-full p-2.5 rounded-xl border border-gray-100 bg-gray-50/50 text-[#03045e] font-bold text-xs focus:outline-none appearance-none cursor-pointer"
            required
          >
            {subjectsList.map(s => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
        </div>

        {/* Category Selector */}
        <div className="space-y-1.5">
          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Category</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full p-2.5 rounded-xl border border-gray-100 bg-gray-50/50 text-[#03045e] font-bold text-xs focus:outline-none appearance-none cursor-pointer"
          >
            <option value="HOMEWORK">Homework Reminder</option>
            <option value="EXAM">Exam / Assessment Notice</option>
            <option value="REMINDER">General Reminder</option>
            <option value="MENTOR">Mentor support Alert</option>
            <option value="CLASS_NOTICE">Classroom Announcement</option>
            <option value="PARENT_MEETING">Parent Meeting Circular</option>
          </select>
        </div>

        {/* Priority Level */}
        <div className="space-y-1.5">
          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Priority</label>
          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
            className="w-full p-2.5 rounded-xl border border-gray-100 bg-gray-50/50 text-[#03045e] font-bold text-xs focus:outline-none appearance-none cursor-pointer"
          >
            <option value="LOW">Low</option>
            <option value="NORMAL">Normal</option>
            <option value="IMPORTANT">Important</option>
          </select>
        </div>
      </div>

      {/* Title input */}
      <div className="space-y-1.5">
        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Update Title</label>
        <input
          type="text"
          placeholder="Enter a brief summary (e.g., Homework Ch 4, Lab Guidelines...)"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full p-2.5 rounded-xl border border-gray-100 bg-gray-50/50 text-[#03045e] font-bold text-xs focus:outline-none focus:border-indigo-100 transition-colors"
          maxLength={80}
          required
        />
      </div>

      {/* Message textarea */}
      <div className="space-y-1.5">
        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Academic Message</label>
        <textarea
          rows="3"
          placeholder="Compose detailed operational information..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="w-full p-3 rounded-2xl border border-gray-100 bg-gray-50/50 text-[#03045e] font-bold text-xs focus:outline-none focus:border-indigo-100 transition-colors resize-none"
          required
        />
      </div>

      {/* Visibility Scope & Submit */}
      <div className="flex flex-col gap-4 pt-4 border-t border-gray-100">
        <div className="flex items-center gap-4">
          <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Visibility Scope:</span>
          
          <label className="flex items-center gap-1.5 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={visibleToStudents}
              onChange={(e) => setVisibleToStudents(e.target.checked)}
              className="rounded text-indigo-600 focus:ring-indigo-200 border-gray-200 cursor-pointer w-4 h-4"
            />
            <span className="text-xs font-bold text-[#03045e]">Students</span>
          </label>

          <label className="flex items-center gap-1.5 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={visibleToParents}
              onChange={(e) => setVisibleToParents(e.target.checked)}
              className="rounded text-indigo-600 focus:ring-indigo-200 border-gray-200 cursor-pointer w-4 h-4"
            />
            <span className="text-xs font-bold text-[#03045e]">Parents</span>
          </label>
        </div>

        <button
          type="submit"
          disabled={loading || !title.trim() || !message.trim()}
          className="w-full py-3 bg-[#03045e] hover:bg-indigo-900 text-white rounded-2xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-300 shadow-md shadow-indigo-100/50"
        >
          {loading ? "Publishing..." : "Publish Circular"}
          <Send className="w-3.5 h-3.5" />
        </button>
      </div>
    </form>
  );
}
