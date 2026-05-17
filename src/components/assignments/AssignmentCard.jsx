import React, { useState } from "react";
import MainCard from "../MainCard";
import { 
  Calendar, 
  Clock, 
  FileText, 
  CheckCircle2, 
  AlertCircle, 
  ChevronRight, 
  Upload, 
  FileCheck,
  Timer
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const STATUS_CONFIG = {
  PENDING: { color: "text-blue-500", bg: "bg-blue-50", icon: Clock, label: "Active" },
  DUE_SOON: { color: "text-amber-500", bg: "bg-amber-50", icon: Timer, label: "Due Soon" },
  OVERDUE: { color: "text-rose-500", bg: "bg-rose-50", icon: AlertCircle, label: "Overdue" },
  SUBMITTED: { color: "text-emerald-500", bg: "bg-emerald-50", icon: FileCheck, label: "Submitted" },
  REVIEWED: { color: "text-indigo-500", bg: "bg-indigo-50", icon: CheckCircle2, label: "Reviewed" },
  LATE: { color: "text-orange-500", bg: "bg-orange-50", icon: AlertCircle, label: "Late Submission" }
};

const AssignmentCard = ({ assignment, onStatusUpdate }) => {
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fileName, setFileName] = useState("");

  const config = STATUS_CONFIG[assignment.status] || STATUS_CONFIG.PENDING;
  const StatusIcon = config.icon;

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate upload delay
    setTimeout(() => {
      setIsSubmitting(false);
      setShowSubmitModal(false);
      if (onStatusUpdate) {
        onStatusUpdate(assignment.id, "SUBMITTED");
      }
    }, 1500);
  };

  return (
    <>
      <MainCard 
        className="p-6 group relative overflow-hidden transition-all duration-300"
      >
        <div className="flex flex-col md:flex-row gap-6">
          <div className="flex-1 flex flex-col h-full">
            {/* Header */}
            <div className="flex justify-between items-start mb-4">
              <div className="space-y-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-tighter ${config.bg} ${config.color}`}>
                    {assignment.type}
                  </span>
                  <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">
                    {assignment.totalMarks} Marks • {assignment.subjectName}
                  </span>
                </div>
                <h3 className="text-lg font-black text-[#03045e] group-hover:text-primary transition-colors line-clamp-1 leading-tight">
                  {assignment.title}
                </h3>
              </div>
              <div className={`p-2 rounded-xl shrink-0 ${config.bg} ${config.color} shadow-sm`}>
                <StatusIcon size={18} strokeWidth={2.5} />
              </div>
            </div>

            {/* Body */}
            <p className="text-sm text-gray-500 font-bold leading-relaxed line-clamp-2 mb-4 flex-1">
              {assignment.description}
            </p>

            {/* Footer */}
            <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1.5 text-gray-400 group-hover:text-gray-600 transition-colors">
                  <Calendar size={14} />
                  <span className="text-[10px] font-black uppercase tracking-widest">{assignment.dueDate}</span>
                </div>
                <button className="flex items-center gap-1.5 text-gray-400 hover:text-primary transition-colors">
                  <FileText size={14} />
                  <span className="text-[10px] font-black uppercase tracking-widest">Resources</span>
                </button>
              </div>
              
              {assignment.status === "SUBMITTED" || assignment.status === "REVIEWED" ? (
                <div className="flex items-center gap-2 text-[10px] font-black text-emerald-600 uppercase tracking-widest">
                  <CheckCircle2 size={14} />
                  <span>Submission Received</span>
                </div>
              ) : (
                <button 
                  onClick={() => setShowSubmitModal(true)}
                  className="flex items-center gap-1 text-[10px] font-black text-primary bg-primary/5 px-4 py-2 rounded-xl uppercase tracking-widest hover:bg-primary hover:text-white transition-all shadow-sm"
                >
                  <Upload size={14} />
                  <span>Submit Work</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </MainCard>

      {/* Submission Modal (Simulated) */}
      <AnimatePresence>
        {showSubmitModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-[2.5rem] p-8 w-full max-w-md shadow-2xl relative overflow-hidden"
            >
              {/* Modal Background Pattern */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-bl-[5rem] -mr-8 -mt-8 pointer-events-none" />

              <div className="relative z-10">
                <h3 className="text-2xl font-black text-[#03045e] mb-2">Submit Assignment</h3>
                <p className="text-sm text-gray-500 font-bold mb-6">
                  Upload your completed work for <span className="text-primary">{assignment.title}</span>.
                </p>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-4">
                    <label className="block">
                      <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Attachment</span>
                      <div className="mt-2 flex items-center justify-center w-full">
                        <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-200 rounded-3xl cursor-pointer bg-gray-50 hover:bg-white hover:border-primary/50 transition-all">
                          <div className="flex flex-col items-center justify-center pt-5 pb-6">
                            <Upload className="w-8 h-8 mb-3 text-gray-400" />
                            <p className="text-xs text-gray-500 font-bold">
                              {fileName || "Click to upload or drag & drop"}
                            </p>
                            <p className="text-[9px] text-gray-400 mt-1 uppercase tracking-tighter">PDF, DOCX, ZIP (Max 10MB)</p>
                          </div>
                          <input 
                            type="file" 
                            className="hidden" 
                            onChange={(e) => setFileName(e.target.files[0]?.name)}
                          />
                        </label>
                      </div>
                    </label>

                    <div className="space-y-2">
                      <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Comments (Optional)</span>
                      <textarea 
                        className="w-full rounded-2xl border-gray-100 bg-gray-50 p-4 text-sm font-bold focus:bg-white focus:ring-4 focus:ring-primary/10 transition-all outline-none"
                        placeholder="Add a note for your teacher..."
                        rows={3}
                      />
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <button 
                      type="button"
                      onClick={() => setShowSubmitModal(false)}
                      className="flex-1 px-6 py-4 rounded-2xl bg-gray-50 text-gray-400 font-black uppercase tracking-widest text-[10px] hover:bg-gray-100 transition-all"
                    >
                      Cancel
                    </button>
                    <button 
                      type="submit"
                      disabled={isSubmitting || !fileName}
                      className={`flex-1 px-6 py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all flex items-center justify-center gap-2 ${
                        isSubmitting || !fileName 
                          ? "bg-gray-100 text-gray-300 cursor-not-allowed" 
                          : "bg-[#03045e] text-white shadow-xl shadow-[#03045e]/20 hover:scale-[1.02]"
                      }`}
                    >
                      {isSubmitting ? (
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <>
                          <CheckCircle2 size={16} />
                          <span>Submit Now</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};

export default AssignmentCard;
