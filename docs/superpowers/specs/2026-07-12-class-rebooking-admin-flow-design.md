# Diseno: re-reserva y creacion guiada de clases

## Contexto

El socio puede cancelar una reserva, pero el historial no ofrece una accion directa para volver a tomar el mismo horario. La API ya permite crear una nueva reserva cuando la anterior esta en estado `cancelled`; solo rechaza duplicados que siguen en estado `active`.

La administracion permite crear asignaciones y horarios en pantallas separadas. Ese modelo es correcto, pero obliga a conocer la relacion entre deporte, sala, entrenador y horario. Se agregara un flujo guiado que use los mismos endpoints y mantenga las pantallas avanzadas existentes.

## Objetivos

1. Permitir reservar nuevamente un horario cancelado desde el historial.
2. Impedir que la accion cree un duplicado cuando ya existe una reserva activa del mismo horario.
3. Agregar una opcion administrativa clara para crear una clase completa.
4. Publicar dos clases nuevas en produccion: Spinning y Entrenamiento Funcional.
5. Mantener sin cambios el backend, la base de datos, los endpoints y sus contratos.

## Fuera de alcance

- No se modificara el codigo del backend ni sus validadores.
- No se modificara el esquema de MariaDB.
- No se agregaran endpoints ni se cambiaran payloads.
- No se eliminara la gestion avanzada de asignaciones y horarios.

## Re-reserva del socio

Las reservas canceladas mostraran el boton `Reservar nuevamente`. Al activarlo, el frontend enviara `POST /api/reservations` con el `class_schedule_id` de la reserva cancelada y recargara el historial desde la API.

Antes de habilitar la accion, la pagina construira el conjunto de horarios que tienen una reserva activa. Si el horario cancelado ya fue reservado nuevamente, el control aparecera deshabilitado con el texto `Ya reservada`. Los errores HTTP se mostraran con retroalimentacion visible y se conservara el historial actual.

## Creacion guiada para administrador

Se agregara la ruta protegida `/admin/classes/new` y una entrada `Crear clase` en la navegacion administrativa y en las acciones del panel. La pagina tendra un formulario unico con:

- deporte;
- sala;
- entrenador;
- observacion opcional;
- dia de la semana;
- hora de inicio;
- hora de termino;
- estado activo.

Al cargar, la pagina consultara deportes, salas, entrenadores y asignaciones mediante los servicios existentes. Al enviar:

1. Validara todos los campos antes de llamar la API.
2. Buscara una asignacion activa con el mismo deporte, sala y entrenador.
3. Reutilizara la asignacion si existe; de lo contrario, creara una con `POST /api/sport-rooms`.
4. Creara el horario mediante `POST /api/class-schedules` usando el identificador de la asignacion.
5. Mostrara confirmacion y limpiara el formulario sin recargar la aplicacion completa.

Si la asignacion se crea pero falla el horario, no se eliminara automaticamente la asignacion. El mensaje explicara que la vinculacion quedo guardada y que se puede reintentar el horario. Esto evita una compensacion destructiva y mantiene el estado real visible para el administrador.

## Clases iniciales

La publicacion agregara los siguientes datos usando exclusivamente los endpoints administrativos:

| Deporte | Sala | Entrenador | Dia | Horario |
| --- | --- | --- | --- | --- |
| Spinning | Sala Spinning | coach1@demo.cl | Miercoles | 18:00-18:50 |
| Entrenamiento Funcional | Cancha Futbol 1 | coach2@demo.cl | Viernes | 19:00-20:00 |

Antes de crear cada registro se consultaran las asignaciones y horarios existentes para que el proceso sea idempotente y no genere duplicados si se ejecuta mas de una vez.

## Accesibilidad y experiencia

- Todos los campos tendran etiquetas asociadas y mensajes de validacion en pantalla.
- El boton principal comunicara el estado de envio y evitara envios repetidos.
- La accion de re-reserva tendra nombre accesible con deporte, dia y hora.
- Se conservaran los componentes, colores y jerarquia visual de SportClub Pro.
- En movil, el formulario usara una sola columna y no producira desplazamiento horizontal.

## Pruebas

1. Prueba de pagina: una reserva cancelada se puede volver a reservar y el historial se recarga.
2. Prueba de pagina: una reserva cancelada queda bloqueada cuando ya existe otra activa para el mismo horario.
3. Prueba del flujo administrador: reutiliza una asignacion coincidente y crea solo el horario.
4. Prueba del flujo administrador: crea asignacion y horario cuando la combinacion no existe.
5. Prueba de error parcial: informa que la asignacion fue creada si falla el horario.
6. Pruebas de rutas y navegacion por rol.
7. Suite completa, ESLint, build y auditoria de dependencias.

## Publicacion y verificacion

Los cambios se desarrollaran en `codex/class-rebooking-admin-flow`, se integraran en `main` despues de pasar las verificaciones y se desplegara unicamente el bundle del frontend en `/var/www/unidad3-sportclub`. Se creara un respaldo previo y se comprobaran la interfaz, la API, las nuevas clases y el estado de los contenedores existentes.
