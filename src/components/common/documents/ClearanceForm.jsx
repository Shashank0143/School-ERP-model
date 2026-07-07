import React from 'react';

const ClearanceForm = ({ student, request, school }) => {
  if (!student || !request) return null;

  // Formatting helpers
  const formatDate = (dateString) => {
    if (!dateString) return '—';
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit', month: 'short', year: 'numeric'
    });
  };

  const s = student;

  const departments = [
    "Finance / Fee Department",
    "Library",
    "Transport",
    "Laboratory",
    "Class Teacher",
    "Administration",
    "Principal"
  ];
  
  return (
    <div className="w-[210mm] min-h-[297mm] bg-white text-black p-10 mx-auto border border-gray-200 shadow-sm print:shadow-none print:border-none print:w-full relative flex flex-col font-serif">
      {/* Outer Border for Form Look */}
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

      {/* Form Title */}
      <div className="text-center mb-8 relative z-10">
        <h2 className="inline-block border-2 border-gray-800 px-6 py-2 text-xl font-black tracking-[0.2em] uppercase bg-gray-50 shadow-[4px_4px_0_0_rgba(0,0,0,0.8)]">
          Withdrawal Clearance Form
        </h2>
      </div>

      {/* Body Content */}
      <div className="px-8 space-y-6 flex-1 z-10 text-[14px] leading-relaxed">
        
        {/* Student Info Section */}
        <div className="grid grid-cols-12 gap-x-4 gap-y-4 mb-8">
          <div className="col-span-4 font-bold text-gray-800">Student Name</div>
          <div className="col-span-8 border-b border-dashed border-gray-400 font-semibold pl-2">{s.name || "—"}</div>

          <div className="col-span-4 font-bold text-gray-800">Admission Number</div>
          <div className="col-span-8 border-b border-dashed border-gray-400 font-semibold pl-2">{s.admissionNumber || "—"}</div>

          <div className="col-span-4 font-bold text-gray-800">Class & Section</div>
          <div className="col-span-8 border-b border-dashed border-gray-400 font-semibold pl-2">{s.className || "—"} / {s.section || "—"}</div>

          <div className="col-span-4 font-bold text-gray-800">Parent / Guardian Name</div>
          <div className="col-span-8 border-b border-dashed border-gray-400 font-semibold pl-2">{s.parentName || "—"}</div>

          <div className="col-span-4 font-bold text-gray-800">Phone Number</div>
          <div className="col-span-8 border-b border-dashed border-gray-400 font-semibold pl-2">{s.phone || "—"}</div>

          <div className="col-span-4 font-bold text-gray-800">Application Date</div>
          <div className="col-span-8 border-b border-dashed border-gray-400 font-semibold pl-2">{formatDate(request.appliedDate)}</div>
          
          <div className="col-span-4 font-bold text-gray-800">Reason for Withdrawal</div>
          <div className="col-span-8 border-b border-dashed border-gray-400 font-semibold pl-2">{request.reason || "—"}</div>
        </div>

        {/* Department Clearance Section */}
        <h3 className="text-md font-bold text-gray-800 uppercase tracking-widest border-b-2 border-gray-800 pb-1 mb-4">
          Departmental Clearances
        </h3>
        
        <table className="w-full border-collapse border border-gray-800 text-sm">
          <thead>
            <tr className="bg-gray-100 font-bold uppercase text-[11px] tracking-widest">
              <th className="border border-gray-800 p-3 text-left w-1/3">Department</th>
              <th className="border border-gray-800 p-3 text-center w-20">Cleared</th>
              <th className="border border-gray-800 p-3 text-left">Remarks</th>
              <th className="border border-gray-800 p-3 text-left w-32">Signature & Stamp</th>
            </tr>
          </thead>
          <tbody>
            {departments.map((dept, index) => (
              <tr key={index}>
                <td className="border border-gray-800 p-4 font-bold text-gray-800">{dept}</td>
                <td className="border border-gray-800 p-4 text-center">
                  <div className="w-5 h-5 border-2 border-gray-800 mx-auto"></div>
                </td>
                <td className="border border-gray-800 p-4"></td>
                <td className="border border-gray-800 p-4"></td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Footer Instructions */}
        <div className="mt-8 p-5 border-2 border-dashed border-gray-400 bg-gray-50/50">
          <h4 className="font-bold text-gray-900 mb-2 uppercase text-[12px] tracking-widest">Important Instructions:</h4>
          <ol className="list-decimal list-inside space-y-1.5 text-xs text-gray-700 font-semibold">
            <li>This form must be printed by the student/parent.</li>
            <li>The student must visit all relevant departments mentioned above in person.</li>
            <li>All signatures and stamps must be obtained manually on this physical copy.</li>
            <li>The <strong>ORIGINAL</strong> signed copy must be submitted to the Administration Office.</li>
            <li>Photocopies, scanned copies, or digital uploads are strictly not accepted.</li>
            <li>Official certificates (Transfer Certificate, Character Certificate) will only be issued after the Administration Office physically verifies and retains this completed form.</li>
          </ol>
        </div>

      </div>
    </div>
  );
};

export default ClearanceForm;
