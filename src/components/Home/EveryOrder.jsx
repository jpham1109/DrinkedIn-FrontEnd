import { ButtonLink } from '../../components/design-system/Button'
import screwdriver from '../../images/screwdriver.png'
import blackManhattan from '../../images/black-manhattan.png'

const pair = [
	{
		label: 'Where you start',
		name: 'Screwdriver',
		note: 'Two ingredients. Zero apologies.',
		src: screwdriver,
		alt: 'A Screwdriver: orange juice and vodka over ice in a tall glass.',
	},
	{
		label: 'Where you might end up',
		name: 'Black Manhattan',
		note: 'Rye, amaro, bitters. Same curiosity.',
		src: blackManhattan,
		alt: 'A Black Manhattan: dark stirred rye and amaro cocktail with a cherry.',
	},
]

// Ported from Design/drinked-in-ui-redesign/components/home/every-order.tsx
// (ai/v1-redesign-plan.md PR9) — kept as a marketing section, not a
// real-data one (approved: "retaining Every Order as a marketing
// section"). The two featured drinks and images are illustrative copy,
// same as v0, not pulled from the catalog.
//
// bg-surface-dark/text-surface-dark-foreground etc. are the same
// dark-surface tokens v0's own "on-dark" utility resolves to (see
// design-tokens.css) — already used elsewhere in this app, so no new
// tokens introduced here.
export function EveryOrder() {
	return (
		<section
			aria-labelledby="every-order-title"
			className="bg-surface-dark text-surface-dark-foreground"
		>
			<div className="mx-auto grid max-w-wide gap-12 px-5 py-20 text-left md:px-8 lg:grid-cols-12 lg:items-center lg:gap-16 lg:px-12 lg:py-28">
				<div className="flex flex-col gap-6 lg:col-span-5">
					<p className="type-eyebrow m-0 text-surface-dark-muted">How we pour</p>
					<h2 id="every-order-title" className="type-h1 m-0 text-balance">
						Every order is a <em>good</em> order.
					</h2>
					<p className="type-lead m-0 text-pretty text-surface-dark-muted">
						A Screwdriver and a rare amaro start the same way: with someone thirsty and a little
						curious. The bartenders here share what they know so you can find more of what you love.
						No secret handshake, no wrong answers.
					</p>
					<ButtonLink to="/cocktails" variant="onDark" size="lg" className="mt-2 w-fit">
						Explore every cocktail
					</ButtonLink>
				</div>

				<ul className="grid list-none grid-cols-2 gap-4 p-0 md:gap-6 lg:col-span-7">
					{pair.map((p, i) => (
						<li key={p.name} className={i === 1 ? 'pt-12 md:pt-20' : undefined}>
							<figure className="m-0 flex flex-col gap-4">
								<div className="aspect-[4/5] overflow-hidden">
									<img src={p.src} alt={p.alt} loading="lazy" className="size-full object-cover" />
								</div>
								<figcaption className="m-0 flex flex-col gap-1 border-t border-surface-dark-border pt-3">
									<span className="type-eyebrow text-surface-dark-muted">{p.label}</span>
									<span className="font-serif text-xl md:text-2xl">{p.name}</span>
									<span className="text-sm text-surface-dark-muted">{p.note}</span>
								</figcaption>
							</figure>
						</li>
					))}
				</ul>
			</div>
		</section>
	)
}
