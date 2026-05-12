import { clubsData } from "../data/clubsData";

const simulateNetwork = (data) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(data);
    }, 400); // Simulate network latency
  });
};

export const clubService = {
  getStats: async () => {
    return simulateNetwork(clubsData.stats);
  },
  getJoinedClubs: async () => {
    return simulateNetwork(clubsData.joinedClubs);
  },
  getAvailableClubs: async () => {
    return simulateNetwork(clubsData.availableClubs);
  },
  getUpcomingActivities: async () => {
    return simulateNetwork(clubsData.upcomingActivities);
  },
  getCoordinators: async () => {
    return simulateNetwork(clubsData.coordinators);
  },
};
