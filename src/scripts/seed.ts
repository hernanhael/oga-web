/**
 * Seed script: creates initial courts and admin user.
 * Run: npx tsx --env-file=.env.local src/scripts/seed.ts
 */
import { db } from "../lib/db";
import { courts, user as userTable } from "../lib/db/schema";
import { auth } from "../lib/auth";
import { eq } from "drizzle-orm";

async function seed() {
  console.log("Seeding courts...");
  await db
    .insert(courts)
    .values([
      { id: "court-3", number: 3, name: "Juzgado Civil y Comercial N° 3", color: "orange" as const },
      { id: "court-8", number: 8, name: "Juzgado Civil y Comercial N° 8", color: "red" as const },
      { id: "court-13", number: 13, name: "Juzgado Civil y Comercial N° 13", color: "blue" as const },
      { id: "court-14", number: 14, name: "Juzgado Civil y Comercial N° 14", color: "green" as const },
    ])
    .onConflictDoNothing();
  console.log("✓ Courts seeded");

  console.log("Creating admin user...");
  const result = await auth.api.signUpEmail({
    body: {
      name: "Administrador",
      email: "admin@oga.jus.gob.ar",
      password: "Admin1234!",
    },
  });

  if (result?.user) {
    await db
      .update(userTable)
      .set({ role: "admin", isActive: true })
      .where(eq(userTable.id, result.user.id));
    console.log("✓ Admin user: admin@oga.jus.gob.ar / Admin1234!");
  } else {
    console.log("⚠ Admin user may already exist");
  }

  process.exit(0);
}

seed().catch((e) => {
  console.error(e);
  process.exit(1);
});
