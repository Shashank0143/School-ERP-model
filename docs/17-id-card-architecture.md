# 17 - Identity Card Module Architecture

## Purpose and Scope
The Identity Card module is part of the Shared UI Platform. It provides a unified presentation layer for rendering and printing institutional identities (Student and Staff ID Cards). It is intentionally domain-agnostic, meaning it has no knowledge of Student, Teacher, or Employee business logic.

### Current Prototype Scope
*   **Included**: Preview, Print, Browser PDF generation, Shared reusable component architecture.
*   **Not Included**: QR Verification, RFID integration, Smart Cards, Barcode validation, Digital verification, Backend template engine.

## Shared Component Architecture
The module is housed entirely under `src/components/common/id-card/` and relies on a composition pattern.
- `IDCard.jsx`: The main entry point that wraps the front and back components.
- `IDCardFront.jsx` / `IDCardBack.jsx`: The two faces of the card.
- `IDCardHeader.jsx` / `IDCardBody.jsx` / `IDCardFooter.jsx`: The structural blocks of the card front.
- `IDCardPreviewModal.jsx`: An isolation wrapper that handles previewing the card in a modal and injecting print-specific styles.

## Architecture Principles
1.  **Single reusable component**: One module serves all portals.
2.  **Variant-driven rendering**: The component adapts its layout based on the `variant` prop.
3.  **Presentation-only module**: The module has absolutely no business logic.
4.  **No persistence**: The module stores nothing.
5.  **No service layer / API / CRUD**: It relies entirely on data passed down as props.
6.  **Backend-ready**: It accepts a normalized JSON object structure.
7.  **Print-friendly**: Optimized for native browser printing without heavy PDF libraries.
8.  **Portal-independent & Role-independent**: Can be rendered anywhere, by any user, for any user (given proper data).

## Variant System
The module currently supports two native variants via the `variant` prop:
- `student`: Renders Student-specific fields such as Admission No, Class, Section, and Parents' Names.
- `staff`: Unifies Teacher, Admin, and Employee cards under a single layout, rendering Employee ID, Designation, and Department.

## Data Mapping Strategy
Since the ID Card module is presentation-only, the consuming parent component (e.g., `StudentProfilePage` or `AdminProfilePage`) is responsible for fetching the necessary profile data via the existing services (`studentService`, `teacherService`, etc.) and mapping it to the normalized `data` prop structure expected by the `IDCard` component.

## Preview and Print Mechanism
The print functionality is built around the native browser print engine (`window.print()`). 
When the `IDCardPreviewModal` is open, it injects print-specific styling using the CSS `@media print` query. This style hides everything else on the page and forces the modal contents to fill the printable area, providing a clean, zero-dependency mechanism for generating PDFs or printing physical cards.
