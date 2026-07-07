import React from 'react';

const PrintableReportCard = ({ card, institutionDetails }) => {
  if (!card) return null;

  return (
    <div className="bg-white p-6 md:p-10 rounded-2xl border border-gray-200 shadow-sm space-y-6 font-serif text-[#03045e] print:border-none print:shadow-none print:p-0 w-full max-w-4xl mx-auto">
      {/* Header */}
      <div className="text-center border-b-2 border-[#03045e] pb-6">
        <h1 className="text-3xl font-black uppercase tracking-widest">{institutionDetails?.name || 'EduDash Public School'}</h1>
        <p className="text-sm mt-2 opacity-80">{institutionDetails?.address || '123 Education Lane, Knowledge City'}</p>
        <p className="text-sm opacity-80">Affiliation No: {institutionDetails?.affiliationNo || 'AFF-2024-5582'} | School Code: {institutionDetails?.schoolCode || 'SC-9921'}</p>
        <div className="mt-6 inline-block bg-[#03045e] text-white px-6 py-2 rounded-full text-sm font-bold tracking-widest uppercase">
          Academic Report Card • Session {card.sessionId}
        </div>
      </div>

      {/* Student Profile Grid */}
      <div className="grid grid-cols-2 gap-4 border-2 border-gray-100 rounded-xl p-6 bg-gray-50/50">
        <div>
          <span className="text-gray-500 text-xs font-bold uppercase tracking-wider block">Student Name</span>
          <span className="font-bold text-lg">{card.studentName}</span>
        </div>
        <div>
          <span className="text-gray-500 text-xs font-bold uppercase tracking-wider block">Admission Number</span>
          <span className="font-bold">{card.admissionNumber}</span>
        </div>
        <div>
          <span className="text-gray-500 text-xs font-bold uppercase tracking-wider block">Roll Number</span>
          <span className="font-bold">{card.rollNumber}</span>
        </div>
        <div>
          <span className="text-gray-500 text-xs font-bold uppercase tracking-wider block">Result Status</span>
          <span className={`font-black uppercase ${card.resultStatus === 'PASS' ? 'text-green-600' : 'text-red-600'}`}>
            {card.resultStatus}
          </span>
        </div>
      </div>

      {/* Subject Performance Table */}
      <div className="mt-8">
        <h3 className="text-lg font-black uppercase tracking-wider mb-4 border-b border-gray-200 pb-2">Academic Performance</h3>
        <table className="w-full text-left border-collapse border border-gray-200">
          <thead className="bg-[#03045e] text-white text-xs uppercase tracking-wider">
            <tr>
              <th className="p-3 border border-gray-300">Subject</th>
              <th className="p-3 border border-gray-300">Included Exams</th>
              <th className="p-3 border border-gray-300 text-center">Final %</th>
              <th className="p-3 border border-gray-300 text-center">Grade</th>
            </tr>
          </thead>
          <tbody className="text-sm">
            {card.subjects?.map(sub => (
              <tr key={sub.subjectId} className="border-b border-gray-200">
                <td className="p-3 border border-gray-200 font-bold">{sub.subjectName}</td>
                <td className="p-3 border border-gray-200 text-gray-500 text-xs">
                  {sub.includedExams?.join(", ") || "N/A"}
                </td>
                <td className="p-3 border border-gray-200 text-center font-bold">
                  {sub.finalPercentage ? sub.finalPercentage.toFixed(1) : 0}%
                </td>
                <td className="p-3 border border-gray-200 text-center font-bold">
                  {sub.finalGrade}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Overall Performance */}
      <div className="mt-6 flex justify-end">
        <div className="bg-gray-50 p-4 border border-gray-200 rounded-lg text-right w-64">
          <div className="text-xs text-gray-500 font-bold uppercase">Overall Percentage</div>
          <div className="text-2xl font-black text-[#03045e]">
            {card.overallPercentage ? card.overallPercentage.toFixed(2) : 0}%
          </div>
          <div className="text-xs text-gray-500 font-bold uppercase mt-2">Overall Grade</div>
          <div className="text-xl font-bold">{card.overallGrade}</div>
        </div>
      </div>

      {/* Remarks */}
      <div className="mt-8 grid grid-cols-2 gap-8">
        <div>
          <h3 className="text-xs font-bold text-gray-500 uppercase mb-2">Class Teacher Remarks</h3>
          <div className="border-b border-gray-400 border-dashed h-8">{card.generalRemark || ''}</div>
          <div className="border-b border-gray-400 border-dashed h-8 mt-4"></div>
        </div>
        <div>
          <h3 className="text-xs font-bold text-gray-500 uppercase mb-2">Principal Remarks</h3>
          <div className="border-b border-gray-400 border-dashed h-8">{card.principalRemark || ''}</div>
          <div className="border-b border-gray-400 border-dashed h-8 mt-4"></div>
        </div>
      </div>

      {/* Signatures */}
      <div className="mt-16 flex justify-between items-end px-8 pt-8">
        <div className="text-center w-48">
          <div className="border-t-2 border-gray-800 pt-2 font-bold text-sm">Class Teacher</div>
        </div>
        <div className="text-center w-48">
          <div className="border-t-2 border-gray-800 pt-2 font-bold text-sm">Principal</div>
        </div>
      </div>
      
      {/* Footer / Meta */}
      <div className="mt-12 text-center text-xs text-gray-400 border-t border-gray-100 pt-4">
        Generated on {new Date(card.generatedAt).toLocaleDateString()} | Ref: {card.id}
      </div>
    </div>
  );
};

export default PrintableReportCard;
