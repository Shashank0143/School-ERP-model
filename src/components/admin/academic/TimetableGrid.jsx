import React from "react";
import MainCard from "../../MainCard";
import { MapPin, Coffee, Pencil, Lock } from "lucide-react";

/**
 * TimetableGrid
 *
 * Institutional Day × Period weekly timetable matrix.
 *
 * Columns: DAY | P1 | P2 | P3 | P4 | LUNCH | P5 | P6 | P7 | P8
 * Rows:    Monday → Friday
 *
 * Props:
 *   schedule    {Array}    - flat slot objects { day, period, subject, teacher?, class?, room }
 *   type        {string}   - "class" shows teacher; "teacher" shows class name
 *   editMode    {boolean}  - enables cell click UI
 *   onCellClick {Function} - (day, period, existingSlot|null) => void
 */

// ── Constants ────────────────────────────────────────────────────────────────

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

const PERIODS = [
  { code: "P1", label: "P1", time: "08:00–08:50" },
  { code: "P2", label: "P2", time: "08:50–09:40" },
  { code: "P3", label: "P3", time: "09:40–10:30" },
  { code: "P4", label: "P4", time: "10:30–11:20" },
  { code: "P5", label: "P5", time: "11:50–12:40" },
  { code: "P6", label: "P6", time: "12:40–13:30" },
  { code: "P7", label: "P7", time: "13:30–14:20" },
  { code: "P8", label: "P8", time: "14:20–15:10" },
];

// Subtle per-subject color palettes
const SUBJECT_PALETTE = {
  Physics: {
    bg: "#eff6ff",
    border: "#bfdbfe",
    text: "#1d4ed8",
    dot: "#3b82f6",
  },
  Chemistry: {
    bg: "#faf5ff",
    border: "#ddd6fe",
    text: "#6d28d9",
    dot: "#8b5cf6",
  },
  Biology: {
    bg: "#f0fdf4",
    border: "#bbf7d0",
    text: "#15803d",
    dot: "#22c55e",
  },
  Mathematics: {
    bg: "#f0f9ff",
    border: "#bae6fd",
    text: "#0369a1",
    dot: "#0ea5e9",
  },
  English: {
    bg: "#fff7ed",
    border: "#fed7aa",
    text: "#c2410c",
    dot: "#f97316",
  },
  History: {
    bg: "#fefce8",
    border: "#fde68a",
    text: "#92400e",
    dot: "#f59e0b",
  },
  "Political Science": {
    bg: "#fff1f2",
    border: "#fecdd3",
    text: "#be123c",
    dot: "#f43f5e",
  },
  Sociology: {
    bg: "#fdf4ff",
    border: "#f5d0fe",
    text: "#86198f",
    dot: "#d946ef",
  },
  Geography: {
    bg: "#f0fdfa",
    border: "#99f6e4",
    text: "#0f766e",
    dot: "#14b8a6",
  },
  "Business Studies": {
    bg: "#fff7ed",
    border: "#fed7aa",
    text: "#9a3412",
    dot: "#ea580c",
  },
  Accountancy: {
    bg: "#eff6ff",
    border: "#bfdbfe",
    text: "#1e40af",
    dot: "#2563eb",
  },
  Economics: {
    bg: "#f0fdf4",
    border: "#bbf7d0",
    text: "#166534",
    dot: "#16a34a",
  },
  "Computer Science": {
    bg: "#ecfeff",
    border: "#a5f3fc",
    text: "#155e75",
    dot: "#06b6d4",
  },
  "Informatics Practices": {
    bg: "#f0fdfa",
    border: "#99f6e4",
    text: "#065f46",
    dot: "#10b981",
  },
  "Physical Education": {
    bg: "#fff1f2",
    border: "#fecdd3",
    text: "#9f1239",
    dot: "#e11d48",
  },
};

const DEFAULT_PALETTE = {
  bg: "#f8fafc",
  border: "#e2e8f0",
  text: "#334155",
  dot: "#64748b",
};

function getSubjectPalette(subjectName = "") {
  if (SUBJECT_PALETTE[subjectName]) return SUBJECT_PALETTE[subjectName];
  const key = Object.keys(SUBJECT_PALETTE).find(
    (k) =>
      subjectName.toLowerCase().includes(k.toLowerCase()) ||
      k.toLowerCase().includes(subjectName.toLowerCase()),
  );
  return key ? SUBJECT_PALETTE[key] : DEFAULT_PALETTE;
}

// ── Sub-components ───────────────────────────────────────────────────────────

