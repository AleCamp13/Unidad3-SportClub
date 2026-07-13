# Class Rebooking And Admin Creation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Permitir re-reservar horarios cancelados, crear una clase completa desde una sola pagina administrativa y publicar Spinning y Entrenamiento Funcional mediante la API existente.

**Architecture:** La re-reserva se implementa en el historial usando el mismo servicio de reservas y el conjunto de horarios activos existente. La creacion administrativa se divide en validacion pura, orquestacion de servicios y una pagina protegida, para mantener componentes pequenos y probar por separado la combinacion de asignacion y horario.

**Tech Stack:** React 18, React Router, React Bootstrap, Lucide React, SweetAlert2, Vitest, Testing Library, Vite y API REST existente.

## Global Constraints

- No modificar backend, base de datos, endpoints ni contratos de payload.
- Usar solo `POST /api/reservations`, `POST /api/sport-rooms` y `POST /api/class-schedules` para las nuevas operaciones.
- Mantener las pantallas avanzadas de asignaciones y horarios.
- Evitar duplicados activos de reserva, asignacion y horario.
- Mantener accesibilidad, comportamiento responsive y estilo SportClub Pro.
- No publicar hasta aprobar suite completa, ESLint, build y auditoria de produccion.

---

### Task 1: Re-reserva desde el historial

**Files:**
- Modify: `src/pages/member/MemberReservationsPage.jsx`
- Modify: `src/pages/member/MemberPages.test.jsx`

**Interfaces:**
- Consumes: `getActiveScheduleIds(reservations)` y `reservationService.createReservation(token, payload)`.
- Produces: accion `Reservar nuevamente` para canceladas y estado `Ya reservada` cuando el horario ya esta activo.

- [ ] **Step 1: Escribir pruebas que fallen para re-reserva y bloqueo activo**

Agregar a `MemberPages.test.jsx` dos casos. El primero debe cargar una cancelada, pulsar `Reservar nuevamente Yoga · Jueves 09:00`, esperar `createReservation('user-token', { class_schedule_id: 2 })` y confirmar una segunda carga. El segundo debe cargar una cancelada y otra activa del mismo horario y comprobar un boton deshabilitado `Ya reservada Yoga · Jueves 09:00`.

- [ ] **Step 2: Ejecutar la prueba y confirmar RED**

Run: `npm test -- --run src/pages/member/MemberPages.test.jsx`

Expected: FAIL porque el historial todavia no renderiza `Reservar nuevamente`.

- [ ] **Step 3: Implementar la accion minima**

En `MemberReservationsPage.jsx`:

```jsx
const activeScheduleIds = useMemo(() => getActiveScheduleIds(reservations), [reservations])

const rebookReservation = async (reservation) => {
  try {
    await reservationService.createReservation(token, {
      class_schedule_id: Number(reservation.class_schedule_id),
    })
    await reload()
    await showAdminSuccess('Reserva confirmada nuevamente')
  } catch (requestError) {
    await showAdminError(requestError)
  }
}
```

Renderizar el boton solo para `cancelled`, deshabilitado si `activeScheduleIds` contiene el horario, con `RotateCcw` y nombre accesible que incluya deporte, dia y hora.

- [ ] **Step 4: Ejecutar la prueba y confirmar GREEN**

Run: `npm test -- --run src/pages/member/MemberPages.test.jsx`

Expected: todos los casos de socio PASS.

- [ ] **Step 5: Commit del comportamiento de re-reserva**

```bash
git add src/pages/member/MemberReservationsPage.jsx src/pages/member/MemberPages.test.jsx
git commit -m "feat: allow rebooking cancelled reservations"
```

### Task 2: Validacion y orquestacion de crear clase

**Files:**
- Create: `src/utils/classCreation.js`
- Create: `src/utils/classCreation.test.js`
- Create: `src/services/classCreationService.js`
- Create: `src/services/classCreationService.test.js`

**Interfaces:**
- Produces: `validateClassCreation(input)`, `findReusableAssignment(assignments, assignment)` y `createClass(token, validated, assignments)`.
- `validateClassCreation` retorna `{ isValid, errors, assignment, schedule }`.
- `createClass` retorna `{ assignment, schedule, reusedAssignment }` y lanza `ClassCreationError` con `assignmentCreated` cuando falla el horario.

