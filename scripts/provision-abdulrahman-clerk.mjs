// Create-or-find Abdulrahman's Clerk login (prod LIVE instance).
// Idempotent: prints the Clerk user id (clerkId) on stdout.
//
// Run: CLERK_SECRET_KEY="sk_live_..." node scripts/provision-abdulrahman-clerk.mjs

const SK = process.env.CLERK_SECRET_KEY;
if (!SK) {
  console.error("CLERK_SECRET_KEY missing");
  process.exit(1);
}

const email = "aak22xq8@gmail.com";
const base = "https://api.clerk.com/v1";
const headers = { Authorization: `Bearer ${SK}`, "Content-Type": "application/json" };

async function findByEmail() {
  const res = await fetch(
    `${base}/users?email_address=${encodeURIComponent(email)}`,
    { headers }
  );
  const body = await res.json();
  const list = Array.isArray(body) ? body : body.data;
  return Array.isArray(list) && list.length ? list[0] : null;
}

let user = await findByEmail();
if (!user) {
  const res = await fetch(`${base}/users`, {
    method: "POST",
    headers,
    body: JSON.stringify({
      email_address: [email],
      password: "start@2025",
      first_name: "Abdulrahman",
      last_name: "Alkandari",
      skip_password_checks: true,
    }),
  });
  user = await res.json();
  if (!user.id) {
    console.error("CREATE FAILED:", JSON.stringify(user));
    process.exit(1);
  }
}

console.log(user.id);
