import React from "react";
import AcademicResultsPage from "../../../shared/AcademicResultsPage";

/**
 * TeacherPublishedResultsTab
 * Reuses the student/parent AcademicResultsPage but explicitly flags it for teacher view.
 */
const TeacherPublishedResultsTab = () => {
  return (
    <div className="w-full">
      <AcademicResultsPage isTeacherView={true} />
    </div>
  );
};

export default TeacherPublishedResultsTab;
