import React, { useEffect, useRef, useState } from 'react'
import { ArrowLeft, ArrowUpRight, BookOpen, GlassWater } from 'lucide-react'
import { useSelector } from 'react-redux'
import { Link, useParams } from 'react-router-dom'
import { Button, ButtonLink } from '../../../components/design-system/Button'
import { CocktailCardSkeleton, EmptyState, ErrorState, Skeleton } from '../../../components/design-system/States'
import { cn } from '../../../util/cn'
import CocktailCard from '../../cocktails/CocktailCard/CocktailCard'
import { selectCocktailsByCategoryId, useGetCocktailsQuery } from '../../cocktails/cocktailsSlice'
import { selectAllCategories, selectCategoryById, useGetCategoriesQuery } from '../categoriesSlice'

// Ported from Design/drinked-in-ui-redesign/components/category/
// category-detail.tsx + category-states.tsx (ai/v1-redesign-plan.md
// PR10), restyled onto the V1 design system — replaces the pre-redesign
// CategoryDetail.jsx entirely (CategoryDetail.module.css now unused,
// deleted alongside this file).
//
// Data source: cocktail membership/counts come from
// selectCocktailsByCategoryId (cocktailsSlice.js, PR10) — NOT
// CategorySerializer's embedded `cocktails: [{id}, ...]` snapshot, which
// is never invalidated by a cocktail mutation (confirmed via the RTK
// Query tag graph) and was silently wrong after any add/delete/
// recategorize. Category's own fields (name, definition) still come from
// categoriesSlice, untouched. This screen subscribes to BOTH
// useGetCategoriesQuery() and useGetCocktailsQuery() itself — like
// CocktailDetail.jsx (PR7), it must not depend on boot-time
// initialization or another screen (e.g. Home) happening to have
// triggered either fetch first.
const PAGE_SIZE = 20

const categoryGridClass =
	'grid grid-cols-2 gap-x-4 gap-y-10 sm:gap-x-6 md:grid-cols-3 lg:grid-cols-4 lg:gap-x-8 lg:gap-y-12 2xl:grid-cols-5'

// Same component/copy/destination v0 reuses verbatim from its own
// cocktail-detail.tsx on this page — not a copy-paste mistake, the
// approved design does link back to the full catalog here, not to
// /categories. CocktailDetail.jsx keeps its own private copy of this
// rather than sharing one (see that file's own comment); matched here.
function BackToCocktails() {
	return (
		<Link
			to="/cocktails"
			className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground no-underline underline-offset-4 hover:text-foreground hover:underline"
		>
			<ArrowLeft className="size-4" aria-hidden="true" />
			Back to cocktails
		</Link>
	)
}

// Plain <div>, not v0's own <main id="main">: App.jsx already wraps every
// route in exactly one <main id="main">, same reasoning as every other
// migrated screen. text-left: same inherited `.App { text-align: center }`
// override already applied everywhere else.
function Shell({ children, busy }) {
	return (
		<div aria-busy={busy || undefined} className="mx-auto max-w-wide px-5 pb-8 pt-6 text-left md:px-8 lg:px-12 lg:pt-8">
			<BackToCocktails />
			{children}
		</div>
	)
}

function countLabel(n) {
	return n === 1 ? '1 cocktail' : `${n} cocktails`
}

function CategoryIntro({ category, count }) {
	return (
		<header className="flex flex-col gap-8 border-b border-foreground pb-10 pt-8 lg:flex-row lg:items-end lg:justify-between lg:gap-16 lg:pb-14 lg:pt-12">
			<div className="flex flex-col gap-3 lg:w-7/12">
				<p className="type-eyebrow m-0 text-muted-foreground">Category</p>
				<h1 id="category-title" className="type-display m-0 text-balance">
					{category.name}
				</h1>
			</div>
			<div className="flex flex-col gap-5 lg:w-5/12 lg:pb-3">
				{/* category.definition, not .description: real CategorySerializer
				    attribute (confirmed), unlike v0's mock Category type. */}
				<p className="m-0 text-pretty font-serif text-xl leading-relaxed md:text-2xl md:leading-relaxed">
					{category.definition}
				</p>
				<p className="m-0 text-sm tabular-nums text-muted-foreground">{countLabel(count)}</p>
			</div>
		</header>
	)
}

