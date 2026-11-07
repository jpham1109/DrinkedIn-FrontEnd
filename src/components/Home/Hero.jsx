import { ArrowRight } from 'lucide-react'
import { useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import { SearchInput } from '../../components/design-system/Field'
import { CreatorIdentity } from '../../components/design-system/Identity'
import { CocktailImage } from '../../features/cocktails/CocktailCard/CocktailCard'
import { selectFeaturedCocktail, useGetCocktailsQuery } from '../../features/cocktails/cocktailsSlice'

// Ported from Design/drinked-in-ui-redesign/components/home/hero.tsx
// (ai/v1-redesign-plan.md PR9). v0's "People are looking for" suggestion
// chips are deliberately dropped — they're hardcoded demo terms
// (sample-data.ts's searchSuggestions) with no real-data equivalent
// (no "trending searches" signal exists anywhere in the backend), and
// this project's own established principle is no invented/mocked data
// ever ships, same reasoning already applied to the Category-index
// section below replacing Spirit Index.
//
// The featured cocktail itself comes from selectFeaturedCocktail
// (cocktailsSlice.js) — deterministic ranking by real likes_count/
// created_at/id, not v0's single hardcoded demo object.
//
// useGetCocktailsQuery() here subscribes Hero to the same cache entry
// PopularCocktails reads (and the app's own boot-time dispatch in
// index.js already populates) — Hero must not rely on PopularCocktails
// rendering alongside it to populate that cache; same reasoning as
// CocktailsContainer's own call to this hook.
export function Hero() {
	useGetCocktailsQuery()
	const featured = useSelector(selectFeaturedCocktail)

	return (
		<section
			aria-labelledby="hero-title"
			className="mx-auto grid max-w-wide gap-10 px-5 pb-16 pt-10 text-left md:px-8 lg:grid-cols-12 lg:items-end lg:gap-16 lg:px-12 lg:pb-6 lg:pt-8"
		>
			{/* min-w-0: grid items default to `min-width: auto`, i.e. their
			    content's min-content size, not 0 — below `lg` this is the grid's
			    only column, so without this the track grows to fit whichever
			    descendant has the widest unshrinkable intrinsic size (confirmed
			    live at a 320px viewport: the grid track sat at ~366px, wider
			    than the section's own ~276px content box, causing real
			    horizontal page overflow). Preflight doesn't touch this — same
			    CSS Grid behavior with or without it — v0 never surfaces it
			    because its prototype page is never embedded somewhere this
			    narrow in practice. */}
			<div className="flex min-w-0 flex-col gap-8 lg:col-span-7 lg:gap-7 lg:pb-4">
				<div className="flex flex-col gap-6 lg:gap-5">
					<p className="type-eyebrow m-0 text-muted-foreground">Cocktails worth discovering</p>
					<h1 id="hero-title" className="type-display m-0 text-balance">
						Find your next <em className="text-accent">favorite</em> drink.
					</h1>
					<p className="type-lead m-0 max-w-xl text-pretty text-muted-foreground">
						Browse recipes from working bartenders, save the ones you want to try, and follow the people
						whose taste you trust. Whatever you like to drink, it belongs here.
					</p>
				</div>

				<SearchInput
					id="hero-search"
					label="Search cocktails by name, spirit, or ingredient"
					placeholder="Try gin, citrusy, or Screwdriver"
					size="lg"
					submitLabel="Search"
					action="/cocktails"
					className="max-w-2xl"
				/>

				<Link
					to="/cocktails"
					className="group inline-flex w-fit items-center gap-2 text-[0.9375rem] font-medium text-foreground no-underline decoration-border-strong underline-offset-4 hover:underline hover:decoration-foreground"
				>
					Or just browse everything
					<ArrowRight
						className="size-4 transition-transform group-hover:translate-x-0.5 motion-reduce:transition-none"
						aria-hidden="true"
					/>
				</Link>
			</div>

			{featured && (
				<figure className="m-0 flex flex-col gap-3 lg:col-span-5">
					<div className="aspect-[4/3] overflow-hidden bg-secondary sm:aspect-[16/10] lg:aspect-square">
						<CocktailImage src={featured.photo} alt={featured.name} name={featured.name} />
					</div>
					<figcaption className="m-0 flex flex-wrap items-center justify-between gap-x-4 gap-y-1 border-b border-border pb-3">
						<span className="text-sm text-muted-foreground">
							On the bar tonight:{' '}
							<Link
								to={`/cocktails/${featured.id}`}
								className="font-medium text-foreground underline-offset-4 hover:underline"
							>
								{featured.name}
							</Link>
						</span>
						{featured.bartender && (
							<CreatorIdentity
								bartender={{
									name: featured.bartender.full_name || featured.bartender.username,
									bar: undefined,
									location: undefined,
									avatarUrl: undefined,
								}}
							/>
						)}
					</figcaption>
				</figure>
			)}
		</section>
	)
}
