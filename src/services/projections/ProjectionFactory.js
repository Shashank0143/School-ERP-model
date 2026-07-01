import { deepFreeze } from '../../utils/objectUtils';

export const ProjectionTypes = {
  WORKSPACE: 'WORKSPACE',
  DIRECTORY: 'DIRECTORY',
  SEARCH: 'SEARCH',
  PRINT: 'PRINT',
  ID_CARD: 'ID_CARD',
  OVERVIEW_WIDGET: 'OVERVIEW_WIDGET'
};

/**
 * Generate capabilities based on raw employee data
 */
const generateCapabilities = (rawEmployee) => {
  const caps = [];
  if (rawEmployee.category === 'Academic' || rawEmployee.designation?.toLowerCase().includes('teacher')) {
    caps.push('ACADEMIC');
  }
  if (rawEmployee.category === 'Operational') {
    caps.push('OPERATIONAL');
  }
  if (rawEmployee.category === 'Administrative') {
    caps.push('ADMINISTRATIVE');
  }
  return caps;
};

const buildWorkspaceProjection = (rawEmployee) => {
  if (!rawEmployee) return null;

  const projection = {
    projectionVersion: 2,
    id: rawEmployee.id || rawEmployee.employeeId,
    
    coreProfile: {
      fullName: rawEmployee.employeeName || rawEmployee.teacherName || 'Unknown Staff',
      firstName: (rawEmployee.employeeName || rawEmployee.teacherName)?.split(' ')[0] || 'Unknown',
      gender: rawEmployee.gender || 'Not Specified',
      dob: rawEmployee.dob || null,
      dateOfBirth: rawEmployee.dob || null,
      bloodGroup: rawEmployee.bloodGroup || 'Not Specified',
      nationality: rawEmployee.nationality || 'Not Specified',
      maritalStatus: rawEmployee.maritalStatus || 'Not Specified',
      address: rawEmployee.address || 'Address not provided',
      phone: rawEmployee.phone || null,
      email: rawEmployee.email || null,
      emergencyContact: rawEmployee.emergencyContact || null,
      
      // Extended fields
      aadhaar: rawEmployee.aadhaar || null,
      pan: rawEmployee.pan || null,
      passport: rawEmployee.passport || null,
      
      // Arrays with safe fallbacks
      generalEducation: rawEmployee.generalEducation || rawEmployee.education || [],
      experience: rawEmployee.experience || [],
      skills: rawEmployee.skills || [],
      languages: rawEmployee.languages || []
    },

    employment: {
      category: rawEmployee.category || 'Academic',
      employmentType: rawEmployee.employmentType || 'Not Specified',
      departmentId: rawEmployee.departmentId || null,
      departmentName: rawEmployee.departmentName || rawEmployee.department || null,
      designation: rawEmployee.designation || 'Not Specified',
      joiningDate: rawEmployee.joiningDate || null,
      confirmationDate: rawEmployee.confirmationDate || null,
      reportingManager: rawEmployee.reportingManager || null,
      status: rawEmployee.status || 'Active'
    },

    identity: {
      portalAccess: !!rawEmployee.portalAccess,
      linkedAuthUserId: rawEmployee.linkedAuthUserId || null
    },
    
    capabilities: generateCapabilities(rawEmployee),
    metadata: { generatedAt: Date.now() }
  };

  return deepFreeze(projection);
};

export const ProjectionFactory = {
  /**
   * Universal creation method mapping domain entities to designated UI projections.
   * @param {string} type - e.g. ProjectionTypes.WORKSPACE
   * @param {Object} sourceData - Raw service data
   * @returns {Object} Deep frozen projection DTO
   */
  create: (type, sourceData) => {
    switch (type) {
      case ProjectionTypes.WORKSPACE: 
        return buildWorkspaceProjection(sourceData);
      
      case ProjectionTypes.DIRECTORY:
      case ProjectionTypes.SEARCH:
      case ProjectionTypes.PRINT:
      case ProjectionTypes.ID_CARD:
      case ProjectionTypes.OVERVIEW_WIDGET:
        // Stub for future projection types
        return null;
        
      default:
        throw new Error(`ProjectionFactory: Unsupported projection type: ${type}`);
    }
  }
};
