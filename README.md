# Unidad 3 SportClub

SPA desarrollada con React para la evaluacion individual N33 de Frontend. Consume la API oficial de SportClub sin modificar el backend, la base de datos, los contratos ni los endpoints entregados.

## Estado

- Funcionalidad frontend: implementada para administrador, entrenador y socio.
- API local: verificada con el backend oficial sin cambios.
- Publicacion GitHub: disponible en [AleCamp13/Unidad3-SportClub](https://github.com/AleCamp13/Unidad3-SportClub), con `main`, rama de desarrollo e historial de commits.
- AWS: [aplicacion publicada en EC2](http://100.52.6.119/) con Debian 13, Nginx, Docker y Elastic IP.

## Tecnologias

- React 18 y Vite 5.
- React Router 6 para rutas publicas, protegidas y por rol.
- React-Bootstrap y Bootstrap 5 para formularios y modales.
- SweetAlert2 para confirmaciones y resultados de operaciones.
- Fetch centralizado para consumir la API con JWT.
- Vitest y React Testing Library para pruebas automatizadas.
- Lucide React para iconografia consistente.

## Requisitos

- Node.js 20 o superior.
- npm 10 o superior.
- Backend oficial SportClub ejecutandose en `http://localhost:3000`.

## Ejecucion local

1. Iniciar el backend oficial siguiendo su README. Con Docker se utiliza `docker compose up -d --build`; con Node se utiliza `npm install` y `npm run dev`.
2. Instalar el frontend desde esta carpeta:

```powershell
npm ci
npm run dev
```

3. Abrir `http://localhost:5173`.

Vite envia `/api` al backend local en el puerto `3000`. Para usar otra URL se define `VITE_API_URL` a partir de `.env.example`.

## Comandos

```powershell
npm run dev
npm test -- --run
npm run lint
npm run build
npm run preview
```

## Cuentas de demostracion verificadas

| Rol | Correo | Contrasena | Uso recomendado |
| --- | --- | --- | --- |
| Administrador | `admin1@demo.cl` | `12345678` | CRUD y configuracion del club |
| Entrenador | `coach2@demo.cl` | `12345678` | Clases, horarios y salas con datos asignados |
| Socio | `user1@demo.cl` | `12345678` | Catalogo, reservas y actividad |

Estas credenciales pertenecen exclusivamente a los datos semilla del backend academico.

## Rutas principales

| Acceso | Rutas |
| --- | --- |
| Publico | `/login`, `/register` |
| Administrador | `/admin/dashboard`, `/admin/users`, `/admin/sports`, `/admin/rooms`, `/admin/assignments`, `/admin/schedules` |
| Entrenador | `/coach/dashboard`, `/coach/classes`, `/coach/schedules`, `/coach/rooms` |
| Socio | `/user/dashboard`, `/user/classes`, `/user/classes/:id`, `/user/reservations` |
| Compartido | `/profile`, `/unauthorized`, pagina 404 |

## Flujos implementados

1. Inicio de sesion con JWT, restauracion mediante `/auth/me` y cierre de sesion.
2. Registro de socio con validacion completa y mensajes asociados a cada campo.
3. Perfil editable y cambio de contrasena para cualquier rol.
4. CRUD administrativo de usuarios, incluida proteccion de la cuenta activa.
5. CRUD administrativo de deportes y cambio de estado.
6. CRUD administrativo de salas con capacidad, ubicacion e imagen.
7. CRUD de asignaciones deporte, sala y entrenador con referencias reales.
8. CRUD de horarios con dia, rango horario y validacion de dependencias.
9. Panel del entrenador con clases, horarios y salas asignadas.
10. Panel del socio con catalogo, detalle, reserva, prevencion de duplicados, cancelacion, resumen y calendario semanal.

Cada mutacion vuelve a consultar la API y actualiza la interfaz sin recargar el navegador. No existen reservas ni estadisticas simuladas en el codigo de produccion.

## API consumida

| Dominio | Endpoints base |
| --- | --- |
| Autenticacion y perfil | `/auth/login`, `/auth/register`, `/auth/me`, `/auth/me/password` |
| Administracion | `/users`, `/sports`, `/rooms`, `/sport-rooms`, `/class-schedules` |
| Entrenador | `/coach/dashboard`, `/coach/my-classes`, `/coach/my-schedules`, `/coach/my-rooms` |
| Socio | `/member/dashboard`, `/member/classes`, `/member/sports`, `/member/rooms` |
| Reservas | `/reservations`, `/reservations/my-reservations`, `/reservations/:id/cancel` |

Las operaciones protegidas envian `Authorization: Bearer <token>`. El cliente central transforma respuestas, errores de red, errores HTTP y validaciones de la API en mensajes utilizables por la interfaz.

## Estructura

```text
src/
  app/          configuracion de rutas
  components/   UI compartida y modales por dominio
  context/      sesion y autenticacion
  hooks/        estado asincrono reutilizable
  layouts/      espacios publicos y por rol
  pages/        vistas de admin, coach, user y perfil
  routes/       guardas de autenticacion y rol
  services/     un servicio por dominio de API
  styles/       tokens y estilos responsive
  utils/        validaciones y formateo
```

La arquitectura detallada esta en [IA.md](IA.md). La evidencia de revision esta en [docs/evidence-checklist.md](docs/evidence-checklist.md).

## Accesibilidad y UX

- Objetivo WCAG 2.1 AA y contrastes principales calculados sobre 4.5:1.
- Navegacion por teclado, enlace para saltar al contenido y foco visible.
- Errores unidos a sus campos mediante `aria-invalid` y `aria-describedby`.
- Modales accesibles, estados de carga/error/vacio y acciones de recuperacion.
- Objetivos tactiles de al menos 44 px en dispositivos tactiles.
- Soporte para `prefers-reduced-motion` y layouts adaptables.

## Restricciones respetadas

- No se modifico el backend entregado.
- No se modifico la estructura de la base de datos.
- No se modificaron contratos, rutas ni endpoints de la API.
- Todas las mejoras estan implementadas en el frontend.

## Uso de asistencia de IA

Se utilizo asistencia de IA para organizar requisitos, revisar riesgos, proponer pruebas y documentar evidencia. Cada cambio se contrasto con la pauta, se verifico mediante pruebas automatizadas y, cuando correspondia, se comprobo contra la API oficial. La entrega y su explicacion son responsabilidad individual del estudiante.
