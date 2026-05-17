import React from "react";
import { motion } from "framer-motion";
import { Info } from "lucide-react";

/**
 * ParentInsight
 * 
 * A reusable banner for parent-specific insights/summaries.
 */
const ParentInsight = React.memo(function ParentInsight({ text, className = "" }) {
  if (!text) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: 0.4 }}
      className={`flex items-start gap-3 p-3 rounded-2xl border border-[#00b4d8]/20 bg-[#caf0f8] ${className}`}
    >
      <div className="mt-0.5 flex-shrink-0">
        <Info size={16} className="text-[#03045e]" aria-hidden="true" />
      </div>
      <p className="text-xs font-bold leading-relaxed text-[#03045e]">
        {text}
      </p>
    </motion.div>
  );
});

export default ParentInsight;
