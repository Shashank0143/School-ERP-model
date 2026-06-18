import React from "react";
import AdminEmptyState from "../AdminEmptyState";

/**
 * AcademicTable
 * 
 * Consistent styled grid layout wrapper for subjects, grades, and allocations.
 */
const AcademicTable = ({ 
  headers = [], 
  items = [], 
  renderRow, 
  isEmpty = false,
  emptyTitle = "No Academic Records",
  emptyDescription = "No data matched the active filters."
}) => {
  return (
    <div className="overflow-x-auto w-full">
      {isEmpty || items.length === 0 ? (
        <AdminEmptyState title={emptyTitle} description={emptyDescription} />
      ) : (
        <table className="w-full text-left border-collapse min-w-[800px]">
          <thead>
            <tr className="border-b border-[#caf0f8] text-[10px] uppercase font-black tracking-wider text-gray-400">
              {headers.map((h, idx) => (
                <th key={idx} className="py-4 px-3 first:pl-2 last:pr-2">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#caf0f8]/30">
            {items.map((item, index) => renderRow(item, index))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default React.memo(AcademicTable);
