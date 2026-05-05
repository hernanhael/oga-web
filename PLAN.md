# Plan de Desarrollo — OGA-Web
**Oficina de Gestión Asociada Civil y Comercial N° 3**
**Poder Judicial de Tucumán**

---

## 1. Descripción del Proyecto

Plataforma web interna y cerrada para los empleados de la OGA Civil y Comercial N° 3. La oficina trabaja para cuatro juzgados, cada uno con un color identificador:

| Juzgado | Color |
|---------|-------|
| N° 3 | Naranja |
| N° 8 | Rojo |
| N° 13 | Azul |
| N° 14 | Verde |

La plataforma centraliza comunicados, el organigrama del personal, la gestión de agenda y audiencias (con asistencia de inteligencia artificial), la educación jurídica y los manuales de procedimientos internos.

**Despliegue:** Vercel (cloud).
**Equipo de desarrollo:** 2 personas.
**Orden de desarrollo:** Área 1 → 2 → 3 → 4 → 5.

---

## 2. Las Cinco Áreas

### Área 1 — Novedades y Comunicados
La página de entrada. Todo empleado la ve al ingresar.

- Descripción mínima de la oficina (sección estática)
- Feed de anuncios filtrable por tipo:
  - **Novedades jurídicas**: cambios de criterio, doctrina
  - **Novedades procedimentales**: cambios en procesos internos
  - **Comunicados de autoridades**: mensajes oficiales de jefes y secretarios
  - **Eventos**: reuniones, capacitaciones, actos
  - **Cumpleaños**: generados automáticamente desde el organigrama
- **Banner de cumpleaños**: aparece el día anterior y el día del cumpleaños de cualquier empleado. Animado, visible al tope del área.
- Actualizaciones en tiempo real: cuando un admin publica un comunicado, todos los empleados conectados lo ven sin recargar la página.

### Área 2 — Organigrama
Directorio visual e interactivo de todos los empleados.

- Árbol expandible/colapsable estilo organigrama
- Cada nodo del árbol muestra: foto, nombre y cargo
- Al hacer click en un empleado se abre un panel lateral con:
  - Datos personales (nombre, correo, teléfono)
  - Cargo / categoría
  - Área o sector dentro de la oficina
  - Tareas y funciones a su cargo
  - Fecha de cumpleaños
- Admin puede crear, editar y desactivar empleados
- Subida de fotos de perfil
- El árbol dispara la alerta de cumpleaños al Área 1

### Área 3 — Agenda y Gestión de Audiencias

#### 3a. Calendario de Reservas de Salas
- Vista tipo calendario con salas como columnas (recursos)
- Cada reserva se muestra con el color del juzgado que la hizo
- Funciones:
  - Agregar reserva (sala, horario, título, observaciones)
  - Modificar reserva propia (admin puede modificar cualquiera)
  - Eliminar reserva
  - Validación de conflictos: si el slot ya está ocupado, la reserva es rechazada
- Filtros: por juzgado, por sala, por rango de fechas
- Actualización en tiempo real entre usuarios
- **Notificación automática** si se detectan huecos disponibles anteriores a la última fecha cargada en el calendario

#### 3b. Tablero Semanal de Audiencias (Proyectable)
Vista diseñada para proyectarse en una pared de la oficina.

- Muestra las audiencias de la semana, divididas por día
- Cada audiencia contiene:
  - Horario
  - Modalidad (Presencial / Virtual / Mixta)
  - Tipo de audiencia
  - N° de expediente
  - Audiencista
  - Funcionario
  - Juez
- El fondo del recuadro de cada audiencia se pinta con el color del juzgado al que pertenece
- Texto grande, sin elementos de navegación, optimizado para visualización en proyector
- **Carga por IA**: el usuario sube una foto de la planilla papel → la IA extrae todos los datos → el usuario revisa y confirma → los datos se cargan automáticamente en el tablero

### Área 4 — Docencia del Derecho
Biblioteca jurídica interactiva para transmitir criterios y guías de interpretación.

