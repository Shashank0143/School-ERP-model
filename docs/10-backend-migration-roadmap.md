# 10 - Backend Migration Roadmap

## The Current State
- **Framework**: React 18
- **Data Access**: `src/services/*` calls `MockDB`.
- **Database**: Everything lives in `localStorage` via `src/persistence/*`.

## The Future State
- **Framework**: React 18
- **Data Access**: `src/services/*` calls `API Provider` (`axios` or `fetch`).
- **Backend**: Node Backend (e.g. Express/NestJS)
- **Database**: PostgreSQL

## What Changes?
**ONLY THE PROVIDER LAYER.**
The migration strategy is explicitly designed to be painless. Backend developers will love this setup because the frontend is completely decoupled from the data layer via the provider factory pattern.

1. **Implement `apiProvider.js`**: Create a new provider that conforms to `providerInterface.js`, implementing all methods using `axios` or `fetch` to talk to the real backend.
2. **Switch the Factory**: In `src/data/index.js`, change the exported provider from `localProvider` to `apiProvider`.
3. **Phased Rollout**: You can run a hybrid model! Update `src/data/index.js` to route specific modules (e.g., Auth and Students) to `apiProvider`, while leaving others (e.g., Exams and Fees) on `localProvider` until their backend endpoints are ready.

## Data & Auth Migration Strategy
- **Auth**: Currently, `edudash_auth_state` holds a mock session. The backend should issue a JWT. The `apiProvider.authenticate()` method must capture the JWT, store it, and append it as a `Bearer` token to all subsequent API requests.
- **Data Dump**: The existing `localStorage` data can be exported as a massive JSON blob. The backend team can use this as seed data to populate the PostgreSQL database during development.

## What Doesn't Change?
- **Components**: UI components remain 100% untouched.
- **Contexts**: Global state managers remain exactly as they are.
- **Pages**: Routing and page-level container logic stays identical.
- **Schemas**: The expected JSON shapes of data flowing into the components must remain identical to the mock database schemas defined in `02-technical-reference.md`.
