// src/utils/attendanceHelpers.js
// Palette: #03045e deep-twilight | #0077b6 bright-teal-blue | #00b4d8 turquoise-surf | #caf0f8 light-cyan

export function getAttendanceStatus(percentage) {
  if (percentage > 85) {
    return {
      status: "excellent",
      colorClass: "text-[#00b4d8]",
      bgClass: "bg-[#00b4d8]/20",
      barClass: "bg-[#00b4d8]",
      strokeColor: "#00b4d8",
      messageKey: "attendance.excellent",
    };
  } else if (percentage >= 75) {
    return {
      status: "good",
      colorClass: "text-[#0077b6]",
      bgClass: "bg-[#0077b6]/20",
      barClass: "bg-[#0077b6]",
      strokeColor: "#0077b6",
      messageKey: "attendance.moderate",
    };
  } else if (percentage >= 60) {
    return {
      status: "warning",
      colorClass: "text-amber-500",
      bgClass: "bg-amber-100",
      barClass: "bg-amber-400",
      strokeColor: "#F59E0B",
      messageKey: "attendance.warning",
    };
  } else {
    return {
      status: "critical",
      colorClass: "text-red-500",
      bgClass: "bg-red-100",
      barClass: "bg-red-400",
      strokeColor: "#EF4444",
      messageKey: "attendance.warning",
    };
  }
}

export function getFeeStatusStyle(status) {
  const normalized = (status || "").toLowerCase();
  const map = {
    paid: { bgClass: "bg-[#d1fae5]", textClass: "text-[#059669]" },
    "partially paid": { bgClass: "bg-[#fef3c7]", textClass: "text-[#d97706]" },
    pending: { bgClass: "bg-[#caf0f8]", textClass: "text-[#0077b6]" },
    overdue: { bgClass: "bg-red-100", textClass: "text-red-600" },
  };
  return map[normalized] ?? map.pending;
}

export function getNoticePriorityStyle(priority) {
  const map = {
    high: { bgClass: "bg-red-100", textClass: "text-red-600" },
    medium: { bgClass: "bg-[#0077b6]/20", textClass: "text-[#0077b6]" },
    low: { bgClass: "bg-[#00b4d8]/20", textClass: "text-[#00b4d8]" },
  };
  return map[priority] ?? map.low;
}

export function formatDate(date, lang = "en") {
  if (!date) return "";
  const d = typeof date === "string" ? new Date(date) : date;
  const locale = lang === "hi" ? "hi-IN" : "en-IN";
  return d.toLocaleDateString(locale, {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function getFeeProgress(amountPaid, totalAmount) {
  if (totalAmount <= 0) return 0;
  return Math.min(100, Math.round((amountPaid / totalAmount) * 100));
}
