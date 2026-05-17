/**
 * shared/calendar.js
 * Centralized academic calendar data
 */

export const schoolCalendar = {
  academicYear: "2024-25",
  terms: [
    { id: "t1", name: "Term 1", period: "Apr 2024 - Sep 2024", status: "ongoing" },
    { id: "t2", name: "Term 2", period: "Oct 2024 - Mar 2025", status: "upcoming" },
  ],
  events: [
    { id: "e1", title: "New Academic Session Begins", date: "01 Apr 2024", type: "academic", description: "Beginning of the academic year 2024-25 for all classes." },
    { id: "e2", title: "Ram Navami", date: "17 Apr 2024", type: "holiday", description: "School closed on account of Ram Navami." },
    { id: "e3", title: "Unit Test - I", date: "15 May 2024", type: "exam", description: "First unit assessment for all subjects." },
    { id: "e4", title: "Summer Vacation Starts", date: "01 Jun 2024", type: "holiday", description: "Summer break for students begins." },
    { id: "e5", title: "School Reopens", date: "01 Jul 2024", type: "academic", description: "Classes resume after summer vacation." },
    { id: "e6", title: "Inter-House Debate", date: "15 Jul 2024", type: "event", description: "Senior wing inter-house English debate competition." },
    { id: "e7", title: "Parent Teacher Meeting", date: "27 Jul 2024", type: "ptm", description: "Term 1 progress review with parents." },
    { id: "e8", title: "Independence Day", date: "15 Aug 2024", type: "event", description: "Flag hoisting and cultural program." },
    { id: "e9", title: "Raksha Bandhan", date: "19 Aug 2024", type: "holiday", description: "School closed for Raksha Bandhan." },
    { id: "e10", title: "Janmashtami", date: "26 Aug 2024", type: "holiday", description: "School closed for Janmashtami." },
    { id: "e11", title: "Teacher's Day", date: "05 Sep 2024", type: "event", description: "Special assembly to honor teachers." },
    { id: "e12", title: "Half Yearly Exams", date: "15 Sep 2024", type: "exam", description: "Term 1 summative assessments." },
  ]
};
