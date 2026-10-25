import React from 'react'
import { ArrowLeft, GlassWater } from 'lucide-react'
import { useSelector } from 'react-redux'
import { Link, useParams } from 'react-router-dom'
import { Button, ButtonLink } from '../../../components/design-system/Button'
import { CreatorIdentity, Tag } from '../../../components/design-system/Identity'
import { EmptyState, ErrorState, Skeleton } from '../../../components/design-system/States'
import { FollowButton, LikeButton } from '../../../components/design-system/Toggles'
import { selectCurrentUser } from '../../auth/authSlice'
import { CocktailImage } from '../CocktailCard/CocktailCard'
import { useGetCocktailQuery } from '../cocktailsSlice'
import { useFollowBartender } from '../useFollowBartender'
import { useLikeCocktail } from '../useLikeCocktail'

// Ported from Design/drinkedin-v0/components/cocktail-detail/cocktail-detail.tsx
// and detail-states.tsx (ai/v1-redesign-plan.md PR7), restyled onto the V1
// design system.
//
// Data source: useGetCocktailQuery(id) is now this screen's own,
// independent fetch — it no longer only relies on selectCocktailById
// reading from whatever CocktailsContainer's boot-time getCocktails list
// happens to already have cached. That list has no per-cocktail
// loading/error/not-found signal of its own (a nonexistent id just reads
// back `undefined` forever, indistinguishable from "still loading"), which
// doesn't hold up for a page people land on directly (shared link, bookmark,
// hard refresh) rather than only by clicking a card in an already-loaded
// grid. getCocktail's own providesTags had a real bug fixed alongside this
// (cocktailsSlice.js — `arg.id` was always undefined since arg IS the id,
// not an object).
//
// Likes are deliberately NOT read from this new query's own response:
// useLikeCocktail(id) is reused completely unchanged from CocktailCard,
// which sources its `count`/`liked` from the SAME selectCocktailById/list
// cache CocktailCard itself reads — so the number shown here is the
// identical value, from the identical source, as whatever CocktailCard
// shows for this cocktail elsewhere in the app, not a second independently
// -fetched number that could drift out of sync with it.
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

function SectionHeading({ id, children, meta }) {
	return (
		<div className="flex items-baseline justify-between gap-4 border-b border-foreground pb-3">
			<h2 id={id} className="type-h3 m-0">
				{children}
			</h2>
			{meta && <span className="text-sm text-muted-foreground">{meta}</span>}
		</div>
	)
}

// Shared by all four render states below (skeleton/not-found/error/real
// content) — v0 only reuses this wrapper for the first three (its own
// detail-states.tsx Shell) and hand-duplicates the same classes a fourth
// time on cocktail-detail.tsx's own <main>; consolidated into one here
// since all four need identical padding/back-link/margin. text-left: same
// inherited `.App { text-align: center }` override already applied to
// every other migrated screen (CocktailCard.jsx, CocktailsContainer.jsx,
// Login.jsx, Signup.jsx) — not a missing-Preflight gap, an inherited legacy
// CSS rule. Plain <div>, not v0's own <main id="main">: App.jsx already
// wraps every route in exactly one <main id="main"> for the Navbar's skip
// link, same reasoning as every prior migration.
function Shell({ children, busy }) {
	return (
		<div
			aria-busy={busy || undefined}
			className="mx-auto max-w-wide px-5 pb-8 pt-6 text-left md:px-8 lg:px-12 lg:pt-8"
		>
			<BackToCocktails />
			<div className="mt-6 lg:mt-8">{children}</div>
		</div>
	)
}

function CocktailDetailSkeleton() {
	return (
		<Shell busy>
			<p className="sr-only" role="status">
				Loading cocktail…
			</p>
			<div
				className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] lg:gap-16"
				aria-hidden="true"
			>
				<Skeleton className="-mx-5 aspect-[4/3] md:mx-0 lg:aspect-[4/5]" />
				<div className="flex flex-col gap-5">
					<Skeleton className="h-6 w-20" />
					<Skeleton className="h-14 w-3/4" />
					<Skeleton className="h-5 w-full max-w-prose" />
					<Skeleton className="h-5 w-2/3" />
					<Skeleton className="mt-4 h-16 w-full" />
					<div className="mt-8 flex flex-col gap-4">
						{Array.from({ length: 4 }, (_, i) => (
							<Skeleton key={i} className="h-6 w-1/2" />
						))}
					</div>
				</div>
			</div>
		</Shell>
	)
}

function CocktailNotFound() {
	return (
		<Shell>
			<EmptyState
				icon={<GlassWater />}
				title="We couldn’t find that cocktail"
				description="It may have been removed, or the link might be wrong."
				action={<ButtonLink to="/cocktails">Browse all cocktails</ButtonLink>}
			/>
		</Shell>
	)
}

// onRetry calls the query's own refetch rather than v0's
// window.location.reload() — same established pattern as
// CocktailsContainer's ErrorState, no reason to force a full page reload
// when RTK Query can just retry the one failed request.
function CocktailDetailError({ onRetry }) {
	return (
		<Shell>
			<ErrorState
				title="We couldn’t load this cocktail"
				action={
					<div>
						<Button variant="outline" size="sm" onClick={onRetry}>
							Try again
						</Button>
					</div>
				}
			/>
		</Shell>
	)
}

