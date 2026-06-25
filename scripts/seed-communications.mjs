import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const FIRM_ID = "a1b2c3d4-0000-0000-0000-000000000001";

// Case IDs from seed-cases.mjs
const CASES = [
  { id: "c1000001-0000-0000-0000-000000000001", client: "Maria Johnson", type: "Personal Injury" },
  { id: "c1000001-0000-0000-0000-000000000002", client: "David Chen", type: "Employment Law" },
  { id: "c1000001-0000-0000-0000-000000000003", client: "Sandra Williams", type: "Personal Injury" },
  { id: "c1000001-0000-0000-0000-000000000004", client: "Michael Torres", type: "Tenant Rights" },
  { id: "c1000001-0000-0000-0000-000000000005", client: "Patricia Davis", type: "Medical Malpractice" },
];

function daysAgo(n, offsetHours = 0) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  d.setHours(d.getHours() - offsetHours);
  return d.toISOString();
}

const calls = [
  // Maria Johnson — Personal Injury
  {
    id: "ca000001-0000-0000-0000-000000000001",
    case_id: CASES[0].id,
    firm_id: FIRM_ID,
    direction: "inbound",
    status: "completed",
    duration_seconds: 847,
    started_at: daysAgo(3, 2),
    recording_url: null,
    transcript: "Attorney: Good afternoon, this is Robert Hayes. Client: Hi, I wanted to check on the settlement offer from State Farm. Attorney: We received their initial offer of twelve thousand dollars which is well below your medical specials of forty-five thousand. I have countered at eighty-five thousand. Client: How long will this take? Attorney: Typically two to four weeks for a response. We are in a strong position given the liability and your documented injuries.",
    external_id: "ext-call-001",
  },
  {
    id: "ca000001-0000-0000-0000-000000000002",
    case_id: CASES[0].id,
    firm_id: FIRM_ID,
    direction: "outbound",
    status: "completed",
    duration_seconds: 312,
    started_at: daysAgo(8, 4),
    recording_url: null,
    transcript: "Attorney: Maria, I am calling to confirm we received all your medical records from Miami Orthopedic Center. Client: Yes I dropped them off yesterday. Attorney: Perfect. I also need you to continue your physical therapy for at least another month before we consider finalizing the demand. Client: Okay, I understand.",
    external_id: "ext-call-002",
  },
  {
    id: "ca000001-0000-0000-0000-000000000003",
    case_id: CASES[0].id,
    firm_id: FIRM_ID,
    direction: "inbound",
    status: "missed",
    duration_seconds: null,
    started_at: daysAgo(12),
    recording_url: null,
    transcript: null,
    external_id: "ext-call-003",
  },
  // David Chen — Employment Law
  {
    id: "ca000001-0000-0000-0000-000000000004",
    case_id: CASES[1].id,
    firm_id: FIRM_ID,
    direction: "inbound",
    status: "completed",
    duration_seconds: 1203,
    started_at: daysAgo(2, 1),
    recording_url: null,
    transcript: "Attorney: David, I have reviewed your termination paperwork and the timing is very suspicious. You were let go exactly two weeks after returning from FMLA leave. Client: My manager had been hostile ever since I got back. Attorney: Do you have any written documentation of this? Client: I have emails and a text message where she said my absence put the team behind. Attorney: That is excellent. That kind of direct evidence of animus is exactly what we need to build a strong retaliation claim.",
    external_id: "ext-call-004",
  },
  {
    id: "ca000001-0000-0000-0000-000000000005",
    case_id: CASES[1].id,
    firm_id: FIRM_ID,
    direction: "outbound",
    status: "voicemail",
    duration_seconds: null,
    started_at: daysAgo(5),
    recording_url: null,
    transcript: null,
    external_id: "ext-call-005",
  },
  // Sandra Williams — Personal Injury
  {
    id: "ca000001-0000-0000-0000-000000000006",
    case_id: CASES[2].id,
    firm_id: FIRM_ID,
    direction: "inbound",
    status: "completed",
    duration_seconds: 543,
    started_at: daysAgo(1, 3),
    recording_url: null,
    transcript: "Attorney: Sandra, I wanted to discuss the incident report from Publix. They are claiming there was a wet floor sign visible. Client: There was no sign when I fell. The sign was placed after I was already on the ground, I saw an employee do it. Attorney: Do you recall if there were any other customers nearby who may have witnessed this? Client: Yes, an older gentleman helped me up. I do not have his name but he told the store manager what happened.",
    external_id: "ext-call-006",
  },
  // Michael Torres — Tenant Rights
  {
    id: "ca000001-0000-0000-0000-000000000007",
    case_id: CASES[3].id,
    firm_id: FIRM_ID,
    direction: "outbound",
    status: "completed",
    duration_seconds: 671,
    started_at: daysAgo(4, 6),
    recording_url: null,
    transcript: "Attorney: Michael, I am calling with an update on your habitability case. We sent a formal demand letter to Downtown Apartments and they have retained counsel. Client: What does that mean for me? Attorney: It means they are taking the matter seriously. We are now in a negotiation phase. I expect we can get you out of your lease penalty-free and recover the costs of your temporary lodging. Client: That would be great. The mold is still there, I had to buy air purifiers.",
    external_id: "ext-call-007",
  },
  // Patricia Davis — Medical Malpractice
  {
    id: "ca000001-0000-0000-0000-000000000008",
    case_id: CASES[4].id,
    firm_id: FIRM_ID,
    direction: "inbound",
    status: "completed",
    duration_seconds: 1821,
    started_at: daysAgo(6, 2),
    recording_url: null,
    transcript: "Attorney: Patricia, our expert witness Dr. Hernandez has reviewed your surgical records and confirms the surgical sponge was clearly visible on the post-op imaging taken before discharge. Client: So they knew it was there? Attorney: The imaging is ambiguous enough that they may argue oversight, but Dr. Hernandez will testify that a standard review of the post-op films should have caught this. This is a strong negligence case. Client: How much are we looking at? Attorney: With the additional surgeries, lost wages, and pain and suffering, we are looking at a demand in the seven figure range.",
    external_id: "ext-call-008",
  },
  {
    id: "ca000001-0000-0000-0000-000000000009",
    case_id: CASES[4].id,
    firm_id: FIRM_ID,
    direction: "outbound",
    status: "completed",
    duration_seconds: 428,
    started_at: daysAgo(14, 0),
    recording_url: null,
    transcript: "Attorney: Patricia, I have good news. The hospital's insurance carrier has made an initial contact through defense counsel. Client: Does that mean they want to settle? Attorney: It is too early to say, but they are clearly concerned about liability. I want to schedule a case strategy meeting next week before we respond.",
    external_id: "ext-call-009",
  },
];