function SubjectCell({ slot, type, editMode, onClick }) {
  const palette = getSubjectPalette(slot.subject);
  const secondaryLine =
    type === "teacher"
      ? slot.class || slot.classId || ""
      : slot.teacher || "Faculty";

  return (
    <div
      onClick={onClick}
      className={`group h-full flex flex-col justify-between p-2.5 rounded-xl border transition-all ${
        editMode ? "cursor-pointer hover:shadow-md hover:scale-[1.02]" : ""
      }`}
      style={{
        backgroundColor: palette.bg,
        borderColor: editMode ? palette.dot : palette.border,
      }}
    >
      {/* Subject + dot */}
      <div className="flex items-start gap-1.5">
        <span
          className="w-2 h-2 rounded-full flex-shrink-0 mt-0.5"
          style={{ backgroundColor: palette.dot }}
        />
        <p
          className="text-[10px] font-black leading-tight"
          style={{ color: palette.text }}
        >
          {slot.subject}
        </p>
        {slot.isLocked ? (
          <Lock
            size={8}
            className="ml-auto text-amber-500 flex-shrink-0 mt-0.5"
          />
        ) : editMode && (
          <Pencil
            size={8}
            className="ml-auto text-gray-300 group-hover:text-gray-500 transition-colors flex-shrink-0 mt-0.5"
          />
        )}
      </div>

      {/* Teacher / Class */}
      <p className="text-[9px] font-bold text-gray-500 mt-1 truncate leading-tight">
        {secondaryLine}
      </p>

      {/* Room */}
      <div className="flex items-center gap-0.5 mt-1">
        <MapPin size={7} className="text-gray-400 flex-shrink-0" />
        <span className="text-[8px] font-semibold text-gray-400 truncate">
          {slot.room}
        </span>
      </div>
    </div>
  );
}

function EmptyCell({ editMode, onClick }) {
  return (
    <div
      onClick={onClick}
      className={`h-full flex items-center justify-center rounded-xl border border-dashed transition-all ${
        editMode
          ? "border-[#0077b6]/30 bg-[#caf0f8]/10 cursor-pointer hover:border-[#0077b6] hover:bg-[#caf0f8]/20"
          : "border-gray-100"
      }`}
    >
      {editMode ? (
        <div className="flex flex-col items-center gap-1 text-[#0077b6]/40 hover:text-[#0077b6]/70 transition-colors">
          <Pencil size={10} />
          <span className="text-[8px] font-black uppercase tracking-wider">
            Add
          </span>
        </div>
      ) : (
        <span className="text-[9px] font-bold text-gray-200">—</span>
      )}
    </div>
  );
}

function LunchCell() {
  return (
    <div className="h-full flex flex-col items-center justify-center gap-1 rounded-xl bg-amber-50 border border-amber-100 px-1">
      <Coffee size={11} className="text-amber-400" />
      <span className="text-[8px] font-black text-amber-600 uppercase tracking-wider text-center leading-tight">
        Lunch
      </span>
    </div>
  );
}

// ── Main Component ───────────────────────────────────────────────────────────

