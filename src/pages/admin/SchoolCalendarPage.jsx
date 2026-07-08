import React, { useState, useMemo, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CalendarDays,
  BookOpen,
  Trophy,
  Users,
  GraduationCap,
  Star,
  ChevronLeft,
  ChevronRight,
  Info,
  X,
  Plus,
  Calendar,
  Edit,
  Trash
} from "lucide-react";
import AdminPageHeader from "../../components/admin/AdminPageHeader";
import AdminEditForm from "../../components/admin/AdminEditForm";
import MainCard from "../../components/MainCard";
import { getSchoolCalendar } from "../../services/sharedService";
import { createEvent, updateEvent, deleteEvent, overrideHoliday } from "../../services/academicCalendarService";

const NAVY = "#03045e";
const TEAL = "#0077b6";
const SAGE = "#00b4d8";

const TYPE_CONFIG = {
  holiday: { label: "Holiday", bg: "#EF444420", color: "#EF4444", icon: Star },
  exam: { label: "Exam", bg: NAVY + "18", color: NAVY, icon: BookOpen },
  event: { label: "Event", bg: TEAL + "20", color: TEAL, icon: Trophy },
  ptm: { label: "PTM", bg: SAGE + "30", color: SAGE, icon: Users },
  academic: {
    label: "Academic",
    bg: "#F59E0B20",
    color: "#F59E0B",
    icon: GraduationCap,
  },
};

const ALL_TYPES = ["upcoming", "all", "holiday", "exam", "event", "ptm", "academic"];

const getMonthData = (year, monthIndex) => {
  const firstDay = new Date(year, monthIndex, 1).getDay();
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
  const days = [];
  for (let i = 0; i < (firstDay === 0 ? 6 : firstDay - 1); i++) {
    days.push(null);
  }
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(i);
  }
  return days;
};

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

const WEEKDAYS = ["M", "T", "W", "T", "F", "S", "S"];

