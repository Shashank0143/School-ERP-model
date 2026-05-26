/**
 * services/timetable/timetableOverrideService.js
 *
 * Handles CRUD operations for school day operational overrides.
 * Persisted in localStorage key: 'erp_timetable_overrides_v1'
 */

import { getItem, setItem } from "../../persistence/storage";
import { STORAGE_KEYS } from "../../persistence/storageKeys";

const OVERRIDES_KEY = "erp_timetable_overrides_v1";

// Standard priorities
export const OVERRIDE_PRIORITIES = {
  holiday: 100,
  exam_day: 80,
  special_event: 60,
  teacher_substitution: 40,
  half_day: 50,
  custom_override: 30,
};

/**
 * Fetch all overrides
 */
export const getOverrides = async () => {
  const data = localStorage.getItem(OVERRIDES_KEY);
  if (!data) {
    // Return empty seed array
    return [];
  }
  try {
    return JSON.parse(data);
  } catch (e) {
    console.error("Failed to parse timetable overrides", e);
    return [];
  }
};

/**
 * Save / Update an override
 */
export const saveOverride = async (override) => {
  const overrides = await getOverrides();
  const index = overrides.findIndex((o) => o.id === override.id);
  
  const now = new Date().toISOString();
  const updatedOverride = {
    ...override,
    priority: OVERRIDE_PRIORITIES[override.type] || 10,
    status: override.status || "active",
    createdAt: override.createdAt || now,
    createdBy: override.createdBy || "admin",
    updatedAt: now,
    updatedBy: "admin",
  };

  if (index !== -1) {
    overrides[index] = updatedOverride;
  } else {
    overrides.push(updatedOverride);
  }

  localStorage.setItem(OVERRIDES_KEY, JSON.stringify(overrides));
  return updatedOverride;
};

/**
 * Delete an override
 */
export const deleteOverride = async (overrideId) => {
  const overrides = await getOverrides();
  const filtered = overrides.filter((o) => o.id !== overrideId);
  localStorage.setItem(OVERRIDES_KEY, JSON.stringify(filtered));
  return { success: true };
};

/**
 * Query active overrides for a specific date and class
 */
export const getActiveOverridesForClassAndDate = async (classId, dateString, grade) => {
  const overrides = await getOverrides();
  
  return overrides.filter((o) => {
    if (o.status !== "active") return false;

    // Check date range
    const start = o.effectiveRange?.start;
    const end = o.effectiveRange?.end || start;
    if (!start) return false;
    if (dateString < start || dateString > end) return false;

    // Check target scope
    if (o.targetScope === "institution") {
      return true;
    }
    if (o.targetScope === "grade" && grade && o.targetIds.includes(grade)) {
      return true;
    }
    if (o.targetScope === "class" && o.targetIds.includes(classId)) {
      return true;
    }

    return false;
  }).sort((a, b) => b.priority - a.priority); // Highest priority first
};

export const timetableOverrideService = {
  getOverrides,
  saveOverride,
  deleteOverride,
  getActiveOverridesForClassAndDate,
  OVERRIDE_PRIORITIES,
};
