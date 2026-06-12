import { getItem, setItem } from "../persistence/storage";
import { STORAGE_KEYS } from "../persistence/storageKeys";
import { leavePortfolioSeed } from "../data/mockDB/seed/leavePortfolioSeed";

/**
 * leavePortfolioMigrationService.js
 * Safely initializes the Leave Portfolio master data for new or existing installations.
 */
export const runLeavePortfolioMigration = () => {
  try {
    const existingPortfolios = getItem(STORAGE_KEYS.LEAVE_PORTFOLIOS);

    if (!existingPortfolios || existingPortfolios.length === 0) {
      console.log("[Migration] Initializing Leave Portfolios with seed data.");
      
      const portfoliosWithTimestamps = leavePortfolioSeed.map(p => ({
        ...p,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }));

      setItem(STORAGE_KEYS.LEAVE_PORTFOLIOS, portfoliosWithTimestamps);
      console.log(`[Migration] Seeded ${portfoliosWithTimestamps.length} leave portfolios.`);
    } else {
      console.log("[Migration] Leave Portfolios already exist. Skipping seed.");
    }
  } catch (error) {
    console.error("[Migration] Failed to run Leave Portfolio migration:", error);
  }
};