function MiniMonth({ year, monthIndex, events, hoveredEventId, onDateClick, isCurrent }) {
  const days = useMemo(() => getMonthData(year, monthIndex), [year, monthIndex]);
  const monthName = MONTHS[monthIndex];

  const eventsByDay = useMemo(() => {
    const map = {};
    (events || []).forEach(e => {
      if (!e.date) return;
      const parts = e.date.split(" ");
      const dDay = parseInt(parts[0]);
      const dMonth = parts[1];
      const dYear = parseInt(parts[2]);
      if (dYear === year && (dMonth.startsWith(monthName.substring(0, 3)) || dMonth === monthName)) {
        if (!map[dDay]) map[dDay] = [];
        map[dDay].push(e);
      }
    });
    return map;
  }, [events, year, monthIndex, monthName]);

  return (
    <div className={`bg-white rounded-xl p-2 border shadow-sm hover:shadow-md transition-all duration-300
      ${isCurrent ? "border-[#00b4d8] bg-[#caf0f8]/20 shadow-lg shadow-[#00b4d8]/10" : "border-[#caf0f8]"}
    `}>
      <div className="flex items-center justify-between mb-1.5 border-b border-[#caf0f8] pb-1">
        <h4 className={`text-[10px] font-black uppercase tracking-wider ${isCurrent ? "text-[#0077b6]" : "text-[#03045e]"}`}>
          {monthName}
        </h4>
        {isCurrent && (
          <span className="text-[7px] font-black bg-[#00b4d8] text-white px-1 rounded-sm uppercase tracking-tighter">Current</span>
        )}
      </div>
      <div className="grid grid-cols-7 gap-0.5">
        {WEEKDAYS.map((d, i) => (
          <span key={i} className="text-[7px] font-bold text-gray-400 text-center mb-0.5">
            {d}
          </span>
        ))}
        {days.map((day, i) => {
          if (day === null) return <div key={i} />;
          const dayEvents = eventsByDay[day] || [];
          const isHovered = dayEvents.some(e => e.id === hoveredEventId);
          const isToday = isCurrent && day === new Date().getDate();
          return (
            <div 
              key={i} 
              className={`relative h-6 w-full flex flex-col items-center justify-center rounded-md text-[9px] font-bold transition-all duration-200 pb-1
                ${dayEvents.length > 0 ? "cursor-pointer" : "text-gray-300"}
                ${isHovered ? "bg-[#03045e] text-white scale-110 z-10 shadow-lg" : isToday ? "ring-1 ring-[#00b4d8] bg-[#00b4d8]/10 text-[#00b4d8]" : "hover:bg-[#caf0f8]"}
              `}
              onClick={() => dayEvents.length > 0 && onDateClick(day, monthName, year, dayEvents)}
            >
              <span className={dayEvents.length > 0 && !isHovered && !isToday ? "text-[#03045e]" : ""}>
                {day}
              </span>
              {dayEvents.length > 0 && !isHovered && (
                <div className="absolute bottom-0.5 flex gap-0.5 justify-center flex-wrap px-0.5">
                  {dayEvents.slice(0, 4).map((e, idx) => (
                    <div 
                      key={idx} 
                      className="w-1.5 h-1.5 rounded-full ring-1 ring-white" 
                      style={{ backgroundColor: TYPE_CONFIG[e.type]?.color || TEAL }} 
                    />
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function EventRow({ event, index, isHovered, onHover, onClick, onEdit, onDelete }) {
  const cfg = TYPE_CONFIG[event.type] ?? TYPE_CONFIG.event;
  const IconComponent = cfg.icon;
  const parts = (event.date || "").split(" ");
  const day = parts[0] || "";
  const month = parts[1] || "";
  const year = parts[2] || "";

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.03 }}
      onMouseEnter={() => onHover(event.id)}
      onMouseLeave={() => onHover(null)}
      onClick={onClick}
      className={`flex items-start gap-4 rounded-2xl px-4 py-3 cursor-pointer transition-all duration-300
        ${isHovered ? "bg-[#03045e] text-white scale-[1.02] shadow-lg z-10" : "bg-white hover:bg-[#caf0f8]/30"}
      `}
      style={{
        outline: !isHovered ? "1px solid #caf0f8" : "none",
        marginBottom: "8px"
      }}
    >
      <div className="flex-shrink-0 w-12 text-center">
        <p className={`text-[10px] font-black uppercase ${isHovered ? "text-[#00b4d8]" : "text-[#0077b6]"}`}>
          {month}
        </p>
        <p className={`text-2xl font-black leading-none ${isHovered ? "text-white" : "text-[#03045e]"}`}>
          {day}
        </p>
        <p className={`text-[9px] font-bold ${isHovered ? "text-white/60" : "text-gray-400"}`}>
          {year}
        </p>
      </div>
      <div className={`w-px self-stretch flex-shrink-0 mt-1 ${isHovered ? "bg-white/20" : "bg-[#0077b620]"}`} />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap mb-0.5">
          <p className="text-sm font-extrabold truncate">
            {event.title}
          </p>
          <span
            className={`inline-flex items-center gap-1 text-[9px] font-black px-2 py-0.5 rounded-full flex-shrink-0 uppercase tracking-tighter
              ${isHovered ? "bg-white/20 text-white" : ""}
            `}
            style={!isHovered ? { backgroundColor: cfg.bg, color: cfg.color } : {}}
          >
            <IconComponent size={10} />
            {cfg.label}
          </span>
        </div>
        <p className={`text-[11px] leading-snug line-clamp-1 ${isHovered ? "text-white/80" : "text-gray-500 font-medium"}`}>
          {event.description || "System mapped event"}
        </p>
      </div>
      
      {/* Action Buttons visible on hover, but we will render them and rely on group hover or just show them for admin */}
      <div className={`flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 ${isHovered ? 'opacity-100' : ''}`} onClick={e => e.stopPropagation()}>
        <button
          onClick={(e) => { e.stopPropagation(); onEdit(event); }}
          className={`p-1.5 rounded-lg transition-colors ${isHovered ? 'text-white hover:bg-white/20' : 'text-[#0077b6] hover:text-[#03045e] hover:bg-[#caf0f8]/40'}`}
          title="Edit Event"
        >
          <Edit size={14} />
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); onDelete(event); }}
          className={`p-1.5 rounded-lg transition-colors ${isHovered ? 'text-white hover:bg-white/20' : 'text-red-500 hover:text-red-700 hover:bg-red-50'}`}
          title={event.isSeeded ? "Override/Cancel Holiday" : "Delete Event"}
        >
          <Trash size={14} />
        </button>
      </div>
    </motion.div>
  );
}

function AdminSchoolCalendarPage() {
  const [calendarData, setCalendarData] = useState(null);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState("upcoming");
  const [hoveredEventId, setHoveredEventId] = useState(null);
  const [selectedDayInfo, setSelectedDayInfo] = useState(null);
  const scrollContainerRef = useRef(null);

  const [createOpen, setCreateOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const data = await getSchoolCalendar();
      setCalendarData(data);
      // Wait, we should just getEvents() from academicCalendarService, but since getSchoolCalendar calls getAcademicCalendar, it's fine.
      // But let's filter out cancelled events in the view, or we know they are already filtered by the service?
      // Wait, the service filters them! So we just use data.events.
      setEvents(data?.events?.filter(e => e.status !== 'cancelled') || []);
    } catch (error) {
      console.error("Error fetching events:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleScheduleEvent = async (data) => {
    try {
      if (editingEvent) {
        const updatedEvents = updateEvent(editingEvent.id, {
          title: data.name,
          type: data.category.toLowerCase(),
          date: new Date(data.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
          description: data.description,
        });
        setEvents(updatedEvents);
      } else {
        const newEvent = {
          title: data.name,
          type: data.category.toLowerCase(),
          date: new Date(data.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
          description: data.description,
          status: "Upcoming"
        };
        const updatedEvents = createEvent(newEvent);
        setEvents(updatedEvents);
      }
      setCreateOpen(false);
      setEditingEvent(null);
    } catch (error) {
      console.error("Failed to save event", error);
    }
  };

  const handleEditClick = (event) => {
    // Parse the date back to YYYY-MM-DD for the date picker
    const parts = event.date.split(" ");
    let dateStr = "";
    if (parts.length === 3) {
      const day = parts[0].padStart(2, '0');
      const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      const monthIdx = monthNames.findIndex(m => parts[1].startsWith(m));
      if (monthIdx !== -1) {
        const month = String(monthIdx + 1).padStart(2, '0');
        dateStr = `${parts[2]}-${month}-${day}`;
      }
    }

    setEditingEvent({
      ...event,
      name: event.title,
      category: event.type.charAt(0).toUpperCase() + event.type.slice(1),
      date: dateStr || "2024-04-01"
    });
    setCreateOpen(true);
  };

  const handleDeleteClick = (event) => {
    if (event.isSeeded) {
      if (window.confirm("Are you sure you want to cancel this seeded holiday? It will be hidden from the calendar.")) {
        const updatedEvents = overrideHoliday(event.id, 'cancelled');
        setEvents(updatedEvents);
      }
    } else {
      if (window.confirm("Are you sure you want to permanently delete this event?")) {
        const updatedEvents = deleteEvent(event.id);
        setEvents(updatedEvents);
      }
    }
  };

  const academicYear = calendarData?.academicYear || "2024-25";
  const yearParts = academicYear.split(/[–-]/);
  const startYear = parseInt(yearParts[0]) || new Date().getFullYear();
  const endYear = yearParts[1] ? (yearParts[1].trim().length === 2 ? 2000 + parseInt(yearParts[1].trim()) : parseInt(yearParts[1].trim())) : startYear + 1;

  const calendarMonths = useMemo(() => {
    const months = [];
    // Start from April (month index 3)
    for (let i = 0; i < 12; i++) {
      const monthIndex = (3 + i) % 12;
      const year = (3 + i) >= 12 ? endYear : startYear;
      months.push({ year, month: monthIndex });
    }
    return months;
  }, [startYear, endYear]);

  const now = new Date();
  const currentMonthIdx = now.getMonth();
  const currentYearIdx = now.getFullYear();

  const filtered = useMemo(() => {
    // 1. Filter by category
    let result = (activeFilter === "all" || activeFilter === "upcoming")
      ? events 
      : events.filter((e) => e.type === activeFilter);
      
    // 2. Helper to parse event date strings like "15 Jul 2026"
    const parseEventDate = (dateStr) => {
      if (!dateStr) return 0;
      const parts = dateStr.split(" ");
      if (parts.length === 3) {
        const day = parseInt(parts[0], 10);
        const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        const monthIdx = monthNames.findIndex(m => parts[1].startsWith(m));
        const year = parseInt(parts[2], 10);
        return new Date(year, monthIdx, day).getTime();
      }
      return new Date(dateStr).getTime();
    };

    // 3. Sort chronologically
    result = [...result].sort((a, b) => parseEventDate(a.date) - parseEventDate(b.date));

    // 4. If viewing "upcoming", only show upcoming events in the timeline (from today onwards)
    if (activeFilter === "upcoming") {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayTime = today.getTime();
      result = result.filter(e => parseEventDate(e.date) >= todayTime);
    }
    
    return result;
  }, [activeFilter, events]);

  const handleDateClick = (day, month, year, dayEvents) => {
    setSelectedDayInfo({ day, month, year, events: dayEvents });
  };

  const eventFields = [
    { name: "name", label: "Event Title", type: "text", required: true },
    { name: "date", label: "Date", type: "date", required: true },
    {
      name: "category",
      label: "Category",
      type: "select",
      options: ALL_TYPES.filter(t => t !== "all" && t !== "upcoming").map(t => ({ value: t.charAt(0).toUpperCase() + t.slice(1), label: TYPE_CONFIG[t].label })),
      required: true,
    },
    { name: "description", label: "Description", type: "text" },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-10 h-10 border-4 border-[#00b4d8] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-[1600px] mx-auto space-y-6"
    >
      <AdminPageHeader
        title="Institutional Calendar"
        description="Manage school-wide events, academic terms, holidays, and institutional schedules across all departments."
        icon={Calendar}
        actionButton={
          <button
            onClick={() => { setEditingEvent(null); setCreateOpen(true); }}
            className="flex items-center gap-2 bg-[#03045e] text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-[#0077b6] transition-colors"
          >
            <Plus size={16} />
            Schedule Event
          </button>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-[1.2fr,1fr] gap-8 items-start mb-8">
        <div className="flex flex-col gap-4 min-w-0">
          <div className="flex items-center justify-between px-2">
            <h2 className="text-lg font-black text-[#03045e] flex items-center gap-2">
              <BookOpen size={20} className="text-[#00b4d8]" />
              Event Timeline
            </h2>
            <span className="text-[11px] font-black text-gray-400 uppercase bg-gray-50 px-2.5 py-1 rounded-full">
              {filtered.length} Events Listed
            </span>
          </div>

          <div 
            className="bg-white rounded-[2rem] p-6 border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] relative overflow-hidden"
            style={{ borderTop: "6px solid #00b4d8", maxHeight: "700px", display: "flex", flexDirection: "column" }}
          >
            <div className="sticky top-0 z-20 bg-white/95 backdrop-blur-md py-4 px-4 border-b border-gray-50 mb-4 overflow-visible">
              <div className="flex flex-wrap gap-2">
                {ALL_TYPES.map((type) => {
                  const isActive = activeFilter === type;
                  const cfg = TYPE_CONFIG[type];
                  return (
                    <button
                      key={type}
                      onClick={() => setActiveFilter(type)}
                      className={`px-4 py-2 rounded-xl text-xs font-black transition-all duration-300 capitalize
                        ${isActive ? "bg-[#03045e] text-white shadow-lg shadow-[#03045e]/20" : "bg-[#caf0f8]/50 text-[#03045e] hover:bg-[#caf0f8]"}
                      `}
                    >
                      {type === "all" ? "All Events" : type === "upcoming" ? "Upcoming" : (cfg?.label ?? type)}
                    </button>
                  );
                })}
              </div>
            </div>

            <div 
              ref={scrollContainerRef}
              className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-1"
              style={{ scrollBehavior: "smooth" }}
            >
              {filtered.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-gray-300">
                  <Star size={48} className="mb-4 opacity-20" />
                  <p className="font-bold">No events match your filter</p>
                </div>
              ) : (
                filtered.map((event, i) => (
                  <EventRow 
                    key={event.id} 
                    event={event} 
                    index={i} 
                    isHovered={hoveredEventId === event.id}
                    onHover={setHoveredEventId}
                    onClick={() => {
                      const parts = (event.date || "").split(" ");
                      handleDateClick(parseInt(parts[0]), parts[1], parseInt(parts[2]), [event]);
                    }}
                    onEdit={handleEditClick}
                    onDelete={handleDeleteClick}
                  />
                ))
              )}
            </div>
            <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-white to-transparent z-10 pointer-events-none opacity-80" />
          </div>
        </div>

        <div className="flex flex-col gap-4 min-w-0 h-full">
          <div className="flex items-center justify-between px-2">
            <h2 className="text-lg font-black text-[#03045e] flex items-center gap-2">
              <CalendarDays size={20} className="text-[#00b4d8]" />
              Academic Planner
              <span className="ml-2 px-2 py-0.5 rounded-md bg-[#03045e] text-white text-[9px] font-black tracking-widest uppercase">
                {academicYear}
              </span>
            </h2>
          </div>

          <div className="bg-white rounded-[2rem] p-5 border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] h-full relative overflow-hidden"
               style={{ borderTop: "6px solid #00b4d8" }}>
            <div className="grid grid-cols-1 md:grid-cols-2 md:grid-cols-3 gap-2">
              {calendarMonths.map((m, idx) => (
                <MiniMonth 
                  key={idx}
                  year={m.year}
                  monthIndex={m.month}
                  events={events}
                  hoveredEventId={hoveredEventId}
                  onDateClick={handleDateClick}
                  isCurrent={m.year === currentYearIdx && m.month === currentMonthIdx}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      <MainCard borderColor="#00b4d8" className="p-6 relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-[#03045e] mb-1">Schedule Key</h3>
            <p className="text-[11px] font-bold text-gray-400">Academic & Activity Color Coding</p>
          </div>
          <div className="flex flex-wrap gap-x-8 gap-y-4">
            {Object.entries(TYPE_CONFIG).map(([key, cfg]) => {
              const IconComponent = cfg.icon;
              return (
                <div key={key} className="flex items-center gap-3">
                  <div 
                    className="w-10 h-10 rounded-xl flex items-center justify-center shadow-sm"
                    style={{ backgroundColor: cfg.bg, color: cfg.color }}
                  >
                    <IconComponent size={18} />
                  </div>
                  <div>
                    <p className="text-[11px] font-black text-[#03045e] leading-none mb-1">{cfg.label}</p>
                    <p className="text-[9px] font-bold text-gray-400 uppercase tracking-tighter">System Code: {key}</p>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="hidden xl:flex items-center gap-2 bg-[#caf0f8] px-4 py-2 rounded-2xl">
            <Info size={16} className="text-[#0077b6]" />
            <p className="text-[10px] font-bold text-[#0077b6] leading-tight">
              Calendar reflects official <br/> School Board dates
            </p>
          </div>
        </div>
      </MainCard>

      <AnimatePresence>
        {selectedDayInfo && (
          <>
            <div className="fixed inset-0 z-40 bg-black/5 backdrop-blur-[1px]" onClick={() => setSelectedDayInfo(null)} />
            <motion.div 
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              className="fixed bottom-8 right-8 w-80 bg-[#03045e] text-white p-5 rounded-[2rem] shadow-2xl z-50 border border-white/10 overflow-hidden"
            >
              <button onClick={() => setSelectedDayInfo(null)} className="absolute top-5 right-5 text-white/40 hover:text-white"><X size={20} /></button>
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center text-2xl font-black text-[#00b4d8]">{selectedDayInfo.day}</div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#00b4d8] leading-none mb-1">{selectedDayInfo.month}</p>
                  <p className="text-sm font-extrabold">{selectedDayInfo.events.length} Event{selectedDayInfo.events.length > 1 ? "s" : ""}</p>
                </div>
              </div>
              <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                {selectedDayInfo.events.map((e, idx) => (
                  <div key={idx} className="flex items-start gap-3 bg-white/5 p-3 rounded-2xl border border-white/10 group hover:bg-white/10 transition-colors">
                    <div className="w-2.5 h-2.5 rounded-full mt-1.5 flex-shrink-0" style={{ backgroundColor: TYPE_CONFIG[e.type]?.color || TEAL }} />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-black mb-0.5 group-hover:text-[#00b4d8] transition-colors">{e.title}</p>
                      <p className="text-[10px] text-white/60 font-medium leading-relaxed">{e.description || "System mapped event"}</p>
                    </div>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex-shrink-0">
                      <button onClick={(ev) => { ev.stopPropagation(); handleEditClick(e); setSelectedDayInfo(null); }} className="p-1.5 text-white/60 hover:text-white hover:bg-white/20 rounded-lg transition-colors" title="Edit Event"><Edit size={12} /></button>
                      <button onClick={(ev) => { ev.stopPropagation(); handleDeleteClick(e); setSelectedDayInfo(null); }} className="p-1.5 text-red-400 hover:text-red-300 hover:bg-red-500/20 rounded-lg transition-colors" title={e.isSeeded ? "Override/Cancel Holiday" : "Delete Event"}><Trash size={12} /></button>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Schedule Event Modal */}
      <AdminEditForm
        isOpen={createOpen}
        onClose={() => { setCreateOpen(false); setEditingEvent(null); }}
        title={editingEvent ? "Edit Institutional Event" : "Schedule Institutional Event"}
        data={editingEvent || { name: "", date: "2026-07-15", category: "Academic", description: "" }}
        fields={eventFields}
        onSubmit={handleScheduleEvent}
      />

      <style dangerouslySetInnerHTML={{ __html: `
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #caf0f8; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #00b4d8; }
      `}} />
    </motion.div>
  );
}

export default AdminSchoolCalendarPage;
