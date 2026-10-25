import React from 'react'
import { Martini } from 'lucide-react'
import { useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import { CreatorIdentity } from '../../../components/design-system/Identity'
import { LikeButton } from '../../../components/design-system/Toggles'
import { cn } from '../../../util/cn'
import { selectCocktailById } from '../cocktailsSlice'
import { useLikeCocktail } from '../useLikeCocktail'

// Ported from Design/drinkedin-v0/components/drinkedin/cocktail-card.tsx
// (ai/v1-redesign-plan.md PR6), restyled onto the V1 design system.
// Unlike v0's version (purely presentational — cocktail/liked/onToggle all
// passed in by CocktailsBrowser), this stays a self-contained container
// like the original CocktailCard.jsx: CategoryDetail.jsx and Profile.jsx
// both render it as `<CocktailCard id={...} />` only, and their own
// redesigns are later PRs — keeping the same `{ id }` contract means
// neither needs to change for this PR.
// Exported for reuse by CocktailDetail.jsx — v0's own cocktail-detail.tsx
// imports this exact component from its card module too (ai/v1-redesign-plan.md
// PR7), rather than duplicating the "Photo coming soon" fallback.
export function CocktailImage({ src, alt, name, className }) {
	if (!src) {
		return (
			<div
				className={cn(
					'flex size-full flex-col items-center justify-center gap-3 bg-secondary text-muted-foreground',
					className
				)}
				role="img"
				aria-label={`No photo yet for ${name}`}
			>
				<Martini className="size-8" strokeWidth={1.25} aria-hidden="true" />
				<span className="type-eyebrow" aria-hidden="true">
					Photo coming soon
				</span>
			</div>
		)
	}
	return (
		<img
			src={src}
			alt={alt ?? ''}
			loading="lazy"
			decoding="async"
			className={cn('size-full object-cover', className)}
		/>
	)
}

const CocktailCard = ({ id }) => {
	const cocktail = useSelector((state) => selectCocktailById(state, id))
	const { liked, count, toggle, pending } = useLikeCocktail(id)

	if (!cocktail) {
		return <p className="text-pretty text-sm text-muted-foreground">Cocktail not found.</p>
	}

	const { name, ingredients, photo, bartender } = cocktail
	const href = `/cocktails/${id}`

	// Real /cocktails response embeds the full bartender (confirmed live,
	// not assumed: { id, full_name, username }), not CreatorIdentity's v0
	// shape ({ name, bar, location, avatarUrl }) — bar/location/avatarUrl
	// are genuinely absent from our data, which CreatorIdentity already
	// renders fine without (its `meta` line and avatar fall back cleanly).
	const creator = bartender && {
		name: bartender.full_name || bartender.username,
		bar: undefined,
		location: undefined,
		avatarUrl: undefined,
	}

	return (
		// text-left: CocktailsContainer already overrides the inherited
		// `.App { text-align: center }` (App.module.css) at its own root, but
		// CategoryDetail.jsx and Profile.jsx don't — confirmed live via
		// getComputedStyle in both (title and ingredients both computed
		// `center`, visibly obvious on the full-width ingredients line).
		// Scoped here instead of in either consuming screen, so the card is
		// self-sufficient regardless of which ancestor renders it.
		<article className="group relative flex flex-col gap-4 text-left">
			<div className="aspect-[4/5] overflow-hidden bg-secondary">
				<CocktailImage
					src={photo}
					alt={name}
					name={name}
					className="transition-transform duration-500 ease-out group-hover:scale-[1.03] motion-reduce:transition-none"
				/>
			</div>

			<div className="flex flex-col gap-2">
				<div className="flex items-start justify-between gap-3">
					<h3 className="type-h3 m-0 text-balance pt-1">
						{/* text-foreground: v0 gets this for free from Preflight's
						    `a { color: inherit }` (anchors don't inherit color by
						    default otherwise — confirmed live: this rendered as
						    rgb(0, 0, 238), the browser's own link-blue, with the
						    `no-underline` fix already correctly removing the
						    underline but not the color). Same missing-Preflight
						    gap already fixed on every Link in Navbar.jsx. */}
						<Link
							to={href}
							className="text-foreground no-underline decoration-1 underline-offset-4 after:absolute after:inset-0 after:content-[''] group-hover:underline focus-visible:outline-none focus-visible:after:outline-2 focus-visible:after:outline-offset-4 focus-visible:after:outline-ring"
						>
							{name}
						</Link>
					</h3>
					<LikeButton
						liked={liked}
						count={count}
						cocktailName={name}
						onToggle={toggle}
						pending={pending}
						className="-mr-2"
					/>
				</div>
				{Array.isArray(ingredients) && ingredients.length > 0 && (
					<p className="m-0 line-clamp-2 text-sm leading-relaxed text-muted-foreground">
						<span className="sr-only">Ingredients: </span>
						{ingredients.join(' · ')}
					</p>
				)}
				{creator && <CreatorIdentity bartender={creator} className="mt-1" />}
			</div>
		</article>
	)
}

export default React.memo(CocktailCard)
