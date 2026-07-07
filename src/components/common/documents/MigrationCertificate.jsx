import React from 'react';

const MigrationCertificate = ({ student, request, school, certificateNumber, generatedBy, issueDate }) => {
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
          Migration Certificate
        </h2>
      </div>

      {/* Meta Info row */}
      <div className="flex justify-between items-center mb-12 px-8 text-sm font-bold z-10">
        <div>Certificate No: <span className="font-semibold border-b border-dashed border-gray-400 px-4 inline-block min-w-[120px] text-center">{certificateNumber || "—"}</span></div>
        <div>Admission No: <span className="font-semibold border-b border-dashed border-gray-400 px-4 inline-block min-w-[120px] text-center">{s.admissionNumber || "—"}</span></div>
      </div>

      {/* Body Content */}
      <div className="px-10 space-y-8 flex-1 z-10 text-[16px] leading-10 text-justify">
        <p>
          This is to certify that <span className="font-bold border-b-2 border-dashed border-gray-400 px-4">{s.name || "—"}</span>, 
          son/daughter of <span className="font-bold border-b-2 border-dashed border-gray-400 px-4">{s.parentName || "—"}</span> &amp; <span className="font-bold border-b-2 border-dashed border-gray-400 px-4">{s.motherName || "—"}</span> 
          has been a bonafide student of this institution.
        </p>
        <p>
          He/She passed the <span className="font-bold border-b-2 border-dashed border-gray-400 px-4">{s.className || "—"}</span> Examination 
          conducted by the School/Board in the year <span className="font-bold border-b-2 border-dashed border-gray-400 px-4">{new Date(issueDate || Date.now()).getFullYear()}</span>.
        </p>
        <p>
          This institution has <strong>no objection</strong> to his/her joining any recognized College/Institute or taking examination of any University or Board established by law.
        </p>
        <p>
          His/Her general conduct during the period of stay in the school was found to be <span className="font-bold border-b-2 border-dashed border-gray-400 px-4">Good</span>.
        </p>
      </div>

      {/* Date row */}
      <div className="px-10 mb-20 text-sm font-bold z-10">
        <p>Date of Issue: <span className="font-semibold">{formatDate(issueDate)}</span></p>
      </div>

      {/* Signatures Row */}
      <div className="mt-auto pt-8 px-8 flex justify-between items-end pb-8 z-10 text-sm font-bold text-gray-800">
        <div className="text-center w-40">
          <div className="border-b border-gray-400 h-10 mb-2"></div>
          Prepared By<br/>
          <span className="text-[10px] text-gray-500 font-semibold">({generatedBy || "Administrator"})</span>
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

export default MigrationCertificate;