// Counts here come from the same selectCocktailsByCategoryId map as the
// current category's own count — if this list used the embedded snapshot
// instead, it would reintroduce the identical staleness bug one level
// down, in a different section of the same page.
function MoreCategories({ categories, currentId, cocktailsByCategory }) {
	const others = categories.filter((c) => c.id !== currentId)
	if (others.length === 0) return null

	return (
		<nav aria-labelledby="more-categories-title" className="mt-20 flex flex-col gap-6 lg:mt-28">
			<h2 id="more-categories-title" className="type-h3 m-0">
				Keep browsing
			</h2>
			<ul className="m-0 grid list-none border-t border-border p-0 sm:grid-cols-2 sm:gap-x-10 lg:grid-cols-3">
				{others.map((c) => (
					<li key={c.id} className="border-b border-border">
						<Link
							to={`/categories/${c.id}`}
							className="group flex min-h-16 items-center justify-between gap-4 py-4 text-foreground no-underline"
						>
							<span className="font-serif text-2xl leading-tight tracking-tight transition-colors group-hover:text-accent md:text-3xl">
								{c.name}
							</span>
							<span className="flex items-center gap-2 text-sm tabular-nums text-muted-foreground">
								{countLabel(cocktailsByCategory.get(c.id)?.length ?? 0)}
								<ArrowUpRight
									className="size-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 motion-reduce:transition-none"
									aria-hidden="true"
								/>
							</span>
						</Link>
					</li>
				))}
			</ul>
		</nav>
	)
}

function CategoryDetailSkeleton() {
	return (
		<Shell busy>
			<p className="sr-only" role="status">
				Loading category…
			</p>
			<div
				aria-hidden="true"
				className="flex flex-col gap-8 border-b border-border pb-10 pt-8 lg:flex-row lg:items-end lg:justify-between lg:gap-16 lg:pb-14 lg:pt-12"
			>
				<div className="flex flex-col gap-4 lg:w-7/12">
					<Skeleton className="h-4 w-20" />
					<Skeleton className="h-16 w-2/3 md:h-20" />
				</div>
				<div className="flex flex-col gap-3 lg:w-5/12">
					<Skeleton className="h-6 w-full" />
					<Skeleton className="h-6 w-5/6" />
					<Skeleton className="mt-2 h-4 w-24" />
				</div>
			</div>
			<ul className={cn(categoryGridClass, 'list-none p-0 pt-10 lg:pt-12')} aria-hidden="true">
				{Array.from({ length: 4 }, (_, i) => (
					<li key={i}>
						<CocktailCardSkeleton />
					</li>
				))}
			</ul>
		</Shell>
	)
}

// onClick is wired to the real queries' own refetch() rather than v0's
// `window.location.reload()` — this app already has a working RTK Query
// refetch path, same "Try again" convention as every other error state
// already shipped (CocktailsContainer, Home's PopularCocktails/
// CategoryIndex, CocktailDetail) — a full reload would be a regression
// from that established pattern, not a faithful port of it.
function CategoryDetailError({ onRetry }) {
	return (
		<Shell>
			<div className="pt-8 lg:pt-12">
				<ErrorState
					title="We couldn’t load this category"
					action={
						<div>
							<Button variant="outline" size="sm" onClick={onRetry}>
								Try again
							</Button>
						</div>
					}
				/>
			</div>
		</Shell>
	)
}