- [ ] **Step 1: Escribir pruebas puras que fallen**

Probar que `validateClassCreation` normaliza IDs, observacion, dia y horas; combina errores de asignacion y horario; y que `findReusableAssignment` solo devuelve una coincidencia activa de deporte, sala y entrenador.

- [ ] **Step 2: Ejecutar utilidades y confirmar RED**

Run: `npm test -- --run src/utils/classCreation.test.js`

Expected: FAIL porque el modulo no existe.

- [ ] **Step 3: Implementar utilidades reutilizando validadores actuales**

```js
export function validateClassCreation(input) {
  const assignmentResult = validateAssignment(input)
  const scheduleResult = validateSchedule({ ...input, sport_room_id: 1 })
  const { sport_room_id: ignored, ...schedule } = scheduleResult.data
  return {
    isValid: assignmentResult.isValid && scheduleResult.isValid,
    errors: { ...assignmentResult.errors, ...scheduleResult.errors },
    assignment: assignmentResult.data,
    schedule,
  }
}
```

La busqueda debe comparar IDs numericos y exigir `status !== false`.

- [ ] **Step 4: Confirmar GREEN de utilidades**

Run: `npm test -- --run src/utils/classCreation.test.js`

Expected: PASS.

- [ ] **Step 5: Escribir pruebas de orquestacion que fallen**

Probar tres caminos: reutiliza asignacion y solo crea horario; crea asignacion antes del horario; si falla el horario despues de crear asignacion, lanza `ClassCreationError` con `assignmentCreated === true`.

- [ ] **Step 6: Ejecutar servicio y confirmar RED**

Run: `npm test -- --run src/services/classCreationService.test.js`

Expected: FAIL porque el servicio no existe.

- [ ] **Step 7: Implementar servicio minimo**

```js
export async function createClass(token, validated, assignments) {
  let assignment = findReusableAssignment(assignments, validated.assignment)
  const reusedAssignment = Boolean(assignment)
  if (!assignment) assignment = await assignmentService.createAssignment(token, validated.assignment)
  try {
    const schedule = await scheduleService.createSchedule(token, {
      ...validated.schedule,
      sport_room_id: Number(assignment.id),
    })
    return { assignment, schedule, reusedAssignment }
  } catch (cause) {
    throw new ClassCreationError(cause, { assignmentCreated: !reusedAssignment })
  }
}
```

- [ ] **Step 8: Confirmar GREEN y commit**

Run: `npm test -- --run src/utils/classCreation.test.js src/services/classCreationService.test.js`

```bash
git add src/utils/classCreation.js src/utils/classCreation.test.js src/services/classCreationService.js src/services/classCreationService.test.js
git commit -m "feat: add class creation workflow"
```

### Task 3: Pagina administrativa Crear clase

**Files:**
- Create: `src/pages/admin/AdminClassCreatePage.jsx`
- Create: `src/pages/admin/AdminClassCreatePage.test.jsx`
- Modify: `src/app/AppRouter.jsx`
- Modify: `src/layouts/RoleLayouts.jsx`
- Modify: `src/pages/dashboard/RoleDashboardPage.jsx`
- Modify: `src/app/App.test.jsx`
- Modify: `src/styles/global.css`

**Interfaces:**
- Consumes: `validateClassCreation`, `createClass`, listados de deportes, salas, entrenadores y asignaciones.
- Produces: ruta protegida `/admin/classes/new`, enlace `Crear clase` y formulario accesible de una pagina.

- [ ] **Step 1: Escribir prueba de pagina que falle**

Simular referencias activas, completar deporte, sala, entrenador, dia, inicio y termino, enviar, y esperar `createClass` con datos normalizados. Agregar un caso de validacion que no invoque el servicio y otro que muestre la advertencia de asignacion parcial.

- [ ] **Step 2: Ejecutar la pagina y confirmar RED**

Run: `npm test -- --run src/pages/admin/AdminClassCreatePage.test.jsx`

Expected: FAIL porque la pagina no existe.

- [ ] **Step 3: Implementar la pagina con patrones existentes**

