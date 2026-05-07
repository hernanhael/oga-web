# OGA-Web — Oficina de Gestión Asociada Civil y Comercial N° 3

Plataforma web interna para empleados del Poder Judicial de Tucumán. Acceso restringido (sin registro público). Desplegada en Vercel.

## Stack

- **Framework**: Next.js 16.2.4 (App Router, TypeScript, `/src` dir)
- **Base de datos**: PostgreSQL — Neon (desarrollo) / Supabase (producción) + Drizzle ORM
- **Auth**: Better Auth (roles, sesión en DB, sin OAuth)
- **IA**: @anthropic-ai/sdk — Claude claude-sonnet-4-6 con vision para extracción de audiencias
- **Tiempo real**: Supabase Realtime (WebSockets sobre CDC de Postgres)
- **Estilos**: Tailwind CSS v4 + shadcn/ui 4.6 — usa `@base-ui/react` (NO Radix UI). `DropdownMenuTrigger` no soporta `asChild`.
- **Calendario**: FullCalendar 6 (ResourceTimeGrid para salas)
- **Organigrama**: react-d3-tree (árbol interactivo con nodos React)
- **Contenido rico**: TipTap v3 (editor + visor, JSON almacenado en DB). Requiere `immediatelyRender: false` en SSR.
- **PDF viewer**: @react-pdf-viewer (descarga deshabilitada, URLs firmadas)
- **Estado UI**: Zustand; **Estado servidor**: TanStack Query
- **Animaciones**: Framer Motion; **Toasts**: sonner
- **Formularios**: react-hook-form + zod

## Comandos

```bash
npm run dev                                                    # Servidor de desarrollo
npm run build                                                  # Build de producción
npm run lint                                                   # ESLint
npx drizzle-kit push                                           # Aplicar cambios de schema a la DB
npx drizzle-kit studio                                         # Explorador visual de la DB
npx tsx --env-file=.env.local src/scripts/seed.ts              # Seed inicial (juzgados + admin)
npx tsx --env-file=.env.local src/scripts/seed-announcements.ts # Datos de prueba para Área 1
npx tsx --env-file=.env.local src/scripts/create-test-user.ts  # Crea usuarios employee + supervisor
```

## Estructura

```
src/
  app/
    (auth)/login/
    (protected)/
      layout.tsx          # Shell: sidebar, header, tema, check cumpleaños (fire-and-forget)
      noticias/
        page.tsx          # Área 1 — SSR: fetch anuncios + cumpleaños → AnnouncementsFeed
        actions.ts        # Server Actions: createAnnouncement, updateAnnouncement, deleteAnnouncement, togglePin
      organigrama/        # Área 2 — Árbol de empleados (pendiente)
      agenda/
        calendario/       # Área 3a — Reserva de salas (pendiente)
        tablero/          # Área 3b — Tablero semanal proyectable (pendiente)
      educacion/          # Área 4 — Docencia jurídica (pendiente)
      procedimientos/     # Área 5 — Guías y quizzes (pendiente)
    api/
      auth/[...all]/      # Better Auth handler
      announcements/      # GET /api/announcements?type=<tipo> — lista con filtro y expiración
      notifications/
        route.ts          # GET /api/notifications — últimas 30 del usuario
        [id]/route.ts     # PATCH /api/notifications/[id] — marcar como leída
      hearings/extract/   # Claude vision: foto → JSON de audiencias (pendiente)
  components/
    layout/
      sidebar.tsx         # Navegación lateral
      header.tsx          # Header con toggle de tema + NotificationBell + user menu
      notification-bell.tsx # Campana con badge de no leídas, dropdown, marcar todo leído
    noticias/
      announcements-feed.tsx  # Feed client: tabs, Supabase Realtime, TanStack Query
      announcement-card.tsx   # Card con TypeBadge + TiptapViewer + dropdown de acciones
      announcement-dialog.tsx # Sheet lateral create/edit (react-hook-form + TipTap)
      birthday-banner.tsx     # Banner animado Framer Motion (OKLCH, descartable)
      tiptap-editor.tsx       # Editor TipTap con toolbar (bold, italic, h2, listas, cita)
      tiptap-viewer.tsx       # Visor TipTap read-only (immediatelyRender: false)
      type-badge.tsx          # Badge coloreado por tipo (news/authority/event/birthday)
    ui/                   # shadcn (copiados al repo, no son dependencia)
    providers.tsx         # QueryClientProvider + ThemeProvider + Toaster
  lib/
    db/schema.ts          # Drizzle schema — fuente de verdad del modelo de datos
    db/index.ts           # Conexión Drizzle
    auth.ts               # Configuración Better Auth + roles
    auth-client.ts        # Cliente Better Auth (browser)
    supabase.ts           # Cliente Supabase — nullable si NEXT_PUBLIC_SUPABASE_URL no está configurado
    utils.ts              # cn() helper
  stores/
    ui-store.ts           # Zustand (tema, filtros, sidebar)
  scripts/
    seed.ts               # Seed inicial: 4 juzgados + admin
    seed-announcements.ts # 9 anuncios de prueba para Área 1
    create-test-user.ts   # Crea users employee y supervisor para testing
  proxy.ts                # Middleware de Next.js 16 (protección de rutas por rol)
```

## Roles de usuario

```
admin      → todo: usuarios, comunicados, organigrama, audiencias, contenido
supervisor → comunicados, reservas, audiencias, lectura total
employee   → lectura total, reservas propias
readonly   → solo lectura
```

Protección de rutas en `src/proxy.ts` (Next.js 16 renombró middleware.ts → proxy.ts, export `proxy` en lugar de `middleware`).

