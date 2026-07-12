# Product

## Register

product

## Users

SportClub es utilizado por tres perfiles dentro de un flujo operativo real:

- El administrador mantiene usuarios, deportes, salas, asignaciones y horarios.
- El entrenador consulta sus clases, horarios y salas asignadas antes de dirigir una actividad.
- El socio revisa la oferta disponible, reserva horarios, cancela reservas activas y controla su actividad.

Cada perfil necesita completar tareas frecuentes con poca friccion, informacion verificable y una orientacion clara dentro de su propio rol.

## Product Purpose

Centralizar la operacion diaria de SportClub en una aplicacion React conectada al backend oficial. El producto debe permitir autenticacion segura, administracion CRUD, consulta de clases y gestion de reservas sin datos simulados ni recargas manuales. El exito consiste en que cada flujo responda con datos reales, entregue retroalimentacion inmediata y pueda demostrarse de forma confiable durante la evaluacion.

## Brand Personality

Deportiva, clara y confiable. La interfaz transmite energia mediante la identidad morada y dorada de SportClub, pero mantiene la sobriedad y precision de una herramienta de trabajo.

## Anti-references

- Una pagina promocional con un hero dominante que oculte las tareas reales.
- Paneles decorativos llenos de tarjetas repetidas, estadisticas inventadas o informacion atmosferica.
- Encabezados diferentes entre roles, navegacion ambigua o acciones importantes escondidas.
- Interfaces monocromaticas, excesivamente redondeadas o con animaciones que distraigan.
- Mensajes tecnicos, silencios despues de una accion o errores que no expliquen como corregir el problema.

## Design Principles

1. Datos reales antes que decoracion: cada cifra, clase, horario y reserva debe provenir de la API.
2. Accion visible, resultado visible: toda operacion comunica progreso, exito o un error corregible y actualiza la pantalla sin recarga.
3. Un rol, un espacio de trabajo: la navegacion y las prioridades cambian con administrador, entrenador o socio sin romper la identidad comun.
4. Escaneo antes que exploracion: tablas, formularios y agendas favorecen la comparacion rapida y las tareas repetidas.
5. Confianza demostrable: validaciones, permisos y estados limite se comportan de forma consistente y quedan cubiertos por pruebas.

## Accessibility & Inclusion

El objetivo es WCAG 2.1 nivel AA: contraste suficiente, estructura semantica, etiquetas y errores asociados a los campos, operacion completa con teclado, foco visible, controles con nombres accesibles, contenido adaptable a movil y respeto por `prefers-reduced-motion`. El significado nunca depende exclusivamente del color.
