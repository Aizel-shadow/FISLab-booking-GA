# FISLab-booking-GX

Prototipo funcional del Taller Scrum de Ingeniería de Software II, Escuela Politécnica Nacional. Construido con HTML5, CSS3 y JavaScript Vanilla, sin frameworks, backend ni dependencias de ejecución.

## Ejecutar

Abre **index.html** directamente en un navegador moderno (Chrome, Edge o Firefox). No requiere instalación, conexión a Internet ni servidor. Permite el almacenamiento local del navegador para conservar las reservas. Utiliza siempre el mismo navegador y la misma ubicación del archivo durante la demostración; el almacenamiento de direcciones `file://` depende del navegador.

## Funcionalidades

- **HU-01:** catálogo de laboratorios de Redes, Software, Electrónica y Física. Cada tarjeta muestra su facultad, edificio, capacidad máxima y equipamiento disponible.
- **HU-02:** filtros por facultad y franja que actualizan el catálogo sin recargar. Selector de fecha y franjas 07:00–09:00, 09:00–11:00, 11:00–13:00 y 14:00–16:00. Cada franja muestra su estado disponible u ocupada, y las ocupadas no se pueden seleccionar.
- **HU-04:** selección de laboratorio, fecha y franja; formulario con correo institucional, código único y motivo. Validación del dominio exacto `@epn.edu.ec`, campos vacíos o con solo espacios, longitudes máximas y fechas desde hoy. Mensajes de error junto a cada campo.
- Persistencia mediante `localStorage`, prevención de reservas duplicadas para un laboratorio/fecha/franja, listado de reservas y cancelación que libera el horario. Los datos introducidos se presentan como texto, sin interpretar HTML.
- Diseño adaptable a móviles, navegación por teclado, formularios etiquetados, diálogos y avisos accesibles.

Los nombres, ubicaciones, equipos y capacidades de los laboratorios son **datos ficticios de demostración**. Una franja por laboratorio está ocupada por datos de ejemplo; el patrón cambia con el día elegido. El filtro horario conserva también las franjas ocupadas para consultar su estado.

La demostración registra la solicitud automáticamente y ocupa el horario. No existe autorización administrativa, autenticación, comprobación real del código ni envío de correo. “Mis reservas” muestra todas las reservas del navegador, sin cuentas de usuario. No se bloquean las horas ya transcurridas del día actual para facilitar el taller.

## Prueba de aceptación manual

1. Abre `index.html`. Comprueba los cuatro laboratorios (Redes, Software, Electrónica y Física), así como su facultad, edificio, capacidad máxima, lista de equipos y las cuatro franjas en cada tarjeta.
2. Elige una facultad y una franja. Comprueba que solo cambian los resultados, sin recarga. Usa “Limpiar filtros”.
3. Selecciona una franja verde. Envía el formulario vacío: debe indicar los campos requeridos.
4. Prueba `usuario@gmail.com` y `usuario@epn.edu.ec.ejemplo.com`: deben rechazarse. Acepta `usuario@epn.edu.ec` con código y motivo no vacíos.
5. Confirma la reserva. Verifica que aparece en “Mis reservas”; vuelve a explorar la misma fecha y comprueba que la franja quedó ocupada.
6. Recarga o cierra y vuelve a abrir el archivo. La reserva debe conservarse.
7. Cancela la reserva y comprueba que la franja vuelve a estar disponible. Las ocupaciones de ejemplo permanecen.
8. Repite con otra fecha; la reserva no debe ocupar el mismo horario de un día distinto. Prueba también un ancho móvil y navegación por teclado.

## Archivos

- `index.html`: estructura y diálogos.
- `styles.css`: estilos y adaptación a pantallas.
- `reservation-store.js`: datos de ejemplo, validación y persistencia.
- `app.js`: filtros, renderizado, navegación y eventos.
- `tests/reservations.test.cjs`: pruebas de reglas y persistencia con Node.js, sin paquetes externos. Ejecutar con `node --test tests/reservations.test.cjs` (Node solo se usa para pruebas).

Clave de almacenamiento: `FISLab-booking-GX.reservations.v1`. Para una demostración nueva, cancela las reservas desde la interfaz; también puedes eliminar únicamente esta clave desde las herramientas de desarrollo. Los errores de permisos, espacio o formato se muestran en pantalla y no generan confirmaciones falsas ni sobrescriben datos ilegibles.

`localStorage` no ofrece transacciones entre ventanas: se comprueba nuevamente la disponibilidad al confirmar y se sincronizan los eventos de almacenamiento, pero una escritura exactamente simultánea desde varias pestañas no tiene garantías transaccionales. Este prototipo está pensado para una demostración local en una sola pestaña.


## HU-07 y HU-08: Sprint Review

Archivos ampliados: `reservation-store.js` (estados, compatibilidad hist?rica y mantenimiento), `app.js` (panel y disponibilidad), `index.html` (navegaci?n y secci?n), `styles.css` (indicadores), `tests/reservations.test.cjs` y este documento.

Las solicitudes nuevas son Pendiente. Aprobar mantiene la franja ocupada; rechazar conserva el registro en Mis reservas y libera la franja. Una solicitud procesada no puede procesarse nuevamente. Las reservas hist?ricas sin estado se interpretan como Aprobada. Mantenimiento se almacena por laboratorio y prevalece sobre las reservas, sin modificarlas. Desactivarlo restaura las restricciones pendientes y aprobadas. Las ocupaciones de ejemplo tambi?n se conservan.

Prueba manual HU-07: crea dos solicitudes en franjas libres, abre Panel del Laboratorista, aprueba una y rechaza otra. Verifica los estados en Mis reservas y que ?nicamente la rechazada libera el horario. Recarga y comprueba persistencia. Intenta reservar una franja pendiente: debe permanecer bloqueada.

Prueba manual HU-08: activa mantenimiento desde el panel. En el cat?logo, verifica franjas amarillas deshabilitadas, texto En mantenimiento y filtros operativos. Recarga: el mantenimiento debe persistir. Desact?valo y comprueba que siguen bloqueadas las reservas pendientes y aprobadas, mientras las franjas libres vuelven a permitir solicitudes.

El panel es de demostraci?n y accesible sin control de roles. El almacenamiento no es compartido entre equipos y no garantiza transacciones simult?neas entre pesta?as. La verificaci?n visual requiere abrir index.html en un navegador; no se ejecut? una prueba visual automatizada en este entorno.
