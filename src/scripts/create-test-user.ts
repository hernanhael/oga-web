import { db } from "../lib/db";
import { user as userTable } from "../lib/db/schema";
import { auth } from "../lib/auth";
import { eq } from "drizzle-orm";

async function run() {
  const users = [
    { name: "María González", email: "empleada@oga.jus.gob.ar", password: "Empleada1234!", role: "employee" as const },
    { name: "Carlos Supervisor", email: "supervisor@oga.jus.gob.ar", password: "Super1234!", role: "supervisor" as const },
  ];

  for (const u of users) {
    const result = await auth.api.signUpEmail({ body: { name: u.name, email: u.email, password: u.password } });
    if (result?.user) {
      await db.update(userTable).set({ role: u.role, isActive: true }).where(eq(userTable.id, result.user.id));
      console.log(`✓ ${u.role.padEnd(12)} ${u.email}  /  ${u.password}`);
    } else {
      console.log(`⚠ Ya existe: ${u.email}`);
    }
  }

  process.exit(0);
}

run().catch((e) => { console.error(e); process.exit(1); });