- Organizada por tipo de proceso y materia
- Cada artículo explica el criterio adoptado y el porqué
- Tipos de contenido:
  - Guías de criterio (texto enriquecido con formato)
  - Imágenes y esquemas
  - Videos explicativos (propios o embebidos de YouTube)
  - Fallos y papers (visualizables dentro de la plataforma, no descargables)
- Búsqueda de texto completo en todos los artículos
- Admin puede crear, editar y organizar el contenido

### Área 5 — Guías de Procedimientos
Centro de capacitación interna.

- Manuales de trabajo general de la oficina
- Guías de cómo decretar, resolver e instrumentar en derecho
- Capturas de pantalla del sistema de administración de expedientes
- Videos instructivos
- Guías de atajos de teclado (Windows y Chrome) presentadas como tarjetas visuales
- **Ejercicios interactivos / quizzes**: preguntas de opción múltiple con respuesta y explicación inmediata

---

## 3. Diseño Visual

### Tema Claro / Oscuro
La plataforma ofrece toggle entre modo claro y oscuro, persistido entre sesiones.

| | Fondo | Texto |
|--|-------|-------|
| **Claro** | Blanco roto (como papel viejo, `hsl(40 30% 97%)`) | Gris azulado oscuro |
| **Oscuro** | Gris muy oscuro (`hsl(220 15% 12%)`) | Blanco cálido |

### Paleta de Colores
Todos los colores de la interfaz son **pastel**: fondos, botones, etiquetas, títulos.

```
Juzgado 3  → naranja pastel   hsl(30  90% 75%)
Juzgado 8  → rojo pastel      hsl(0   80% 75%)
Juzgado 13 → azul pastel      hsl(215 80% 75%)
Juzgado 14 → verde pastel     hsl(140 60% 70%)
```

### Botones
- Relleno pastel por dentro
- Borde pronunciado (`border-2 border-current`)

### Animaciones
Transiciones suaves entre páginas, modales y paneles. El banner de cumpleaños tiene animación de entrada. Los nodos del organigrama se expanden con animación.

---

## 4. Usuarios y Permisos

### Roles

| Rol | Capacidades |
|-----|-------------|
| **Admin** | Todo: gestión de usuarios, publicar comunicados, editar organigrama, cargar audiencias, administrar contenido educativo |
| **Supervisor** | Publicar comunicados, gestionar reservas de salas, cargar audiencias, leer todo |
| **Empleado** | Leer todo el contenido, crear reservas propias |
| **Solo lectura** | Solo puede leer (para usuarios externos autorizados) |

### Acceso
- No hay registro público. Los admins crean las cuentas.
- Login con email y contraseña.
- Sesión persistida con cookie segura (HTTP-only).
- El middleware del servidor verifica la sesión y el rol en cada ruta.

---

## 5. Stack Tecnológico

### Por qué este stack

**Next.js 15 (App Router)** — Un único repositorio que maneja tanto el frontend como el backend (API routes). Los React Server Components permiten que las páginas con mucho contenido (Áreas 4 y 5) rendericen en el servidor, reduciendo la carga en el navegador.

**Supabase (PostgreSQL)** — Provee en un solo servicio: base de datos PostgreSQL, autenticación (no la usamos directamente, pero el proyecto la gestiona), almacenamiento de archivos y notificaciones en tiempo real. Puede auto-alojarse si el Poder Judicial lo requiere en el futuro.

**Claude API (Anthropic)** — El modelo `claude-sonnet-4-6` tiene capacidad de visión y puede analizar imágenes y extraer texto estructurado con muy alta precisión. Es la opción ideal para leer planillas de audiencias escritas a mano o impresas.

**FullCalendar** — La biblioteca de calendarios más completa para React. Soporta vista de recursos (salas como columnas), drag-and-drop nativo y es fácilmente personalizable con colores por juzgado.

### Tabla de tecnologías

