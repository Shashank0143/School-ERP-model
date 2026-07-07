import { getItem, setItem } from "../persistence/storage";

const STORAGE_KEY = "studentWithdrawalRequests";
const COMPLETION_STORAGE_KEY = "schoolCompletionRecords";
import { STORAGE_KEYS } from "../persistence/storageKeys";

/**
 * Initializes the LocalStorage collection if it doesn't exist.
 * This function guarantees the collection is always an array.
 * It will not overwrite existing valid data.
 */
const initializeStorage = () => {
  const data = getItem(STORAGE_KEY, null);
  if (!Array.isArray(data)) {
    setItem(STORAGE_KEY, []);
  }

  const completionData = getItem(COMPLETION_STORAGE_KEY, null);
  if (!Array.isArray(completionData)) {
    setItem(COMPLETION_STORAGE_KEY, []);
  }
};

// Auto-initialize on module load
initializeStorage();

/**
 * Normalizes legacy or malformed data to ensure structural integrity.
 */
const normalizeRequest = (request) => {
  if (!request) return null;
  
  // Convert legacy "Pending" status to "Pending Review"
  let normalizedStatus = request.status || "Pending Review";
  if (normalizedStatus === "Pending") normalizedStatus = "Pending Review";

  return {
    ...request,
    id: request.id || `ext-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
    studentId: request.studentId || null,
    exitType: request.exitType || "Withdrawal",
    reason: request.reason || "",
    remarks: request.remarks || "",
    attachment: request.attachment || "",
    status: normalizedStatus,
    appliedDate: request.appliedDate || new Date().toISOString(),
    reviewedDate: request.reviewedDate || null,
    reviewedBy: request.reviewedBy || null,
    clearanceFormIssued: request.clearanceFormIssued || false,
    clearanceIssuedDate: request.clearanceIssuedDate || null,
    clearanceIssuedBy: request.clearanceIssuedBy || null,
    originalClearanceReceived: request.originalClearanceReceived || false,
    originalClearanceReceivedDate: request.originalClearanceReceivedDate || null,
    originalClearanceReceivedBy: request.originalClearanceReceivedBy || null,
    documentsPreparationStarted: request.documentsPreparationStarted || false,
    documentsPreparationDate: request.documentsPreparationDate || null,
    documentsPreparationBy: request.documentsPreparationBy || null,
    documentsReadyForCollection: request.documentsReadyForCollection || false,
    documentsReadyDate: request.documentsReadyDate || null,
    documentsReadyBy: request.documentsReadyBy || null,
    // Deprecated - Not used by UI anymore - Reserved for backend workflow
    clearances: {
      fees: request.clearances?.fees || false,
      library: request.clearances?.library || false,
      transport: request.clearances?.transport || false,
      laboratory: request.clearances?.laboratory || false,
      principal: request.clearances?.principal || false,
    },
    generatedDocuments: {
      transferCertificate: request.generatedDocuments?.transferCertificate || false,
      characterCertificate: request.generatedDocuments?.characterCertificate || false,
      migrationCertificate: request.generatedDocuments?.migrationCertificate || false,
    },
    generatedDocumentDates: {
      transferCertificate: request.generatedDocumentDates?.transferCertificate || null,
      characterCertificate: request.generatedDocumentDates?.characterCertificate || null,
      migrationCertificate: request.generatedDocumentDates?.migrationCertificate || null,
    },
  };
};

/**
 * Retrieves all student exit requests.
 */
export const getAllRequests = () => {
  try {
    const data = getItem(STORAGE_KEY, []);
    return Array.isArray(data) ? data.map(normalizeRequest) : [];
  } catch (error) {
    console.error("Failed to get all exit requests:", error);
    return [];
  }
};

/**
 * Retrieves a single student exit request by ID.
 */
export const getRequestById = (id) => {
  const requests = getAllRequests();
  return requests.find((req) => req.id === id) || null;
};

/**
 * Retrieves all exit requests for a specific student.
 */
export const getRequestsByStudent = (studentId) => {
  if (!studentId) return [];
  const requests = getAllRequests();
  return requests.filter((req) => req.studentId === studentId);
};

/**
 * Creates a new student exit request.
 */
export const createRequest = (data) => {
  if (!data || !data.studentId) {
    throw new Error("Student ID is required to create an exit request.");
  }
  if (!data.reason || data.reason.trim() === "") {
    throw new Error("Reason is required to create an exit request.");
  }

  const requests = getAllRequests();

  const newRequest = normalizeRequest({
    ...data,
    id: `ext-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
    exitType: "Withdrawal", // Currently only Withdrawal is supported
    status: "Pending Review",
    appliedDate: new Date().toISOString(),
  });

  requests.push(newRequest);
  setItem(STORAGE_KEY, requests);

  return newRequest;
};

