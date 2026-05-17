/**
 * services/clubService.js
 * Service abstraction for clubs and committees (Relational Database)
 */

import { MockDB } from "../mockDB";

const simulateNetwork = (data) => {
  return new Promise((resolve) => {
    setTimeout(() => resolve(data), 150);
  });
};

export const getJoinedClubs = async (studentId = 'stud-001') => {
  const enrollments = await MockDB.clubEnrollments.find({ studentId });
  const joined = await Promise.all(
    enrollments.map(async (en) => {
      const club = await MockDB.clubs.find({ id: en.clubId }).then(res => res[0]);
      if (!club) return null;
      return {
        id: club.id,
        name: club.name,
        category: club.category,
        role: en.role,
        coordinator: club.coordinator,
        nextMeeting: "20 May 2025, 3:30 PM",
        status: en.status,
        description: club.description,
        badges: en.badges || [],
        logo: club.logo
      };
    })
  );
  return simulateNetwork(joined.filter(Boolean));
};

export const getAvailableClubs = async (studentId = 'stud-001') => {
  const enrollments = await MockDB.clubEnrollments.find({ studentId });
  const joinedIds = enrollments.map(en => en.clubId);
  const allClubs = await MockDB.clubs.all();
  
  const available = allClubs
    .filter(c => !joinedIds.includes(c.id))
    .map(c => {
      return {
        id: c.id,
        name: c.name,
        category: c.category,
        memberCount: 30 + (c.id.charCodeAt(c.id.length - 1) % 15),
        frequency: "Weekly",
        tags: [c.category, "Extra-Curricular"],
        logo: c.logo
      };
    });
  return simulateNetwork(available);
};

export const getUpcomingActivities = async (studentId = 'stud-001') => {
  const enrollments = await MockDB.clubEnrollments.find({ studentId });
  const joinedIds = enrollments.map(en => en.clubId);
  const allActivities = await MockDB.clubActivities.all();
  
  const studentActivities = await Promise.all(
    allActivities
      .filter(act => joinedIds.includes(act.clubId))
      .map(async (act) => {
        const club = await MockDB.clubs.find({ id: act.clubId }).then(res => res[0]);
        return {
          id: act.id,
          title: act.title,
          club: club?.name || "General Club",
          date: act.date,
          time: act.time,
          venue: act.venue,
          type: act.type,
          status: act.status
        };
      })
  );
  return simulateNetwork(studentActivities);
};

export const getStats = async (studentId = 'stud-001') => {
  const joined = await getJoinedClubs(studentId);
  const activities = await getUpcomingActivities(studentId);
  
  return simulateNetwork({
    joinedCount: joined.length,
    activeStatus: joined.length === 2 ? "Highly Active" : joined.length === 1 ? "Active" : "Inactive",
    upcomingEvents: activities.length
  });
};

export const getCoordinators = async (studentId = 'stud-001') => {
  const enrollments = await MockDB.clubEnrollments.find({ studentId });
  const joinedClubIds = enrollments.map(en => en.clubId);
  
  const joinedClubs = await Promise.all(
    joinedClubIds.map(cid => MockDB.clubs.find({ id: cid }).then(res => res[0]))
  );
  
  const coordinatorNames = joinedClubs.filter(Boolean).map(c => c.coordinator);
  
  const allCoordinators = await MockDB.clubCoordinators.all();
  const studentCoordinators = allCoordinators.filter(coord => 
    coordinatorNames.includes(coord.name)
  );
  
  return simulateNetwork(studentCoordinators);
};

export const clubService = {
  getStats,
  getJoinedClubs,
  getAvailableClubs,
  getUpcomingActivities,
  getCoordinators,
};
