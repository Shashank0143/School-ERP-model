import React from 'react';

const TransferCertificate = ({ student, request, school, tcNumber, generatedBy, issueDate }) => {
  if (!student || !request) return null;

  // Formatting helpers
  const formatDate = (dateString) => {
    if (!dateString) return '—';
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit', month: 'short', year: 'numeric'
    });
  };

  const s = student;
  
  return (
    <div className="w-[210mm] min-h-[297mm] bg-white text-black p-10 mx-auto border border-gray-200 shadow-sm print:shadow-none print:border-none print:w-full relative flex flex-col font-serif">
      {/* Outer Border for Certificate Look */}
      <div className="absolute inset-4 border-[3px] border-double border-gray-800 pointer-events-none" />
      <div className="absolute inset-5 border border-gray-400 pointer-events-none" />

      {/* Header */}
      <div className="text-center mt-8 mb-6 z-10">
        <h1 className="text-3xl font-black uppercase tracking-widest text-gray-900 mb-2">
          {school?.name || "EduDash International School"}
        </h1>
        <p className="text-sm font-semibold text-gray-700 max-w-lg mx-auto">
          {school?.address || "123 Education Boulevard, Knowledge City, State - 100001"}
        </p>
        <p className="text-xs font-bold text-gray-600 mt-1">
          {school?.affiliation || "Affiliated to C.B.S.E, New Delhi"}
        </p>
      </div>

      {/* Certificate Title */}
      <div className="text-center mb-8 relative z-10">
        <h2 className="inline-block border-2 border-gray-800 px-6 py-2 text-2xl font-black tracking-[0.2em] uppercase bg-gray-50 shadow-[4px_4px_0_0_rgba(0,0,0,0.8)]">
          Transfer Certificate
        </h2>
      </div>

      {/* Meta Info row */}
      <div className="flex justify-between items-center mb-8 px-8 text-sm font-bold z-10">
        <div>TC No: <span className="font-semibold border-b border-dashed border-gray-400 px-4 inline-block min-w-[120px] text-center">{tcNumber || "—"}</span></div>
        <div>Admission No: <span className="font-semibold border-b border-dashed border-gray-400 px-4 inline-block min-w-[120px] text-center">{s.admissionNumber || "—"}</span></div>
      </div>

      {/* Body Content */}
      <div className="px-8 space-y-6 flex-1 z-10 text-[15px] leading-relaxed">
        <div className="grid grid-cols-12 gap-x-4 gap-y-6">
          
          <div className="col-span-4 font-bold text-gray-800">1. Name of the Pupil</div>
          <div className="col-span-8 border-b border-dashed border-gray-400 font-semibold pl-2">{s.name || "—"}</div>

          <div className="col-span-4 font-bold text-gray-800">2. Father's / Guardian's Name</div>
          <div className="col-span-8 border-b border-dashed border-gray-400 font-semibold pl-2">{s.parentName || "—"}</div>

          <div className="col-span-4 font-bold text-gray-800">3. Mother's Name</div>
          <div className="col-span-8 border-b border-dashed border-gray-400 font-semibold pl-2">{s.motherName || "—"}</div>

          <div className="col-span-4 font-bold text-gray-800">4. Date of Birth</div>
          <div className="col-span-8 border-b border-dashed border-gray-400 font-semibold pl-2">{formatDate(s.dateOfBirth)}</div>

          <div className="col-span-4 font-bold text-gray-800">5. Nationality</div>
          <div className="col-span-8 border-b border-dashed border-gray-400 font-semibold pl-2">{s.nationality || "Indian"}</div>

          <div className="col-span-4 font-bold text-gray-800">6. Date of First Admission</div>
          <div className="col-span-8 border-b border-dashed border-gray-400 font-semibold pl-2">{formatDate(s.admissionDate) || "—"} (Class {s.admissionClass || "—"})</div>

          <div className="col-span-4 font-bold text-gray-800">7. Class in which pupil last studied</div>
          <div className="col-span-8 border-b border-dashed border-gray-400 font-semibold pl-2">{s.className || "—"} (Section {s.section || "—"})</div>

          <div className="col-span-4 font-bold text-gray-800">8. School / Board Annual Examination</div>
          <div className="col-span-8 border-b border-dashed border-gray-400 font-semibold pl-2">Passed</div>

          <div className="col-span-4 font-bold text-gray-800">9. Whether qualified for promotion</div>
          <div className="col-span-8 border-b border-dashed border-gray-400 font-semibold pl-2">Yes</div>

          <div className="col-span-4 font-bold text-gray-800">10. Month upto which dues paid</div>
          <div className="col-span-8 border-b border-dashed border-gray-400 font-semibold pl-2">Cleared / No Dues</div>

          <div className="col-span-4 font-bold text-gray-800">11. General Conduct</div>
          <div className="col-span-8 border-b border-dashed border-gray-400 font-semibold pl-2">Good</div>

          <div className="col-span-4 font-bold text-gray-800">12. Reason for leaving the school</div>
          <div className="col-span-8 border-b border-dashed border-gray-400 font-semibold pl-2">{request.reason || "—"}</div>

          <div className="col-span-4 font-bold text-gray-800">13. Date of application for certificate</div>
          <div className="col-span-8 border-b border-dashed border-gray-400 font-semibold pl-2">{formatDate(request.appliedDate)}</div>

          <div className="col-span-4 font-bold text-gray-800">14. Date of issue of certificate</div>
          <div className="col-span-8 border-b border-dashed border-gray-400 font-semibold pl-2">{formatDate(issueDate)}</div>

          <div className="col-span-4 font-bold text-gray-800">15. Any other remarks</div>
          <div className="col-span-8 border-b border-dashed border-gray-400 font-semibold pl-2">{request.remarks || "Nil"}</div>

        </div>
      </div>

      {/* Signatures Row */}
      <div className="mt-16 pt-12 px-8 flex justify-between items-end pb-8 z-10 text-sm font-bold text-gray-800">
        <div className="text-center w-40">
          <div className="border-b border-gray-400 h-10 mb-2"></div>
          Prepared By<br/>
          <span className="text-[10px] text-gray-500 font-semibold">({generatedBy || "Administrator"})</span>
        </div>
        <div className="text-center w-40">
          <div className="border-b border-gray-400 h-10 mb-2"></div>
          Checked By
        </div>
        <div className="text-center w-40">
          <div className="border-b border-gray-400 h-10 mb-2"></div>
          Principal<br/>
          <span className="text-[10px] text-gray-500 font-semibold">(Seal & Signature)</span>
        </div>
      </div>
      
    </div>
  );
};

export default TransferCertificate;
