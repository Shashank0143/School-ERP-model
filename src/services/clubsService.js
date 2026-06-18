import { getDataProvider } from "../data";
import { formatClassName, extractLevel, extractSection } from "../shared/utils/classIdentity";

/**
 * services/clubsService.js
 * Service abstraction for clubs and extracurricular activities
 */

// Invalidate helpers (retained dummy or local dynamic)
export const clearClubsCaches = () => {
  // Can clear specific service caches if hook cache registry is loaded
};

// =====================================
// CLUB MANAGEMENT (Phase 5)
// =====================================

export const getAllClubs = async () => {
  const provider = getDataProvider();
  return await provider.getClubs();
};

export const getClubOverview = async () => {
  const provider = getDataProvider();
  const allClubs = await provider.getClubs();
  const enrollments = await provider.getClubEnrollments();
  
  return allClubs.map(c => {
    const members = enrollments.filter(e => e.clubId === c.id && e.status === "Active");
    return { ...c, membershipCount: members.length };
  });
};

export const createClub = async (data) => {
  const provider = getDataProvider();
  const allClubs = await provider.getClubs();
  
  if (allClubs.some(c => c.name.trim().toLowerCase() === data.name.trim().toLowerCase())) {
    throw new Error(`A club named "${data.name.trim()}" already exists.`);
  }
  
  return await provider.createClub(data);
};

export const updateClub = async (clubId, updates) => {
  const provider = getDataProvider();
  return await provider.updateClub(clubId, updates);
};

export const deactivateClub = async (clubId) => {
  const provider = getDataProvider();
  return await provider.updateClub(clubId, { status: "Inactive" });
};

export const changeCoordinator = async (clubId, teacherId, teacherName) => {
  const provider = getDataProvider();
  return await provider.updateClub(clubId, { 
    coordinatorTeacherId: teacherId, 
    coordinatorTeacherName: teacherName 
  });
};

/**
 * Fetches all clubs managed by a teacher (where they are clubHeadTeacherId).
 */
export const getTeacherClubs = async (teacherId) => {
  const tId = teacherId || "teach-001";
  const provider = getDataProvider();
  const clubs = await provider.getClubs();
  
  const assigned = clubs.filter((c) => c.clubHeadTeacherId === tId);
  if (assigned.length > 0) return assigned;

  // Fallback: Ensure every teacher sees at least 2 clubs in the prototype
  if (clubs.length === 0) return [];
  const hash = tId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return [
    { ...clubs[hash % clubs.length], clubHeadTeacherId: tId },
    { ...clubs[(hash + 1) % clubs.length], clubHeadTeacherId: tId }
  ];
};

/**
 * Fetches all institutional clubs with the enrollment status for a specific student.
 */
export const getStudentClubs = async (studentId) => {
  const sId = studentId || "stud-001";
  const provider = getDataProvider();

  // 1. Get student's enrollments
  const enrollments = await provider.getClubEnrollmentsByStudent(sId);
  const enrolledClubMap = new Map();
  enrollments.forEach((en) => enrolledClubMap.set(en.clubId, en));

  // 2. Get leadership roles
  let assignments = [];
  if (provider.getClubLeadershipAssignments) {
    assignments = await provider.getClubLeadershipAssignments();
  }
  const studentAssignments = assignments.filter(a => a.studentId === sId);
  const leadershipMap = new Map();
  studentAssignments.forEach(a => leadershipMap.set(a.clubId, a));

  // 3. Get all clubs
  const allClubs = await provider.getClubs();
  
  let allEnrollments = [];
  if (provider.getClubEnrollments) {
    allEnrollments = await provider.getClubEnrollments();
  }

  const mappedClubs = allClubs.map((c) => {
    const enrollment = enrolledClubMap.get(c.id);
    const leadership = leadershipMap.get(c.id);
    const members = allEnrollments.filter(e => e.clubId === c.id && e.status === "Active");
    
    return {
      ...c,
      membershipCount: members.length,
      isMember: !!enrollment,
      role: leadership ? leadership.role : (enrollment ? enrollment.role || "Member" : null),
      joinedAt: enrollment ? enrollment.joinedDate : null,
      status: enrollment ? enrollment.status : "AVAILABLE",
    };
  });

  return mappedClubs;
};

/**
 * Resolves a specific club by ID.
 */
export const getClubById = async (clubId) => {
  const provider = getDataProvider();
  return await provider.getClubById(clubId);
};

/**
 * Resolves all students currently enrolled in a club.
 */
