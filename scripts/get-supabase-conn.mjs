import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

const PROJECT_REF = "dnvwqfzbruzyxacopgel";
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Check project status via Supabase Management API
// First test: can we reach the project's REST endpoint?
const healthRes = await fetch(
  `https://${PROJECT_REF}.supabase.co/rest/v1/users?select=email&limit=1`,
  {
    headers: {
      apikey: SERVICE_KEY,
      Authorization: `Bearer ${SERVICE_KEY}`,
    },
  }
);
console.log("REST health status:", healthRes.status);
if (healthRes.ok) {
  const data = await healthRes.json();
  console.log("REST works, sample data:", data);
}

// Try direct connection with different username formats
import postgres from "postgres";

const configs = [
  // Standard pooler format (current Supabase)
  `postgresql://postgres.${PROJECT_REF}:4ZaS6rusOGzocz59@aws-0-us-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true`,
  // Session mode pooler (port 5432)
  `postgresql://postgres.${PROJECT_REF}:4ZaS6rusOGzocz59@aws-0-us-east-1.pooler.supabase.com:5432/postgres`,
  // Old pooler format
  `postgresql://postgres.${PROJECT_REF}:4ZaS6rusOGzocz59@aws-east-1.pooler.supabase.com:6543/postgres`,
];

for (const url of configs) {
  const masked = url.replace(/:[^:@]+@/, ":***@");
  console.log("\nTrying:", masked);
  const sql = postgres(url, { ssl: "require", max: 1, connect_timeout: 5 });
  try {
    const rows = await sql`SELECT email FROM users LIMIT 1`;
    console.log("  ✓ SUCCESS:", rows[0]?.email);
    await sql.end();
    break;
  } catch (err) {
    console.log("  ✗ FAILED:", err.message.split("\n")[0]);
    await sql.end().catch(() => {});
  }
}
