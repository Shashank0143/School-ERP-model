import React from "react";
import TeacherModuleHeader from "../../components/teacher/TeacherModuleHeader";
import TeacherComingSoon from "../../components/teacher/TeacherComingSoon";

const ClubsActivitiesPage = () => {
  return (
    <div className="space-y-8 pb-12">
      <TeacherModuleHeader 
        titleKey="nav.clubs_activities"
        descriptionKey="Coordinate and manage school clubs, committees, and extracurricular activities."
        helperContentEn="Approve memberships, post event updates, and track club participation for students."
        helperContentHi="सदस्यता स्वीकृत करें, कार्यक्रम अपडेट पोस्ट करें और छात्रों के लिए क्लब भागीदारी को ट्रैक करें।"
      />
      <TeacherComingSoon moduleName="Clubs & Activities" />
    </div>
  );
};

export default ClubsActivitiesPage;