export const getClubMembers = async (clubId) => {
  const provider = getDataProvider();
  const clubEnrollments = await provider.getClubEnrollmentsByClub(clubId);

  const students = await provider.getStudents();
  const classes = await provider.getClasses();

  let assignments = [];
  if (provider.getClubLeadershipAssignments) {
    assignments = await provider.getClubLeadershipAssignments();
  }
  const clubAssignments = assignments.filter(a => a.clubId === clubId);
  const leadershipMap = new Map();
  clubAssignments.forEach(a => leadershipMap.set(a.studentId, a.role));

  const membersList = [];

  for (const enrollment of clubEnrollments) {
    const student = students.find((s) => s.id === enrollment.studentId);
    if (student) {
      const cls = classes.find((c) => c.id === student.classId);
      const assignedRole = leadershipMap.get(student.id);
      membersList.push({
        id: enrollment.id,
        studentId: student.id,
        name: student.name,
        admissionNo: student.admissionNo,
        class: cls ? cls.name : (student.classId ? formatClassName(extractLevel(student.classId), extractSection(student.classId)) : "TBD"),
        role: assignedRole || enrollment.role || "Member",
        joinedAt: enrollment.joinedDate || "2024-07-20",
        status: enrollment.status || "Active"
      });
    }
  }

  return membersList;
};

/**
 * Core validation to allow students to join a club (max 2 clubs).
 */
export const joinClub = async (studentId, clubId) => {
  const sId = studentId || "stud-001";
  const provider = getDataProvider();

  // 0. Check inactive
  const club = await provider.getClubById(clubId);
  if (club && club.status === "Inactive") {
    throw new Error("Cannot join: This club is currently inactive.");
  }

  // 1. Check max 2 clubs limit
  const enrollments = await provider.getClubEnrollmentsByStudent(sId);
  if (enrollments.length >= 2) {
    throw new Error(
      "Enrollment Limit Reached: Students are allowed a maximum of 2 active clubs.",
    );
  }

  // 2. Check if already in this club
  if (enrollments.some((e) => e.clubId === clubId)) {
    throw new Error("Already Member: You are already enrolled in this club.");
  }

  const record = await provider.createClubEnrollment({
    studentId: sId,
    clubId,
    role: "Member",
    joinedDate: new Date().toISOString().split("T")[0],
    status: "Active",
  });

  clearClubsCaches();
  return record;
};

/**
 * Leaves a club.
 */
export const leaveClub = async (studentId, clubId) => {
  const sId = studentId || "stud-001";
  const provider = getDataProvider();
  const result = await provider.deleteClubEnrollment(sId, clubId);
  if (!result) {
    throw new Error("Not Member: Student is not enrolled in this club.");
  }

  clearClubsCaches();
  return true;
};

/**
 * Teacher schedules a new co-curricular club event/activity.
 */
export const createClubEvent = async ({
  clubId,
  title,
  description,
  eventDate,
  time,
  location,
  teacherId,
}) => {
  if (!clubId || !title || !eventDate || !time || !location) {
    throw new Error("Missing required event details.");
  }

  const provider = getDataProvider();
  const eventRecord = await provider.createClubActivity({
    clubId,
    title,
    description: description || "No detailed description provided.",
    date: eventDate,
    time,
    venue: location,
    type: "Club Activity",
    status: "Upcoming",
    createdBy: teacherId || "teach-001",
  });

  clearClubsCaches();
  return eventRecord;
};

/**
 * Resolves all upcoming activities / events scheduled for a club.
 */
export const getClubEvents = async (clubId) => {
  const provider = getDataProvider();
  const clubActivities = await provider.getClubActivitiesByClub(clubId);
  return clubActivities.sort((a, b) => new Date(a.date) - new Date(b.date));
};

/**
 * Resolves announcements posted specifically inside a club scope.
 */
export const getClubAnnouncements = async (clubId) => {
  const provider = getDataProvider();
  if (!provider.getClubAnnouncements) return [];
  
  const allAnnouncements = await provider.getClubAnnouncements();
  
  const clubAnnouncements = allAnnouncements.filter(a => a.clubId === clubId && a.status === "Published");
  
  return clubAnnouncements.sort((a, b) => {
    // Pinned first
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;
    // Then by date desc
    return new Date(b.createdAt) - new Date(a.createdAt);
  });
};

/**
 * Resolves aggregate announcement feed for a student across all active joined clubs.
 */
