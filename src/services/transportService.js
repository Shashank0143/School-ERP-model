import { transportData } from "../data/transportData";

const simulateNetwork = (data) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(data);
    }, 450); // Simulate network latency
  });
};

export const transportService = {
  getTransportSummary: async () => {
    return simulateNetwork(transportData.summary);
  },
  getVehicleDetails: async () => {
    return simulateNetwork(transportData.vehicle);
  },
  getPersonnelInfo: async () => {
    return simulateNetwork(transportData.personnel);
  },
  getRouteTimeline: async () => {
    return simulateNetwork(transportData.route);
  },
  getTransportNotices: async () => {
    return simulateNetwork(transportData.notices);
  },
  getSafetyGuidelines: async () => {
    return simulateNetwork(transportData.guidelines);
  },
};
