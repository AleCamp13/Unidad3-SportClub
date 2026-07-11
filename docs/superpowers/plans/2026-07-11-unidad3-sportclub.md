# Unidad 3 SportClub Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development to implement this plan task-by-task. Every behavior change follows superpowers:test-driven-development.

**Goal:** Build a complete, responsive React SPA for the individual N33 evaluation, covering the mandatory base, all ten business flows, real API integration, evidence, and AWS-ready deployment.

**Architecture:** The frontend is a Vite/React application with React Router, role layouts, an AuthContext, a central fetch client, and one service per API domain. React-Bootstrap owns forms and modals, SweetAlert2 owns confirmations and operation feedback, and all server data comes from the teacher backend. The production build calls `/api`, which Nginx proxies to the unchanged Express backend.

**Tech Stack:** React 18, Vite 5, React Router 6, Bootstrap 5, React-Bootstrap 2, SweetAlert2 11, Lucide React, Fetch, Vitest, React Testing Library, ESLint.

## Global Constraints

- Repository: new public frontend repository `AleCamp13/Unidad3-SportClub`; the previous SportClub repository remains unchanged.
- Do not modify the teacher backend, database structure, API contracts, or endpoint paths.
- Implement improvements exclusively in the frontend and do not use simulated data where an endpoint exists.
- Individual delivery: implement all 10 flows (4 admin, 2 coach, 3 member, 1 shared profile) plus the mandatory base.
- GitHub evaluation reads only `main`; feature work must be merged there before delivery.
- Folder names and code identifiers are English; React component names are PascalCase; visible UI copy is Spanish.
- Development API URL is `http://localhost:3000/api`; production API URL is `/api`.
- JWT is sent as `Authorization: Bearer <token>` for protected requests.
- All create/edit forms use React-Bootstrap Modal; destructive operations use SweetAlert2 confirmation.
- Every mutation updates the interface automatically without a browser reload.
- Handle loading, empty, success, validation, API failure, unauthenticated, unauthorized, and not-found states.
- Use real labels, accessible focus, keyboard-safe dialogs, responsive layouts, and reduced-motion support.
- Follow TDD for production behavior: test first, verify RED, implement, verify GREEN, refactor.

---

### Task 1: Frontend Foundation, Design System, and API Client

**Files:**
- Create: `package.json`, Vite/ESLint/Vitest configuration, `index.html`, environment examples
- Create: `src/main.jsx`, `src/app/App.jsx`, `src/app/AppRouter.jsx`
- Create: `src/services/apiClient.js`, `src/utils/validators.js`, `src/utils/formatters.js`
- Create: `src/styles/tokens.css`, `src/styles/global.css`, shared feedback and shell components
- Test: API client, validators, formatters, and shell smoke tests

**Interfaces:**
- `apiRequest(path, options) -> Promise<data>` unwraps `{ ok, message, data }` and throws `ApiError` with `status`, `message`, and `errors`.
- `getApiUrl()` resolves `VITE_API_URL`, falling back to `/api`.
- Validators return `{ isValid, errors, data }` without mutating input.

- [ ] Write focused failing tests for URL resolution, response unwrapping, network errors, non-JSON errors, validation, and formatting.
- [ ] Run focused tests and record expected RED failures caused by missing modules.
- [ ] Scaffold the React application and install exact dependencies with a committed lockfile.
- [ ] Implement API client, utilities, root router, shared states, and SportClub design tokens.
- [ ] Build the responsive shell using a purple/gold club identity with neutral surfaces and role accents.
- [ ] Run focused tests, full suite, lint, and production build; commit when all are clean.

### Task 2: Authentication, Session, Protected Routes, Roles, and Profile

**Files:**
- Create: `src/services/authService.js`, `src/context/AuthContext.jsx`, `src/hooks/useAuth.js`
- Create: `src/routes/ProtectedRoute.jsx`, `src/routes/RoleRoute.jsx`
- Create: auth pages, shared profile page, Unauthorized and NotFound pages
- Create: public, user, coach, and admin layouts/navigation
- Test: auth service, context restoration, guards, login, registration, profile, and password forms

**Interfaces:**
- Session shape is `{ token, user }`; storage keys are `sportclub_token` and `sportclub_user`.
- AuthContext exposes `user`, `token`, `isRestoring`, `login`, `register`, `refreshUser`, and `logout`.
- Startup validates saved tokens with `GET /auth/me`; a 401 clears the session.

- [ ] Write failing tests for login payloads, registration validation, session restoration, role guards, profile update, and logout.
- [ ] Verify RED, then implement services, context, pages, layouts, and route guards.
- [ ] Register `/login`, `/register`, `/profile`, role dashboards, `/unauthorized`, and wildcard 404 routes.
- [ ] Implement `GET/PUT /auth/me` and `PUT /auth/me/password` with immediate context refresh.
- [ ] Verify all role redirects, reload persistence, 401 handling, full tests, lint, and build; commit.

### Task 3: Users, Sports, and Rooms Administration

**Files:**
- Create: domain services for users, sports, and rooms
- Create: admin list pages and reusable entity feedback/table controls
- Create: `UserFormModal`, `SportFormModal`, and `RoomFormModal`
- Test: service payloads, form validation, create/edit modal behavior, delete confirmation flow, and list refresh

**Interfaces:**
- Users use `/users`; sports use `/sports`; rooms use `/rooms`.
- User fields follow `full_name`, `email`, `password`, `role`, `birth_date`, and `metadata.sports`.
- Sport fields follow `name`, `objective`, `duration`, and `status`.
- Room fields follow `name`, `description`, `capacity`, `location`, `image_url`, `observation`, and `status`.

