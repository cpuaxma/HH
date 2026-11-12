/* Testimonials: three slots, all placeholders until real, approved quotes arrive. Nothing here is invented. */
const QUOTES = [
  { quote: "[Client quote. One or two sentences about the result, in the client’s own words.]", name: "[Client name]", role: "[Role], [Business], [Area]" },
  { quote: "[Client quote about working with the team.]", name: "[Client name]", role: "[Role], [Business]" },
  { quote: "[Client quote about a specific campaign or launch.]", name: "[Client name]", role: "[Role], [Business]" },
];

export function Testimonials() {
  const [lead, ...rest] = QUOTES;
  return (
    <section id="clients" aria-labelledby="clients-title" className="relative py-24 md:py-36">
      <div className="wrap">
        <div className="grid gap-5 lg:grid-cols-12 lg:items-end">
          <h2 id="clients-title" className="font-display text-[clamp(3.5rem,14vw,8.5rem)] uppercase lg:col-span-8">What clients say</h2>
          <p className="max-w-[36ch] text-lg text-ink/60 lg:col-span-4 lg:justify-self-end">
            [Placeholder section. Real quotes go here once clients approve them.]
          </p>
        </div>

        <figure className="mt-14 border-t border-line pt-10 md:mt-20 md:pt-14">
          <span aria-hidden className="font-display block h-[0.5em] text-[clamp(6rem,20vw,14rem)] leading-none text-accent">&ldquo;</span>
          <blockquote className="mt-6 max-w-[22ch] text-[clamp(1.75rem,5.4vw,4rem)] leading-[1.08] tracking-[-0.02em] text-ink">
            {lead.quote}
          </blockquote>
          <figcaption className="mt-8 text-lg">
            <span className="block text-ink">{lead.name}</span>
            <span className="block text-ink/55">{lead.role}</span>
          </figcaption>
        </figure>

        <div className="mt-14 grid gap-10 border-t border-line pt-10 md:grid-cols-2 md:gap-12 lg:mt-20">
          {rest.map((q) => (
            <figure key={q.quote} className="md:border-l md:border-line md:pl-10 md:first:border-l-0 md:first:pl-0">
              <blockquote className="max-w-[30ch] text-2xl leading-snug tracking-[-0.01em] text-ink/90">{q.quote}</blockquote>
              <figcaption className="mt-6">
                <span className="block text-ink">{q.name}</span>
                <span className="block text-ink/55">{q.role}</span>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
