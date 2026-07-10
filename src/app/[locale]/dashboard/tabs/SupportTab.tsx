export default function SupportTab() {
  return (
    <section className="mx-auto max-w-2xl overflow-hidden rounded-2xl border border-white/70 bg-white shadow-[0_16px_45px_rgba(62,0,76,0.08)]">
      <div className="border-b border-gray-100 bg-[#fbf7fc] px-5 py-5 sm:px-6">
        <div className="flex items-center gap-3">
          <span className="material-symbols-outlined flex h-11 w-11 items-center justify-center rounded-xl bg-[#3e004c] text-[22px] text-[#f4d66c]">support_agent</span>
          <div>
            <h2 className="text-xl font-bold text-[#3e004c]">Support</h2>
            <p className="mt-1 text-sm text-gray-500">Get help from the Beninfy operations team.</p>
          </div>
        </div>
      </div>
      <div className="grid gap-3 p-5 sm:p-6">
        <a href="https://wa.me/22951019134" target="_blank" rel="noopener noreferrer" className="flex items-center justify-between rounded-2xl border border-[#eaddec] bg-[#fbf7fc] p-4 transition-colors hover:bg-white">
          <span className="flex items-center gap-3">
            <span className="material-symbols-outlined flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-[20px] text-emerald-700">chat</span>
            <span>
              <span className="block text-sm font-semibold text-gray-900">WhatsApp support</span>
              <span className="block text-xs text-gray-500">+229 51 01 91 34</span>
            </span>
          </span>
          <span className="material-symbols-outlined text-[18px] text-gray-400">open_in_new</span>
        </a>
        <a href="mailto:support@beninfy.com" className="flex items-center justify-between rounded-2xl border border-[#eaddec] bg-[#fbf7fc] p-4 transition-colors hover:bg-white">
          <span className="flex items-center gap-3">
            <span className="material-symbols-outlined flex h-10 w-10 items-center justify-center rounded-xl bg-[#f7eff8] text-[20px] text-[#3e004c]">mail</span>
            <span>
              <span className="block text-sm font-semibold text-gray-900">Email support</span>
              <span className="block text-xs text-gray-500">support@beninfy.com</span>
            </span>
          </span>
          <span className="material-symbols-outlined text-[18px] text-gray-400">arrow_forward</span>
        </a>
      </div>
    </section>
  )
}
