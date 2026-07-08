/**
 * initialization/initializeStorage.js
 * Validates low-level storage schema bindings and applies inline JSON recoveries
 * for corrupted or missing secondary collections, protecting core state integrity.
 */

import { STORAGE_KEYS } from "../persistence/storageKeys";
import { getItem, setItem, hasKey } from "../persistence/storage";

export const initializeStorage = {
  /**
   * Safely checks all registered database keys.
   * If a key is missing or is malformed JSON, resets it safely to empty array `[]`
   * or a sensible default, preventing app crashes.
   */
  ensureRequiredKeys: () => {
    console.log("[InitializationEngine] Running storage keys integrity checks...");
    
    // Schema version and auth state should not be forced to empty arrays
    const excludeKeys = [
      STORAGE_KEYS.AUTH_STATE,
      STORAGE_KEYS.STUDENTS_SCHEMA_VERSION,
      STORAGE_KEYS.REMARKS_SCHEMA_VERSION,
      STORAGE_KEYS.LEAVE_SCHEMA_VERSION
    ];

    const allKeys = Object.values(STORAGE_KEYS);
    
    allKeys.forEach((key) => {
      if (excludeKeys.includes(key)) {
        return;
      }

      if (!hasKey(key)) {
        // We no longer initialize to [] here. 
        // If we do, seedIfEmpty and generateMissingMockData will see []
        // and mistakenly assume the user deleted all data, bypassing seeding.
        console.info(`[InitializationEngine] Missing collection key: "${key}" (will be handled by seeders)`);
      } else {
        // Double check JSON parsability
        try {
          const rawValue = localStorage.getItem(key);
          if (rawValue === null || rawValue === undefined) {
            setItem(key, []);
            return;
          }
          JSON.parse(rawValue);
        } catch (error) {
          console.warn(`[InitializationEngine] Corrupted JSON string detected for key "${key}". Safe-repairing to []`, error);
          setItem(key, []); // Safe repair: preserve layout, recover primitive
        }
      }
    });
    
    console.log("[InitializationEngine] All storage collections are present and parsable.");
  }
};

export default initializeStorage;
