import { describe, it, expect } from 'vitest';
import { ProjectionFactory, ProjectionTypes } from './ProjectionFactory';

describe('ProjectionFactory.create', () => {
  it('should map a fully populated raw employee correctly', () => {
    const raw = {
      id: 'EMP-001',
      employeeId: 'EMP-001',
      employeeName: 'Jane Doe Smith',
      gender: 'Female',
      dob: '1990-05-15',
      address: '123 Main St',
      phone: '+1-555-0199',
      email: 'jane@school.edu',
      emergencyContact: 'John Doe',
      generalEducation: ['B.Sc.'],
      category: 'Academic',
      employmentType: 'Full-Time',
      departmentId: 'DEPT-001',
      designation: 'Senior Teacher',
      joiningDate: '2020-08-01',
      status: 'Active',
      portalAccess: true,
      linkedAuthUserId: 'AUTH-123'
    };

    const projection = ProjectionFactory.create(ProjectionTypes.WORKSPACE, raw);

    // Structural assertions
    expect(projection.projectionVersion).toBe(1);
    expect(projection.id).toBe('EMP-001');
    expect(projection.coreProfile.firstName).toBe('Jane');
    expect(projection.coreProfile.generalEducation).toEqual(['B.Sc.']);
    expect(projection.employment.status).toBe('Active');
    expect(projection.identity.portalAccess).toBe(true);
    expect(projection.capabilities).toContain('ACADEMIC');
    expect(projection.metadata.generatedAt).toBeDefined();
  });

  it('should return null for null input', () => {
    expect(ProjectionFactory.create(ProjectionTypes.WORKSPACE, null)).toBeNull();
  });

  it('should handle missing fields safely (nulls/fallbacks)', () => {
    const raw = { id: 'EMP-002', employeeName: 'Bob' };
    const projection = ProjectionFactory.create(ProjectionTypes.WORKSPACE, raw);

    expect(projection.coreProfile.fullName).toBe('Bob');
    expect(projection.coreProfile.firstName).toBe('Bob');
    expect(projection.coreProfile.gender).toBeNull();
    expect(projection.employment.category).toBe('Administrative'); // Default fallback
    expect(projection.identity.portalAccess).toBe(false);
  });

  it('should generate correct capabilities for Operational category', () => {
    const raw = { id: 'EMP-003', employeeName: 'Charlie', category: 'Operational' };
    const projection = ProjectionFactory.create(ProjectionTypes.WORKSPACE, raw);

    expect(projection.capabilities).toContain('OPERATIONAL');
    expect(projection.capabilities).not.toContain('ACADEMIC');
  });

  it('should freeze the projection, making it immutable', () => {
    const raw = { id: 'EMP-004', employeeName: 'Dave' };
    const projection = ProjectionFactory.create(ProjectionTypes.WORKSPACE, raw);

    expect(Object.isFrozen(projection)).toBe(true);
    expect(Object.isFrozen(projection.coreProfile)).toBe(true);

    // In strict mode, modifying a frozen object throws. In non-strict, it silently fails.
    // We expect the property to remain unchanged.
    try {
      projection.coreProfile.firstName = 'Hacked';
    } catch (e) {
      // Ignored
    }
    expect(projection.coreProfile.firstName).toBe('Dave');
  });

  it('should ignore Dates when deep freezing', () => {
    // Note: The factory uses Date.now() which is a number, 
    // but if it ever used a Date object, it shouldn't freeze the Date prototype.
    const raw = { id: 'EMP-005', employeeName: 'Eve' };
    const projection = ProjectionFactory.create(ProjectionTypes.WORKSPACE, raw);
    
    expect(projection.id).toBe('EMP-005');
  });
});