const messages = [
  // Maria Johnson
  {
    id: "ms000001-0000-0000-0000-000000000001",
    case_id: CASES[0].id,
    firm_id: FIRM_ID,
    direction: "outbound",
    body: "Hi Maria, just a reminder your PT appointment documents need to be sent to our office by Friday. Please scan and email them to robert@hayeslawfirm.com. — Robert Hayes",
    sent_at: daysAgo(4, 1),
    external_id: "ext-sms-001",
  },
  {
    id: "ms000001-0000-0000-0000-000000000002",
    case_id: CASES[0].id,
    firm_id: FIRM_ID,
    direction: "inbound",
    body: "Hi, will do! I have 3 months of PT records. Can I bring them in person on Thursday?",
    sent_at: daysAgo(4),
    external_id: "ext-sms-002",
  },
  {
    id: "ms000001-0000-0000-0000-000000000003",
    case_id: CASES[0].id,
    firm_id: FIRM_ID,
    direction: "outbound",
    body: "Thursday works great. Office hours are 9am-5pm. Ask for Sarah at the front desk.",
    sent_at: daysAgo(3, 23),
    external_id: "ext-sms-003",
  },
  // David Chen
  {
    id: "ms000001-0000-0000-0000-000000000004",
    case_id: CASES[1].id,
    firm_id: FIRM_ID,
    direction: "outbound",
    body: "David, please forward me all emails from your manager between March and May of this year. Use our secure upload portal.",
    sent_at: daysAgo(2, 5),
    external_id: "ext-sms-004",
  },
  {
    id: "ms000001-0000-0000-0000-000000000005",
    case_id: CASES[1].id,
    firm_id: FIRM_ID,
    direction: "inbound",
    body: "Sent! I also found a performance review from February that shows I was rated \"exceeds expectations\" — would that help?",
    sent_at: daysAgo(2, 4),
    external_id: "ext-sms-005",
  },
  {
    id: "ms000001-0000-0000-0000-000000000006",
    case_id: CASES[1].id,
    firm_id: FIRM_ID,
    direction: "outbound",
    body: "Absolutely — that's very helpful evidence. Upload that too please.",
    sent_at: daysAgo(2, 3),
    external_id: "ext-sms-006",
  },
  // Sandra Williams
  {
    id: "ms000001-0000-0000-0000-000000000007",
    case_id: CASES[2].id,
    firm_id: FIRM_ID,
    direction: "outbound",
    body: "Sandra, do you have any photos from right after the fall? Any pictures of your wrist or the scene at Publix?",
    sent_at: daysAgo(1, 6),
    external_id: "ext-sms-007",
  },
  {
    id: "ms000001-0000-0000-0000-000000000008",
    case_id: CASES[2].id,
    firm_id: FIRM_ID,
    direction: "inbound",
    body: "My daughter took some photos at the hospital. I'll send them now.",
    sent_at: daysAgo(1, 5),
    external_id: "ext-sms-008",
  },
  // Michael Torres
  {
    id: "ms000001-0000-0000-0000-000000000009",
    case_id: CASES[3].id,
    firm_id: FIRM_ID,
    direction: "outbound",
    body: "Michael, please document the mold with photos and timestamps going forward. This will support damages if this goes to litigation.",
    sent_at: daysAgo(5, 2),
    external_id: "ext-sms-009",
  },
  {
    id: "ms000001-0000-0000-0000-000000000010",
    case_id: CASES[3].id,
    firm_id: FIRM_ID,
    direction: "inbound",
    body: "I have photos going back 6 months. The property manager kept saying they would fix it. I have those voicemails too.",
    sent_at: daysAgo(5, 1),
    external_id: "ext-sms-010",
  },
  // Patricia Davis
  {
    id: "ms000001-0000-0000-0000-000000000011",
    case_id: CASES[4].id,
    firm_id: FIRM_ID,
    direction: "outbound",
    body: "Patricia, our expert review is complete. Please call the office to schedule a strategy meeting at your earliest convenience.",
    sent_at: daysAgo(7, 0),
    external_id: "ext-sms-011",
  },
  {
    id: "ms000001-0000-0000-0000-000000000012",
    case_id: CASES[4].id,
    firm_id: FIRM_ID,
    direction: "inbound",
    body: "I can come in Monday or Wednesday morning. Also — I just had my follow-up and the doctor confirmed the scar tissue is permanent.",
    sent_at: daysAgo(6, 22),
    external_id: "ext-sms-012",
  },
];