| Categoría | Tecnología | Versión |
|-----------|-----------|---------|
| Framework | Next.js App Router | 15.x |
| Lenguaje | TypeScript | 6.x |
| Base de datos | PostgreSQL (Supabase) | — |
| ORM | Drizzle ORM | 0.45.x |
| Autenticación | Better Auth | 1.6.x |
| IA (extracción) | @anthropic-ai/sdk | 0.92.x |
| Tiempo real | Supabase Realtime | bundled |
| Calendario | FullCalendar | 6.1.x |
| Organigrama | react-d3-tree | 3.6.x |
| Editor de texto | TipTap | 3.22.x |
| Visor de PDF | @react-pdf-viewer/core | 3.12.x |
| Videos | react-player | 3.4.x |
| Estado UI | Zustand | 5.0.x |
| Estado servidor | TanStack Query | 5.x |
| Estilos | Tailwind CSS v4 + shadcn/ui | 4.2.x |
| Tema claro/oscuro | next-themes | 0.4.x |
| Animaciones | Framer Motion | 12.x |
| Toasts | sonner | 2.0.x |
| Formularios | react-hook-form + zod | 7.x + 4.x |
| Fechas | date-fns | 4.1.x |
| Subida de archivos | react-dropzone | 15.x |
| Compresión de imagen | browser-image-compression | 2.0.x |
| Despliegue | Vercel | — |

---

## 6. Modelo de Datos

```
users
  id, email, name, password_hash
  role: admin | supervisor | employee | readonly
  court_id (juzgado al que pertenece, puede ser null)
  position (cargo: ej. "Actuaria", "Secretaria", "Empleada")
  birthdate, photo_url, tasks (texto), is_active
  created_at

courts
  id, number (3 | 8 | 13 | 14)
  name, color (orange | red | blue | green)

announcements
  id, title, content (JSON TipTap)
  type: news | authority | event | birthday
  author_id → users.id
  published_at, expires_at, pinned
  created_at

rooms
  id, name, court_id, capacity, description

reservations
  id, room_id → rooms.id
  user_id → users.id
  court_id → courts.id
  title, start_time, end_time, notes
  created_at

hearings (audiencias del tablero)
  id, week_start (fecha de lunes de la semana)
  day_of_week (lunes | martes | miércoles | jueves | viernes)
  time (hora), modality (Presencial | Virtual | Mixta)
  type (tipo de audiencia), case_number (nº expediente)
  audiencista, funcionario, juez
  court_id → courts.id
  notes, created_at

hearing_extractions (historial de extracciones por IA)
  id, image_url
  status: pending | processing | completed | failed
  extracted_data (JSON con lo que devolvió Claude)
  hearing_id → hearings.id
  created_at

org_nodes (posición en el árbol)
  id, user_id → users.id
  parent_id → org_nodes.id (null si es raíz)
  position_order

law_categories
  id, name, process_type, subject_matter, parent_id

law_articles
  id, category_id → law_categories.id
  title, content (JSON TipTap), tags
  author_id → users.id
  created_at, updated_at

law_attachments
  id, article_id → law_articles.id
  type: pdf | video | image | fallo | paper
  url, title, display_only (siempre true), order

procedure_guides
  id, title, content (JSON TipTap)
  category, shortcut_type: windows | chrome | none
  created_at

guide_attachments
  id, guide_id → procedure_guides.id
  type, url, title, order

quizzes
  id, guide_id → procedure_guides.id
  question, options (JSON array de strings)
  correct_answer (índice), explanation

notifications
  id, user_id → users.id
  type, message, read (boolean)
  related_id, related_type
  created_at
```

---

## 7. Flujo de la Funcionalidad IA (Área 3b)

Esta es la funcionalidad técnicamente más compleja del proyecto.

