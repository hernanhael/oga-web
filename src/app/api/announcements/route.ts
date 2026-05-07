import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { announcements, user } from "@/lib/db/schema";
import { desc, eq, and, or, isNull, gt } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type");

  const conditions = [
    or(isNull(announcements.expiresAt), gt(announcements.expiresAt, new Date())),
  ];

  if (type && type !== "all") {
    conditions.push(
      eq(announcements.type, type as "news" | "authority" | "event" | "birthday")
    );
  }

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
    .where(and(...conditions))
    .orderBy(desc(announcements.pinned), desc(announcements.createdAt))
    .limit(50);

  return NextResponse.json(rows);
}
