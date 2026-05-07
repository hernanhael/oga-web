"use server";

import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { announcements } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const announcementSchema = z.object({
  title: z.string().min(1, "El título es obligatorio").max(200),
  content: z.any().optional().nullable(),
  type: z.enum(["news", "authority", "event", "birthday"]),
  expiresAt: z.string().nullable().optional(),
  pinned: z.boolean().default(false),
});

async function requireRole(...roles: string[]) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) throw new Error("No autorizado");
  const role = (session.user as Record<string, unknown>).role as string;
  if (!roles.includes(role)) throw new Error("Sin permiso para esta acción");
  return session;
}

export async function createAnnouncement(data: unknown) {
  const session = await requireRole("admin", "supervisor");
  const parsed = announcementSchema.parse(data);

  await db.insert(announcements).values({
    title: parsed.title,
    content: parsed.content ?? null,
    type: parsed.type,
    authorId: session.user.id,
    expiresAt: parsed.expiresAt ? new Date(parsed.expiresAt) : null,
    pinned: parsed.pinned,
  });

  revalidatePath("/noticias");
}

export async function updateAnnouncement(id: string, data: unknown) {
  await requireRole("admin", "supervisor");
  const parsed = announcementSchema.parse(data);

  await db
    .update(announcements)
    .set({
      title: parsed.title,
      content: parsed.content ?? null,
      type: parsed.type,
      expiresAt: parsed.expiresAt ? new Date(parsed.expiresAt) : null,
      pinned: parsed.pinned,
    })
    .where(eq(announcements.id, id));

  revalidatePath("/noticias");
}

export async function deleteAnnouncement(id: string) {
  await requireRole("admin");
  await db.delete(announcements).where(eq(announcements.id, id));
  revalidatePath("/noticias");
}

export async function togglePin(id: string, pinned: boolean) {
  await requireRole("admin", "supervisor");
  await db.update(announcements).set({ pinned }).where(eq(announcements.id, id));
  revalidatePath("/noticias");
}
