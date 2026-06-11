export default function SupportTab() {
  return (
    <section className="bg-surface-container-lowest rounded-2xl p-6 shadow-sm border border-outline-variant max-w-xl mx-auto">
      <h2 className="text-headline-sm mb-2">Support</h2>
      <p className="text-body-sm text-on-surface-variant mb-6">Need help? Contact our support team below.</p>
      <div className="flex flex-col gap-3">
        <a href="mailto:support@beninfy.com" className="inline-flex items-center gap-2 text-primary text-label-md hover:underline">
          <span className="material-symbols-outlined text-[20px]">mail</span>
          support@beninfy.com
        </a>
        <a href="tel:+2348002364639" className="inline-flex items-center gap-2 text-primary text-label-md hover:underline">
          <span className="material-symbols-outlined text-[20px]">call</span>
          +234 800 BENINFY
        </a>
      </div>
    </section>
  )
}
