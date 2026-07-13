# SportClub Pro Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Deliver a complete SportClub Pro visual redesign that preserves all working React and API behavior while improving UX, consistency, accessibility and presentation quality.

**Architecture:** Keep services, context, routes and backend contracts unchanged. Add one tested sport-image resolver, apply small semantic markup additions to existing pages and centralize the new visual language in the current token and global style files. Generated photos are optimized to WebP and selected by sport name with a deterministic fallback.

**Tech Stack:** React 18, React Router 6, React-Bootstrap, Bootstrap 5, Lucide React, Vite 5, Vitest, Testing Library, CSS custom properties.

## Global Constraints

- Do not modify the delivered backend, database structure, API contracts or endpoints.
- Keep the project individual; do not add team-work content.
- Preserve the SportClub purple and gold identity and role colors.
- Use only existing dependencies.
- Keep WCAG 2.1 AA contrast, keyboard access, responsive layout and reduced-motion support.
- Use only API-derived operational data; do not invent dashboard statistics.

---

### Task 1: Optimized Sport Image Resolver

**Files:**
- Create: `src/utils/sportImages.test.js`
- Create: `src/utils/sportImages.js`
- Create: `public/assets/sports/*.webp`
- Remove after verified conversion: `public/assets/sports/*.png`

**Interfaces:**
- Produces: `getSportImage(name)` returning a public image path and `getSportImageAlt(name)` returning concise Spanish alt text.

- [ ] **Step 1: Write the failing resolver tests** for case, accents, aliases and fallback.
- [ ] **Step 2: Run `npm test -- --run src/utils/sportImages.test.js`** and confirm failure because the module is missing.
- [ ] **Step 3: Implement normalization with `normalize('NFD')`, combining-mark removal and a fixed path map.**
- [ ] **Step 4: Run the focused test again** and confirm every mapping passes.
- [ ] **Step 5: Convert the six generated PNG files to 1440px WebP quality 84**, verify dimensions and keep only the optimized WebP assets in `public`.

### Task 2: Shared SportClub Pro Foundation

**Files:**
- Modify: `src/styles/tokens.css`
- Modify: `src/styles/global.css`
- Modify: `src/components/layout/AppShell.jsx`
- Modify: `src/layouts/PublicLayout.jsx`

**Interfaces:**
- Consumes: existing `role`, `roleLabel`, `navItems`, `user` and `onLogout` props.
- Produces: unchanged shell behavior with new semantic classes for brand text, role context and public visual panel.

- [ ] **Step 1: Extend existing shell tests** to require the accessible product label and current account context.
- [ ] **Step 2: Run the shell test** and confirm the new assertions fail.
- [ ] **Step 3: Add semantic markup without changing routes or event handlers.**
- [ ] **Step 4: Update tokens and shared CSS** for restrained surfaces, court-line details, consistent interaction states and responsive navigation.
- [ ] **Step 5: Run shell and app routing tests** and confirm they pass.

### Task 3: Public Authentication Experience

**Files:**
- Modify: `src/pages/auth/LoginPage.jsx`
- Modify: `src/pages/auth/RegisterPage.jsx`
- Modify: `src/pages/auth/AuthPages.test.jsx`
- Modify: `src/styles/global.css`

**Interfaces:**
- Keeps: current `login`, `register`, validation, navigation and error normalization behavior.

- [ ] **Step 1: Add assertions** for the access promise, form context and registration progress copy.
- [ ] **Step 2: Run auth page tests** and confirm the assertions fail before markup changes.
- [ ] **Step 3: Add concise supporting content and icons** while retaining every field name, control id and submit state.
- [ ] **Step 4: Implement full-height photography for login and a wider task-focused registration surface.**
- [ ] **Step 5: Run auth tests** and verify login, registration, validation and request errors still pass.

### Task 4: Role Dashboards And Operational Surfaces

