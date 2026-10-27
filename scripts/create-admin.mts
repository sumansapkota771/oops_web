/**
 * Creates (or resets) an admin account.
 *
 *   pnpm admin:create you@gmail.com                      generates a password and prints it once
 *   pnpm admin:create you@gmail.com "Your Name"          sets the display name
 *   pnpm admin:create you@gmail.com "Your Name" Pass1234word   uses the password you give
 *
 * If the email already exists it is made an active admin again and its password is replaced.
 */
import { generatePassword, hashPassword, passwordProblem } from "../src/lib/admin/password.ts";
import { admin, requireEnv } from "./_supabase.mts";

requireEnv();
const [emailArg, nameArg, passArg] = process.argv.slice(2);
const email = emailArg?.trim().toLowerCase();
if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
  console.error('Usage: pnpm admin:create you@gmail.com ["Your Name"] [password]');
  process.exit(1);
}
const password = passArg || generatePassword();
const weak = passwordProblem(password);
if (weak) {
  console.error(`✗ ${weak}`);
  process.exit(1);
}

const db = admin();
const row = {
  email,
  name: nameArg?.trim() || email.split("@")[0],
  role: "admin",
  is_active: true,
  password_hash: await hashPassword(password),
  must_change_password: !passArg,
  failed_attempts: 0,
  locked_until: null,
};
const { data: existing } = await db.from("admin_users").select("id").eq("email", email).maybeSingle();
const { error } = existing ? await db.from("admin_users").update(row).eq("id", existing.id) : await db.from("admin_users").insert(row);
if (error) {
  console.error(`✗ ${error.message}`);
  process.exit(1);
}
console.log(`\n✓ ${existing ? "Updated" : "Created"} admin ${email}`);
if (!passArg) console.log(`  Temporary password: ${password}\n  (shown once — they will be asked to choose their own after signing in)`);
console.log("  Sign in at /admin\n");
