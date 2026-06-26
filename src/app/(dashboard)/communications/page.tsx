import { auth } from "@/lib/auth";
import { getCommunicationsByFirm } from "@/lib/queries";
import { CommsInbox } from "@/components/communications/comms-inbox";

export default async function CommunicationsPage() {
  const session = await auth();
  const firmId = (session?.user as any)?.lawFirmId as string | undefined;

  let items: Awaited<ReturnType<typeof getCommunicationsByFirm>>["items"] = [];
  let total = 0;

  if (firmId) {
    try {
      const result = await getCommunicationsByFirm(firmId, 1, 100);
      items = result.items;
      total = result.total;
    } catch {
      // Tables may not be migrated yet — show empty state
    }
  }

  return (
    <div style={{ height: "100%", overflow: "hidden" }}>
      <CommsInbox items={items} total={total} />
    </div>
  );
}
