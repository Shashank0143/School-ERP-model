import React from "react";
import TeacherModuleHeader from "../../components/teacher/TeacherModuleHeader";
import TeacherComingSoon from "../../components/teacher/TeacherComingSoon";

const ClassTimetablePage = () => {
  return (
    <div className="space-y-8 pb-12">
      <TeacherModuleHeader 
        titleKey="nav.class_timetable"
        descriptionKey="View and manage your teaching schedule and class assignments."
        helperContentEn="Check your daily and weekly teaching schedule, including room assignments and class timings."
        helperContentHi="कमरे के असाइनमेंट और कक्षा के समय सहित अपने दैनिक और साप्ताहिक शिक्षण कार्यक्रम की जाँच करें।"
      />
      <TeacherComingSoon moduleName="Class Timetable" />
    </div>
  );
};

export default ClassTimetablePage;
