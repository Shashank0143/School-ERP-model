import React from 'react';
import { User } from 'lucide-react';

const IDCardBody = ({ data, variant }) => {
  const isStudent = variant === 'student';
  const idLabel = isStudent ? 'Admission No.' : 'Employee ID';

  return (
    <div className="p-4 flex flex-col items-center bg-white relative">
      {/* Photo Section */}
      <div className="mb-3 relative">
        <div className="w-24 h-24 rounded-full border-4 border-white shadow-md bg-gray-100 flex items-center justify-center overflow-hidden">
          {data.photo ? (
            <img src={data.photo} alt={data.name} className="w-full h-full object-cover" />
          ) : (
            <User size={48} className="text-gray-300" />
          )}
        </div>
        {data.status && (
          <div 
            className={`absolute bottom-1 right-1 w-4 h-4 rounded-full border-2 border-white ${data.status.toLowerCase() === 'active' ? 'bg-emerald-500' : 'bg-red-500'}`} 
            title={`Status: ${data.status}`} 
          />
        )}
      </div>

      {/* Name Section */}
      <h3 className="font-bold text-gray-900 text-lg text-center leading-tight">
        {data.name || 'Name not provided'}
      </h3>
      
      {data.role && (
        <span className="text-[11px] font-semibold text-[#0077b6] uppercase tracking-wider mt-1 bg-[#caf0f8]/50 px-2 py-0.5 rounded-full">
          {data.role}
        </span>
      )}

      {/* Details Grid */}
      <div className="w-full mt-4 space-y-2 text-sm">
        {data.id && (
          <div className="flex justify-between items-center border-b border-gray-100 pb-1">
            <span className="text-gray-500 text-xs">ID No.</span>
            <span className="font-semibold text-gray-800">{data.id}</span>
          </div>
        )}
        
        {isStudent ? (
          <>
            {(data.class || data.section) && (
              <div className="flex justify-between items-center border-b border-gray-100 pb-1">
                <span className="text-gray-500 text-xs">Class</span>
                <span className="font-semibold text-gray-800">
                  {data.class || ''} {data.section ? `Sec ${data.section}` : ''}
                </span>
              </div>
            )}
          </>
        ) : (
          <>
            {data.designation && (
              <div className="flex justify-between items-center border-b border-gray-100 pb-1">
                <span className="text-gray-500 text-xs text-left">Designation</span>
                <span className="font-semibold text-gray-800 text-right max-w-[65%] truncate" title={data.designation}>{data.designation}</span>
              </div>
            )}
            {data.department && (
              <div className="flex justify-between items-center border-b border-gray-100 pb-1">
                <span className="text-gray-500 text-xs text-left">Department</span>
                <span className="font-semibold text-gray-800 text-right max-w-[65%] truncate" title={data.department}>{data.department}</span>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default IDCardBody;