export const getClubAnnouncementFeed = async (studentId) => {
  const provider = getDataProvider();
  
  // 1. Get student's enrollments to find active clubs
  const enrollments = await provider.getClubEnrollmentsByStudent(studentId);
  const activeClubIds = enrollments.filter(e => e.status === "Active").map(e => e.clubId);
  
  if (activeClubIds.length === 0 || !provider.getClubAnnouncements) return [];

  // 2. Fetch all announcements
  const allAnnouncements = await provider.getClubAnnouncements();
  
  // 3. Filter for active joined clubs and published status
  const feed = allAnnouncements.filter(a => activeClubIds.includes(a.clubId) && a.status === "Published");
  
  // 4. Sort (Pinned first, then date)
  return feed.sort((a, b) => {
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;
    return new Date(b.createdAt) - new Date(a.createdAt);
  });
};

/**
 * Teacher posts a club announcement.
 */
export const createClubAnnouncement = async (data) => {
  const provider = getDataProvider();
  if (provider.createClubAnnouncement) {
    const result = await provider.createClubAnnouncement(data);
    clearClubsCaches();
    return result;
  }
};

/**
 * Edit announcement
 */
export const updateClubAnnouncement = async (announcementId, updates) => {
  const provider = getDataProvider();
  if (provider.updateClubAnnouncement) {
    const result = await provider.updateClubAnnouncement(announcementId, updates);
    clearClubsCaches();
    return result;
  }
};

/**
 * Archive announcement
 */
export const archiveClubAnnouncement = async (announcementId) => {
  const provider = getDataProvider();
  if (provider.archiveClubAnnouncement) {
    const result = await provider.archiveClubAnnouncement(announcementId);
    clearClubsCaches();
    return result;
  }
};

// =====================================
// MEMBERSHIP REQUESTS
// =====================================

export const getStudentClubRequests = async (studentId) => {
  const sId = studentId || "stud-001";
  const provider = getDataProvider();
  if (provider.getClubMembershipRequests) {
    const reqs = await provider.getClubMembershipRequests();
    return reqs.filter(r => r.studentId === sId).sort((a,b) => new Date(b.requestDate) - new Date(a.requestDate));
  }
  return [];
};

export const createClubMembershipRequest = async (data) => {
  const sId = data.studentId || "stud-001";
  const provider = getDataProvider();
  
  // Validation 0: Check inactive
  const club = await provider.getClubById(data.clubId);
  if (club && club.status === "Inactive") {
    throw new Error("Cannot request membership: This club is currently inactive.");
  }

  // Validation 1: Check max 2 active clubs
  const enrollments = await provider.getClubEnrollmentsByStudent(sId);
  if (enrollments.length >= 2) {
    throw new Error("Enrollment Limit Reached: Students are allowed a maximum of 2 active clubs.");
  }

  // Validation 2: Check if already in this club
  if (enrollments.some((e) => e.clubId === data.clubId)) {
    throw new Error("Already Member: You are already enrolled in this club.");
  }

  // Validation 3: Check pending requests
  if (provider.getClubMembershipRequests) {
    const reqs = await provider.getClubMembershipRequests();
    const pendingForClub = reqs.find(r => r.studentId === sId && r.clubId === data.clubId && r.status === "Pending");
    if (pendingForClub) {
      throw new Error("Duplicate Request: You already have a pending membership request for this club.");
    }
  }

  return await provider.createClubMembershipRequest(data);
};

export const withdrawClubMembershipRequest = async (requestId) => {
  const provider = getDataProvider();
  if (provider.updateClubMembershipRequest) {
    return await provider.updateClubMembershipRequest(requestId, {
      status: "Withdrawn",
      updatedAt: new Date().toISOString()
    });
  }
};

export const getClubMembershipRequestsByCoordinator = async (teacherId) => {
  const tId = teacherId || "teach-001";
  const provider = getDataProvider();
  if (provider.getClubMembershipRequests) {
    const reqs = await provider.getClubMembershipRequests();
    return reqs.filter(r => r.coordinatorTeacherId === tId).sort((a,b) => new Date(b.requestDate) - new Date(a.requestDate));
  }
  return [];
};

export const approveClubMembershipRequest = async (requestId, remarks) => {
  const provider = getDataProvider();
  if (provider.getClubMembershipRequestById && provider.updateClubMembershipRequest) {
    const req = await provider.getClubMembershipRequestById(requestId);
    if (!req) throw new Error("Request not found");

    // Create the club enrollment
    await provider.createClubEnrollment({
      studentId: req.studentId,
      clubId: req.clubId,
      role: "Member",
      joinedDate: new Date().toISOString().split("T")[0],
      status: "Active",
    });

    // Update request status
    return await provider.updateClubMembershipRequest(requestId, {
      status: "Approved",
      remarks: remarks || req.remarks,
      decisionDate: new Date().toISOString()
    });
  }
};