```
1. El usuario abre /tablero/admin

2. Arrastra o selecciona una foto de la planilla de audiencias
   (react-dropzone)

3. La imagen se comprime en el navegador
   (browser-image-compression → reduce costo y tiempo de API)

4. La imagen se envía al servidor
   → POST /api/hearings/extract (Route Handler de Next.js)

5. El servidor envía la imagen a Claude claude-sonnet-4-6 con visión
   Prompt en español rioplatense:
   "Extraé de esta imagen las audiencias listadas.
    Por cada audiencia devolvé un objeto JSON con:
    hora, modalidad (Presencial/Virtual/Mixta), tipo_audiencia,
    numero_expediente, audiencista, funcionario, juez"

6. Claude devuelve JSON estructurado

7. El servidor valida la respuesta con Zod (descarta campos inválidos)

8. El frontend muestra una tabla editable con los datos extraídos
   "Revisá los datos antes de confirmar"

9. El usuario corrige errores si los hay y hace click en "Confirmar"

10. Server Action guarda las audiencias en la base de datos

11. El tablero proyectable se actualiza automáticamente
```

---

## 8. Estructura de Archivos del Proyecto

```
oga-web/
├── src/
│   ├── app/
│   │   ├── (auth)/
│   │   │   └── login/
│   │   │       └── page.tsx
│   │   ├── (protected)/
│   │   │   ├── layout.tsx          ← Shell: sidebar, header, tema, cumpleaños
│   │   │   ├── page.tsx            ← Redirect a /noticias
│   │   │   ├── noticias/           ← ÁREA 1
│   │   │   ├── organigrama/        ← ÁREA 2
│   │   │   ├── agenda/
│   │   │   │   ├── calendario/     ← ÁREA 3a
│   │   │   │   └── tablero/        ← ÁREA 3b (layout propio para proyector)
│   │   │   ├── educacion/          ← ÁREA 4
│   │   │   └── procedimientos/     ← ÁREA 5
│   │   └── api/
│   │       ├── auth/[...all]/      ← Better Auth
│   │       ├── hearings/extract/   ← Claude vision
│   │       └── reservations/
│   ├── components/
│   │   ├── ui/                     ← Componentes shadcn
│   │   ├── org-chart/
│   │   ├── calendar/
│   │   ├── hearing-board/
│   │   ├── rich-content/           ← TipTap viewer/editor
│   │   ├── notifications/
│   │   └── layout/                 ← Sidebar, Header, Nav
│   ├── lib/
│   │   ├── db/
│   │   │   ├── schema.ts           ← Drizzle schema (fuente de verdad)
│   │   │   └── index.ts            ← Conexión a la DB
│   │   ├── auth.ts                 ← Configuración Better Auth
│   │   ├── supabase.ts             ← Cliente Supabase
│   │   └── utils.ts                ← cn() y helpers
│   ├── hooks/                      ← Custom React hooks
│   ├── stores/                     ← Zustand stores
│   └── types/                      ← Tipos TypeScript compartidos
├── CLAUDE.md
├── PLAN.md
└── ...configs (next.config.ts, tsconfig.json, etc.)
```

---

## 9. Roadmap de Desarrollo

### Fase 0 — Fundación *(1 semana)*
Estructura base con la que se sostiene todo lo demás.

- [ ] Inicializar proyecto con `create-next-app` (TypeScript, App Router, `/src`)
- [ ] Configurar Tailwind CSS v4 con variables CSS del tema pastel
- [ ] Instalar y configurar shadcn/ui con variante de botón personalizada
- [ ] Configurar `next-themes` (toggle claro/oscuro sin flash)
- [ ] Crear proyecto en Supabase, configurar connection string
- [ ] Definir schema completo en `src/lib/db/schema.ts` con Drizzle
- [ ] Ejecutar primera migración
- [ ] Configurar Better Auth (email+password, roles, adaptador Drizzle)
- [ ] Construir página de login
- [ ] Middleware de protección de rutas en `src/middleware.ts`
- [ ] Construir shell de la app: sidebar de navegación, header con toggle de tema y bell de notificaciones

**Entregable:** Un empleado puede hacer login y ver el shell de la app. Un admin puede crear usuarios desde un panel básico.

