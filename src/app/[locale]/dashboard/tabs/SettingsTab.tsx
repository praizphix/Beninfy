export default function SettingsTab() {
  return (
    <section className="mx-auto max-w-2xl overflow-hidden rounded-2xl border border-white/70 bg-white shadow-[0_16px_45px_rgba(62,0,76,0.08)]">
      <div className="border-b border-gray-100 bg-[#fbf7fc] px-5 py-5 sm:px-6">
        <div className="flex items-center gap-3">
          <span className="material-symbols-outlined flex h-11 w-11 items-center justify-center rounded-xl bg-[#3e004c] text-[22px] text-[#f4d66c]">settings</span>
          <div>
            <h2 className="text-xl font-bold text-[#3e004c]">Settings</h2>
            <p className="mt-1 text-sm text-gray-500">Notification and account preferences.</p>
          </div>
        </div>
      </div>
      <div className="space-y-3 p-5 sm:p-6">
        {[
          { icon: 'notifications', label: 'Notifications', desc: 'Trip reminders and support updates' },
          { icon: 'lock', label: 'Change password', desc: 'Password controls are coming soon' },
        ].map((item) => (
          <div key={item.label} className="flex items-center gap-3 rounded-2xl border border-[#eaddec] bg-[#fbf7fc] p-4">
            <span className="material-symbols-outlined flex h-10 w-10 items-center justify-center rounded-xl bg-white text-[20px] text-[#7b3f89] shadow-sm">{item.icon}</span>
            <span className="min-w-0 flex-1">
              <span className="block text-sm font-semibold text-gray-900">{item.label}</span>
              <span className="block text-xs text-gray-500">{item.desc}</span>
            </span>
            <span className="rounded-full bg-white px-2.5 py-1 text-xs font-semibold text-gray-400">Soon</span>
          </div>
        ))}
      </div>
    </section>
  )
}