/**
 * Updates an existing student exit request.
 */
export const updateRequest = (id, data) => {
  if (!id) throw new Error("Request ID is required for update.");
  
  const requests = getAllRequests();
  const index = requests.findIndex((req) => req.id === id);
  
  if (index === -1) {
    throw new Error("Exit request not found.");
  }

  // Merge existing request with updates, then normalize
  const updatedRequest = normalizeRequest({
    ...requests[index],
    ...data,
  });

  requests[index] = updatedRequest;
  setItem(STORAGE_KEY, requests);

  return updatedRequest;
};

/**
 * Deletes a student exit request.
 */
export const deleteRequest = (id) => {
  if (!id) throw new Error("Request ID is required for deletion.");

  const requests = getAllRequests();
  const filteredRequests = requests.filter((req) => req.id !== id);
  
  if (requests.length === filteredRequests.length) {
    return false; // Nothing deleted
  }

  setItem(STORAGE_KEY, filteredRequests);
  return true;
};

/**
 * Approves a student exit request.
 */
export const approveRequest = (id, reviewerId = "System") => {
  return updateRequest(id, {
    status: "Approved",
    reviewedDate: new Date().toISOString(),
    reviewedBy: reviewerId,
  });
};

/**
 * Issues a Clearance Form for a student exit request.
 */
export const issueClearanceForm = (id, adminId = "Admin") => {
  return updateRequest(id, {
    clearanceFormIssued: true,
    clearanceIssuedDate: new Date().toISOString(),
    clearanceIssuedBy: adminId,
  });
};

/**
 * Marks the physical original clearance form as received by the administration.
 */
export const markOriginalClearanceReceived = (id, adminId = "Admin") => {
  const request = getRequestById(id);
  if (!request) {
    throw new Error("Exit request not found.");
  }
  if (!request.clearanceFormIssued) {
    throw new Error("Cannot receive original clearance form before it has been issued.");
  }
  return updateRequest(id, {
    originalClearanceReceived: true,
    originalClearanceReceivedDate: new Date().toISOString(),
    originalClearanceReceivedBy: adminId,
  });
};

/**
 * Rejects a student exit request.
 */
export const rejectRequest = (id, reviewerId = "System", reasonCategory = "Other", remarks = "") => {
  return updateRequest(id, {
    status: "Rejected",
    reviewedDate: new Date().toISOString(),
    reviewedBy: reviewerId,
    reasonCategory,
    reviewRemarks: remarks,
  });
};

/**
 * Toggles a specific clearance flag.
 */
export const toggleClearance = (id, type) => {
  const request = getRequestById(id);
  if (!request) throw new Error("Exit request not found.");

  if (request.clearances[type] === undefined) {
    throw new Error(`Invalid clearance type: ${type}`);
  }

  return updateRequest(id, {
    clearances: {
      ...request.clearances,
      [type]: !request.clearances[type],
    },
  });
};

/**
 * Marks a specific document as generated.
 */
export const markDocumentGenerated = (id, type) => {
  const request = getRequestById(id);
  if (!request) throw new Error("Exit request not found.");

  if (request.generatedDocuments[type] === undefined) {
    throw new Error(`Invalid document type: ${type}`);
  }

  const newValue = !request.generatedDocuments[type];

  return updateRequest(id, {
    generatedDocuments: {
      ...request.generatedDocuments,
      [type]: newValue,
    },
    generatedDocumentDates: {
      ...request.generatedDocumentDates,
      [type]: newValue ? new Date().toISOString() : null,
    },
  });
};