Usar `useAsyncData`, `AdminPageHeader`, `Form`, `Row`, `Col`, `Alert`, `Spinner`, `fieldErrorProps` y `normalizeFieldErrors`. Cargar referencias en paralelo y filtrar deportes/salas inactivos. El formulario inicial sera:

```js
const EMPTY_FORM = {
  sport_id: '', room_id: '', coach_id: '', observation: '',
  day_of_week: '', start_time: '', end_time: '', status: true,
}
```

Tras exito, mostrar `Clase creada` y reiniciar el formulario. Ante `assignmentCreated`, mostrar `La vinculacion quedo guardada, pero el horario no pudo crearse. Reintenta el horario.`

- [ ] **Step 4: Agregar ruta y accesos**

Importar `CalendarPlus2`, agregar `Crear clase` a `ADMIN_NAV_ITEMS` y `ADMIN_ACTIONS`, e incorporar:

```jsx
<Route path="/admin/classes/new" element={<AdminClassCreatePage />} />
```

- [ ] **Step 5: Aplicar estilos responsive**

Agregar clases `.class-create`, `.class-create-form`, `.class-create-section` y `.class-create-actions`, usando los tokens existentes, radio maximo de 8px y una sola columna bajo 768px.

- [ ] **Step 6: Ejecutar pruebas y confirmar GREEN**

Run: `npm test -- --run src/pages/admin/AdminClassCreatePage.test.jsx src/app/App.test.jsx`

Expected: PASS y enlace disponible solo para admin.

- [ ] **Step 7: Commit de la interfaz**

```bash
git add src/pages/admin/AdminClassCreatePage.jsx src/pages/admin/AdminClassCreatePage.test.jsx src/app/AppRouter.jsx src/layouts/RoleLayouts.jsx src/pages/dashboard/RoleDashboardPage.jsx src/app/App.test.jsx src/styles/global.css
git commit -m "feat: add guided admin class creation"
```

### Task 4: Datos reales y verificacion integrada

**Files:**
- Modify: `docs/evidence-checklist.md`

**Interfaces:**
- Consumes: API administrativa desplegada y credenciales demo existentes.
- Produces: una asignacion y horario activos para Spinning, y otra asignacion y horario activos para Entrenamiento Funcional.

- [ ] **Step 1: Ejecutar calidad local completa**

Run: `npm test -- --run`

Expected: 0 pruebas fallidas.

Run: `npm run lint && npm run build && npm audit --omit=dev`

Expected: codigo 0 y cero vulnerabilidades de produccion.

- [ ] **Step 2: Crear datos mediante API de forma idempotente**

Consultar primero `/api/sport-rooms` y `/api/class-schedules`. Crear solo si no existe la combinacion:

```json
{"sport_id":3,"room_id":4,"coach_id":2,"observation":"Clase guiada de Spinning","status":true}
{"day_of_week":3,"start_time":"18:00","end_time":"18:50","status":true}
```

```json
{"sport_id":4,"room_id":1,"coach_id":3,"observation":"Entrenamiento funcional grupal","status":true}
{"day_of_week":5,"start_time":"19:00","end_time":"20:00","status":true}
```

- [ ] **Step 3: Verificar comportamiento real antes de desplegar**

Con usuario socio, confirmar que `/api/member/classes` devuelve Yoga, Spinning y Entrenamiento Funcional. Crear nuevamente la reserva cancelada con `POST /api/reservations`, verificar estado `active`, cancelar la nueva reserva y confirmar que el ciclo puede repetirse sin error.

- [ ] **Step 4: Publicar y desplegar frontend**

Crear respaldo de `/var/www/unidad3-sportclub`, sincronizar solo `dist/`, validar `nginx -t`, recargar Nginx y no reiniciar backend ni MariaDB.

- [ ] **Step 5: Verificar produccion y documentar evidencia**

Comprobar HTTP 200 en portada, ruta de crear clase, catalogo, WebP, login y endpoints protegidos. Revisar escritorio y movil sin desbordamiento. Registrar las pruebas y las tres clases disponibles en `docs/evidence-checklist.md`.

- [ ] **Step 6: Commit de evidencia y publicacion**

```bash
git add docs/evidence-checklist.md
git commit -m "docs: record class workflow verification"
git push -u origin codex/class-rebooking-admin-flow
```
