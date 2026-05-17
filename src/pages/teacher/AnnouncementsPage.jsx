import React from "react";
import TeacherModuleHeader from "../../components/teacher/TeacherModuleHeader";
import TeacherComingSoon from "../../components/teacher/TeacherComingSoon";

const AnnouncementsPage = () => {
  return (
    <div className="space-y-8 pb-12">
      <TeacherModuleHeader 
        titleKey="nav.announcements"
        descriptionKey="Create and manage announcements for students and parents."
        helperContentEn="Post important updates, circulars, and event notifications to the school-wide or class-specific boards."
        helperContentHi="स्कूल-व्यापी या कक्षा-विशिष्ट बोर्डों पर महत्वपूर्ण अपडेट, परिपत्र और घटना सूचनाएं पोस्ट करें।"
      />
      <TeacherComingSoon moduleName="Announcements" />
    </div>
  );
};

export default AnnouncementsPage;