const CocktailDetail = () => {
	const { id } = useParams()
	// Same parseInt(id, 10) convention CocktailEdit.jsx already uses for this
	// exact param — the entity-adapter-backed caches (selectCocktailById,
	// via useLikeCocktail) key by numeric id, and a route param is always a
	// string.
	const numericId = parseInt(id, 10)

	const {
		data: cocktail,
		isLoading,
		isUninitialized,
		isError,
		error,
		refetch,
	} = useGetCocktailQuery(numericId)

	const currentUser = useSelector(selectCurrentUser)
	const { liked, count, toggle: toggleLike, pending: likePending } = useLikeCocktail(numericId)
	const { following, toggle: toggleFollow, pending: followPending } = useFollowBartender(cocktail?.bartender)

	if (isUninitialized || isLoading) {
		return <CocktailDetailSkeleton />
	}

	if (isError) {
		// Only a real 404 from the server counts as "not found" — any other
		// failure (network error, 500, etc.) gets the generic retryable error
		// state instead, same distinction CocktailsContainer already makes
		// for its own list query.
		if (error?.status === 404) {
			return <CocktailNotFound />
		}
		return <CocktailDetailError onRetry={refetch} />
	}

	if (!cocktail) {
		return <CocktailNotFound />
	}

	const { name, description, ingredients, execution, photo, category, bartender } = cocktail
	const isOwnCocktail = currentUser?.id === bartender?.id

	// Faithful to v0's own transformation, unchanged: split on blank lines
	// only, trim, drop empties. No smarter step-detection (numbered
	// prefixes, sentence-splitting, etc.) — the recipe's actual line breaks
	// are the only thing that decides where a step boundary is.
	const steps = (execution ?? '')
		.split(/\n+/)
		.map((s) => s.trim())
		.filter(Boolean)

	// Adapts the real, embedded `{id, full_name, username}` shape
	// (BartenderSerializer — no bar/location/avatar fields exist on it) to
	// CreatorIdentity's v0 shape, same adaptation CocktailCard.jsx already
	// does for the same embedded data. bar/location/avatarUrl left
	// undefined on purpose: CreatorIdentity's `variant="full"` already
	// renders fine without them (its meta line and Avatar fall back
	// cleanly), so there's nothing to backfill.
	const creator = bartender && {
		name: bartender.full_name || bartender.username,
		bar: undefined,
		location: undefined,
		avatarUrl: undefined,
	}

	return (
		<Shell>
			<article className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] lg:gap-16">
				<div className="lg:sticky lg:top-24 lg:self-start">
					<div className="-mx-5 aspect-[4/3] overflow-hidden bg-secondary md:mx-0 lg:aspect-[4/5]">
						<CocktailImage src={photo} alt={name} name={name} />
					</div>
				</div>

				<div className="flex min-w-0 flex-col gap-12">
					<header className="flex flex-col gap-5">
						{category && (
							<div className="flex flex-wrap items-center gap-3">
								<Tag className="self-start">{category.name}</Tag>
								<Link
									to={`/categories/${category.id}`}
									className="text-sm font-medium text-muted-foreground no-underline underline-offset-4 hover:text-foreground hover:underline"
								>
									View category
								</Link>
							</div>
						)}
						<h1 className="type-display m-0 text-balance">{name}</h1>
						{description && (
							<p className="type-lead m-0 max-w-prose text-pretty text-muted-foreground">{description}</p>
						)}
						{category?.definition && (
							<p className="m-0 max-w-prose text-pretty text-sm leading-relaxed text-muted-foreground">
								{category.definition}
							</p>
						)}

						<div className="mt-2 flex flex-col gap-4 border-y border-border py-4 sm:flex-row sm:items-center sm:justify-between">
							<div className="flex items-center justify-between gap-4 sm:justify-start">
								{creator && <CreatorIdentity bartender={creator} variant="full" />}
								{bartender && !isOwnCocktail && (
									<FollowButton
										variant="quiet"
										name={creator.name}
										following={following}
										onToggle={toggleFollow}
										pending={followPending}
									/>
								)}
							</div>
							<LikeButton
								size="md"
								liked={liked}
								count={count}
								cocktailName={name}
								onToggle={toggleLike}
								pending={likePending}
								className="self-start sm:self-auto"
							/>
						</div>
					</header>

					{Array.isArray(ingredients) && ingredients.length > 0 && (
						<section aria-labelledby="ingredients-title" className="flex flex-col">
							<SectionHeading
								id="ingredients-title"
								meta={`${ingredients.length} ${ingredients.length === 1 ? 'item' : 'items'}`}
							>
								Ingredients
							</SectionHeading>
							<ul className="m-0 flex list-none flex-col p-0">
								{ingredients.map((ingredient) => (
									<li key={ingredient} className="border-b border-border py-3.5 text-[1.0625rem] leading-relaxed">
										{ingredient}
									</li>
								))}
							</ul>
						</section>
					)}

					{steps.length > 0 && (
						<section aria-labelledby="method-title" className="flex flex-col gap-6">
							<SectionHeading id="method-title">How to make it</SectionHeading>
							{steps.length === 1 ? (
								<p className="m-0 max-w-prose text-pretty text-[1.0625rem] leading-relaxed">{steps[0]}</p>
							) : (
								<ol className="m-0 flex max-w-prose list-none flex-col gap-6 p-0">
									{steps.map((step, i) => (
										<li key={i} className="grid grid-cols-[2.5rem_minmax(0,1fr)] gap-x-3">
											<span className="font-serif text-2xl leading-none text-muted-foreground" aria-hidden="true">
												{i + 1}
											</span>
											<p className="m-0 text-pretty text-[1.0625rem] leading-relaxed">
												<span className="sr-only">Step {i + 1}: </span>
												{step}
											</p>
										</li>
									))}
								</ol>
							)}
						</section>
					)}
				</div>
			</article>
		</Shell>
	)
}

export default React.memo(CocktailDetail)