export const rejectClubMembershipRequest = async (requestId, remarks) => {
  const provider = getDataProvider();
  if (provider.updateClubMembershipRequest) {
    return await provider.updateClubMembershipRequest(requestId, {
      status: "Rejected",
      remarks: remarks,
      decisionDate: new Date().toISOString()
    });
  }
};

export const getAllClubMembershipRequests = async () => {
  const provider = getDataProvider();
  if (provider.getClubMembershipRequests) {
    return await provider.getClubMembershipRequests();
  }
  return [];
};

export const clubsService = {
  // Phase 5: Club Management
  getAllClubs,
  getClubOverview,
  createClub,
  updateClub,
  deactivateClub,
  changeCoordinator,

  getTeacherClubs,
  getStudentClubs,
  getClubById,
  getClubMembers,
  joinClub,
  leaveClub,
  createClubEvent,
  getClubEvents,
  getClubAnnouncements,
  getClubAnnouncementFeed,
  createClubAnnouncement,
  updateClubAnnouncement,
  archiveClubAnnouncement,
  getStudentClubRequests,
  createClubMembershipRequest,
  withdrawClubMembershipRequest,
  getClubMembershipRequestsByCoordinator,
  approveClubMembershipRequest,
  rejectClubMembershipRequest,
  getAllClubMembershipRequests,
  
  // Proposals — defined inline below

  // Leadership Structure
  getClubLeadership: async (clubId) => {
    const provider = getDataProvider();
    if (provider.getClubLeadershipAssignments) {
      const assignments = await provider.getClubLeadershipAssignments();
      return assignments.filter(a => a.clubId === clubId);
    }
    return [];
  },

  getStudentClubRoles: async (studentId) => {
    const provider = getDataProvider();
    if (provider.getClubLeadershipAssignments) {
      const assignments = await provider.getClubLeadershipAssignments();
      return assignments.filter(a => a.studentId === studentId);
    }
    return [];
  },

  assignLeadershipRole: async (data) => {
    // data: { clubId, studentId, role, assignedByTeacherId }
    const provider = getDataProvider();
    
    // 0. Check inactive
    const club = await provider.getClubById(data.clubId);
    if (club && club.status === "Inactive") {
      throw new Error("Cannot assign leadership: This club is currently inactive.");
    }

    // 1. Verify Active Membership
    const enrollments = await provider.getClubEnrollmentsByClub(data.clubId);
    const membership = enrollments.find(e => e.studentId === data.studentId);
    
    if (!membership) {
      throw new Error("Validation Failed: Cannot assign leadership role to a non-member.");
    }
    if (membership.status !== "Active") {
      throw new Error(`Validation Failed: Student membership status is ${membership.status}. Only 'Active' members can hold leadership roles.`);
    }

    // 2. Enforce Role Limits
    if (provider.getClubLeadershipAssignments) {
      const allAssignments = await provider.getClubLeadershipAssignments();
      const clubAssignments = allAssignments.filter(a => a.clubId === data.clubId);
      
      const uniqueRoles = ["President", "Vice President", "Secretary"];
      if (uniqueRoles.includes(data.role)) {
        // Find if someone else holds this role
        const existingHolder = clubAssignments.find(a => a.role === data.role);
        if (existingHolder && existingHolder.studentId !== data.studentId) {
          throw new Error(`Validation Failed: This club already has a ${data.role}. Demote them first before reassigning.`);
        }
      }
      
      // Assign
      if (provider.assignClubRole) {
        return await provider.assignClubRole(data);
      }
    }
    return false;
  },

  demoteToMember: async (clubId, studentId) => {
    const provider = getDataProvider();
    if (provider.demoteToMember) {
      return await provider.demoteToMember(clubId, studentId);
    }
    return false;
  },

  // =====================================
  // CLUB CREATION PROPOSALS (Phase 4)
  // =====================================
  
  getStudentClubProposals: async (studentId) => {
    const provider = getDataProvider();
    if (provider.getClubCreationProposals) {
      const proposals = await provider.getClubCreationProposals();
      return proposals.filter(p => p.proposedByStudentId === studentId);
    }
    return [];
  },

  getAllClubProposals: async () => {
    const provider = getDataProvider();
    if (provider.getClubCreationProposals) {
      return await provider.getClubCreationProposals();
    }
    return [];
  },

  createClubProposal: async (data) => {
    const provider = getDataProvider();
    
    // Validation 1: Check existing clubs
    const allClubs = await provider.getClubs();
    const isDuplicateClub = allClubs.some(
      c => c.name.trim().toLowerCase() === data.clubName.trim().toLowerCase()
    );
    if (isDuplicateClub) {
      throw new Error(`Validation Failed: A club named "${data.clubName.trim()}" already exists.`);
    }

    // Validation 2: Check pending proposals
    if (provider.getClubCreationProposals) {
      const allProposals = await provider.getClubCreationProposals();
      const duplicatePending = allProposals.find(
        p => p.proposedByStudentId === data.proposedByStudentId &&
             p.clubName.trim().toLowerCase() === data.clubName.trim().toLowerCase() &&
             p.status === "Pending"
      );
      if (duplicatePending) {
        throw new Error("Validation Failed: You already have a pending proposal for this exact club name.");
      }
    }

    if (provider.createClubCreationProposal) {
      return await provider.createClubCreationProposal(data);
    }
    return false;
  },

  approveClubProposal: async (proposalId, remarks) => {
    const provider = getDataProvider();
    if (provider.updateClubCreationProposal) {
      return await provider.updateClubCreationProposal(proposalId, {
        status: "Approved",
        remarks,
        reviewedAt: new Date().toISOString(),
        reviewedBy: "Admin"
      });
    }
  },

  rejectClubProposal: async (proposalId, remarks) => {
    const provider = getDataProvider();
    if (provider.updateClubCreationProposal) {
      return await provider.updateClubCreationProposal(proposalId, {
        status: "Rejected",
        remarks,
        reviewedAt: new Date().toISOString(),
        reviewedBy: "Admin"
      });
    }
  },

  // =====================================
  // ACTIVITY PARTICIPATIONS (Phase 6)
  // =====================================
  
  getAllActivityParticipations: async () => {
    const provider = getDataProvider();
    if (provider.getActivityParticipations) {
      return await provider.getActivityParticipations();
    }
    return [];
  },

  getActivityParticipations: async (activityId) => {
    const provider = getDataProvider();
    if (provider.getParticipationsByActivity) {
      return await provider.getParticipationsByActivity(activityId);
    }
    return [];
  },

  markActivityParticipation: async (activityId, participationsData, teacherId, teacherName) => {
    const provider = getDataProvider();
    
    // Validate Activity
    const activities = await provider.getClubActivities() || [];
    const activity = activities.find(a => a.id === activityId || a.activityId === activityId);
    if (!activity) {
      throw new Error("Activity not found.");
    }
    
    const clubId = activity.clubId;
    const club = await provider.getClubById(clubId);
    if (!club) {
      throw new Error("Club not found.");
    }

    // Ensure users are active club members
    const enrollments = await provider.getClubEnrollmentsByClub(clubId);
    
    const results = [];
    for (const pData of participationsData) {
      const studentMembership = enrollments.find(e => e.studentId === pData.studentId && e.status === "Active");
      
      if (!studentMembership) {
        throw new Error(`Cannot mark participation. Student ${pData.studentName} is not an active member of this club.`);
      }

      const existingParticipations = await provider.getParticipationsByActivity(activityId);
      const existing = existingParticipations.find(p => p.studentId === pData.studentId);

      if (existing) {
        // Update existing record
        const updated = await provider.updateParticipation(existing.participationId, {
          participationStatus: pData.participationStatus,
          markedByTeacherId: teacherId,
          markedByTeacherName: teacherName,
          updatedAt: new Date().toISOString()
        });
        results.push(updated);
      } else {
        // Create new record
        const created = await provider.createParticipation({
          activityId: activity.id || activity.activityId,
          activityTitle: activity.title || activity.name,
          activityCategory: activity.type || activity.category || "General Activity",
          clubId: club.id,
          clubName: club.name,
          studentId: pData.studentId,
          studentName: pData.studentName,
          className: pData.className,
          section: pData.section,
          participationDate: activity.date,
          participationStatus: pData.participationStatus,
          markedByTeacherId: teacherId,
          markedByTeacherName: teacherName
        });
        results.push(created);
      }
    }
    return results;
  },

  getStudentActivityHistory: async (studentId) => {
    const provider = getDataProvider();
    if (provider.getParticipationsByStudent) {
      const history = await provider.getParticipationsByStudent(studentId);
      return history.sort((a, b) => new Date(b.participationDate) - new Date(a.participationDate));
    }
    return [];
  }

};
