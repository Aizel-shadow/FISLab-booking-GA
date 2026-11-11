# INGENIERÍA DE SOFTWARE II - TALLER SCRUM - 11nov2026
# Guía del Taller Vivencial Scrum: Sistema de Reserva de Laboratorios EPN

Duración total: 120 minutos  
Rol del Docente: Product Owner (PO)  
Entregable final: Entornos configurados (Jira, Slack, Teams) + Incremento funcional del sistema + *Sprint Report*.

---

## Reglas Generales y Nomenclatura

* Cada equipo trabajará de forma independiente construyendo su propia versión del sistema.
* Nomenclatura obligatoria: Reemplaza `GX` por el literal de tu grupo (`GA`, `GB` o `GC`) en todas las herramientas: `FISLab-booking-GX`.
* Acceso Docente: Es obligatorio agregar el correo del docente (humberto.guaigua@epn.edu.ec) como Administrador en Jira y como Miembro en Slack y Teams durante los primeros 15 minutos.

---

## Cronograma Paso a Paso

### Fase 1: Configuración del Ecosistema (Minutos 00 - 15)
Designen roles rápidamente (1 Scrum Master y Developers). Dividan estas tareas en paralelo:

1. Jira Software:
   * Crear un proyecto gratuito con plantilla Scrum llamado `FISLab-booking-GX`.
   * Agregar al docente y a todos los miembros del equipo como Administradores.
   * Importar el archivo `ProdBacklog_FISLab-booking-GABC.csv` entregado por el docente (*Filters > Import issues from CSV* o desde la vista de *Backlog*).
2. Slack:
   * Crear un Workspace gratuito llamado `FISLab-booking-GX` e invitar al docente y al equipo.
   * Crear los canales `#general`, `#jira-notificaciones` y `#dudas-po`.
   * Instalar la aplicación oficial Jira Cloud en Slack y vincular el proyecto `FISLab-booking-GX` al canal `#jira-notificaciones` para que publique alertas cuando una tarjeta cambie de estado.
3. Microsoft Teams:
   * Crear un Equipo o reunión privada llamada `FISLab-booking-GX` para sus sesiones internas de trabajo y agregar al docente.

---

### Fase 2: Sprint Planning (Minutos 15 - 30)
Reúnanse en su sala de Teams y revisen el tablero de Jira:

1. Selección del Sprint Backlog: Revisen las 9 Historias de Usuario importadas. Como tienen 60 minutos efectivos de desarrollo, seleccionen solo las historias que realmente puedan terminar al 100% (priorizando las marcadas como *Highest* y *High*).
2. Desglose Técnico: Dividan cada Historia de Usuario seleccionada en Subtareas (ej. *Diseño de interfaz*, *Lógica de validación*, *Pruebas*) y asignen un responsable a cada una.
3. Definición de Terminado (DoD): Escriban en la descripción del Sprint o en `#general` de Slack qué debe cumplir una historia para pasar a *Done* (ej. *Sin errores en consola, cumple criterios de aceptación y está integrada*).
4. Iniciar Sprint: Hagan clic en Start Sprint en Jira (duración: *Custom / 1 hora*).

---

### Fase 3: Ejecución del Sprint - Bloque 1 (Minutos 30 - 55)

