import React from 'react';
import { motion } from 'framer-motion';
import { Clock, MapPin, User, FileText } from 'lucide-react';
import StatusBadge from "../common/StatusBadge";
import { useLanguage } from "../../context/LanguageContext";

const ScheduleCard = ({ paper, onEdit, onAction, actionLabel }) => {
  const { t } = useLanguage();
  
  const dateObj = new Date(paper.date || paper.datetime);
  const isValidDate = !isNaN(dateObj.getTime());

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-5 bg-white border border-gray-100 rounded-3xl shadow-sm hover:shadow-md transition-all flex flex-col gap-4 group"
    >
      <div className="flex justify-between items-start gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-blue-50/50 flex flex-col items-center justify-center border border-blue-100/50 group-hover:scale-110 transition-transform flex-shrink-0">
            {isValidDate ? (
              <>
                <span className="text-xs font-black text-[#00b4d8]">
                  {dateObj.toLocaleDateString('en-US', { day: 'numeric' })}
                </span>
                <span className="text-[9px] font-bold text-[#03045e] uppercase">
                  {dateObj.toLocaleDateString('en-US', { month: 'short' })}
                </span>
              </>
            ) : (
              <FileText size={20} className="text-[#00b4d8]" />
            )}
          </div>
          <div>
            <h4 className="font-bold text-[#03045e] text-sm group-hover:text-[#00b4d8] transition-colors">{paper.subject || paper.subjectName || "Subject"}</h4>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-0.5">{paper.className || paper.class || paper.code || "Class"}</p>
          </div>
        </div>
        <StatusBadge status={paper.status} />
      </div>

      <div className="grid grid-cols-2 gap-3 pt-4 border-t border-gray-100">
        <div className="flex items-center gap-2 text-xs font-bold text-gray-500">
          <Clock size={14} className="text-[#00b4d8] flex-shrink-0" />
          <span className="truncate">{paper.time || paper.timeSlot || "TBA"}</span>
        </div>
        <div className="flex items-center gap-2 text-xs font-bold text-gray-500">
          <MapPin size={14} className="text-[#00b4d8] flex-shrink-0" />
          <span className="truncate">{paper.room || "TBA"}</span>
        </div>
        {(paper.invigilator || paper.invigilatorName) && (
          <div className="flex items-center gap-2 text-xs font-bold text-gray-500 col-span-2">
            <User size={14} className="text-[#00b4d8] flex-shrink-0" />
            <span className="truncate">{paper.invigilator || paper.invigilatorName}</span>
          </div>
        )}
      </div>

      {(onEdit || onAction) && (
        <div className="flex gap-2 mt-2">
          {onAction && (
             <button 
               onClick={() => onAction(paper)}
               className="flex-1 py-2.5 bg-[#f8fdff] hover:bg-[#00b4d8] text-[#00b4d8] hover:text-white border border-[#caf0f8] hover:border-[#00b4d8] rounded-xl text-[10px] font-black uppercase tracking-widest transition-all"
             >
               {actionLabel || t("common.actions", { fallback: "Action" })}
             </button>
          )}
          {onEdit && (
            <button 
              onClick={() => onEdit(paper)}
              className="flex-1 py-2.5 bg-gray-50 hover:bg-gray-100 text-gray-600 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all"
            >
              {t("common.edit", { fallback: "Edit" })}
            </button>
          )}
        </div>
      )}
    </motion.div>
  );
};

export default ScheduleCard;
