/**
 * Utility functions for object manipulation
 */

/**
 * Deep freezes an object to make it completely immutable.
 * Selectively ignores special objects like Date, Map, Set, File, Blob, and primitives.
 * 
 * @param {any} object - The object to freeze
 * @returns {any} The frozen object
 */
export function deepFreeze(object) {
  // If not an object (primitive) or is null, return as is
  if (object === null || typeof object !== 'object') {
    return object;
  }

  // Ignore special objects that shouldn't be frozen or handled natively
  if (
    object instanceof Date ||
    object instanceof Map ||
    object instanceof Set ||
    object instanceof WeakMap ||
    object instanceof WeakSet ||
    (typeof File !== 'undefined' && object instanceof File) ||
    (typeof Blob !== 'undefined' && object instanceof Blob)
  ) {
    return object;
  }

  // Retrieve the property names defined on object
  const propNames = Object.getOwnPropertyNames(object);

  // Freeze properties before freezing self
  for (const name of propNames) {
    const value = object[name];
    if (value && typeof value === "object") {
      deepFreeze(value);
    }
  }

  return Object.freeze(object);
}
