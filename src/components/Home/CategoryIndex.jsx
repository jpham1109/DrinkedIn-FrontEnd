import { ArrowUpRight, LayoutGrid } from 'lucide-react'
import { useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import { SectionHeader } from '../../components/design-system/SectionHeader'
import { EmptyState, ErrorState } from '../../components/design-system/States'
import { Button } from '../../components/design-system/Button'
import {
	selectAllCategories,
	useGetCategoriesQuery,
} from '../../features/categories/categoriesSlice'
import { selectCocktailsByCategoryId, useGetCocktailsQuery } from '../../features/cocktails/cocktailsSlice'

// Ported from Design/drinked-in-ui-redesign/components/home/spirit-index.tsx
// (ai/v1-redesign-plan.md PR9), replacing "Spirit Index" entirely rather
// than restyling it: v0's version is keyed on base spirits
// (spiritIndex's query/label/count are all hardcoded gin/vodka/rum/etc.
// demo rows with no backend equivalent — Category isn't a spirit, it's
// a drink style/collection per CategorySerializer, e.g. "Tiki",
// "Classics"). Copy below is written so it never claims these are
// spirits — "Browse by category" / "collections bartenders put
// together", not "pick a spirit, see where it goes".
//
// counts come from selectCocktailsByCategoryId (cocktailsSlice.js, PR10),
// not category.cocktails.length — that embedded snapshot is never
// invalidated by a cocktail mutation (confirmed via the RTK Query tag
// graph), so it was silently wrong after any add/delete/recategorize.
// Needs its own useGetCocktailsQuery() subscription alongside the
// existing categories query — this section depends on BOTH now, and must
// not render "0 drinks" for every category while cocktails are still
// loading or failed to load (that would misrepresent a loading/error
// state as a genuinely empty category).
export function CategoryIndex() {
	const categoriesQuery = useGetCategoriesQuery()
	const cocktailsQuery = useGetCocktailsQuery()
	const categories = useSelector(selectAllCategories)
	const cocktailsByCategory = useSelector(selectCocktailsByCategoryId)

	const isLoading =
		categoriesQuery.isUninitialized ||
		categoriesQuery.isLoading ||
		cocktailsQuery.isUninitialized ||
		cocktailsQuery.isLoading
	const isError = categoriesQuery.isError || cocktailsQuery.isError
	const error = categoriesQuery.error ?? cocktailsQuery.error
	const refetch = () => {
		categoriesQuery.refetch()
		cocktailsQuery.refetch()
	}
	const state = isLoading ? 'loading' : isError ? 'error' : 'ready'

	return (
		<section
			aria-labelledby="categories-title"
			className="mx-auto grid max-w-wide gap-10 px-5 py-16 text-left md:px-8 lg:grid-cols-12 lg:gap-16 lg:px-12 lg:py-24"
		>
			<SectionHeader
				id="categories-title"
				eyebrow="Browse by category"
				title="Find a collection you like"
				description="Bartenders group recipes into collections like these. Pick one and see what's inside."
				className="lg:col-span-4 lg:items-start"
			/>

			{state === 'loading' && (
				<ul
					className="grid list-none border-t border-border p-0 sm:grid-cols-2 sm:gap-x-10 lg:col-span-8"
					aria-busy="true"
					aria-label="Loading categories"
				>
					{Array.from({ length: 4 }, (_, i) => (
						<li key={i} className="flex min-h-20 items-center border-b border-border py-4">
							<div className="h-8 w-32 animate-pulse rounded-control bg-secondary" />
						</li>
					))}
				</ul>
			)}

			{state === 'error' && (
				<ErrorState
					className="lg:col-span-8"
					title="We couldn’t load categories"
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

			{state === 'ready' && categories.length === 0 && (
				<EmptyState
					className="lg:col-span-8"
					icon={<LayoutGrid />}
					title="No categories yet"
					description="Collections bartenders put together will show up here."
				/>
			)}

			{state === 'ready' && categories.length > 0 && (
				<ul className="grid list-none border-t border-border p-0 sm:grid-cols-2 sm:gap-x-10 lg:col-span-8">
					{categories.map((category) => (
						<li key={category.id} className="border-b border-border">
							<Link
								to={`/categories/${category.id}`}
								className="group flex min-h-20 items-center justify-between gap-4 py-4 text-foreground no-underline"
							>
								<span className="font-serif text-3xl leading-tight tracking-tight transition-colors group-hover:text-accent md:text-4xl">
									{category.name}
								</span>
								<span className="flex items-center gap-2 text-sm tabular-nums text-muted-foreground">
									{cocktailsByCategory.get(category.id)?.length ?? 0} drinks
									<ArrowUpRight
										className="size-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 motion-reduce:transition-none"
										aria-hidden="true"
									/>
								</span>
							</Link>
						</li>
					))}
				</ul>
			)}
		</section>
	)
}