- [ ] Write and run failing tests for list/create/update/delete and frontend validation in all three domains.
- [ ] Implement service modules and responsive admin pages with loading, empty, retry, and API error states.
- [ ] Use React-Bootstrap Modal for create/edit and SweetAlert2 for delete and status confirmation.
- [ ] Prevent deleting the logged-in user and surface duplicate/validation errors in Spanish.
- [ ] Re-fetch the affected list after every mutation without a browser reload.
- [ ] Verify focused tests, full suite, lint, and build; commit.

### Task 4: Assignments and Class Schedules Administration

**Files:**
- Create: `assignmentService.js`, `scheduleService.js`
- Create: assignments and schedules admin pages and modals
- Test: reference loading, payload conversion, time validation, duplicate errors, CRUD refresh

**Interfaces:**
- Assignments use `/sport-rooms` with `sport_id`, `room_id`, `coach_id`, `observation`, `status`.
- Schedules use `/class-schedules` with `sport_room_id`, `day_of_week` (1-7), `start_time`, `end_time`, `status`.
- Coach options come from `/users?role=coach`; sport and room options come from their real APIs.

- [ ] Write failing tests for all CRUD operations, select hydration, numeric ID conversion, and start-time-before-end-time validation.
- [ ] Verify RED, then implement assignment and schedule services, pages, tables, and reusable modals.
- [ ] Display joined sport, room, coach, day, and time values instead of raw foreign keys.
- [ ] Handle missing references, duplicates, inactive entities, loading, empty, and retry states.
- [ ] Verify focused tests, full suite, lint, and build; commit.

### Task 5: Coach, Member Classes, and Reservation Flows

**Files:**
- Create: `coachService.js`, `memberService.js`, `reservationService.js`
- Create: coach dashboard/classes/schedule pages
- Create: member dashboard/classes/reservations pages and reservation modal
- Test: dashboard data, class rendering, schedule selection, reservation creation, duplicate prevention, cancellation

**Interfaces:**
- Coach endpoints: `/coach/dashboard`, `/coach/my-classes`, `/coach/my-schedules`, `/coach/my-rooms`.
- Member endpoints: `/member/dashboard`, `/member/classes`, `/member/classes/:id`, `/member/sports`, `/member/rooms`.
- Reservation endpoints: `/reservations/my-reservations`, `POST /reservations`, `PATCH /reservations/:id/cancel`.
- Reservation creation payload is `{ class_schedule_id, observation? }`.

- [ ] Write failing tests for all coach and member flows using complete documented API response shapes.
- [ ] Verify RED, then implement dashboards and data views with role-appropriate navigation.
- [ ] Allow a member to inspect real schedules, reserve a selected schedule, view active/cancelled reservations, and cancel only active reservations.
- [ ] Remove every simulated/localStorage reservation path; localStorage remains session-only.
- [ ] Update UI state immediately after create/cancel and show SweetAlert2 feedback.
- [ ] Verify focused tests, full suite, lint, and build; commit.

### Task 6: UX Hardening, Accessibility, Documentation, and Integrated Verification

**Files:**
- Modify: application pages/components/styles as required by responsive and accessibility review
- Create: `README.md`, `IA.md`, `docs/evidence-checklist.md`, `docs/presentation-guide.md`
- Test: cross-role navigation, responsive behavior, error/empty states, and accessibility smoke checks

**Interfaces:**
- README documents local and production setup, environment variables, seed accounts, route map, endpoint map, AWS URL slot, and all ten flows assigned to the individual student.
- Evidence checklist records verification status without claiming tests that were not run.

- [ ] Write failing accessibility/interaction tests for any gaps found during browser review.
- [ ] Verify RED, fix keyboard focus, labels, button states, contrast, responsive overflow, and reduced motion.
- [ ] Review desktop and mobile screenshots for every role and fix overlap, clipping, inconsistent headers, and weak empty/error states.
- [ ] Write concise project, AI-use, evidence, and presentation documentation.
- [ ] Run the complete automated suite, lint, build, and a route-by-route browser smoke test; commit.

### Task 7: GitHub Publication and AWS-Ready Release

**Files:**
- Create: `.env.example`, `.env.production`, `deploy/nginx-sportclub.conf`, `deploy/README.md`
- Modify: README with final repository and deployment evidence

**Interfaces:**
- Nginx serves `dist` with `try_files $uri $uri/ /index.html`.
- Nginx proxies `/api/` to `http://localhost:3000/api/`.
- Backend and MariaDB run from the unchanged teacher repository via Docker Compose.

- [ ] Add deployment configuration and validate the Nginx syntax structurally.
- [ ] Run final clean install, tests, lint, and production build from the documented commands.
- [ ] Create the public GitHub repository, push the feature branch, merge verified work to `main`, and verify the remote tree.
- [ ] Audit the existing EC2 before changing it; verify Debian 13, ports 22/80, Docker, Nginx, and Elastic IP.
- [ ] Deploy only after connection details are available; verify frontend, `/api`, login by all roles, nested-route refresh, and core CRUD/reservation flows.
- [ ] Record the final AWS URL and pre-evaluation health checklist; commit and push the release evidence.

## Final Acceptance

- `npm test -- --run` passes with zero failures and no warning noise.
- `npm run lint` exits 0.
- `npm run build` exits 0 and produces `dist`.
- Login, registration, profile, role guards, users CRUD, four admin flows, two coach flows, and three member flows work against the unchanged teacher API.
- No mock business data remains in production code.
- Every mutation updates the visible interface without reload.
- The app is usable at mobile and desktop widths and has no console errors.
- GitHub `main` contains the reviewed frontend and the AWS URL is reachable at evaluation time.
