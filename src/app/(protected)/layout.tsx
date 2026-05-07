import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { notifications, user } from "@/lib/db/schema";
import { and, eq, gte, isNotNull, sql } from "drizzle-orm";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";

async function checkAndCreateBirthdayNotifications(userId: string) {
  const today = new Date();
  const [m, d] = [today.getMonth() + 1, today.getDate()];

  const birthdayUsers = await db
    .select({ id: user.id, name: user.name })
    .from(user)
    .where(
      and(
        isNotNull(user.birthdate),
        eq(user.isActive, true),
        sql`EXTRACT(MONTH FROM ${user.birthdate}) = ${m}`,
        sql`EXTRACT(DAY FROM ${user.birthdate}) = ${d}`
      )
    );

  if (birthdayUsers.length === 0) return;

  const todayStart = new Date(today);
  todayStart.setHours(0, 0, 0, 0);

  const existing = await db
    .select({ relatedId: notifications.relatedId })
    .from(notifications)
    .where(
      and(
        eq(notifications.userId, userId),
        eq(notifications.type, "birthday"),
        gte(notifications.createdAt, todayStart)
      )
    );

  const existingIds = new Set(existing.map((n) => n.relatedId));

  const toCreate = birthdayUsers.filter((u) => !existingIds.has(u.id));

  for (const bUser of toCreate) {
    await db.insert(notifications).values({
      userId,
      type: "birthday",
      message: `Hoy es el cumpleaños de ${bUser.name} 🎂`,
      relatedId: bUser.id,
      relatedType: "user",
    });
  }
}

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/login");
  }

  // Fire-and-forget: create birthday notifications without blocking render
  checkAndCreateBirthdayNotifications(session.user.id).catch(() => null);

  const role =
    (session.user as Record<string, unknown>).role as string ?? "employee";

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar />
      <div className="flex flex-1 flex-col min-w-0">
        <Header
          user={{
            id: session.user.id,
            name: session.user.name,
            email: session.user.email,
            role,
            photoUrl: (session.user as Record<string, unknown>).photoUrl as
              | string
              | null
              | undefined,
          }}
        />
        <main className="flex-1 overflow-y-auto">
          <div className="p-6">{children}</div>
        </main>
      </div>
    </div>
  );
}
