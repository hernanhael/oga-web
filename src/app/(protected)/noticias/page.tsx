import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { announcements, user } from "@/lib/db/schema";
import { desc, eq, and, or, isNull, gt, isNotNull, sql } from "drizzle-orm";
import { AnnouncementsFeed } from "@/components/noticias/announcements-feed";
import type { AnnouncementRow } from "@/components/noticias/announcement-card";

async function getBirthdays() {
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const [todayM, todayD] = [today.getMonth() + 1, today.getDate()];
  const [tomorrowM, tomorrowD] = [tomorrow.getMonth() + 1, tomorrow.getDate()];

  const rows = await db
    .select({
      id: user.id,
      name: user.name,
      month: sql<number>`EXTRACT(MONTH FROM ${user.birthdate})`,
      day: sql<number>`EXTRACT(DAY FROM ${user.birthdate})`,
    })
    .from(user)
    .where(
      and(
        isNotNull(user.birthdate),
        eq(user.isActive, true),
        or(
          and(
            sql`EXTRACT(MONTH FROM ${user.birthdate}) = ${todayM}`,
            sql`EXTRACT(DAY FROM ${user.birthdate}) = ${todayD}`
          ),
          and(
            sql`EXTRACT(MONTH FROM ${user.birthdate}) = ${tomorrowM}`,
            sql`EXTRACT(DAY FROM ${user.birthdate}) = ${tomorrowD}`
          )
        )
      )
    );

  return {
    today: rows
      .filter((r) => r.month === todayM && r.day === todayD)
      .map(({ id, name }) => ({ id, name })),
    tomorrow: rows
      .filter((r) => r.month === tomorrowM && r.day === tomorrowD)
      .map(({ id, name }) => ({ id, name })),
  };
}

async function getAnnouncements(): Promise<AnnouncementRow[]> {
  const rows = await db
    .select({
      id: announcements.id,
      title: announcements.title,
      content: announcements.content,
      type: announcements.type,
      authorId: announcements.authorId,
      authorName: user.name,
      publishedAt: announcements.publishedAt,
      expiresAt: announcements.expiresAt,
      pinned: announcements.pinned,
      createdAt: announcements.createdAt,
    })
    .from(announcements)
    .leftJoin(user, eq(announcements.authorId, user.id))
    .where(
      or(isNull(announcements.expiresAt), gt(announcements.expiresAt, new Date()))
    )
    .orderBy(desc(announcements.pinned), desc(announcements.createdAt))
    .limit(50);

  return rows.map((r) => ({
    ...r,
    content: (r.content as Record<string, unknown> | null) ?? null,
  })) as AnnouncementRow[];
}

export default async function NoticiasPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  const role =
    (session?.user as Record<string, unknown>)?.role as string ?? "employee";

  const [initialData, birthdays] = await Promise.all([
    getAnnouncements(),
    getBirthdays(),
  ]);

  return (
    <AnnouncementsFeed
      initialData={initialData}
      userRole={role}
      birthdayToday={birthdays.today}
      birthdayTomorrow={birthdays.tomorrow}
    />
  );
}