function CategoryNotFound({ categories, cocktailsByCategory }) {
	return (
		<Shell>
			<div className="pt-8 lg:pt-12">
				<EmptyState
					icon={<BookOpen />}
					title="We couldn’t find that category"
					description="It may have been renamed, or the link might be wrong. Pick one below or browse the whole library."
					action={<ButtonLink to="/cocktails">Browse all cocktails</ButtonLink>}
				/>
			</div>
			<MoreCategories categories={categories} currentId={undefined} cocktailsByCategory={cocktailsByCategory} />
		</Shell>
	)
}

function CategoryDetail() {
	const { id } = useParams()
	const categoryId = Number(id)

	const categoriesQuery = useGetCategoriesQuery()
	const cocktailsQuery = useGetCocktailsQuery()
	const categories = useSelector(selectAllCategories)
	const category = useSelector((state) => selectCategoryById(state, categoryId))
	const cocktailsByCategory = useSelector(selectCocktailsByCategoryId)

	const [visibleCount, setVisibleCount] = useState(PAGE_SIZE)
	const firstRevealedRef = useRef(null)
	const gridRef = useRef(null)

	useEffect(() => {
		const index = firstRevealedRef.current
		if (index === null) return
		firstRevealedRef.current = null
		gridRef.current?.children[index]?.querySelector('a[href]')?.focus()
	}, [visibleCount])

	// Navigating from one category straight to another re-renders this
	// same component instance with a new `id` param — without this, a
	// visibleCount left over from a large category would silently carry
	// into the next one.
	useEffect(() => {
		setVisibleCount(PAGE_SIZE)
	}, [categoryId])

	const isLoading =
		categoriesQuery.isUninitialized ||
		categoriesQuery.isLoading ||
		cocktailsQuery.isUninitialized ||
		cocktailsQuery.isLoading
	const isError = categoriesQuery.isError || cocktailsQuery.isError

	function retry() {
		categoriesQuery.refetch()
		cocktailsQuery.refetch()
	}

	// A failed or unresolved cocktails query must not render as a
	// genuinely empty category — these checks come before reading any
	// cocktail data at all.
	if (isLoading) return <CategoryDetailSkeleton />
	if (isError) return <CategoryDetailError onRetry={retry} />
	if (!category) return <CategoryNotFound categories={categories} cocktailsByCategory={cocktailsByCategory} />

	const cocktails = cocktailsByCategory.get(categoryId) ?? []
	const total = cocktails.length
	const visible = cocktails.slice(0, visibleCount)
	const paginated = total > PAGE_SIZE
	const hasMore = visible.length < total

	function loadMore() {
		firstRevealedRef.current = visibleCount
		setVisibleCount((n) => Math.min(n + PAGE_SIZE, total))
	}

	return (
		<Shell>
			<CategoryIntro category={category} count={total} />

			<section aria-label={`${category.name} cocktails`} className="pt-10 lg:pt-12">
				{total === 0 ? (
					<EmptyState
						icon={<GlassWater />}
						title={`No ${category.name.toLowerCase()} cocktails yet`}
						description="Bartenders haven’t added any recipes to this category so far. There’s plenty more in the library while you wait."
						action={<ButtonLink to="/cocktails">Browse all cocktails</ButtonLink>}
					/>
				) : (
					<ul ref={gridRef} className={cn(categoryGridClass, 'list-none p-0')}>
						{visible.map((cocktail) => (
							<li key={cocktail.id}>
								<CocktailCard id={cocktail.id} />
							</li>
						))}
					</ul>
				)}

				{paginated && (
					<div className="mt-14 flex flex-col items-center gap-5 lg:mt-16">
						<p aria-live="polite" className="m-0 text-sm tabular-nums text-muted-foreground">
							{hasMore ? `Showing ${visible.length} of ${total} cocktails` : `Showing all ${total} cocktails`}
						</p>
						{hasMore && (
							<Button variant="outline" onClick={loadMore}>
								Load more
							</Button>
						)}
					</div>
				)}
			</section>

			<MoreCategories categories={categories} currentId={categoryId} cocktailsByCategory={cocktailsByCategory} />
		</Shell>
	)
}

export default React.memo(CategoryDetail)
