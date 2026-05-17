import React from "react";
import TeacherModuleHeader from "../../components/teacher/TeacherModuleHeader";
import TeacherComingSoon from "../../components/teacher/TeacherComingSoon";

const ReportsAnalyticsPage = () => {
  return (
    <div className="space-y-8 pb-12">
      <TeacherModuleHeader 
        titleKey="nav.reports_analytics"
        descriptionKey="Generate comprehensive academic and operational reports."
        helperContentEn="Export data and generate detailed reports for attendance, examination results, and class performance."
        helperContentHi="उपस्थिति, परीक्षा परिणाम और कक्षा प्रदर्शन के लिए डेटा निर्यात करें और विस्तृत रिपोर्ट तैयार करें।"
      />
      <TeacherComingSoon moduleName="Reports & Analytics" />
    </div>
  );
};

export default ReportsAnalyticsPage;
