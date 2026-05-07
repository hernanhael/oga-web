/**
 * Seed de anuncios ilustrativos para desarrollo.
 * Run: npx tsx --env-file=.env.local src/scripts/seed-announcements.ts
 */
import { db } from "../lib/db";
import { announcements, user as userTable } from "../lib/db/schema";
import { eq } from "drizzle-orm";

function doc(...content: unknown[]) {
  return { type: "doc", content };
}
function p(text: string) {
  return { type: "paragraph", content: [{ type: "text", text }] };
}
function pBold(text: string) {
  return { type: "paragraph", content: [{ type: "text", text, marks: [{ type: "bold" }] }] };
}
function h2(text: string) {
  return { type: "heading", attrs: { level: 2 }, content: [{ type: "text", text }] };
}
function bullet(...items: string[]) {
  return {
    type: "bulletList",
    content: items.map((text) => ({
      type: "listItem",
      content: [{ type: "paragraph", content: [{ type: "text", text }] }],
    })),
  };
}
function quote(text: string) {
  return { type: "blockquote", content: [p(text)] };
}

async function run() {
  // Buscar admin para asignar como autor
  const [admin] = await db
    .select({ id: userTable.id })
    .from(userTable)
    .where(eq(userTable.role, "admin"))
    .limit(1);

  const authorId = admin?.id ?? null;

  const items = [
    // ── FIJADO ─────────────────────────────────────────────────────────────
    {
      title: "Recordatorio: Sistema de turnos habilitado",
      type: "authority" as const,
      pinned: true,
      content: doc(
        p("Se recuerda a todo el personal que el sistema de reserva de salas está disponible desde el lunes. La reserva mínima es de 30 minutos y la máxima de 4 horas por turno."),
        p("Para cualquier consulta o inconveniente técnico, contactar al área de sistemas."
        )
      ),
    },

    // ── NOVEDADES ──────────────────────────────────────────────────────────
    {
      title: "Bienvenida al nuevo sistema interno de gestión",
      type: "news" as const,
      pinned: false,
      content: doc(
        p("Con gran satisfacción presentamos la plataforma OGA, el sistema interno de gestión para el personal del Poder Judicial de Tucumán."),
        h2("¿Qué incluye?"),
        bullet(
          "Novedades y comunicados en tiempo real",
          "Organigrama interactivo del personal",
          "Calendario de reserva de salas",
          "Tablero de audiencias con extracción por IA",
          "Sección de docencia jurídica y procedimientos"
        ),
        p("Agradecemos a todo el equipo que colaboró en el desarrollo. ¡Bienvenidos!")
      ),
    },
    {
      title: "Actualización del protocolo de gestión documental",
      type: "news" as const,
      pinned: false,
      content: doc(
        p("Se informa que a partir del próximo lunes entra en vigencia el nuevo protocolo de gestión documental aprobado por Resolución N° 142/2025."),
        h2("Principales cambios"),
        bullet(
          "Los escritos electrónicos deben presentarse en formato PDF/A",
          "Los archivos adjuntos no pueden superar los 10 MB por envío",
          "Los acuses de recibo se generarán automáticamente dentro de las 24 hs hábiles"
        ),
        p("El protocolo completo está disponible en la sección de Procedimientos.")
      ),
    },
    {
      title: "Capacitación en expediente electrónico — inscripción abierta",
      type: "news" as const,
      pinned: false,
      content: doc(
        p("Se encuentra abierta la inscripción para la capacitación en el módulo de expediente electrónico del Sistema de Gestión Judicial."),
        p("Las clases se dictarán los miércoles de 14:00 a 16:00 hs durante el mes de junio. Cupos limitados.")
      ),
    },

    // ── COMUNICADOS ────────────────────────────────────────────────────────
    {
      title: "Comunicado: Feria judicial — julio 2025",
      type: "authority" as const,
      pinned: false,
      expiresAt: new Date("2025-08-01"),
      content: doc(
        quote("Resolución del Superior Tribunal de Justicia de Tucumán — Mayo 2025"),
        p("Se comunica que la feria judicial de invierno se extenderá del 14 al 25 de julio de 2025, inclusive."),
        p("Durante ese período, únicamente funcionarán los juzgados y tribunales de turno según el cronograma publicado en la web del Poder Judicial.")
      ),
    },
    {
      title: "Instrucción: uso obligatorio de firma digital",
      type: "authority" as const,
      pinned: false,
      content: doc(
        pBold("A partir del 1° de junio de 2025 será obligatorio el uso de firma digital certificada para todos los escritos presentados ante los juzgados de esta Oficina."),
        p("Los certificados pueden gestionarse ante el Departamento de Informática del Poder Judicial, de lunes a viernes de 8:00 a 13:00 hs."),
        p("Se adjunta guía de instalación en la sección de Procedimientos.")
      ),
    },

    // ── EVENTOS ────────────────────────────────────────────────────────────
    {
      title: "Jornada de mediación — miércoles 21 de mayo",
      type: "event" as const,
      pinned: false,
      expiresAt: new Date("2025-05-22"),
      content: doc(
        p("El Centro Judicial de Mediación organiza una jornada abierta sobre técnicas de resolución alternativa de conflictos."),
        h2("Programa"),
        bullet(
          "9:00 hs — Apertura institucional",
          "9:30 hs — Conferencia: «Mediación familiar en el contexto judicial actual»",
          "11:00 hs — Mesa redonda con mediadores del fuero civil",
          "13:00 hs — Cierre y certificados de asistencia"
        ),
        p("Lugar: Salón de Actos del Palacio de Justicia, 2° piso. Entrada libre y gratuita.")
      ),
    },
    {
      title: "Torneo de fútbol 5 — Equipos Poder Judicial",
      type: "event" as const,
      pinned: false,
      content: doc(
        p("Organizamos el primer torneo interárea de fútbol 5 del año. ¡Anotá tu equipo!"),
        bullet(
          "Equipos de 5 jugadores (mixtos permitidos)",
          "Inscripción hasta el viernes 16 de mayo",
          "Primera fecha: sábado 24 de mayo, 10:00 hs",
          "Cancha: complejo deportivo del Poder Judicial"
        ),
        p("Contactar a Recursos Humanos para inscribir el equipo.")
      ),
    },

    // ── CUMPLEAÑOS ─────────────────────────────────────────────────────────
    {
      title: "Feliz cumpleaños, Lic. Patricia Molina",
      type: "birthday" as const,
      pinned: false,
      content: doc(
        p("Todo el equipo de la Oficina de Gestión Asociada le desea un muy feliz cumpleaños a nuestra jefa de despacho, Lic. Patricia Molina."),
        p("¡Muchas gracias por tu dedicación y compromiso de siempre! 🎂")
      ),
    },
  ];

  console.log(`Insertando ${items.length} anuncios...`);

  for (const item of items) {
    await db.insert(announcements).values({
      title: item.title,
      type: item.type,
      content: item.content,
      authorId,
      pinned: item.pinned,
      expiresAt: item.expiresAt ?? null,
    });
    console.log(`  ✓ [${item.type}] ${item.title}`);
  }

  console.log("\nListo.");
  process.exit(0);
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
