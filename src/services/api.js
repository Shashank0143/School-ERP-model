/**
 * Base API Service
 * 
 * This file serves as the abstraction layer for all data fetching.
 * Currently, it returns data from local JS files (dummy data).
 * In the future, this is where Axios or Fetch will be integrated.
 */

import { dummyData } from "../data/dummyData";

// Helper to simulate API latency
const simulateNetwork = (data) => {
  return new Promise((resolve) => {
    setTimeout(() => resolve(data), 100); 
  });
};

export const timetableService = {
  getWeeklyTimetable: async () => simulateNetwork(dummyData.weeklyTimetable),
  getTodayClasses: async () => {
    const day = new Date().toLocaleDateString('en-US', { weekday: 'long' });
    return simulateNetwork(dummyData.weeklyTimetable[day] || []);
  }
};

export const studentService = {
  getProfile: async () => simulateNetwork(dummyData.student),
  getAttendance: async () => simulateNetwork(dummyData.attendance),
};

export const financeService = {
  getFeeDetails: async () => simulateNetwork(dummyData.feeDetails),
  getBills: async () => simulateNetwork(dummyData.feeDetails.bills),
};

export const academicService = {
  getExaminationSchedule: async () => simulateNetwork(dummyData.examination.schedule),
  getCalendarEvents: async () => simulateNetwork(dummyData.schoolCalendar.events),
  getNotices: async () => simulateNetwork(dummyData.notices),
};
