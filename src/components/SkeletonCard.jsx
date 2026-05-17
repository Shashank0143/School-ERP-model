import React from "react";
import { motion } from "framer-motion";

/**
 * SkeletonCard
 * 
 * Reusable loading placeholder for MainCard-based components.
 * Helps prevent Layout Shift (CLS) by reserving space during async data fetching.
 */
const SkeletonCard = ({ height = "200px", className = "" }) => {
  return (
    <div 
      className={`bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden flex flex-col relative ${className}`}
      style={{ borderTop: "6px solid #f3f4f6" }}
    >
      <div className="p-6 flex flex-col gap-4 animate-pulse">
        {/* Header Skeleton */}
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gray-100" />
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-gray-100 rounded-full w-1/3" />
            <div className="h-3 bg-gray-50 rounded-full w-1/4" />
          </div>
        </div>
        
        {/* Body Skeleton */}
        <div className="space-y-3 mt-2" style={{ minHeight: `calc(${height} - 100px)` }}>
          <div className="h-4 bg-gray-50 rounded-full w-full" />
          <div className="h-4 bg-gray-50 rounded-full w-5/6" />
          <div className="h-4 bg-gray-50 rounded-full w-4/6" />
        </div>

        {/* Footer/Action Skeleton */}
        <div className="mt-auto h-10 bg-gray-100 rounded-xl w-full" />
      </div>
      
      {/* Shimmer overlay */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent"
        initial={{ x: "-100%" }}
        animate={{ x: "100%" }}
        transition={{ 
          repeat: Infinity, 
          duration: 1.5, 
          ease: "linear" 
        }}
        style={{ width: "50%" }}
      />
    </div>
  );
};

export default React.memo(SkeletonCard);
