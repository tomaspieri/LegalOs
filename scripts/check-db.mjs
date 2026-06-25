import bcrypt from "bcryptjs";
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const { data: users, error } = await supabase
  .from("users")
  .select("id, name, email, password_hash, role, law_firm_id")
  .limit(10);

if (error) {
  console.error("DB error:", error.message);
  process.exit(1);
}

console.log("Users in DB:", users.length);
for (const row of users) {
  console.log({
    email: row.email,
    name: row.name,
    role: row.role,
    hasHash: !!row.password_hash,
    hashPrefix: row.password_hash?.substring(0, 10),
  });
}

const robert = users.find(r => r.email === "robert@hayeslawfirm.com");
console.log("\nRobert's law_firm_id:", robert?.law_firm_id);

if (robert?.law_firm_id) {
  const { data: cases, error: casesErr } = await supabase
    .from("cases")
    .select("id, case_title, pipeline_stage")
    .eq("law_firm_id", robert.law_firm_id);
  console.log("Cases for Robert's firm:", cases?.length ?? 0, casesErr?.message ?? "");
  cases?.forEach(c => console.log(" -", c.case_title, "|", c.pipeline_stage));
}
