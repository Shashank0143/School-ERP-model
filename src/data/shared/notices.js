/**
 * shared/notices.js
 * Centralized notices, events, and happenings data
 */

export const noticeData = {
  general: [
    { id: 1, title: "Half-yearly examination schedule released", date: "10 July 2025", priority: "high", icon: "FileText" },
    { id: 2, title: "School library closed on 15 July (holiday)", date: "8 July 2025", priority: "medium", icon: "BookOpen" },
    { id: 3, title: "Annual Sports Day registrations open till 20 July", date: "5 July 2025", priority: "low", icon: "Trophy" },
    { id: 4, title: "Parent-Teacher Meeting on 20 July 2025", date: "9 July 2025", priority: "high", icon: "AlertCircle" },
  ],
  exam: [
    { id: 1, title: "Physics practical exam: 18 July 2025, Lab 1", date: "10 July 2025", priority: "high", icon: "FileText" },
    { id: 2, title: "Chemistry theory exam: 22 July 2025, Hall A", date: "10 July 2025", priority: "high", icon: "FileText" },
    { id: 3, title: "Mathematics test: 25 July 2025, Room 11A", date: "11 July 2025", priority: "medium", icon: "FileText" },
  ],
  events: [
    { id: 1, name: "Science Exhibition 2025", date: "12 July 2025", category: "Academic", bgGradient: "linear-gradient(135deg, #03045e, #0077b6)" },
    { id: 2, name: "Annual Cultural Fest", date: "13 July 2025", category: "Cultural", bgGradient: "linear-gradient(135deg, #0077b6, #00b4d8)" },
    { id: 3, name: "Inter-House Quiz", date: "14 July 2025", category: "Academic", bgGradient: "linear-gradient(135deg, #03045e, #00b4d8)" },
  ],
  upcoming: [
    { id: 1, name: "Inter-School Debate", date: "17 July 2025", category: "Academic", bgGradient: "linear-gradient(135deg, #0077b6, #03045e)", daysLeft: 3 },
    { id: 2, name: "Workshop: Robotics Basics", date: "19 July 2025", category: "Tech", bgGradient: "linear-gradient(135deg, #03045e, #0077b6)", daysLeft: 5 },
    { id: 3, name: "Annual Sports Day", date: "21 July 2025", category: "Sports", bgGradient: "linear-gradient(135deg, #00b4d8, #0077b6)", daysLeft: 7 },
  ],
};
