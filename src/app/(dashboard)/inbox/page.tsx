import { Mail } from "lucide-react";

export default function InboxPage() {
  return (
    <div className="flex flex-col h-full">
      <div className="px-6 py-5 border-b border-[var(--color-border)] bg-[var(--color-surface)]">
        <h1 className="text-lg font-semibold text-[var(--color-text-primary)]">
          Inbox
        </h1>
        <p className="text-sm text-[var(--color-text-muted)] mt-0.5">
          Connect Gmail to read and send emails from this app
        </p>
      </div>

      <div className="flex-1 flex items-center justify-center px-4">
        <div className="text-center max-w-[384px]">
          <div className="w-14 h-14 rounded-full bg-[var(--color-surface-2)] border border-[var(--color-border)] flex items-center justify-center mx-auto mb-4">
            <Mail size={24} className="text-[var(--color-text-muted)]" />
          </div>
          <h2 className="text-base font-semibold text-[var(--color-text-primary)] mb-2">
            Gmail not connected
          </h2>
          <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed">
            Connect your Gmail account from Settings to read your inbox and send emails directly from LegalOS. Emails will be automatically linked to the matching client case.
          </p>
        </div>
      </div>
    </div>
  );
}
