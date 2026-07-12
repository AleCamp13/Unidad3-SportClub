# Guia de Presentacion

## Objetivo

Demostrar que el frontend React cumple la pauta, consume la API real y puede explicarse sin depender de datos simulados.

## Preparacion

1. Confirmar que backend y frontend estan encendidos.
2. Tener abiertas tres ventanas privadas o cerrar sesion entre roles.
3. Usar `admin1@demo.cl`, `coach2@demo.cl` y `user1@demo.cl`, todos con `12345678`.
4. Evitar borrar datos semilla; crear registros claramente temporales si se necesita demostrar CRUD.
5. Tener disponible la salida de `npm test -- --run`, `npm run lint` y `npm run build`.

## Guion sugerido

### 1. Arquitectura y restricciones, 1 minuto

- Mostrar la estructura `src` y explicar paginas, componentes, servicios y rutas.
- Indicar que toda mejora esta en el frontend y que no se modifico el backend.
- Mostrar `apiClient`, JWT y el proxy `/api`.

### 2. Autenticacion y rutas, 1 minuto

- Intentar una ruta privada sin sesion.
- Iniciar sesion y explicar la redireccion por rol.
- Mostrar que una ruta de otro rol termina en acceso no autorizado.

### 3. Administrador, 3 minutos

- Crear un usuario temporal, editarlo y eliminarlo.
- Mostrar validaciones claras y que la propia cuenta no se puede eliminar.
- Recorrer deportes y salas.
- Mostrar asignaciones y horarios con nombres reales, no IDs.

### 4. Entrenador, 1 minuto

- Iniciar como `coach2@demo.cl`.
- Mostrar dashboard, clase asignada, dos horarios y sala asociada.
- Explicar que son endpoints exclusivos de coach.

### 5. Socio y reservas, 2 minutos

- Iniciar como `user1@demo.cl`.
- Filtrar el catalogo, abrir el detalle y seleccionar un horario.
- Mostrar prevencion de duplicado y el historial de reservas.
- Explicar cancelacion, resumen y calendario semanal.

### 6. Perfil, UX y evidencia, 1 minuto

- Editar perfil o mostrar cambio de contrasena sin ejecutarlo.
- Provocar una fecha futura para enseñar el mensaje asociado al campo.
- Mostrar foco de teclado, estados de carga/error y adaptacion movil.
- Cerrar con pruebas, lint, build, GitHub y URL AWS.

## Preguntas probables

**¿Por que se vuelve a consultar despues de guardar?**

Para que la interfaz represente el estado confirmado por el servidor y no una copia optimista que pueda diferir.

**¿Donde se maneja el token?**

AuthContext restaura la sesion; los servicios reciben el token y agregan `Authorization: Bearer` mediante una funcion comun.

**¿Como se evita reservar dos veces?**

Se comparan los `class_schedule_id` de reservas activas y, adicionalmente, la API confirma la regla con HTTP 409.

**¿Que ocurre cuando la API falla?**

`apiClient` genera un `ApiError`; las vistas conservan datos ingresados, muestran un mensaje en espanol y ofrecen reintento cuando corresponde.

**¿Que parte es reutilizable?**

Cliente API, contexto de sesion, guardas, hooks asincronos, estados de feedback, modales, alertas, validadores, formateadores y tokens visuales.

## Cierre

La demostracion debe terminar mostrando evidencia, no solo afirmaciones: tests, build, historial Git, repositorio publico y aplicacion AWS accesible.
