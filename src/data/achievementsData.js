// src/data/achievementsData.js
// Mock data for Achievements module — API-ready structure

export const ACHIEVEMENT_CATEGORIES = [
  { id: "all", labelEn: "All", labelHi: "सभी", color: "#03045e" },
  { id: "academic", labelEn: "Academic", labelHi: "शैक्षणिक", color: "#0077b6" },
  { id: "sports", labelEn: "Sports", labelHi: "खेल", color: "#00b4d8" },
  { id: "cultural", labelEn: "Cultural", labelHi: "सांस्कृतिक", color: "#7c3aed" },
  { id: "technical", labelEn: "Technical", labelHi: "तकनीकी", color: "#059669" },
  { id: "competitions", labelEn: "Competitions", labelHi: "प्रतियोगिताएं", color: "#d97706" },
];

// rank: "gold" | "silver" | "bronze" | "participation" | "certificate"
export const MOCK_ACHIEVEMENTS = [
  {
    id: "ach-001",
    titleEn: "Science Olympiad — Gold Medal",
    titleHi: "साइंस ओलंपियाड — स्वर्ण पदक",
    category: "academic",
    rank: "gold",
    date: "15 Feb 2025",
    organizationEn: "National Science Foundation, India",
    organizationHi: "राष्ट्रीय विज्ञान फाउंडेशन, भारत",
    descriptionEn:
      "Secured 1st place in the Regional Science Olympiad 2025 among 200+ participants from 35 schools.",
    descriptionHi:
      "35 स्कूलों के 200+ प्रतिभागियों में से क्षेत्रीय विज्ञान ओलंपियाड 2025 में प्रथम स्थान प्राप्त किया।",
    hasCertificate: true,
    iconEmoji: "🥇",
    color: "#d97706",
    colorBg: "#fef3c7",
  },
  {
    id: "ach-002",
    titleEn: "Inter-School Cricket — District Champions",
    titleHi: "अंतर-विद्यालय क्रिकेट — जिला चैंपियन",
    category: "sports",
    rank: "gold",
    date: "20 Mar 2025",
    organizationEn: "District Sports Authority",
    organizationHi: "जिला खेल प्राधिकरण",
    descriptionEn:
      "Part of the school cricket team that won the District Inter-School Cricket Championship 2025.",
    descriptionHi:
      "स्कूल क्रिकेट टीम का हिस्सा जिसने जिला अंतर-विद्यालय क्रिकेट चैंपियनशिप 2025 जीती।",
    hasCertificate: true,
    iconEmoji: "🏏",
    color: "#00b4d8",
    colorBg: "#caf0f8",
  },
  {
    id: "ach-003",
    titleEn: "Coding Competition — Finalist",
    titleHi: "कोडिंग प्रतियोगिता — फाइनलिस्ट",
    category: "technical",
    rank: "silver",
    date: "10 Jan 2025",
    organizationEn: "TechFest 2025, IIT Bombay",
    organizationHi: "TechFest 2025, IIT बॉम्बे",
    descriptionEn:
      "Reached the finals of TechFest 2025 coding challenge. Ranked 2nd among 500+ participants nationally.",
    descriptionHi:
      "TechFest 2025 कोडिंग चैलेंज के फाइनल में पहुंचे। राष्ट्रीय स्तर पर 500+ प्रतिभागियों में 2वां स्थान।",
    hasCertificate: true,
    iconEmoji: "💻",
    color: "#059669",
    colorBg: "#d1fae5",
  },
  {
    id: "ach-004",
    titleEn: "Annual Cultural Fest — Best Actor",
    titleHi: "वार्षिक सांस्कृतिक उत्सव — सर्वश्रेष्ठ अभिनेता",
    category: "cultural",
    rank: "gold",
    date: "13 Jul 2025",
    organizationEn: "Springdale Senior Secondary School",
    organizationHi: "स्प्रिंगडेल सीनियर सेकेंडरी स्कूल",
    descriptionEn: "Awarded Best Actor at the Annual Cultural Fest for the stage play 'Rang Utsav 2025'.",
    descriptionHi:
      "मंच नाटक 'रंग उत्सव 2025' के लिए वार्षिक सांस्कृतिक उत्सव में सर्वश्रेष्ठ अभिनेता से सम्मानित।",
    hasCertificate: true,
    iconEmoji: "🎭",
    color: "#7c3aed",
    colorBg: "#ede9fe",
  },
  {
    id: "ach-005",
    titleEn: "Mathematics Quiz — State Level Participant",
    titleHi: "गणित प्रश्नोत्तरी — राज्य स्तरीय प्रतिभागी",
    category: "competitions",
    rank: "participation",
    date: "5 Dec 2024",
    organizationEn: "State Board of Secondary Education",
    organizationHi: "राज्य माध्यमिक शिक्षा बोर्ड",
    descriptionEn:
      "Represented school at the State-Level Mathematics Quiz Championship held in New Delhi.",
    descriptionHi:
      "नई दिल्ली में आयोजित राज्य स्तरीय गणित प्रश्नोत्तरी चैंपियनशिप में स्कूल का प्रतिनिधित्व किया।",
    hasCertificate: true,
    iconEmoji: "🔢",
    color: "#d97706",
    colorBg: "#fef9c3",
  },
  {
    id: "ach-006",
    titleEn: "Best Student Leader Award",
    titleHi: "सर्वश्रेष्ठ छात्र नेता पुरस्कार",
    category: "academic",
    rank: "certificate",
    date: "14 Feb 2025",
    organizationEn: "Springdale Senior Secondary School — Annual Day",
    organizationHi: "स्प्रिंगडेल सीनियर सेकेंडरी स्कूल — वार्षिक दिवस",
    descriptionEn:
      "Recognized as the Best Student Leader for exceptional contribution to school activities and peer mentoring.",
    descriptionHi:
      "स्कूल गतिविधियों और सहपाठी मार्गदर्शन में असाधारण योगदान के लिए सर्वश्रेष्ठ छात्र नेता के रूप में मान्यता।",
    hasCertificate: true,
    iconEmoji: "🏅",
    color: "#0077b6",
    colorBg: "#dbeafe",
  },
];
