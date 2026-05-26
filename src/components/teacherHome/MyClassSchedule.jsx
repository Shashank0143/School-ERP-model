import React, { useState } from "react";
import { Calendar, Clock, MapPin, User, BookOpen } from "lucide-react";
import MainCard from "../MainCard";

export default function MyClassSchedule({ classSchedule, className }) {
  const [activeTab, setActiveTab] = useState("today");

  if (!classSchedule) return null;

  const { today = [], weekly = [] } = classSchedule;

  // Group weekly schedule by day
  const groupedWeekly = weekly.reduce((acc, curr) => {
    if (!acc[curr.day]) acc[curr.day] = [];
    acc[curr.day].push(curr);
    return acc;
  }, {});

  const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

  return (
    <MainCard borderColor="#00b4d8" className="p-6 bg-white shadow-sm rounded-3xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 mb-5 gap-3">
        <div>
          <span className="text-[9px] font-black text-[#00b4d8] uppercase tracking-wider bg-cyan-50 border border-cyan-100 px-2 py-0.5 rounded-md">
            Class Timetable
          </span>
          <h3 className="text-base font-black text-[#03045e] mt-1.5 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-[#00b4d8]" />
            My Class Timetable ({className})
          </h3>
        </div>

        {/* Tab Switcher */}
        <div className="flex bg-slate-100 p-1 rounded-xl self-start sm:self-center">
          <button
            onClick={() => setActiveTab("today")}
            className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all ${
              activeTab === "today"
                ? "bg-white text-[#03045e] shadow-xs"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            Today's Periods
          </button>
          <button
            onClick={() => setActiveTab("weekly")}
            className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all ${
              activeTab === "weekly"
                ? "bg-white text-[#03045e] shadow-xs"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            Weekly Grid
          </button>
        </div>
      </div>

      {/* Render Active View */}
      {activeTab === "today" ? (
        today.length === 0 ? (
          <div className="text-center py-10 text-xs font-bold text-slate-400 italic">
            Timetable has not been set yet
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[500px]">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">Period</th>
                  <th className="py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">Subject</th>
                  <th className="py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">Subject Teacher</th>
                  <th className="py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">Room</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {today.map((period, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-3.5">
                      <span className="text-xs font-black text-[#03045e] bg-slate-100 px-2.5 py-1 rounded-lg">
                        {period.period}
                      </span>
                    </td>
                    <td className="py-3.5">
                      <div className="flex items-center gap-2">
                        <BookOpen className="w-3.5 h-3.5 text-blue-500" />
                        <span className="text-xs font-black text-slate-700">{period.subject}</span>
                      </div>
                    </td>
                    <td className="py-3.5">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-600">{period.teacher}</span>
                      </div>
                    </td>
                    <td className="py-3.5">
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-[#00b4d8]" />
                        <span className="text-xs font-bold text-slate-600">{period.room}</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      ) : (
        <div className="space-y-6">
          {daysOfWeek.map((day) => {
            const dayPeriods = groupedWeekly[day] || [];
            return (
              <div key={day} className="bg-slate-50/50 border border-slate-100 rounded-2xl p-4">
                <h4 className="text-xs font-black text-[#03045e] uppercase tracking-wider mb-3 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#00b4d8]" />
                  {day}
                </h4>
                {dayPeriods.length === 0 ? (
                  <p className="text-[10px] font-bold text-slate-400 italic pl-4">Timetable has not been set yet</p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                    {dayPeriods.map((period, pIdx) => (
                      <div key={pIdx} className="bg-white border border-slate-100 p-3 rounded-xl hover:shadow-xs transition-shadow">
                        <div className="flex items-center justify-between gap-2 mb-1.5">
                          <span className="text-[9px] font-black text-[#03045e] bg-slate-100 px-2 py-0.5 rounded-md">
                            {period.period.replace("Period ", "P")}
                          </span>
                          <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">{period.time.split(" - ")[0]}</span>
                        </div>
                        <h5 className="text-xs font-black text-slate-700 line-clamp-1">{period.subject}</h5>
                        <p className="text-[10px] font-bold text-slate-500 mt-1">
                          {period.teacher}
                        </p>
                        <p className="text-[10px] font-bold text-slate-500 mt-0.5 flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-[#00b4d8]" /> {period.room}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </MainCard>
  );
}