1. Comiencen a desarrollar su prototipo o aplicación funcional (tecnología libre: HTML/JS, React, Python, Java, C#, Figma interactivo, etc.).
2. Regla de Oro en Jira: Cada vez que empiecen una tarea, muévanla a In Progress. Al terminarla, muévanla a Done. No dejen tarjetas sin mover hasta el final.
3. Si tienen dudas sobre reglas de negocio de la EPN (ej. horarios, límites de reserva), consulten al docente en su canal `#dudas-po` de Slack.

---

### Fase 4: Daily Scrum (Minutos 55 - 65)

1. Detengan la programación exactamente en el minuto 55.
2. En su sala de Teams, compartan pantalla mostrando el tablero de Jira e inicien la grabación de la reunión (evidencia obligatoria).
3. En máximo 5 minutos (máximo 1 minuto por persona), cada integrante responde:
   * *¿Qué completé desde que empezó el Sprint?*
   * *¿Qué voy a hacer en los próximos 25 minutos?*
   * *¿Tengo algún bloqueo técnico o de requisitos?*
4. Detengan la grabación al terminar.

---

### Fase 5: Ejecución del Sprint - Bloque 2 e Integración (Minutos 65 - 90)

1. Resuelvan los bloqueos detectados en la Daily y terminen las historias comprometidas.
2. Atentos a Slack: El Product Owner puede anunciar cambios o ajustes de última hora durante este bloque. Deberán adaptarse y reflejarlo en Jira.
3. Integren todo en una sola demo funcional y asegúrense de que las tarjetas terminadas estén en Done en Jira.

---

### Fase 6: Sprint Review (Minutos 90 - 105)
Todos regresan a la sala principal con el docente:

1. Cada equipo tendrá 4 minutos para mostrar su producto funcionando en vivo (no diapositivas) y su tablero de Jira.
2. El docente (PO) probará o validará si las historias cumplen los *Criterios de Aceptación* para darlas por aprobadas.

---

### Fase 7: Sprint Retrospective y Cierre (Minutos 105 - 120)
En sus equipos (10 minutos):

1. Analicen: *¿Qué funcionó bien en la configuración y uso de Jira/Slack/Teams? ¿Qué falló en nuestra comunicación y cómo lo mejoraríamos en el próximo Sprint?*
2. En Jira, hagan clic en Complete Sprint y abran la pestaña Reports > Sprint Report (o *Burndown Chart*).
3. Compartan una captura de su *Sprint Report* final en el canal `#general` de Slack para el cierre del taller con el docente.


---------------------

##  Product Backlog - Sistema de Reserva de Laboratorios (FISLab-booking)

A continuación se detallan las Historias de Usuario (HU) del proyecto, ordenadas de mayor a menor prioridad según su clasificación en el Product Backlog:

### 🔴 Prioridad: Highest

* **HU-04: Formulario de Solicitud de Reserva** (8 puntos)
  * **Descripción:** Como estudiante o docente EPN, quiero seleccionar una franja disponible y llenar un formulario con mi correo institucional (`@epn.edu.ec`), código único y motivo de uso para solicitar la reserva.
  * **Criterios de Aceptación:** Validar que el correo termine en `@epn.edu.ec` y que ningún campo esté vacío.

* **HU-05: Validación de Cruce de Horarios** (5 puntos)
  * **Descripción:** Como sistema, quiero validar que no existan cruces de horario en el mismo laboratorio y bloquear la franja seleccionada al confirmar una reserva.
  * **Criterios de Aceptación:** Impedir doble reserva en la misma fecha, hora y laboratorio.

---

### 🟠 Prioridad: High

* **HU-02: Filtro por Facultad y Horario** (8 puntos)
  * **Descripción:** Como usuario, quiero filtrar los laboratorios por facultad y ver su disponibilidad por franjas horarias (07:00-09:00, 09:00-11:00, 11:00-13:00, 14:00-16:00) para encontrar horarios libres rápidamente.
  * **Criterios de Aceptación:** El filtro debe actualizar la vista en tiempo real sin recargar la página.

* **HU-01: Catálogo de Laboratorios EPN** (5 puntos)
  * **Descripción:** Como estudiante o docente de la EPN, quiero visualizar la lista de laboratorios (Redes, Software, Electrónica, Física) con su capacidad y equipamiento para saber cuál elegir.
  * **Criterios de Aceptación:** Mostrar nombre del lab, edificio/facultad, capacidad máxima y lista de equipos disponibles.

* **HU-07: Panel de Aprobación para Laboratorista** (5 puntos)
  * **Descripción:** Como laboratorista, quiero aprobar o rechazar solicitudes pendientes de reserva y liberar automáticamente el horario si la solicitud es rechazada.
  * **Criterios de Aceptación:** Lista de solicitudes pendientes con botones *Aprobar* y *Rechazar* funcionales.

---

### 🟡 Prioridad: Medium

* **HU-08: Gestión de Mantenimiento de Equipos** (5 puntos)
  * **Descripción:** Como laboratorista, quiero marcar un laboratorio como *En Mantenimiento* para que deje de aparecer disponible en el catálogo público.
  * **Criterios de Aceptación:** Al activar mantenimiento, las franjas pasan a color amarillo y no permiten reservas.

* **HU-03: Indicador Visual de Estado** (3 puntos)
  * **Descripción:** Como usuario, quiero ver el estado visual de cada franja horaria mediante colores (Verde: Disponible, Rojo: Ocupado, Amarillo: Mantenimiento) para identificar opciones de un vistazo.
  * **Criterios de Aceptación:** Leyenda de colores visible y cambio dinámico según estado.

* **HU-06: Comprobante Digital de Reserva** (3 puntos)
  * **Descripción:** Como usuario, quiero recibir en pantalla un comprobante con código alfanumérico único y resumen de mi reserva confirmada para presentarlo al ingresar al laboratorio.
  * **Criterios de Aceptación:** Generar código único (ej. `EPN-2026-X92`) y botón de descarga o captura.

---------

### 🔵 Prioridad: Low

* **HU-09: Reporte Rápido de Ocupación** (3 puntos)
  * **Descripción:** Como autoridad de facultad, quiero ver un resumen numérico de cuántas reservas activas existen hoy por laboratorio para medir el uso de infraestructura.
  * **Criterios de Aceptación:** Contador actualizado de reservas confirmadas por cada laboratorio.

---------------------

## 👥 Asignación de Historias de Usuario por Integrante

### 👤 Erick (11 pts)
* **HU-04: Formulario de Solicitud de Reserva** (Highest | 8 pts)
  * *Descripción:* Como estudiante o docente EPN, quiero seleccionar una franja disponible y llenar un formulario con mi correo institucional (@epn.edu.ec), código único y motivo de uso para solicitar la reserva.
* **HU-09: Reporte Rápido de Ocupación** (Low | 3 pts)
  * *Descripción:* Como autoridad de facultad, quiero ver un resumen numérico de cuántas reservas activas existen hoy por laboratorio para medir el uso de infraestructura.

---

### 👤 Heidi (11 pts)
* **HU-02: Filtro por Facultad y Horario** (High | 8 pts)
  * *Descripción:* Como usuario, quiero filtrar los laboratorios por facultad y ver su disponibilidad por franjas horarias (07:00-09:00, 09:00-11:00, 11:00-13:00, 14:00-16:00) para encontrar horarios libres rápidamente.
* **HU-03: Indicador Visual de Estado** (Medium | 3 pts)
  * *Descripción:* Como usuario, quiero ver el estado visual de cada franja horaria mediante colores (Verde: Disponible, Rojo: Ocupado, Amarillo: Mantenimiento) para identificar opciones de un vistazo.

---

### 👤 Karo (8 pts)
* **HU-05: Validación de Cruce de Horarios** (Highest | 5 pts)
  * *Descripción:* Como sistema, quiero validar que no existan cruces de horario en el mismo laboratorio y bloquear la franja seleccionada al confirmar una reserva.
* **HU-06: Comprobante Digital de Reserva** (Medium | 3 pts)
  * *Descripción:* Como usuario, quiero recibir en pantalla un comprobante con código alfanumérico único y resumen de mi reserva confirmada para presentarlo al ingresar al laboratorio.

---

### 👤 Isabel (10 pts)
* **HU-01: Catálogo de Laboratorios EPN** (High | 5 pts)
  * *Descripción:* Como estudiante o docente de la EPN, quiero visualizar la lista de laboratorios (Redes, Software, Electrónica, Física) con su capacidad y equipamiento para saber cuál elegir.
* **HU-08: Gestión de Mantenimiento de Equipos** (Medium | 5 pts)
  * *Descripción:* Como laboratorista, quiero marcar un laboratorio como En Mantenimiento para que deje de aparecer disponible en el catálogo público.

---

### 👤 Daya (5 pts)
* **HU-07: Panel de Aprobación para Laboratorista** (High | 5 pts)
  * *Descripción:* Como laboratorista, quiero aprobar o rechazar solicitudes pendientes de reserva y liberar automáticamente el horario si la solicitud es rechazada.
  * *(Nota: Daya apoya en la integración general del frontend y pruebas de aceptación).*