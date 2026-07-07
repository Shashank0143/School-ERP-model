/**
 * Generates a consistent presentation-only mock certificate number 
 * based on the document type and request ID.
 * 
 * Example:
 * TC-2026-00015
 */
export const generateMockCertificateNumber = (type, id) => {
  if (!id) return "UNKNOWN";
  
  const currentYear = new Date().getFullYear();
  
  // Extract a 5-char deterministic piece from the ID (skipping the "ext-" or "comp-" prefix)
  let shortId = id;
  if (id.includes("-")) {
    const parts = id.split("-");
    if (parts.length >= 3) {
      shortId = parts[2].substring(0, 5).toUpperCase();
    } else {
      shortId = id.substring(0, 5).toUpperCase();
    }
  } else {
    shortId = id.substring(0, 5).toUpperCase();
  }
  
  let prefix = "DOC";
  switch (type) {
    case "transferCertificate":
      prefix = "TC";
      break;
    case "characterCertificate":
      prefix = "CC";
      break;
    case "migrationCertificate":
      prefix = "MC";
      break;
    case "clearanceForm":
      prefix = "CF";
      break;
    default:
      prefix = "DOC";
  }
  
  return `${prefix}-${currentYear}-${shortId}`;
};
