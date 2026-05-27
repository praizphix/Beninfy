export default function SettingsTab() {
  return (
    <section className="bg-surface-container-lowest rounded-2xl p-6 shadow-sm border border-outline-variant max-w-xl mx-auto">
      <h2 className="text-headline-sm mb-2">Settings</h2>
      <p className="text-body-sm text-on-surface-variant mb-6">Notification and account preferences coming soon.</p>
      <ul className="space-y-3">
        <li className="flex items-center gap-3">
          <span className="material-symbols-outlined text-[20px] text-outline-variant">notifications</span>
          <span className="text-label-md">Notifications</span>
          <span className="ml-auto text-xs text-on-surface-variant">(coming soon)</span>
        </li>
        <li className="flex items-center gap-3">
          <span className="material-symbols-outlined text-[20px] text-outline-variant">lock</span>
          <span className="text-label-md">Change password</span>
          <span className="ml-auto text-xs text-on-surface-variant">(coming soon)</span>
        </li>
      </ul>
    </section>
  )
}