/**
 * Starts preparation of official documents (Withdrawal)
 */
export const startDocumentPreparation = (id, adminId = "Admin") => {
  return updateRequest(id, {
    documentsPreparationStarted: true,
    documentsPreparationDate: new Date().toISOString(),
    documentsPreparationBy: adminId,
  });
};

/**
 * Marks official documents as ready for physical collection (Withdrawal)
 */
export const markDocumentsReadyForCollection = (id, adminId = "Admin") => {
  return updateRequest(id, {
    documentsReadyForCollection: true,
    documentsReadyDate: new Date().toISOString(),
    documentsReadyBy: adminId,
  });
};

// ==========================================
// School Completion & Alumni Transition
// ==========================================

/**
 * Normalizes a school completion record.
 */
const normalizeCompletionRecord = (record) => {
  if (!record) return null;
  return {
    ...record,
    id: record.id || `comp-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
    studentId: record.studentId || null,
    completedDate: record.completedDate || new Date().toISOString(),
    completedBy: record.completedBy || "System",
    academicYear: record.academicYear || "2025-2026",
    status: record.status || "School Completed",
    alumni: record.alumni !== undefined ? record.alumni : true,
    remarks: record.remarks || "",
    documentsPreparationStarted: record.documentsPreparationStarted || false,
    documentsPreparationDate: record.documentsPreparationDate || null,
    documentsPreparationBy: record.documentsPreparationBy || null,
    documentsReadyForCollection: record.documentsReadyForCollection || false,
    documentsReadyDate: record.documentsReadyDate || null,
    documentsReadyBy: record.documentsReadyBy || null,
    documents: {
      transferCertificate: record.documents?.transferCertificate || false,
      characterCertificate: record.documents?.characterCertificate || false,
      migrationCertificate: record.documents?.migrationCertificate || false,
    },
    generatedDocumentDates: {
      transferCertificate: record.generatedDocumentDates?.transferCertificate || null,
      characterCertificate: record.generatedDocumentDates?.characterCertificate || null,
      migrationCertificate: record.generatedDocumentDates?.migrationCertificate || null,
    },
  };
};

/**
 * Retrieves all school completion records.
 */
export const getAllCompletionRecords = () => {
  try {
    const data = getItem(COMPLETION_STORAGE_KEY, []);
    return Array.isArray(data) ? data.map(normalizeCompletionRecord) : [];
  } catch (error) {
    console.error("Failed to get all completion records:", error);
    return [];
  }
};

/**
 * Retrieves a completion record by student ID.
 */
export const getCompletionRecordByStudent = (studentId) => {
  if (!studentId) return null;
  const records = getAllCompletionRecords();
  return records.find((req) => req.studentId === studentId) || null;
};

const CLASS_LEVEL_ORDER = [
  "Nursery", "LKG", "UKG", 
  "1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12"
];

/**
 * Centralized logic for school completion eligibility.
 * Dynamically determines the highest available class level from active classes.
 */
export const isEligibleForSchoolCompletion = (student) => {
  if (!student) return false;
  
  const classes = getItem(STORAGE_KEYS.CLASSES, []);
  if (!classes || classes.length === 0) return false;
  
  let highestOrder = -1;
  let highestLevel = "";
  
  classes.forEach(c => {
    const lvl = c.classLevel || c.level;
    const order = CLASS_LEVEL_ORDER.indexOf(lvl);
    if (order > highestOrder) {
      highestOrder = order;
      highestLevel = lvl;
    }
  });
  
  // If no matching class levels were found (e.g., custom names), fallback to student
  if (highestOrder === -1) return false;
  
  return (student.classLevel || student.level) === highestLevel;
};

/**
 * Returns the highest available class level from active classes (e.g. for UI display)
 */
export const getHighestAvailableClassLevel = () => {
  const classes = getItem(STORAGE_KEYS.CLASSES, []);
  if (!classes || classes.length === 0) return "12"; // fallback
  
  let highestOrder = -1;
  let highestLevel = "12";
  
  classes.forEach(c => {
    const lvl = c.classLevel || c.level;
    const order = CLASS_LEVEL_ORDER.indexOf(lvl);
    if (order > highestOrder) {
      highestOrder = order;
      highestLevel = lvl;
    }
  });
  
  return highestLevel;
};

/**
 * Marks a student as School Completed across the system globally.
 */
export const markStudentAsSchoolCompleted = (studentId) => {
  const students = getItem(STORAGE_KEYS.STUDENTS, []);
  const index = students.findIndex((s) => s.id === studentId);
  if (index !== -1) {
    students[index].status = "School Completed";
    setItem(STORAGE_KEYS.STUDENTS, students);
  }
};

/**
 * Undoes a school completion, removing records and returning student to Active.
 */
export const undoSchoolCompletion = (studentId) => {
  if (!studentId) return;
  
  // 1. Remove completion record
  const records = getAllCompletionRecords();
  const newRecords = records.filter(r => r.studentId !== studentId);
  setItem(COMPLETION_STORAGE_KEY, newRecords);
  
  // 2. Return student to Active
  const students = getItem(STORAGE_KEYS.STUDENTS, []);
  const index = students.findIndex((s) => s.id === studentId);
  if (index !== -1) {
    students[index].status = "Active";
    setItem(STORAGE_KEYS.STUDENTS, students);
  }
};

/**
 * Creates a new school completion record and transitions the student.
 */
export const createCompletionRecord = (data) => {
  if (!data || !data.studentId) {
    throw new Error("Student ID is required to create a completion record.");
  }

  const records = getAllCompletionRecords();
  const existing = records.find(r => r.studentId === data.studentId);
  if (existing) {
    throw new Error("Student already has a completion record.");
  }

  const newRecord = normalizeCompletionRecord({
    ...data,
    id: `comp-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
  });

  records.push(newRecord);
  setItem(COMPLETION_STORAGE_KEY, records);

  // Transition the student globally
  markStudentAsSchoolCompleted(data.studentId);

  return newRecord;
};

