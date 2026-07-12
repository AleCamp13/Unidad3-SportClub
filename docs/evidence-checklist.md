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
- [x] Suite completa: 27 archivos y 104 pruebas aprobadas; ESLint y build limpios.

## Verificacion integrada local

- [x] Login administrativo y CRUD real de usuario, deporte y sala con limpieza posterior.
- [x] Crear, editar y eliminar asignacion y horario reales con limpieza posterior.
- [x] Login entrenador y lectura de dashboard, clases, horarios y salas.
- [x] Login socio y lectura de dashboard, clases, detalle, deportes, salas y reservas.
- [x] Solicitud duplicada rechazada con HTTP 409 sin cambiar datos.
- [ ] Recorrido visual con capturas de escritorio y movil. El controlador visual no estuvo disponible en esta sesion.

## Publicacion

- [ ] Crear repositorio publico `AleCamp13/Unidad3-SportClub`.
- [ ] Publicar y revisar `main` en GitHub.
- [ ] Registrar evidencia de commits y arbol remoto.
- [ ] Auditar instancia EC2 antes de modificarla.
- [ ] Desplegar frontend y backend oficial en AWS.
- [ ] Verificar URL publica, refresh de rutas y `/api` en produccion.

No se debe marcar una casilla pendiente hasta contar con evidencia directa.
