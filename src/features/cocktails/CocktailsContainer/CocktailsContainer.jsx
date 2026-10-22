import React, { useMemo, useState } from 'react'
import { useSelector } from 'react-redux'
import { GlassWater, Plus, SearchX } from 'lucide-react'
import { Button } from '../../../components/design-system/Button'
import { SearchInput } from '../../../components/design-system/Field'
import { Overlay } from '../../../components/design-system/Overlay'
import { CocktailCardSkeleton, EmptyState, ErrorState } from '../../../components/design-system/States'
import { cn } from '../../../util/cn'
import { escapeRegExp } from '../../../util/escapeRegExp'
import { selectCurrentUser } from '../../auth/authSlice'
import CocktailCard from '../CocktailCard/CocktailCard'
import CocktailForm from '../CocktailForm/CocktailForm'
import { selectAllCocktails, useGetCocktailsQuery } from '../cocktailsSlice'

// Ported from Design/drinkedin-v0/components/cocktails/cocktails-browser.tsx
// (ai/v1-redesign-plan.md PR6), restyled onto the V1 design system. File
// and route unchanged — App.jsx still imports this as CocktailsContainer.
//
// useGetCocktailsQuery() here does NOT duplicate the fetch: cocktails are
// already dispatched once at app boot in index.js
// (cocktailsApi.endpoints.getCocktails.initiate()), and RTK Query
// subscribes to that same cache entry by cache key rather than refetching
// — same pattern NavBar/ProtectedRoute already use for useGetUserQuery().
// This is purely to get isLoading/isError/error, which nothing previously
// read: before this PR there was no real loading state at all, just
// "cocktails.length === 0" standing in for both "still loading" and
// "genuinely empty catalog".
const sortOptions = [
	{ value: 'popularity', label: 'Most liked' },
	{ value: 'name', label: 'A–Z' },
]

function SortToggle({ sort, onSort }) {
	return (
		<div role="group" aria-label="Sort cocktails" className="flex items-center gap-1 text-sm">
			<span className="pr-1 text-muted-foreground" aria-hidden="true">
				Sort
			</span>
			{sortOptions.map((option) => (
				<button
					key={option.value}
					type="button"
					aria-pressed={sort === option.value}
					onClick={() => onSort(option.value)}
					className={cn(
						'inline-flex h-9 items-center rounded-control border-0 bg-transparent px-3 font-sans font-medium transition-colors',
						sort === option.value
							? 'bg-foreground text-background'
							: 'text-muted-foreground hover:bg-secondary hover:text-foreground'
					)}
				>
					<span className="sr-only">Sort by </span>
					{option.label}
				</button>
			))}
		</div>
	)
}

const gridClass =
	'grid grid-cols-2 gap-x-4 gap-y-10 sm:gap-x-6 md:grid-cols-3 lg:grid-cols-4 lg:gap-x-8 lg:gap-y-12 2xl:grid-cols-5'

