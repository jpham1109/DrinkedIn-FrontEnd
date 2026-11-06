import { CategoryIndex } from './CategoryIndex'
import { EveryOrder } from './EveryOrder'
import { Hero } from './Hero'
import { JoinCta } from './JoinCta'
import { PopularCocktails } from './PopularCocktails'

// Redesigned per ai/v1-redesign-plan.md PR9, replacing the placeholder
// (a single decorative background image, Home.module.css, now deleted —
// confirmed nothing else imported it). Composes v0's home sections
// (Design/drinkedin-v0/app/page.tsx), minus Behind the Bar (dropped,
// approved) and Spirit Index (replaced by CategoryIndex, approved —
// see that file's own comment for why). text-left: same missing-
// Preflight gap already documented in CocktailsContainer.jsx — this
// page's root overrides the inherited `.App { text-align: center }`
// once, same as every other real page.
//
// No wrapping <main> here — App.jsx already provides the single
// `<main id="main">` landmark for every route.
function Home() {
	return (
		<div className="text-left">
			<Hero />
			<PopularCocktails />
			<EveryOrder />
			<CategoryIndex />
			<JoinCta />
		</div>
	)
}

export default Home