---

### Fase 1 — Área 1: Noticias y Comunicados *(1 semana)*

- [ ] CRUD completo de anuncios (editor TipTap para admins)
- [ ] Feed de noticias con filtros por tipo (novedades, comunicados, eventos)
- [ ] Anuncios fijados (pinned) al tope del feed
- [ ] Sistema de cumpleaños:
  - Server Component en `layout.tsx` consulta cumpleaños de hoy y mañana
  - Banner animado (Framer Motion) visible en Área 1
  - Inserta en tabla `notifications` para el historial del bell icon
- [ ] Supabase Realtime: nuevo comunicado → todos los usuarios conectados lo ven sin recargar

**Entregable:** Página de inicio funcional con feed de noticias, comunicados y alertas de cumpleaños en tiempo real.

---

### Fase 2 — Área 2: Organigrama *(1 semana)*

- [ ] Completar campos de perfil de usuario (cargo, tareas, foto, cumpleaños)
- [ ] Implementar `react-d3-tree` con nodos React personalizados (foto, nombre, cargo)
- [ ] Click en nodo → shadcn `Sheet` (panel lateral deslizante) con datos completos
- [ ] Subida de fotos de perfil a Supabase Storage; `next/image` para optimización
- [ ] Panel admin: crear empleado, editar datos, desactivar cuenta
- [ ] Panel admin: reordenar la posición de nodos en el árbol

**Entregable:** Árbol interactivo del personal con perfiles expandibles y fotos.

---

### Fase 3 — Área 3a: Calendario de Salas *(1–2 semanas)*

- [ ] Seed de datos: salas, juzgados con colores
- [ ] Implementar FullCalendar `ResourceTimeGridView` (salas como columnas)
- [ ] Colorear eventos según juzgado de la reserva
- [ ] Modal de nueva reserva: sala, horario, título, observaciones (react-hook-form + zod)
- [ ] Validación de conflictos en el servidor (Route Handler verifica solapamiento antes de guardar)
- [ ] Editar y eliminar reservas propias (admin puede editar cualquiera)
- [ ] Filtros por juzgado, sala y rango de fechas (Zustand)
- [ ] Supabase Realtime: reservas actualizadas para todos los usuarios en tiempo real
- [ ] Notificación automática si hay huecos disponibles antes de la última fecha cargada

**Entregable:** Sistema de reserva de salas colaborativo, en tiempo real y con colores por juzgado.

---

### Fase 4 — Área 3b: Tablero de Audiencias con IA *(1–2 semanas)*

- [ ] Ruta `/tablero` con layout propio sin chrome de navegación (optimizado para proyector)
- [ ] Vista semanal de audiencias con FullCalendar `TimeGridWeek` (read-only)
- [ ] Colorear el fondo de cada audiencia según juzgado
- [ ] Ruta `/tablero/admin` con UI de carga por IA (para supervisor y admin)
- [ ] Implementar Route Handler `/api/hearings/extract`:
  - Recibe imagen, la envía a Claude claude-sonnet-4-6 con vision
  - Prompt en español rioplatense con esquema JSON exacto
  - `cache_control: ephemeral` en system message para reducir costos
  - Valida respuesta con Zod
- [ ] UI de revisión: tabla editable con datos extraídos antes de confirmar
- [ ] Server Action que guarda las audiencias confirmadas en la DB
- [ ] Pruebas con planillas reales de audiencias del Poder Judicial de Tucumán
- [ ] Ajuste del prompt según resultados de las pruebas

**Entregable:** Subís una foto de la planilla → la IA extrae todos los datos → los revisás → el tablero se actualiza. La vista proyectable es completamente funcional.

---

### Fase 5 — Área 4: Docencia del Derecho *(1–2 semanas)*