const CocktailsContainer = () => {
	const { isLoading, isUninitialized, isError, error, refetch } = useGetCocktailsQuery()
	const cocktailsEntities = useSelector(selectAllCocktails)
	const user = useSelector(selectCurrentUser)
	const isBartender = user?.bartender ?? false

	const [adding, setAdding] = useState(false)
	const [searchText, setSearchText] = useState('')
	const [sort, setSort] = useState('popularity')

	const state = isUninitialized || isLoading ? 'loading' : isError ? 'error' : 'ready'

	// Same field set and case-insensitive partial-match approach as
	// before (name, ingredients, bartender name) — only the pattern itself
	// is now escaped so regex metacharacters typed by a user (parentheses,
	// asterisks, etc.) are matched literally instead of either throwing
	// (an unbalanced paren previously crashed this) or matching more than
	// intended (e.g. "." matching any character).
	const searchedCocktails = useMemo(() => {
		const re = new RegExp(escapeRegExp(searchText), 'i')
		return [...cocktailsEntities].filter((cocktail) => {
			const ingredientsMatch = re.test(cocktail.ingredients?.join('\n'))
			const nameMatch = re.test(cocktail.name)
			const bartenderName = re.test(
				cocktail.bartender?.full_name
					? cocktail.bartender?.full_name
					: cocktail.bartender?.username
			)
			return ingredientsMatch || nameMatch || bartenderName
		})
	}, [cocktailsEntities, searchText])

	const cocktailsToDisplay = useMemo(
		() =>
			[...searchedCocktails].sort((a, b) => {
				if (sort === 'name') return a.name.localeCompare(b.name)
				if (sort === 'popularity') return b.likes_count - a.likes_count
				return 0
			}),
		[searchedCocktails, sort]
	)

	const trimmedSearch = searchText.trim()
	const catalogEmpty = state === 'ready' && cocktailsEntities.length === 0
	const noResults = state === 'ready' && !catalogEmpty && cocktailsToDisplay.length === 0

	return (
		// Plain <div>, not v0's own <main id="main">: App.jsx already wraps
		// every route in exactly one <main id="main"> for the Navbar's skip
		// link (same reasoning Login.jsx's own comment already documents for
		// this exact situation) — a second one here was a real bug, not just
		// style: duplicate `id="main"` in the DOM, and an invalid nested
		// <main> landmark. text-left: the whole app's legacy `.App` wrapper
		// (App.module.css) sets `text-align: center`, which — being an
		// inherited property — cascades all the way down to every element
		// here unless overridden; confirmed live (walked the full ancestor
		// chain via getComputedStyle, not assumed) and confirmed this is
		// pre-existing and latent on Login/Signup too, just not visually
		// obvious there. Not fixing it at the shared `.App` wrapper or in
		// Login/Signup — out of scope for this PR — just overriding it once
		// here, at this page's own root, same as any other missing reset.
		<div className="mx-auto max-w-wide px-5 pb-8 text-left md:px-8 lg:px-12">
			<div className="flex flex-col gap-6 border-b border-border pb-6 pt-8 lg:pt-12">
				<div className="flex items-end justify-between gap-6">
					<div className="flex flex-col gap-2">
						<h1 className="type-h1 m-0">Cocktails</h1>
						<p className="m-0 text-pretty leading-relaxed text-muted-foreground">
							Recipes from working bartenders. Find one you like, then make it at home.
						</p>
					</div>
					{user && isBartender && (
						<Button onClick={() => setAdding(true)} className="max-sm:hidden">
							<Plus aria-hidden="true" />
							Add cocktail
						</Button>
					)}
				</div>

				<div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
					<div role="search" className="w-full md:max-w-xl">
						<SearchInput
							id="cocktail-search"
							label="Search cocktails"
							placeholder="Search by drink, ingredient or bartender"
							value={searchText}
							onChange={(e) => setSearchText(e.target.value)}
							className="h-12"
						/>
					</div>
					<div className="flex items-center justify-between gap-3">
						<SortToggle sort={sort} onSort={setSort} />
						{user && isBartender && (
							<Button onClick={() => setAdding(true)} size="sm" className="sm:hidden">
								<Plus aria-hidden="true" />
								Add cocktail
							</Button>
						)}
					</div>
				</div>
			</div>

			<div className="flex min-h-12 items-center justify-between gap-4 py-4 text-sm text-muted-foreground">
				<p className="m-0" aria-live="polite">
					{state === 'loading' && 'Loading cocktails…'}
					{state === 'ready' &&
						!catalogEmpty &&
						(trimmedSearch
							? `${cocktailsToDisplay.length} ${cocktailsToDisplay.length === 1 ? 'result' : 'results'} for “${trimmedSearch}”`
							: `${cocktailsToDisplay.length} cocktails`)}
				</p>
				{trimmedSearch && state === 'ready' && (
					<Button variant="link" size="sm" onClick={() => setSearchText('')}>
						Clear search
					</Button>
				)}
			</div>

			{state === 'loading' && (
				<ul className={cn(gridClass, 'list-none m-0 p-0')} aria-busy="true" aria-label="Loading cocktails">
					{Array.from({ length: 10 }, (_, i) => (
						<li key={i}>
							<CocktailCardSkeleton />
						</li>
					))}
				</ul>
			)}

			{state === 'error' && (
				<ErrorState
					title="We couldn’t load the cocktails"
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

			{catalogEmpty && (
				<EmptyState
					icon={<GlassWater />}
					title="No cocktails yet"
					description={
						isBartender
							? 'Be the first to share a recipe. It’ll show up here for everyone.'
							: 'Bartenders haven’t shared any recipes yet. Check back soon.'
					}
					action={
						isBartender ? (
							<Button onClick={() => setAdding(true)}>
								<Plus aria-hidden="true" />
								Add cocktail
							</Button>
						) : undefined
					}
				/>
			)}

			{noResults && (
				<EmptyState
					icon={<SearchX />}
					title={`Nothing matches “${trimmedSearch}”`}
					description="Try a spirit, an ingredient, or a bartender’s name."
					action={
						<Button variant="outline" onClick={() => setSearchText('')}>
							Show all cocktails
						</Button>
					}
				/>
			)}

			{state === 'ready' && cocktailsToDisplay.length > 0 && (
				<ul className={cn(gridClass, 'list-none m-0 p-0')}>
					{cocktailsToDisplay.map((cocktail) => (
						<li key={cocktail.id}>
							<CocktailCard id={cocktail.id} />
						</li>
					))}
				</ul>
			)}

			{user && isBartender && (
				<Overlay
					open={adding}
					onClose={() => setAdding(false)}
					variant="drawer"
					title="Add a cocktail"
					description="Share a recipe with everyone on DrinkedIn."
				>
					{/* Mounted only while open so each opening starts from a clean
					    form — matches the original's behavior, which fully
					    unmounted <CocktailForm /> on toggle-off (unlike Overlay's
					    own default of keeping children mounted behind the closed
					    native <dialog>). */}
					{adding && <CocktailForm onCancel={() => setAdding(false)} />}
				</Overlay>
			)}
		</div>
	)
}

export default React.memo(CocktailsContainer)
