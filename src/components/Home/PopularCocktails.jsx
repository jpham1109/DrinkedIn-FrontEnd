import { ArrowRight, GlassWater } from 'lucide-react'
import { useSelector } from 'react-redux'
import { ButtonLink } from '../../components/design-system/Button'
import { SectionHeader } from '../../components/design-system/SectionHeader'
import { CocktailCardSkeleton, EmptyState, ErrorState } from '../../components/design-system/States'
import { Button } from '../../components/design-system/Button'
import { cn } from '../../util/cn'
import CocktailCard from '../../features/cocktails/CocktailCard/CocktailCard'
import {
	selectCocktailsRankedByLikes,
	selectFeaturedCocktail,
	useGetCocktailsQuery,
} from '../../features/cocktails/cocktailsSlice'

const gridClass =
	'grid grid-cols-1 gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-4 lg:gap-x-8'

// Ported from Design/drinkedin-v0/components/home/popular-cocktails.tsx
// (ai/v1-redesign-plan.md PR9). v0 slices the first 4 of its mock
// `cocktails` prop with no real ranking signal behind it; the real
// version uses selectCocktailsRankedByLikes (real likes_count-first
// ranking, same selector Hero's featured pick is derived from) and
// excludes whichever cocktail Hero is already featuring, so the same
// cocktail never appears twice on the page. If excluding it leaves
// nothing (e.g. the whole platform has 1 cocktail), this section just
// renders its own empty state rather than re-including the featured one
// — no special-casing needed, `.slice(0, 4)` on a shorter list already
// does the right thing.
//
// Each card is the real, already-proven self-contained CocktailCard
// (`{ id }` only) — unlike v0, which has to prop-drill `liked`/
// `onLikeToggle` into its purely presentational card, the real
// CocktailCard already owns its own live like state via
// useLikeCocktail(id).
export function PopularCocktails() {
	const { isLoading, isUninitialized, isError, error, refetch } = useGetCocktailsQuery()
	const ranked = useSelector(selectCocktailsRankedByLikes)
	const featured = useSelector(selectFeaturedCocktail)

	const state = isUninitialized || isLoading ? 'loading' : isError ? 'error' : 'ready'
	const popular = ranked.filter((c) => c.id !== featured?.id).slice(0, 4)

	return (
		<section aria-labelledby="popular-title" className="mx-auto max-w-wide px-5 py-16 text-left md:px-8 lg:pb-24 lg:pt-6">
			<SectionHeader
				id="popular-title"
				eyebrow="Most liked"
				title="Drinks people are loving"
				action={
					<ButtonLink to="/cocktails" variant="link">
						See all cocktails
						<ArrowRight className="size-4" aria-hidden="true" />
					</ButtonLink>
				}
			/>

			{state === 'loading' && (
				<ul className={cn(gridClass, 'mt-10 list-none p-0 lg:mt-12')} aria-busy="true" aria-label="Loading cocktails">
					{Array.from({ length: 4 }, (_, i) => (
						<li key={i}>
							<CocktailCardSkeleton />
						</li>
					))}
				</ul>
			)}

			{state === 'error' && (
				<ErrorState
					className="mt-10 lg:mt-12"
					title="We couldn’t load popular cocktails"
					description={error?.error || 'Something went wrong. Please try again.'}
					action={
						<div>
							<Button variant="outline" size="sm" onClick={refetch}>
								Try again
							</Button>
						</div>
					}
				/>
			)}

			{state === 'ready' && popular.length === 0 && (
				<EmptyState
					className="mt-10 lg:mt-12"
					icon={<GlassWater />}
					title="No cocktails yet"
					description="Recipes bartenders share will show up here."
				/>
			)}

			{state === 'ready' && popular.length > 0 && (
				<ul className={cn(gridClass, 'mt-10 list-none p-0 lg:mt-12')}>
					{popular.map((cocktail) => (
						<li key={cocktail.id}>
							<CocktailCard id={cocktail.id} />
						</li>
					))}
				</ul>
			)}
		</section>
	)
}