const TimetableGrid = ({
  schedule = [],
  type = "class",
  editMode = false,
  onCellClick = null,
}) => {
  // Ensure schedule is always an array
  const scheduleArray = Array.isArray(schedule) ? schedule : [];

  // Build (day, period) → slot lookup
  const slotMap = {};
  for (const s of scheduleArray) {
    slotMap[`${s.day}::${s.period}`] = s;
  }
  const getSlot = (day, code) => slotMap[`${day}::${code}`] || null;

  const handleClick = (day, period) => {
    if (editMode && onCellClick) {
      onCellClick(day, period, getSlot(day, period));
    }
  };

  return (
    <MainCard className="p-5 overflow-hidden border border-[#caf0f8]/50 shadow-sm bg-white">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-100 pb-3 mb-4">
        <div>
          <h3 className="text-xs font-black text-[#03045e] uppercase tracking-wider">
            Weekly Academic Timetable
          </h3>
          <p className="text-[10px] text-gray-400 font-semibold mt-0.5">
            8 periods · 50 min each · Lunch fixed at 11:20 – 11:50
          </p>
        </div>
        <div className="flex items-center gap-1.5 text-[10px] text-amber-600 font-bold bg-amber-50 px-3 py-1.5 rounded-full border border-amber-100">
          <Coffee size={11} />
          <span>Lunch 11:20–11:50</span>
        </div>
      </div>

      {/* Edit mode hint */}
      {editMode && (
        <div className="mb-3 px-3 py-2 rounded-2xl bg-[#caf0f8]/30 border border-[#caf0f8] flex items-center gap-2">
          <Pencil size={12} className="text-[#0077b6]" />
          <span className="text-[10px] font-black text-[#0077b6]">
            Click any period cell to assign or change its subject, teacher, and
            room.
          </span>
        </div>
      )}

      {/* Scrollable Matrix */}
      <div className="overflow-x-auto w-full">
        <div
          className="grid gap-1.5"
          style={{
            minWidth: "920px",
            gridTemplateColumns: "80px repeat(4, 1fr) 56px repeat(4, 1fr)",
          }}
        >
          {/* ── Header Row ── */}

          <div className="flex items-center justify-center p-2 rounded-xl bg-[#03045e] text-[9px] font-black text-white/70 uppercase tracking-wider">
            Day
          </div>

          {PERIODS.slice(0, 4).map((p) => (
            <div
              key={p.code}
              className="p-2 rounded-xl bg-[#caf0f8]/30 border border-[#caf0f8]/60 text-center"
            >
              <span className="block text-[10px] font-black text-[#03045e]">
                {p.label}
              </span>
              <span className="block text-[8px] font-semibold text-gray-400 mt-0.5">
                {p.time}
              </span>
            </div>
          ))}

          <div className="p-2 rounded-xl bg-amber-50 border border-amber-100 text-center flex flex-col items-center justify-center gap-0.5">
            <Coffee size={12} className="text-amber-400" />
            <span className="block text-[8px] font-black text-amber-600 uppercase">
              Break
            </span>
            <span className="block text-[7px] font-semibold text-amber-400">
              11:20–11:50
            </span>
          </div>

          {PERIODS.slice(4).map((p) => (
            <div
              key={p.code}
              className="p-2 rounded-xl bg-[#caf0f8]/30 border border-[#caf0f8]/60 text-center"
            >
              <span className="block text-[10px] font-black text-[#03045e]">
                {p.label}
              </span>
              <span className="block text-[8px] font-semibold text-gray-400 mt-0.5">
                {p.time}
              </span>
            </div>
          ))}

          {/* ── Day Rows ── */}
          {DAYS.map((day) => (
            <React.Fragment key={day}>
              {/* Day label */}
              <div className="flex items-center justify-center p-2 rounded-xl bg-[#03045e]/5 border border-[#03045e]/10">
                <span className="text-[10px] font-black text-[#03045e] uppercase tracking-wider text-center">
                  {day.slice(0, 3)}
                  <span className="block text-[8px] font-semibold text-gray-400 normal-case tracking-normal">
                    {day.slice(3)}
                  </span>
                </span>
              </div>

              {/* P1–P4 */}
              {PERIODS.slice(0, 4).map((p) => {
                const slot = getSlot(day, p.code);
                return (
                  <div key={p.code} className="min-h-[80px]">
                    {slot ? (
                      <SubjectCell
                        slot={slot}
                        type={type}
                        editMode={editMode}
                        onClick={() => handleClick(day, p.code)}
                      />
                    ) : (
                      <EmptyCell
                        editMode={editMode}
                        onClick={() => handleClick(day, p.code)}
                      />
                    )}
                  </div>
                );
              })}

              {/* Lunch */}
              <div className="min-h-[80px]">
                <LunchCell />
              </div>

              {/* P5–P8 */}
              {PERIODS.slice(4).map((p) => {
                const slot = getSlot(day, p.code);
                return (
                  <div key={p.code} className="min-h-[80px]">
                    {slot ? (
                      <SubjectCell
                        slot={slot}
                        type={type}
                        editMode={editMode}
                        onClick={() => handleClick(day, p.code)}
                      />
                    ) : (
                      <EmptyCell
                        editMode={editMode}
                        onClick={() => handleClick(day, p.code)}
                      />
                    )}
                  </div>
                );
              })}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Subject Legend */}
      {scheduleArray.length > 0 && (
        <div className="mt-4 pt-3 border-t border-gray-100 flex flex-wrap gap-x-4 gap-y-1.5">
          {Object.entries(SUBJECT_PALETTE)
            .filter(([name]) => scheduleArray.some((s) => s.subject === name))
            .map(([name, palette]) => (
              <div key={name} className="flex items-center gap-1.5">
                <span
                  className="w-2 h-2 rounded-full flex-shrink-0"
                  style={{ backgroundColor: palette.dot }}
                />
                <span className="text-[9px] font-semibold text-gray-500">
                  {name}
                </span>
              </div>
            ))}
        </div>
      )}
    </MainCard>
  );
};

export default React.memo(TimetableGrid);