- [ ] Seed de categorías por tipo de proceso y materia
- [ ] Navegación lateral por categorías (árbol colapsable)
- [ ] Visor de artículos con TipTap read-only (soporte para imágenes, videos YouTube embebidos, tablas)
- [ ] Visor de PDF en modal (`@react-pdf-viewer`) con:
  - Botón de descarga removido vía plugin de toolbar
  - URLs firmadas de Supabase Storage con expiración de 1 hora
  - `onContextMenu` interceptado (disuasión de descarga por clic derecho)
- [ ] Reproductor de video (`react-player`)
- [ ] Búsqueda de texto completo con Postgres `to_tsvector` (Drizzle `sql`)
- [ ] Panel admin: editor TipTap, subida de adjuntos (PDF, imagen, video) a Supabase Storage

**Entregable:** Biblioteca jurídica interactiva con guías, fallos y videos. PDFs visibles pero no descargables.

---

### Fase 6 — Área 5: Guías de Procedimientos *(1 semana)*

- [ ] Reusar TipTap viewer para guías de procedimiento
- [ ] Galería de capturas de pantalla con lightbox animado (Framer Motion)
- [ ] Reproductor de video instructivo
- [ ] Tarjetas de atajos de teclado (Windows + Chrome): diseño visual tipo cheatsheet
- [ ] Componente de quiz:
  - Pregunta con opciones de selección única
  - Reveal inmediato de respuesta correcta con explicación
  - Puntaje de la sesión en estado React local (sin backend)

**Entregable:** Centro de capacitación con guías, capturas, videos y quizzes.

---

### Fase 7 — Pulido y Producción *(1 semana)*

- [ ] Centro de notificaciones completo (Realtime en bell icon del header)
- [ ] Búsqueda global tipo command palette (shadcn `cmdk`)
- [ ] Suspense boundaries y skeletons de carga en páginas con datos
- [ ] Lazy loading de imágenes y componentes pesados (FullCalendar, TipTap, react-d3-tree)
- [ ] Revisión de accesibilidad: ARIA labels, navegación por teclado, contraste de colores
- [ ] Responsividad: funcional en tablet (la plataforma es principalmente de escritorio)
- [ ] Error boundaries y páginas de error 404 / 500
- [ ] Documentación de variables de entorno (`.env.example`)
- [ ] Deploy final a Vercel y prueba de producción

**Entregable:** Plataforma completa, accesible, performante y desplegada en Vercel.

---

## 10. Variables de Entorno Necesarias

```env
# Base de datos (Supabase)
DATABASE_URL=postgresql://...
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...   # Solo para operaciones server-side

# Autenticación (Better Auth)
BETTER_AUTH_SECRET=...          # String aleatorio de 32+ chars
BETTER_AUTH_URL=https://oga-web.vercel.app

# IA (Anthropic)
ANTHROPIC_API_KEY=...

# Entorno
NODE_ENV=production
```

---

## 11. Notas de Implementación Importantes

1. **Prompt de extracción IA**: debe nombrar los campos exactamente como aparecen en las planillas tucumanas. Incluir un ejemplo de few-shot en el system message para guiar el formato de salida. Iterar el prompt con planillas reales.

2. **PDFs no descargables**: es un control organizacional, no un DRM técnico. Ninguna solución browser-side es 100% inviolable, pero es suficiente para un entorno de colegas de confianza.

3. **Tablero proyectable**: la ruta `/tablero` debe tener su propio `layout.tsx` sin sidebar ni header. Texto grande, alto contraste, pensado para verse a 3–4 metros de distancia.

4. **Cumpleaños en tiempo real**: el banner de cumpleaños se evalúa como React Server Component en cada navegación, sin necesidad de cron job. La inserción en la tabla `notifications` dispara Supabase Realtime para el bell icon de los usuarios conectados.

5. **Tailwind v4**: la configuración vive en `globals.css` como CSS custom properties, no en `tailwind.config.js`. Usar `@tailwindcss/postcss` en `postcss.config.mjs`.

6. **Colaboración**: usar Vercel Preview Deployments para revisar cambios antes de mergear a `main`. Un feature branch por área.

---

*Documento generado el 01/05/2026.*
