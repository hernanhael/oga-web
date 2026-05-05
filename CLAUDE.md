# OGA-Web — Oficina de Gestión Asociada Civil y Comercial N° 3

Plataforma web interna para empleados del Poder Judicial de Tucumán. Acceso restringido (sin registro público). Desplegada en Vercel.

## Stack

- **Framework**: Next.js 15 (App Router, TypeScript, `/src` dir)
- **Base de datos**: PostgreSQL vía Supabase + Drizzle ORM
- **Auth**: Better Auth (roles, sesión en DB, sin OAuth)
- **IA**: @anthropic-ai/sdk — Claude claude-sonnet-4-6 con vision para extracción de audiencias
- **Tiempo real**: Supabase Realtime (WebSockets sobre CDC de Postgres)
- **Estilos**: Tailwind CSS v4 + shadcn/ui (CSS variables, tema pastel)
- **Calendario**: FullCalendar 6 (ResourceTimeGrid para salas)
- **Organigrama**: react-d3-tree (árbol interactivo con nodos React)
- **Contenido rico**: TipTap (editor + visor, JSON almacenado en DB)
- **PDF viewer**: @react-pdf-viewer (descarga deshabilitada, URLs firmadas)
- **Estado UI**: Zustand; **Estado servidor**: TanStack Query
- **Animaciones**: Framer Motion; **Toasts**: sonner
- **Formularios**: react-hook-form + zod

## Comandos

```bash
npm run dev          # Servidor de desarrollo
npm run build        # Build de producción
npm run lint         # ESLint
npx drizzle-kit push # Aplicar cambios de schema a la DB
npx drizzle-kit studio # Explorador visual de la DB
```

## Estructura

```
src/
  app/
    (auth)/login/
    (protected)/
      layout.tsx          # Shell: sidebar, header, tema, Realtime, check cumpleaños
      noticias/           # Área 1 — Novedades y comunicados
      organigrama/        # Área 2 — Árbol de empleados
      agenda/
        calendario/       # Área 3a — Reserva de salas
        tablero/          # Área 3b — Tablero semanal (proyectable)
      educacion/          # Área 4 — Docencia jurídica
      procedimientos/     # Área 5 — Guías y quizzes
    api/
      auth/[...all]/      # Better Auth handler
      hearings/extract/   # Claude vision: foto → JSON de audiencias
  components/ui/          # shadcn (copiados al repo, no son dependencia)
  lib/
    db/schema.ts          # Drizzle schema — fuente de verdad del modelo de datos
    db/index.ts           # Conexión Drizzle
    auth.ts               # Configuración Better Auth + roles
    supabase.ts           # Cliente Supabase (Realtime + Storage)
    utils.ts              # cn() helper
  stores/                 # Zustand stores (tema, filtros, sidebar)
```

## Roles de usuario

```
admin      → todo: usuarios, comunicados, organigrama, audiencias, contenido
supervisor → comunicados, reservas, audiencias, lectura total
employee   → lectura total, reservas propias
readonly   → solo lectura
```

Middleware en `src/middleware.ts` protege todas las rutas bajo `(protected)/`.

## Juzgados y colores

| Juzgado | Color | CSS var |
|---------|-------|---------|
| 3 | Naranja | `--court-orange` |
| 8 | Rojo | `--court-red` |
| 13 | Azul | `--court-blue` |
| 14 | Verde | `--court-green` |

Todos los colores son pastel. Usar en calendarios, tablero y organigrama para identificación visual rápida.

## Diseño

- Tema claro: fondo papel viejo (`hsl(40 30% 97%)`), texto gris azulado oscuro
- Tema oscuro: gris oscuro (`hsl(220 15% 12%)`), texto blanco cálido
- Tailwind v4: configuración en `globals.css` (CSS custom properties), sin `tailwind.config.js`
- Botones shadcn: fill pastel + `border-2 border-current` (borde pronunciado)
- `next-themes` para toggle claro/oscuro sin flash

## Funcionalidades críticas

### Extracción de audiencias por IA (Área 3b)
Ruta: `src/app/api/hearings/extract/route.ts`
- Usuario sube foto de planilla papel
- `browser-image-compression` comprime la imagen antes de enviar
- Claude claude-sonnet-4-6 extrae: hora, modalidad, tipo, nº expediente, audiencista, funcionario, juez
- Prompt en español rioplatense; `cache_control: ephemeral` en system message
- Zod valida la respuesta → UI de revisión → Server Action guarda en DB
- El tablero proyectable vive en `/tablero` (layout sin chrome de navegación)

### Cumpleaños
- Check server-side en `(protected)/layout.tsx` en cada navegación
- Consulta empleados con cumpleaños hoy y mañana
- Banner animado (Framer Motion) en Área 1
- Inserta en tabla `notifications` para el historial del bell icon

### PDFs no descargables
- `@react-pdf-viewer/toolbar` con botón de descarga removido
- Supabase Storage sirve con signed URLs que expiran en 1 hora
- Interceptar `onContextMenu` y Ctrl+S en el contenedor del visor

### Tablero proyectable
- Ruta `/tablero` con layout propio (sin sidebar ni header)
- Texto grande, optimizado para verse desde lejos en pared
- Fondo de cada audiencia = color pastel del juzgado correspondiente
- `/tablero/admin` para la carga con IA (requiere rol supervisor o admin)

## Roadmap

1. **Fase 0** — Fundación: Next.js, Tailwind, shadcn, Better Auth, Drizzle, shell de la app
2. **Fase 1** — Área 1: Noticias, comunicados, cumpleaños, Realtime
3. **Fase 2** — Área 2: Organigrama react-d3-tree, perfiles, fotos
4. **Fase 3** — Área 3a: Calendario FullCalendar, reservas, conflictos, Realtime
5. **Fase 4** — Área 3b: Tablero IA, extracción Claude, vista proyectable
6. **Fase 5** — Área 4: Docencia jurídica, TipTap, PDF viewer, búsqueda Postgres
7. **Fase 6** — Área 5: Guías, atajos de teclado, quizzes
8. **Fase 7** — Producción: notificaciones, búsqueda global, performance, deploy Vercel
