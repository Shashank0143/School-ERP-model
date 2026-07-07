import { getDataProvider } from "../data";

const DEFAULT_GOVERNANCE = {
  version: 1,
  categories: [
    { id: "cat-1", name: "Unit Test", isActive: true },
    { id: "cat-2", name: "Term Examination", isActive: true },
    { id: "cat-3", name: "Other Assessment", isActive: true }
  ],
  weightages: [
    { categoryId: "cat-1", weightage: 30 },
    { categoryId: "cat-2", weightage: 50 },
    { categoryId: "cat-3", weightage: 20 },
  ],
  gradeBoundaries: [
    { id: "gb-1", name: "A+", min: 90, max: 100, point: 10, order: 1 },
    { id: "gb-2", name: "A", min: 80, max: 89, point: 9, order: 2 },
    { id: "gb-3", name: "B+", min: 70, max: 79, point: 8, order: 3 },
    { id: "gb-4", name: "B", min: 60, max: 69, point: 7, order: 4 },
    { id: "gb-5", name: "C", min: 50, max: 59, point: 6, order: 5 },
    { id: "gb-6", name: "D", min: 33, max: 49, point: 5, order: 6 },
    { id: "gb-7", name: "F", min: 0, max: 32, point: 0, order: 7 },
  ],
  passingRules: {
    overallPercentage: 33
  }
};

export const getAssessmentGovernance = async () => {
  const provider = getDataProvider();
  let governance = await provider.getAssessmentGovernance();
  
  if (!governance) {
    // If it doesn't exist, this means it's either first launch or migrating from old version
    governance = { ...DEFAULT_GOVERNANCE };
    await provider.updateAssessmentGovernance(governance);
  }
  
  return governance;
};

export const saveAssessmentGovernance = async (updates) => {
  const provider = getDataProvider();
  const current = await getAssessmentGovernance();
  const updated = { ...current, ...updates };
  return provider.updateAssessmentGovernance(updated);
};

export const migrateOldExamCycles = async () => {
  const provider = getDataProvider();
  const exams = await provider.getExams();
  let migrated = false;
  
  const OTHER_ASSESSMENT_ID = "cat-3"; // ID for "Other Assessment"
  
  for (let exam of exams) {
    if (!exam.assessmentCategoryId) {
      exam.assessmentCategoryId = OTHER_ASSESSMENT_ID;
      await provider.updateExam(exam.id || exam.examId, exam);
      migrated = true;
    }
  }
  
  return migrated;
};
