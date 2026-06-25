// Utility script to set Vercel env vars via REST API (avoids PowerShell piping encoding issues)
// Fill in your credentials before running. Do NOT commit with real values.
const TOKEN = process.env.VERCEL_TOKEN ?? "YOUR_VERCEL_TOKEN";
const PROJECT_ID = process.env.VERCEL_PROJECT_ID ?? "YOUR_PROJECT_ID";
const TEAM_ID = process.env.VERCEL_TEAM_ID ?? "YOUR_TEAM_ID";

const VARS = {
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
  NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "",
  SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY ?? "",
  NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET ?? "",
};

const listRes = await fetch(
  `https://api.vercel.com/v9/projects/${PROJECT_ID}/env?teamId=${TEAM_ID}`,
  { headers: { Authorization: `Bearer ${TOKEN}` } }
);
const listData = await listRes.json();
const allEnvs = listData.envs ?? [];

for (const [key, value] of Object.entries(VARS)) {
  const existing = allEnvs.filter(e => e.key === key);
  for (const env of existing) {
    const delRes = await fetch(
      `https://api.vercel.com/v9/projects/${PROJECT_ID}/env/${env.id}?teamId=${TEAM_ID}`,
      { method: "DELETE", headers: { Authorization: `Bearer ${TOKEN}` } }
    );
    console.log(`Deleted ${key} (${env.id}) status:`, delRes.status);
  }

  const createRes = await fetch(
    `https://api.vercel.com/v10/projects/${PROJECT_ID}/env?teamId=${TEAM_ID}`,
    {
      method: "POST",
      headers: { Authorization: `Bearer ${TOKEN}`, "Content-Type": "application/json" },
      body: JSON.stringify({ key, value, type: "encrypted", target: ["production"] }),
    }
  );
  const createData = await createRes.json();
  console.log(`Created ${key}: status=${createRes.status}`);
}
