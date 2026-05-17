/**
 * MockDB Engine
 * 
 * A lightweight query engine that simulates relational database operations
 * on top of plain JS objects. Designed to be swapped with a real API later.
 */

const LATENCY = 400; // Simulate 400ms network latency

const simulateLatency = () => new Promise(resolve => setTimeout(resolve, LATENCY));

export const engine = {
  /**
   * Simple Query Logic
   * @param {Array} collection - The "table" data
   * @param {Object} query - Key-value filters
   */
  where: async (collection, query) => {
    await simulateLatency();
    return collection.filter(item => {
      for (let key in query) {
        if (item[key] !== query[key]) return false;
      }
      return true;
    });
  },

  /**
   * Find a single record
   */
  findOne: async (collection, query) => {
    await simulateLatency();
    return collection.find(item => {
      for (let key in query) {
        if (item[key] !== query[key]) return false;
      }
      return true;
    }) || null;
  },

  /**
   * Find by Primary Key
   */
  findById: async (collection, id) => {
    await simulateLatency();
    return collection.find(item => item.id === id) || null;
  },

  /**
   * Resolve Relationships (Left Join simulation)
   * @param {Object} item - The source record
   * @param {String} localKey - Key on the source record
   * @param {Array} targetCollection - The collection to join with
   * @param {String} foreignKey - Key on the target collection
   */
  resolveOne: (item, localKey, targetCollection, foreignKey = 'id') => {
    if (!item) return null;
    return targetCollection.find(t => t[foreignKey] === item[localKey]) || null;
  },

  /**
   * Resolve Many-to-One Relationships
   */
  resolveMany: (item, localKey, targetCollection, foreignKey) => {
    if (!item) return [];
    return targetCollection.filter(t => t[foreignKey] === item[localKey]);
  }
};
