import { SITE, instagramHref, whatsappHref } from "@/lib/site";

export function Footer() {
  return (
    <footer className="border-t border-line pt-14 pb-[calc(var(--safe-b)+7rem)] lg:pb-12">
      <div className="wrap grid gap-12 lg:grid-cols-12">
        <div className="lg:col-span-5">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo-dark.png" alt="Hot Pepper Media" width={737} height={508} className="h-20 w-auto" loading="lazy" />
          <p className="mt-6 max-w-[32ch] text-ink/65">Social media marketing agency in Beirut, Lebanon, for businesses of every kind.</p>
        </div>
        <nav aria-label="Footer" className="grid grid-cols-2 gap-8 text-base sm:grid-cols-3 lg:col-span-7">
          <div>
            <h2 className="mb-4 text-sm text-ink/45">Site</h2>
            <ul className="grid gap-1">
              {[["#services", "Services"], ["#work", "Work"], ["#process", "Process"], ["#clients", "Clients"], ["#contact", "Contact"]].map(([h, l]) => (
                <li key={h}><a href={h} className="inline-flex min-h-11 items-center text-ink/80 transition-colors hover:text-ink">{l}</a></li>
              ))}
            </ul>
          </div>
          <div className="col-span-2 sm:col-span-1">
            <h2 className="mb-4 text-sm text-ink/45">Contact</h2>
            <ul className="grid gap-1">
              <li><a href={whatsappHref} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center text-ink/80 transition-colors hover:text-ink">WhatsApp</a></li>
              <li><a href={instagramHref} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center text-ink/80 transition-colors hover:text-ink">Instagram</a></li>
              <li><a href={`mailto:${SITE.email}`} className="inline-flex min-h-11 items-center text-ink/80 transition-colors hover:text-ink">{SITE.email}</a></li>
            </ul>
          </div>
          <div>
            <h2 className="mb-4 text-sm text-ink/45">Based in</h2>
            <p className="text-ink/80">Beirut, Lebanon</p>
          </div>
        </nav>
      </div>
      <div className="wrap mt-14 flex flex-col gap-2 border-t border-line pt-6 text-sm text-ink/45 sm:flex-row sm:justify-between">
        <p>© 2026 Hot Pepper Media</p>
        <a href="#top" className="inline-flex min-h-11 items-center transition-colors hover:text-ink sm:min-h-0">Back to top</a>
      </div>
    </footer>
  );
}
