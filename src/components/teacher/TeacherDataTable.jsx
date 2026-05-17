import React from "react";
import MainCard from "../MainCard";
import { motion } from "framer-motion";

/**
 * TeacherDataTable
 * 
 * Reusable, operational data table for teacher modules.
 * Focuses on high density, clear separation, and interactive rows.
 */
const TeacherDataTable = ({ 
  columns, 
  data, 
  loading, 
  emptyMessage = "No records found.",
  rowClassName = "" 
}) => {
  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3, 4, 5].map(i => (
          <div key={i} className="h-12 w-full bg-gray-100 animate-pulse rounded-xl" />
        ))}
      </div>
    );
  }

  return (
    <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
      <table className="w-full border-separate border-spacing-y-2">
        <thead>
          <tr className="text-[10px] font-black text-gray-400 uppercase tracking-widest text-left">
            {columns.map((col, idx) => (
              <th key={idx} className={`px-4 py-2 ${col.className || ""}`}>
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="text-center py-12 text-gray-400 font-medium italic">
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map((row, rowIdx) => (
              <motion.tr 
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: rowIdx * 0.03 }}
                key={row.id || rowIdx} 
                className={`bg-white group hover:bg-[#f8fdff] transition-colors shadow-sm ${rowClassName}`}
              >
                {columns.map((col, colIdx) => (
                  <td 
                    key={colIdx} 
                    className={`px-4 py-3 text-sm font-bold text-[#03045e] first:rounded-l-2xl last:rounded-r-2xl border-y border-[#caf0f8]/30 first:border-l last:border-r ${col.className || ""}`}
                  >
                    {col.render ? col.render(row) : row[col.accessor]}
                  </td>
                ))}
              </motion.tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default React.memo(TeacherDataTable);
