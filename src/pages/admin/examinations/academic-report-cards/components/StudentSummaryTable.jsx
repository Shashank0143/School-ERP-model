import React from 'react';
import { CheckCircle, AlertCircle } from 'lucide-react';
import StatusBadge from '../../../../../components/common/StatusBadge';

const StudentSummaryTable = ({ cards, onSelectCard }) => {
  if (!cards || cards.length === 0) return null;

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead className="bg-gray-50 text-gray-500 uppercase text-[10px] font-black tracking-wider border-b border-gray-100">
          <tr>
            <th className="px-6 py-4">Student</th>
            <th className="px-6 py-4">Percentage</th>
            <th className="px-6 py-4">Grade</th>
            <th className="px-6 py-4">Result</th>
            <th className="px-6 py-4">Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {cards.map(card => (
            <tr 
              key={card.id} 
              className={`hover:bg-gray-50/50 transition-colors ${onSelectCard ? 'cursor-pointer' : ''}`}
              onClick={() => onSelectCard && onSelectCard(card)}
            >
              <td className="px-6 py-4">
                <div className="font-bold text-[#03045e]">{card.studentName}</div>
                <div className="text-xs text-gray-400">Adm: {card.admissionNumber} • Roll: {card.rollNumber}</div>
              </td>
              <td className="px-6 py-4 font-medium text-gray-600">
                {card.overallPercentage ? card.overallPercentage.toFixed(2) : 0}%
              </td>
              <td className="px-6 py-4">
                <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded-md text-[10px] font-bold">
                  {card.overallGrade}
                </span>
              </td>
              <td className="px-6 py-4">
                {card.resultStatus === 'PASS' ? (
                  <span className="flex items-center gap-1 text-green-600 font-bold text-xs">
                    <CheckCircle size={14} /> PASS
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-red-600 font-bold text-xs">
                    <AlertCircle size={14} /> FAIL
                  </span>
                )}
              </td>
              <td className="px-6 py-4">
                <StatusBadge status={card.status.toLowerCase()} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default StudentSummaryTable;
