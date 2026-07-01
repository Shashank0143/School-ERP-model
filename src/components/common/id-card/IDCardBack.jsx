import React from 'react';

const IDCardBack = ({ data, variant = 'student' }) => {
  return (
    <div className="w-[300px] h-full min-h-[420px] bg-white rounded-xl shadow-lg border border-gray-200 flex flex-col overflow-hidden relative">
      <div className="bg-gray-100 h-10 w-full mb-4 mt-4 relative">
        <div className="absolute inset-0 bg-gray-800/10"></div>
      </div>
      
      <div className="px-5 py-2 flex-1 flex flex-col">
        <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider border-b border-gray-200 pb-1 mb-3">
          Contact Details
        </h4>
        
        <div className="space-y-3 flex-1">
          {data.bloodGroup && (
            <div>
              <span className="block text-[10px] text-gray-500 uppercase">Blood Group</span>
              <span className="text-sm font-semibold text-red-600">{data.bloodGroup}</span>
            </div>
          )}
          
          {data.parentName && variant === 'student' && (
            <div>
              <span className="block text-[10px] text-gray-500 uppercase">Parent/Guardian</span>
              <span className="text-sm font-medium text-gray-800">{data.parentName}</span>
            </div>
          )}
          
          {data.phone && (
            <div>
              <span className="block text-[10px] text-gray-500 uppercase">Phone Number</span>
              <span className="text-sm font-medium text-gray-800">{data.phone}</span>
            </div>
          )}
          
          {data.emergencyContact && (
            <div>
              <span className="block text-[10px] text-gray-500 uppercase">Emergency Contact</span>
              <span className="text-sm font-medium text-gray-800">{data.emergencyContact}</span>
            </div>
          )}
          
          {data.address && (
            <div>
              <span className="block text-[10px] text-gray-500 uppercase">Address</span>
              <span className="text-xs font-medium text-gray-700 leading-snug block">{data.address}</span>
            </div>
          )}
        </div>
        
        <div className="mt-6 pt-4 border-t border-gray-200 text-center space-y-2">
          <p className="text-[9px] text-gray-500 uppercase font-medium">Issue Note</p>
          <p className="text-[10px] text-gray-600 leading-tight">
            If found, please return to school administration.
            <br />
            <strong>Contact:</strong> info@edudash.edu | +91 800-EDUDASH
          </p>
        </div>
      </div>
      
      <div className="bg-gray-50 p-2 flex justify-end px-5 pb-4">
        <div className="text-center w-24">
          <div className="border-b border-gray-400 h-8 mb-1 flex items-end justify-center">
            {/* Signature image could go here */}
            <span className="text-[8px] italic text-gray-400">Authorized Signatory</span>
          </div>
          <span className="text-[9px] text-gray-600 font-medium uppercase">Principal</span>
        </div>
      </div>
    </div>
  );
};

export default IDCardBack;