## Juzgados y colores

| Juzgado | Color | CSS var |
|---------|-------|---------|
| 3 | Naranja | `--court-orange` |
| 8 | Rojo | `--court-red` |
| 13 | Azul | `--court-blue` |
| 14 | Verde | `--court-green` |

Todos los colores son pastel. Usar en calendarios, tablero y organigrama para identificación visual rápida.

## Diseño

- Tema claro: fondo papel viejo (`oklch(0.971 0.011 90)`), texto gris azulado oscuro (`oklch(0.237 0.031 257)`)
- Tema oscuro: gris oscuro (`oklch(0.143 0.021 257)`), texto blanco cálido (`oklch(0.945 0.008 91)`)
- Colores en espacio OKLCH (mejor uniformidad perceptual que HSL)
- Tailwind v4: configuración en `globals.css` (CSS custom properties), sin `tailwind.config.js`
- Botones shadcn: fill pastel + `border-2 border-current` (borde pronunciado)
- `next-themes` para toggle claro/oscuro sin flash

## Patrones de implementación

### Server Actions + TanStack Query
- Las mutaciones usan Server Actions (`"use server"`) con revalidatePath
- El fetch inicial es SSR (Server Component pasa `initialData` a TanStack Query)
- El cliente refresca vía `queryClient.invalidateQueries` después de cada acción
- Las API routes (`/api/*`) sirven para el queryFn de TanStack Query en el cliente

### Supabase Realtime
- El cliente Supabase (`src/lib/supabase.ts`) es **nullable**: si `NEXT_PUBLIC_SUPABASE_URL` no está configurado, devuelve `null` y el Realtime se omite silenciosamente
- Las suscripciones siempre incluyen un guard: `if (!supabase) return;`
- En el feed de anuncios: `postgres_changes` sobre `announcements` → `invalidateQueries`

### TipTap v3
- Siempre pasar `immediatelyRender: false` en `useEditor` para evitar hydration mismatch en SSR
- El JSON de TipTap se almacena directamente en columnas `json` de Drizzle
- `TiptapEditor` para create/edit, `TiptapViewer` para lectura (editable: false)
- Estilos del contenido en `.tiptap-content` en `globals.css` (sin @tailwindcss/typography)

### Cumpleaños
- El layout protected hace el check con `EXTRACT(MONTH/DAY FROM birthdate)` en cada navegación
- La creación de notificaciones es **fire-and-forget** (no bloquea el render del layout)
- La page de `/noticias` hace su propia query de cumpleaños para el banner (independiente del layout)
- Deduplicación: chequea si ya existe una notificación de tipo `birthday` con el mismo `relatedId` creada hoy

## Funcionalidades críticas implementadas

### Área 1 — Novedades y Comunicados ✅
- Feed filtrable por tipo: Todos / Novedades / Comunicados / Eventos / Cumpleaños
- CRUD completo: admin/supervisor pueden crear y editar; solo admin puede eliminar
- Fijar anuncios (pinned): aparecen primero con ring visual
- Vencimiento automático: anuncios con `expiresAt` pasado no aparecen en el feed
- Editor TipTap con toolbar: negrita, cursiva, h2, listas, cita
- Banner de cumpleaños animado (hoy + mañana) con Framer Motion y colores OKLCH
- Campana de notificaciones: badge de no leídas, dropdown con historial, marcar todo leído
- Realtime: Supabase CDC sobre tabla `announcements` → invalidación de cache automática

### Extracción de audiencias por IA (Área 3b — pendiente)
Ruta: `src/app/api/hearings/extract/route.ts`
- Usuario sube foto de planilla papel
- `browser-image-compression` comprime la imagen antes de enviar
- Claude claude-sonnet-4-6 extrae: hora, modalidad, tipo, nº expediente, audiencista, funcionario, juez
- Prompt en español rioplatense; `cache_control: ephemeral` en system message
- Zod valida la respuesta → UI de revisión → Server Action guarda en DB
- El tablero proyectable vive en `/tablero` (layout sin chrome de navegación)

### PDFs no descargables (Área 4 — pendiente)
- `@react-pdf-viewer/toolbar` con botón de descarga removido
- Supabase Storage sirve con signed URLs que expiran en 1 hora
- Interceptar `onContextMenu` y Ctrl+S en el contenedor del visor

### Tablero proyectable (Área 3b — pendiente)
- Ruta `/tablero` con layout propio (sin sidebar ni header)
- Texto grande, optimizado para verse desde lejos en pared
- Fondo de cada audiencia = color pastel del juzgado correspondiente
- `/tablero/admin` para la carga con IA (requiere rol supervisor o admin)

## Roadmap

1. ✅ **Fase 0** — Fundación: Next.js 16, Tailwind v4, shadcn, Better Auth, Drizzle, shell de la app
2. ✅ **Fase 1** — Área 1: Feed de anuncios, TipTap, cumpleaños, Realtime, campana de notificaciones
3. **Fase 2** — Área 2: Organigrama react-d3-tree, perfiles, fotos, gestión de usuarios
4. **Fase 3** — Área 3a: Calendario FullCalendar, reservas de salas, conflictos, Realtime
5. **Fase 4** — Área 3b: Tablero IA, extracción Claude, vista proyectable
6. **Fase 5** — Área 4: Docencia jurídica, PDF viewer, búsqueda Postgres
7. **Fase 6** — Área 5: Guías, atajos de teclado, quizzes
8. **Fase 7** — Producción: búsqueda global, performance, deploy Vercel
