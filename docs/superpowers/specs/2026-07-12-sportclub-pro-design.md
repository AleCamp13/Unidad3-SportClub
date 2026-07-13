# SportClub Pro Design Specification

## Objective

Transform the existing React frontend into a polished operational product while preserving every API contract, route, role permission, validation and CRUD workflow. The result must feel athletic, trustworthy and easy to demonstrate during evaluation.

## Product Scene

Administrators, coaches and members use SportClub in bright indoor environments, often between tasks and with limited time. The interface therefore uses a light, high-contrast workspace, compact controls and clear role states. Photography supplies sport context only where it helps recognition; it never replaces operational information.

## Visual Direction

- Keep the committed purple, gold, blue, green and red identity.
- Use Manrope for interface text and Barlow Condensed only for concise display headings and sport names.
- Keep cards at 8px radius or less, avoid nested cards and reserve pills for statuses.
- Use the existing court-line motif as the single signature element.
- Use real-looking generated sport photography in public access, member class discovery and selected coach context.
- Keep admin screens dense and table-led, with role color used for status rather than decoration.
- Do not add gradients, decorative orbs, invented statistics, group-work content or changes to backend contracts.

## Shared Experience

### Public access

Login uses a full-height SportClub training image with the form in a readable integrated surface. Registration keeps the same identity but prioritizes form completion, field errors and mobile readability. Both retain the current submit states and server feedback.

### Application shell

The shared shell keeps the desktop sidebar and mobile bottom navigation. The header identifies the current role and account, while active navigation uses the role accent plus the gold court marker. Focus, hover, active and disabled states remain consistent.

### Admin

Admin pages remain operational: compact headings, primary action at the top, responsive tables, explicit empty/loading/error states and icon-only row actions with accessible labels. No photography is placed behind tables or forms.

### Coach

Coach pages prioritize the next assignment, weekly schedule, room and capacity. Sport imagery supports class recognition without obscuring schedules or locations.

### Member

Member pages provide a visual class catalog, filter controls, clear reserved states, a weekly calendar, reservation history and API-derived activity metrics. Each class image is selected from the sport name with a safe general fallback.

### Profile and system states

Profile editing and password change retain their existing contracts and errors. System pages use the shared brand structure and direct recovery actions.

## Image Mapping

- CrossFit -> `/assets/sports/crossfit.webp`
- Yoga -> `/assets/sports/yoga.webp`
- Spinning -> `/assets/sports/spinning.webp`
- Entrenamiento Funcional and Funcional -> `/assets/sports/entrenamiento-funcional.webp`
- Pilates -> `/assets/sports/pilates.webp`
- Unknown or missing sport -> `/assets/sports/sportclub-general.webp`

The mapping must ignore accents, case and surrounding whitespace.

## Accessibility And Resilience

- Target WCAG 2.1 AA contrast.
- Preserve semantic headings, field labels, invalid feedback and keyboard operation.
- Every photo has meaningful alt text or is decorative when the surrounding text already names the sport.
- Respect `prefers-reduced-motion` and keep transitions within 150-250 ms.
- Keep text readable at 320px width and avoid horizontal overflow outside intentionally scrollable tables and calendars.
- Preserve loading, empty, error, success and disabled states across all workflows.

## Acceptance Criteria

1. Login, registration, routing, authorization, profile, admin CRUD, coach queries, class discovery, reservations and cancellation keep their existing behavior.
2. All current automated tests pass and new image mapping behavior is covered by a red-green test cycle.
3. Lint, production build and dependency audit complete without errors.
4. Desktop and mobile screenshots show no overlap, blank image, clipped control or unreadable text.
5. The backend, database, endpoints and API payload contracts are unchanged.