// AI summaries for completed calls with transcripts
const callSummaries = [
  {
    id: "cs000001-0000-0000-0000-000000000001",
    call_id: "ca000001-0000-0000-0000-000000000001",
    firm_id: FIRM_ID,
    summary_text: "Client called to check on settlement status. State Farm's initial offer of $12,000 was rejected; attorney countered at $85,000 citing $45,000 in medical specials. Client asking about timeline — attorney expects 2-4 week response. Case in strong position due to clear liability and documented injuries.",
    generated_at: daysAgo(3, 1),
  },
  {
    id: "cs000001-0000-0000-0000-000000000002",
    call_id: "ca000001-0000-0000-0000-000000000002",
    firm_id: FIRM_ID,
    summary_text: "Outbound call to confirm receipt of medical records from Miami Orthopedic Center. Attorney advised client to continue physical therapy for at least one more month before finalizing the demand. Client confirmed compliance.",
    generated_at: daysAgo(8, 3),
  },
  {
    id: "cs000001-0000-0000-0000-000000000003",
    call_id: "ca000001-0000-0000-0000-000000000004",
    firm_id: FIRM_ID,
    summary_text: "Client called regarding employment retaliation case. Termination occurred two weeks after FMLA return — classic suspicious timing. Client has strong evidence: emails and a text from manager expressing hostility toward the absence. Attorney confirmed this documentary evidence supports a retaliation claim under FMLA/Title VII.",
    generated_at: daysAgo(2),
  },
  {
    id: "cs000001-0000-0000-0000-000000000004",
    call_id: "ca000001-0000-0000-0000-000000000006",
    firm_id: FIRM_ID,
    summary_text: "Client reported that Publix placed the wet floor sign after her fall, not before — a key fact dispute. She identified a male eyewitness who assisted her and spoke with the store manager. Attorney to follow up on identifying and contacting the witness. Publix's incident report contradicts client's account.",
    generated_at: daysAgo(1, 2),
  },
  {
    id: "cs000001-0000-0000-0000-000000000005",
    call_id: "ca000001-0000-0000-0000-000000000007",
    firm_id: FIRM_ID,
    summary_text: "Update call on habitability case. Downtown Apartments has retained defense counsel, signaling they are taking the claim seriously. Negotiation phase beginning; attorney expects to obtain lease termination without penalty plus reimbursement for temporary lodging expenses. Mold issue ongoing — client purchased air purifiers as mitigation.",
    generated_at: daysAgo(4, 5),
  },
  {
    id: "cs000001-0000-0000-0000-000000000006",
    call_id: "ca000001-0000-0000-0000-000000000008",
    firm_id: FIRM_ID,
    summary_text: "Expert Dr. Hernandez has confirmed the retained surgical sponge was visible on post-operative imaging prior to discharge. Strong negligence case — hospital may argue oversight but expert will testify that standard post-op film review should have detected it. Attorney projecting seven-figure demand based on additional surgeries, lost wages, and pain and suffering.",
    generated_at: daysAgo(6, 1),
  },
  {
    id: "cs000001-0000-0000-0000-000000000007",
    call_id: "ca000001-0000-0000-0000-000000000009",
    firm_id: FIRM_ID,
    summary_text: "Hospital's insurer made initial contact through defense counsel — positive signal that they are concerned about liability. Attorney cautioned against premature settlement discussion. Case strategy meeting to be scheduled before any formal response is sent.",
    generated_at: daysAgo(14),
  },
];

async function seed() {
  console.log("Seeding calls...");
  const { error: callsErr } = await supabase.from("calls").upsert(calls, { onConflict: "external_id" });
  if (callsErr) console.error("Calls error:", callsErr.message);
  else console.log(`  ${calls.length} calls upserted.`);

  console.log("Seeding messages...");
  const { error: msgsErr } = await supabase.from("messages").upsert(messages, { onConflict: "external_id" });
  if (msgsErr) console.error("Messages error:", msgsErr.message);
  else console.log(`  ${messages.length} messages upserted.`);

  console.log("Seeding call summaries...");
  const { error: summaryErr } = await supabase.from("call_summaries").upsert(callSummaries, { onConflict: "id" });
  if (summaryErr) console.error("Call summaries error:", summaryErr.message);
  else console.log(`  ${callSummaries.length} summaries upserted.`);

  console.log("Done.");
}

seed().catch(console.error);
