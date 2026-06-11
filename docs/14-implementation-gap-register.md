# Implementation Gap Register

This register provides a reality-check on the current state of EduDash modules. It explicitly defines which layers are implemented and identifies "fake" or "planned" modules to prevent backend developers from making false assumptions based on UI stubs.

| Module | UI | Service | Provider Contract | Storage | Backend Ready |
| :--- | :---: | :---: | :---: | :---: | :---: |
| **Authentication** | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Student Management** | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Teacher Management** | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Parent Management** | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Timetables** | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Assignments** | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Attendance** | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Examinations** | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Fees & Finance** | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Leave Management** | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Transport** | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Notices & Events** | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Support Center** | ✅ | ✅ | ❌ | ✅ | ⚠️ |
| **Student Duty Mgmt** | ✅ | ✅ | ❌ | ✅ | ⚠️ |
| **Clubs (Basic)** | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Clubs (Leadership)** | ✅ | ✅ | ❌ | ✅ | ⚠️ |
| **Clubs (Proposals)** | ✅ | ✅ | ❌ | ✅ | ⚠️ |
| **Mentorship** | ✅ | ✅ | ⚠️ | ✅ | ⚠️ |
| **Employee Directory** | ✅ | ✅ | ❌ | ✅ | ⚠️ |
| **Departments** | ✅ | ✅ | ❌ | ✅ | ⚠️ |
| **Access Control** | ✅ | ✅ | ❌ | ⚠️ (Partial) | ❌ |
| **Communication Center** | ⚠️ (Stub) | ❌ | ❌ | ❌ | ❌ |

## Legend
* ✅ **Implemented**: The layer exists and functions correctly.
* ❌ **Missing**: The layer does not exist.
* ⚠️ **Partial/Stub**: The layer exists visually but lacks underlying functionality or formal contracts.

## Guidance for Backend Developers
1. **Focus on ✅ and ⚠️ Backend Ready modules first.** 
2. **Do NOT build schemas for ❌ Storage modules (Communication Center, Access Control Roles).** These are currently UI-only stubs with hardcoded data.
