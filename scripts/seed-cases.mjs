import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const LAW_FIRM_ID = "a1b2c3d4-0000-0000-0000-000000000001";

// Get user IDs
const { data: users } = await supabase.from("users").select("id, name, email").eq("law_firm_id", LAW_FIRM_ID);
console.log("Users:", users?.map(u => `${u.name} (${u.id})`));

const robert = users?.find(u => u.email === "robert@hayeslawfirm.com");
const sarah = users?.find(u => u.email === "sarah@hayeslawfirm.com");
const mike = users?.find(u => u.email === "mike@hayeslawfirm.com");

const now = new Date().toISOString();

const cases = [
  {
    id: "c1000001-0000-0000-0000-000000000001",
    law_firm_id: LAW_FIRM_ID,
    assigned_to_id: robert?.id,
    client_name: "Maria Johnson",
    client_email: "maria.johnson@email.com",
    client_phone: "+1 (555) 201-0001",
    case_title: "Johnson v. State Farm — Auto Accident",
    case_type: "Personal Injury",
    pipeline_stage: "case_management",
    sort_order: 0,
    notes: "Client was rear-ended at intersection. Medical bills ~$45k.",
    created_at: now,
    updated_at: now,
  },
  {
    id: "c1000001-0000-0000-0000-000000000002",
    law_firm_id: LAW_FIRM_ID,
    assigned_to_id: sarah?.id,
    client_name: "David Chen",
    client_email: "d.chen@email.com",
    client_phone: "+1 (555) 201-0002",
    case_title: "Chen Employment Discrimination",
    case_type: "Employment Law",
    pipeline_stage: "retainer_sent",
    sort_order: 0,
    notes: "Wrongful termination after medical leave.",
    created_at: now,
    updated_at: now,
  },
  {
    id: "c1000001-0000-0000-0000-000000000003",
    law_firm_id: LAW_FIRM_ID,
    assigned_to_id: mike?.id,
    client_name: "Sandra Williams",
    client_email: "s.williams@email.com",
    client_phone: "+1 (555) 201-0003",
    case_title: "Williams Slip & Fall — Grocery Store",
    case_type: "Personal Injury",
    pipeline_stage: "new_lead",
    sort_order: 0,
    notes: "Fell in wet aisle, broken wrist. Store denied liability.",
    created_at: now,
    updated_at: now,
  },
  {
    id: "c1000001-0000-0000-0000-000000000004",
    law_firm_id: LAW_FIRM_ID,
    assigned_to_id: robert?.id,
    client_name: "Michael Torres",
    client_email: "m.torres@email.com",
    client_phone: "+1 (555) 201-0004",
    case_title: "Torres v. Downtown Apartments — Habitability",
    case_type: "Tenant Rights",
    pipeline_stage: "case_evaluation",
    sort_order: 0,
    notes: "Mold issue in apartment, landlord unresponsive for 6 months.",
    created_at: now,
    updated_at: now,
  },
  {
    id: "c1000001-0000-0000-0000-000000000005",
    law_firm_id: LAW_FIRM_ID,
    assigned_to_id: sarah?.id,
    client_name: "Patricia Davis",
    client_email: "p.davis@email.com",
    client_phone: "+1 (555) 201-0005",
    case_title: "Davis Medical Malpractice — Surgery Error",
    case_type: "Medical Malpractice",
    pipeline_stage: "litigation",
    sort_order: 0,
    notes: "Surgeon left surgical sponge post-op. Expert witness secured.",
    created_at: now,
    updated_at: now,
  },
];

const { data, error } = await supabase.from("cases").upsert(cases);
if (error) {
  console.error("Error seeding cases:", error.message);
} else {
  console.log(`Seeded ${cases.length} cases successfully.`);
}

// Also add a timeline event for the first case
const { error: tlErr } = await supabase.from("timeline_events").upsert([
  {
    id: "a1000001-0000-0000-0000-000000000001",
    case_id: "c1000001-0000-0000-0000-000000000001",
    author_id: robert?.id,
    type: "note",
    content: "Initial consultation completed. Client has medical records from 3 providers. Moving to case management phase.",
    occurred_at: now,
    created_at: now,
  },
  {
    id: "a1000001-0000-0000-0000-000000000002",
    case_id: "c1000001-0000-0000-0000-000000000001",
    author_id: sarah?.id,
    type: "call",
    content: "Called State Farm adjuster. They are offering $12k — well below medical bills. Rejected.",
    occurred_at: new Date(Date.now() - 86400000).toISOString(),
    created_at: new Date(Date.now() - 86400000).toISOString(),
  },
]);
if (tlErr) console.error("Timeline error:", tlErr.message);
else console.log("Timeline events seeded.");
