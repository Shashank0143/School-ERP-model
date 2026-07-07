import React from 'react';
import { useLanguage } from "../../context/LanguageContext";

const StatusBadge = ({ status, type, text, className = "" }) => {
  const { t } = useLanguage();
  
  const normalizedStatus = (status || type || text || "default").toString().toLowerCase();
  
  const getStyles = (s) => {
    switch (s) {
      case 'published':
      case 'approved':
      case 'completed':
      case 'active':
      case 'ready':
      case 'present':
        return 'bg-emerald-50 text-emerald-600 border-emerald-200';
      case 'evaluation':
      case 'ongoing':
      case 'pending':
      case 'submitted':
      case 'leave':
        return 'bg-amber-50 text-amber-600 border-amber-200';
      case 'scheduled':
      case 'assigned':
      case 'half-day':
        return 'bg-blue-50 text-blue-600 border-blue-200';
      case 'draft':
      case 'archived':
      case 'inactive':
        return 'bg-gray-100 text-gray-600 border-gray-200';
      case 'rejected':
      case 'absent':
      case 'failed':
      case 'cancelled':
        return 'bg-rose-50 text-rose-600 border-rose-200';
      default:
        return 'bg-gray-100 text-gray-600 border-gray-200';
    }
  };

  const displayText = text || status || type;

  return (
    <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border ${getStyles(normalizedStatus)} ${className}`}>
      {t(`status.${normalizedStatus}`, { fallback: displayText })}
    </span>
  );
};

export default StatusBadge;