**Files:**
- Modify: `src/pages/dashboard/RoleDashboardPage.jsx`
- Modify: `src/pages/member/MemberDashboardPage.jsx`
- Modify: `src/pages/coach/CoachDashboardPage.jsx`
- Modify: `src/pages/coach/CoachClassesPage.jsx`
- Modify: `src/pages/coach/CoachRoomsPage.jsx`
- Modify: `src/pages/coach/CoachSchedulesPage.jsx`
- Modify: `src/styles/global.css`

**Interfaces:**
- Keeps all existing service calls and data fields.
- Uses `getSportImage()` only for contextual media.

- [ ] **Step 1: Extend member and coach tests** for headings, next assignment and API-derived metric labels.
- [ ] **Step 2: Run focused role tests** and confirm only the new presentation assertions fail.
- [ ] **Step 3: Refine dashboard markup** into compact scoreboards, next-action bands and schedule-first sections.
- [ ] **Step 4: Add sport media to coach class recognition** with safe fallback and useful alt text.
- [ ] **Step 5: Run role tests** and confirm all role data and error states remain correct.

### Task 5: Classes, Reservations And Weekly Activity

**Files:**
- Modify: `src/components/member/ClassOffering.jsx`
- Modify: `src/components/member/MemberActivity.jsx`
- Modify: `src/pages/member/MemberClassesPage.jsx`
- Modify: `src/pages/member/MemberClassDetailPage.jsx`
- Modify: `src/pages/member/MemberReservationsPage.jsx`
- Modify: `src/components/member/MemberReservationComponents.test.jsx`
- Modify: `src/pages/member/MemberPages.test.jsx`
- Modify: `src/styles/global.css`

**Interfaces:**
- Keeps `onReserve(classInfo, schedule)`, active schedule detection, modal payload and cancellation behavior unchanged.

- [ ] **Step 1: Add component tests** for sport media, reserved button state and calendar event labels.
- [ ] **Step 2: Run focused member tests** and confirm the media assertion fails before implementation.
- [ ] **Step 3: Add responsive image regions and schedule structure** without changing reservation handlers.
- [ ] **Step 4: Improve filters, weekly calendar, history rows and action states** in the shared CSS.
- [ ] **Step 5: Run all member tests** and verify reserve, duplicate prevention and cancel flows still pass.

### Task 6: Admin, Profile And System Consistency

**Files:**
- Modify: `src/components/admin/AdminPageHeader.jsx`
- Modify: `src/pages/admin/*.jsx`
- Modify: `src/pages/profile/ProfilePage.jsx`
- Modify: `src/pages/system/NotFoundPage.jsx`
- Modify: `src/pages/system/UnauthorizedPage.jsx`
- Modify: `src/styles/global.css`

**Interfaces:**
- Keeps all modal, CRUD, confirmation, reload and validation behavior unchanged.

- [ ] **Step 1: Run current admin and profile suites** as a behavior baseline.
- [ ] **Step 2: Apply the common page hierarchy, table density, status vocabulary and form grouping.**
- [ ] **Step 3: Keep icon-only row actions with titles and accessible labels.**
- [ ] **Step 4: Run admin, scheduling, profile and route guard suites** and confirm no regression.

### Task 7: Quality Gate And Release

**Files:**
- Modify if findings require: `src/styles/global.css`
- Modify: `docs/ux-audit.md`
- Modify: `docs/evidence-checklist.md`

**Interfaces:**
- Produces: verified production bundle and evidence-ready release.

- [ ] **Step 1: Run `npm test -- --run`**, expecting every suite to pass without warnings.
- [ ] **Step 2: Run `npm run lint` and `npm run build`**, expecting exit code 0.
- [ ] **Step 3: Run `npm audit --omit=dev`**, expecting zero known production vulnerabilities.
- [ ] **Step 4: Capture and inspect desktop and mobile screenshots** for login and each role using real API data.
- [ ] **Step 5: Fix any overlap, clipping, contrast or broken-image finding and repeat the checks.**
- [ ] **Step 6: Commit the feature on `codex/sportclub-pro`, push it, merge only after verification and redeploy the static bundle to the existing AWS instance.**
- [ ] **Step 7: Verify `http://100.52.6.119/` and representative `/api` requests after deployment.**
