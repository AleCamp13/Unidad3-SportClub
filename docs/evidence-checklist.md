# Checklist de Evidencia

Fecha de revision local: 12 de julio de 2026.

## Base obligatoria

- [x] Proyecto React organizado en componentes, paginas, servicios, rutas y utilidades.
- [x] React Router con rutas publicas, protegidas, por rol, 401/403 y 404.
- [x] Login, registro, restauracion de sesion, logout y perfil compartido.
- [x] JWT enviado en todas las operaciones protegidas.
- [x] Backend, base de datos, contratos y endpoints sin modificaciones.

## Funcionalidad

- [x] CRUD de usuarios con Modal, SweetAlert2, validacion y refresco automatico.
- [x] CRUD de deportes y cambio de estado.
- [x] CRUD de salas.
- [x] CRUD de asignaciones deporte, sala y entrenador.
- [x] CRUD de horarios con referencias y validacion temporal.
- [x] Panel, clases, horarios y salas del entrenador.
- [x] Catalogo y detalle de clases del socio.
- [x] Crear, listar, filtrar y cancelar reservas.
- [x] Prevencion de reserva duplicada en UI y respuesta HTTP 409 de la API.
- [x] Resumen de actividad y calendario derivados de reservas reales.

## Verificacion automatizada

- [x] Pruebas focalizadas para servicios, validaciones, formularios, rutas y paginas.
- [x] Contrastes principales: 5.12:1 a 17.03:1, todos sobre el minimo AA.
- [x] Detector de anti-patrones visuales: cero advertencias despues del pulido.
- [x] Build Vite ejecutado despues del pulido de estilos.
- [x] Suite completa SportClub Pro: 29 archivos y 113 pruebas aprobadas; ESLint y build limpios.
- [x] `npm audit --omit=dev`: cero vulnerabilidades en dependencias de produccion.
- [x] Seis fotografias deportivas optimizadas a WebP, entre 99 y 129 KB por archivo.
- [x] Contrastes SportClub Pro entre 6.84:1 y 16.72:1 para texto principal y secundario.

## Verificacion integrada local

- [x] Login administrativo y CRUD real de usuario, deporte y sala con limpieza posterior.
- [x] Crear, editar y eliminar asignacion y horario reales con limpieza posterior.
- [x] Login entrenador y lectura de dashboard, clases, horarios y salas.
- [x] Login socio y lectura de dashboard, clases, detalle, deportes, salas y reservas.
- [x] Solicitud duplicada rechazada con HTTP 409 sin cambiar datos.
- [x] Recorrido visual con capturas de escritorio y movil en 1440 x 1000 y 390 x 844.
- [x] Login, registro, admin, entrenador, socio, catalogo y perfil sin imagenes rotas ni overflow documental.

## Verificacion AWS

- [x] Instancia EC2 Debian 13 auditada antes de instalar servicios.
- [x] Frontend servido por Nginx y backend oficial con MariaDB mediante Docker Compose.
- [x] Portada, `/login` y refresh directo de `/user/classes` responden HTTP 200.
- [x] CSS y JavaScript de produccion responden HTTP 200 desde la Elastic IP.
- [x] Login y endpoint protegido verificados con HTTP 200 para admin, coach y user.
- [x] Docker y Nginx activos y habilitados; MariaDB healthy y reinicio de contenedores en `always`.

## Publicacion

- [x] Crear repositorio publico `AleCamp13/Unidad3-SportClub`.
- [x] Publicar y revisar `main` en GitHub.
- [x] Registrar evidencia de 12 commits, rama `main` y rama `feature/unidad3-sportclub` en el arbol remoto.
- [x] Auditar instancia EC2 antes de modificarla.
- [x] Desplegar frontend y backend oficial en AWS.
- [x] Verificar [URL publica](http://100.52.6.119/), refresh de rutas y `/api` en produccion.

No se debe marcar una casilla pendiente hasta contar con evidencia directa.
