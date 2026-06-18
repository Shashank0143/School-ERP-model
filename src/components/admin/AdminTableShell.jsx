import React from "react";
import AdminEmptyState from "./AdminEmptyState";

/**
 * AdminTableShell
 * 
 * Reusable table container with proper horizontal overflow,
 * customized headers, padding rhythm, and consistent border lines.
 */
const AdminTableShell = ({ 
  headers = [], 
  children, 
  isEmpty = false, 
  emptyTitle = "No records found",
  emptyDescription = "There are no entries currently matching this directory filter.",
  minWidth = "800px" 
}) => {
  return (
    <div className="overflow-x-auto w-full">
      {isEmpty ? (
        <AdminEmptyState title={emptyTitle} description={emptyDescription} />
      ) : (
        <table className="w-full text-left border-collapse" style={{ minWidth }}>
          <thead>
            <tr className="border-b border-[#caf0f8] text-[10px] uppercase font-black tracking-wider text-gray-400">
              {headers.map((header, idx) => (
                <th key={idx} className="py-4 px-3 first:pl-2 last:pr-2">
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#caf0f8]/30">
            {children}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default React.memo(AdminTableShell);
