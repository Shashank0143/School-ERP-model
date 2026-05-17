import React from "react";
import TeacherModuleHeader from "../../components/teacher/TeacherModuleHeader";
import TeacherComingSoon from "../../components/teacher/TeacherComingSoon";

const ProfileSettingsPage = () => {
  return (
    <div className="space-y-8 pb-12">
      <TeacherModuleHeader 
        titleKey="nav.profile_settings"
        descriptionKey="Manage your professional profile and application preferences."
        helperContentEn="Update your contact information, security settings, and notification preferences."
        helperContentHi="अपनी संपर्क जानकारी, सुरक्षा सेटिंग्स और अधिसूचना प्राथमिकताएं अपडेट करें।"
      />
      <TeacherComingSoon moduleName="Profile & Settings" />
    </div>
  );
};

export default ProfileSettingsPage;
