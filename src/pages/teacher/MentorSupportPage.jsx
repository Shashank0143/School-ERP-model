import React from "react";
import TeacherModuleHeader from "../../components/teacher/TeacherModuleHeader";
import TeacherComingSoon from "../../components/teacher/TeacherComingSoon";

const MentorSupportPage = () => {
  return (
    <div className="space-y-8 pb-12">
      <TeacherModuleHeader 
        titleKey="nav.mentorSupport"
        descriptionKey="Connect with students for academic and personal guidance."
        helperContentEn="Respond to mentorship requests and manage your assigned mentees through this operational portal."
        helperContentHi="मेंटरशिप अनुरोधों का उत्तर दें और इस परिचालन पोर्टल के माध्यम से अपने सौंपे गए मेंटियों का प्रबंधन करें।"
      />
      <TeacherComingSoon moduleName="Mentor Support" />
    </div>
  );
};

export default MentorSupportPage;
