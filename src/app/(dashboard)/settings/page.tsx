export default function SettingsPage() {
  return (
    <div className="max-w-[42rem] mx-auto px-4 sm:px-6 py-6">
      <div className="mb-8">
        <h1 className="text-lg font-semibold text-[var(--color-text-primary)]">
          Settings
        </h1>
        <p className="text-sm text-[var(--color-text-muted)] mt-0.5">
          Manage your account and firm settings
        </p>
      </div>

      <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-lg)] divide-y divide-[var(--color-border)]">
        {/* Gmail */}
        <div className="p-5 flex items-center justify-between gap-4">
          <div>
            <h3 className="text-sm font-medium text-[var(--color-text-primary)]">
              Gmail Integration
            </h3>
            <p className="text-sm text-[var(--color-text-muted)] mt-0.5">
              Connect your Gmail account to manage email from LegalOS
            </p>
          </div>
          <span className="text-xs bg-[var(--color-surface-2)] text-[var(--color-text-muted)] px-2.5 py-1 rounded-full font-medium flex-shrink-0">
            Coming soon
          </span>
        </div>

        {/* Users */}
        <div className="p-5 flex items-center justify-between gap-4">
          <div>
            <h3 className="text-sm font-medium text-[var(--color-text-primary)]">
              Team Members
            </h3>
            <p className="text-sm text-[var(--color-text-muted)] mt-0.5">
              Manage access for attorneys and staff
            </p>
          </div>
          <span className="text-xs bg-[var(--color-surface-2)] text-[var(--color-text-muted)] px-2.5 py-1 rounded-full font-medium flex-shrink-0">
            Coming soon
          </span>
        </div>

        {/* Data migration */}
        <div className="p-5 flex items-center justify-between gap-4">
          <div>
            <h3 className="text-sm font-medium text-[var(--color-text-primary)]">
              Data Migration
            </h3>
            <p className="text-sm text-[var(--color-text-muted)] mt-0.5">
              Import historical data from Notion and Quo
            </p>
          </div>
          <span className="text-xs bg-[var(--color-surface-2)] text-[var(--color-text-muted)] px-2.5 py-1 rounded-full font-medium flex-shrink-0">
            Coming soon
          </span>
        </div>
      </div>
    </div>
  );
}