/**
 * Updates a school completion record.
 */
export const updateCompletionRecord = (id, data) => {
  if (!id) throw new Error("Record ID is required for update.");
  
  const records = getAllCompletionRecords();
  const index = records.findIndex((req) => req.id === id);
  
  if (index === -1) {
    throw new Error("Completion record not found.");
  }

  const updatedRecord = normalizeCompletionRecord({
    ...records[index],
    ...data,
  });

  records[index] = updatedRecord;
  setItem(COMPLETION_STORAGE_KEY, records);

  return updatedRecord;
};

/**
 * Marks a completion document as generated or revokes it.
 */
export const markCompletionDocumentGenerated = (id, docType) => {
  const records = getAllCompletionRecords();
  const record = records.find(r => r.id === id);
  if (!record) throw new Error("Completion record not found.");

  if (record.documents[docType] === undefined) {
    throw new Error(`Invalid document type: ${docType}`);
  }

  const newValue = !record.documents[docType];

  return updateCompletionRecord(id, {
    documents: {
      ...record.documents,
      [docType]: newValue,
    },
    generatedDocumentDates: {
      ...record.generatedDocumentDates,
      [docType]: newValue ? new Date().toISOString() : null,
    },
  });
};

/**
 * Starts preparation of official documents (Completion)
 */
export const startCompletionDocumentPreparation = (id, adminId = "Admin") => {
  return updateCompletionRecord(id, {
    documentsPreparationStarted: true,
    documentsPreparationDate: new Date().toISOString(),
    documentsPreparationBy: adminId,
  });
};

/**
 * Marks official documents as ready for physical collection (Completion)
 */
export const markCompletionDocumentsReadyForCollection = (id, adminId = "Admin") => {
  return updateCompletionRecord(id, {
    documentsReadyForCollection: true,
    documentsReadyDate: new Date().toISOString(),
    documentsReadyBy: adminId,
  });
};
