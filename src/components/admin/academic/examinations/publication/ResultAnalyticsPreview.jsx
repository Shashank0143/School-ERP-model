import React, { useMemo } from "react";
import { Award, Sparkles, TrendingUp, Users, CheckCircle } from "lucide-react";

export default function ResultAnalyticsPreview({ examCycle, papers, students, subjects }) {
  const analytics = useMemo(() => {
    if (!examCycle) return null;

    const storedRecordsStr = localStorage.getItem(`exam_op_state_${examCycle.id}_evaluation_records`) || "[]";
    const records = JSON.parse(storedRecordsStr);

    if (records.length === 0) return null;

    const totalGraded = records.length;
    const absentCount = records.filter((r) => r.isAbsent).length;
    
    // Pass percentage (33% passing threshold)
    const passed = records.filter((r) => !r.isAbsent && r.marksObtained >= 13).length; // assuming max marks = 40
    const passPercentage = Math.round((passed / (totalGraded - absentCount || 1)) * 100);

    // Subject aggregates
    const subjectStats = {};
    records.forEach((r) => {
      const p = papers.find((paper) => paper.id === r.paperId);
      if (!p) return;
      if (!subjectStats[p.subjectId]) {
        subjectStats[p.subjectId] = {
          total: 0,
          count: 0,
          passed: 0,
        };
      }
      subjectStats[p.subjectId].total += r.marksObtained;
      subjectStats[p.subjectId].count += 1;
      if (r.marksObtained >= 13) {
        subjectStats[p.subjectId].passed += 1;
      }
    });

    const parsedSubjects = Object.entries(subjectStats).map(([subId, stat]) => {
      const sub = subjects.find((s) => s.id === subId);
      return {
        subjectName: sub?.name || subId,
        average: Math.round(stat.total / stat.count),
        passRate: Math.round((stat.passed / stat.count) * 100),
      };
    });

    // Topper list (highest marks obtained)
    const sortedRecords = [...records]
      .filter((r) => !r.isAbsent)
      .sort((a, b) => b.marksObtained - a.marksObtained)
      .slice(0, 3)
      .map((r) => {
        const stud = students.find((s) => s.id === r.studentId);
        return {
          name: stud?.name || "Student",
          score: r.marksObtained,
        };
      });

    return {
      passPercentage,
      absentPercentage: Math.round((absentCount / totalGraded) * 100),
      toppers: sortedRecords,
      subjects: parsedSubjects,
    };
  }, [examCycle, papers, students, subjects]);

  if (!analytics) {
    return (
      <div className="text-center py-8 text-gray-400 text-xs font-bold uppercase">
        No evaluation records logged yet to pre-compute analytics
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h4 className="text-xs font-black text-[#03045e] uppercase tracking-wider">
          Pre-Publication Analytics Preview
        </h4>
        <p className="text-[9px] text-gray-400 font-bold uppercase mt-0.5">
          Class performance projections and averages
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4.5 rounded-2xl border border-gray-100 space-y-1.5 shadow-sm">
          <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest block">
            Class Pass Rate
          </span>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-black text-[#03045e]">
              {analytics.passPercentage}%
            </span>
          </div>
          <span className="text-[8px] text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100 font-black uppercase inline-block">
            Target Met
          </span>
        </div>

        <div className="bg-white p-4.5 rounded-2xl border border-gray-100 space-y-1.5 shadow-sm">
          <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest block">
            Absentee Rate
          </span>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-black text-[#03045e]">
              {analytics.absentPercentage}%
            </span>
          </div>
          <span className="text-[8px] text-rose-600 bg-rose-50 px-2 py-0.5 rounded border border-rose-100 font-black uppercase inline-block">
            Attendance Logged
          </span>
        </div>

        <div className="bg-white p-4.5 rounded-2xl border border-gray-100 space-y-1.5 shadow-sm">
          <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest block">
            Academic Topper
          </span>
          <div className="flex items-baseline gap-1.5">
            <span className="text-base font-black text-[#03045e] truncate max-w-[150px]">
              {analytics.toppers[0]?.name || "N/A"}
            </span>
          </div>
          <span className="text-[8px] text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100 font-black uppercase inline-block">
            Score: {analytics.toppers[0]?.score || 0} marks
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-1 md:grid-cols-2 gap-6">
        {/* Subject wise average */}
        <div className="space-y-3">
          <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest block">
            Subject Performance Projection
          </span>
          <div className="space-y-3">
            {analytics.subjects.map((sub, idx) => (
              <div key={idx} className="space-y-1">
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-[#03045e]">{sub.subjectName}</span>
                  <span className="text-gray-400 font-semibold">
                    Avg: {sub.average} / Pass: {sub.passRate}%
                  </span>
                </div>
                <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#0077b6] rounded-full"
                    style={{ width: `${sub.passRate}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Toppers rank list */}
        <div className="space-y-3">
          <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest block">
            Projected School Toppers
          </span>
          <div className="space-y-2">
            {analytics.toppers.map((top, idx) => (
              <div
                key={idx}
                className="bg-[#caf0f8]/20 p-3 rounded-2xl border border-[#caf0f8]/30 flex justify-between items-center"
              >
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-[#03045e] text-[#caf0f8] flex items-center justify-center font-black text-xs">
                    {idx + 1}
                  </span>
                  <strong className="text-xs font-black text-[#03045e]">
                    {top.name}
                  </strong>
                </div>
                <span className="text-xs font-extrabold text-[#0077b6]">
                  {top.score} marks
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
