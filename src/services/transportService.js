import { MockDB } from "../mockDB";
import { simulateNetwork } from "./sharedService";

export const getTransportSummary = async (studentId) => {
  const assignment = await MockDB.transport.findAssignment({ studentId });
  if (!assignment) return null;
  const route = await MockDB.transport.findRoute({ id: assignment.routeId });
  
  return simulateNetwork({
    ...route,
    pickupStop: assignment.pickupStop,
    status: assignment.status,
    validTill: "31 March 2026"
  });
};

export const getVehicleDetails = async (studentId) => {
  const assignment = await MockDB.transport.findAssignment({ studentId });
  const route = await MockDB.transport.findRoute({ id: assignment?.routeId });
  return simulateNetwork({
    type: "Major Bus",
    model: "Tata Starbus 2023",
    capacity: "52 Seater",
    features: ["AC", "GPS Enabled", "CCTV Camera", "First Aid Kit"],
    coordinator: "Mr. Satish Mehra",
    vehicleNo: route?.vehicleNo
  });
};

export const getPersonnelInfo = async (studentId) => {
  const assignment = await MockDB.transport.findAssignment({ studentId });
  const route = await MockDB.transport.findRoute({ id: assignment?.routeId });
  return simulateNetwork({
    driver: {
      name: route?.driverName || "Ramesh Chand",
      phone: route?.driverPhone || "+91 98765 43210",
      experience: "12 Years",
      verified: true
    }
  });
};

export const getRouteTimeline = async (studentId) => {
  const assignment = await MockDB.transport.findAssignment({ studentId });
  return simulateNetwork([
    { stop: assignment?.pickupStop || "Home", time: "07:15 AM", isPickup: true, current: true },
    { stop: "HDFC Bank Square", time: "07:22 AM" },
    { stop: "Springdale Senior Secondary", time: "08:10 AM", isSchool: true }
  ]);
};

export const getTransportNotices = async () => simulateNetwork([]);
export const getSafetyGuidelines = async () => simulateNetwork([]);
