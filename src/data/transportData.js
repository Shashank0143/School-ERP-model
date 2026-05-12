export const transportData = {
  summary: {
    routeNo: "RT-104",
    vehicleNo: "DL-1PB-4521",
    pickupStop: "Sector 15 Main Gate",
    dropStop: "Sector 15 Main Gate",
    pickupTime: "07:15 AM",
    dropTime: "03:45 PM",
    status: "Active",
    passId: "TRS-2024-889",
    validTill: "31 March 2026",
  },
  vehicle: {
    type: "Major Bus",
    model: "Tata Starbus 2023",
    capacity: "52 Seater",
    features: ["AC", "GPS Enabled", "CCTV Camera", "First Aid Kit"],
    coordinator: "Mr. Satish Mehra",
  },
  personnel: {
    driver: {
      name: "Ramesh Chand",
      phone: "+91 98765 43210",
      experience: "12 Years",
      verified: true,
      licenseNo: "DL-14-2012-00435",
    },
    attendant: {
      name: "Suresh Kumar",
      phone: "+91 87654 32109",
      availability: "Morning & Evening",
    },
  },
  route: [
    { stop: "Sector 15 Main Gate", time: "07:15 AM", isPickup: true, current: true },
    { stop: "HDFC Bank Square", time: "07:22 AM" },
    { stop: "Central Mall Road", time: "07:35 AM" },
    { stop: "Police Chowki Circle", time: "07:45 AM" },
    { stop: "Main Highway Hub", time: "07:55 AM" },
    { stop: "Springdale Senior Secondary", time: "08:10 AM", isSchool: true },
  ],
  notices: [
    {
      id: "tn1",
      title: "Route Delay Notice",
      message: "Expect a 10-15 min delay on Route 104 due to highway maintenance near Highway Hub.",
      date: "12 May 2025",
      priority: "medium",
    },
    {
      id: "tn2",
      title: "Holiday Suspension",
      message: "Transport services will be suspended on 15th May due to the gazetted holiday.",
      date: "10 May 2025",
      priority: "high",
    },
  ],
  guidelines: [
    { id: "g1", text: "Student ID card is mandatory for boarding." },
    { id: "g2", text: "Reach the pickup point at least 5 minutes before scheduled time." },
    { id: "g3", text: "Maintain discipline and decorum inside the vehicle." },
    { id: "g4", text: "Do not board or deboard while the vehicle is in motion." },
  ],
};
