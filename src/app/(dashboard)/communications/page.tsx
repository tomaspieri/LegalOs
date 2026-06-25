import { auth } from "@/lib/auth";
import { getCommunicationsByFirm } from "@/lib/queries";
import { CommsFeed } from "@/components/communications/comms-feed";

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
    <div className="flex flex-col min-h-full">
      {/* Page header */}
      <div className="flex items-center justify-between px-4 sm:px-6 py-4 sm:py-5 border-b border-[var(--color-border)] bg-[var(--color-surface)] sticky top-0 z-10">
        <div>
          <h1 className="text-base sm:text-lg font-semibold text-[var(--color-text-primary)]">
            Communications
          </h1>
          <p className="text-xs sm:text-sm text-[var(--color-text-muted)] mt-0.5">
            {total > 0 ? `${total} total` : "All calls and messages"}
          </p>
        </div>
      </div>

      {/* Feed */}
      <div className="flex-1 px-4 sm:px-6 py-6 max-w-[52rem]">
        {items.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-[var(--color-text-muted)] text-sm">No communications yet.</p>
            <p className="text-[var(--color-text-muted)] text-xs mt-1">
              Run the SQL migration and seed script to populate this page.
            </p>
          </div>
        ) : (
          <CommsFeed items={items} total={total} />
        )}
      </div>
    </div>
  );
}
