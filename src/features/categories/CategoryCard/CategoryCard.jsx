import { useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import { CocktailImage } from '../../cocktails/CocktailCard/CocktailCard'
import { selectCocktailsByCategoryId } from '../../cocktails/cocktailsSlice'
import styles from './CategoryCard.module.css'

// Preview cocktail no longer comes from the static `popular_drinks`
// field (removed 2026-11-18 — see ai/v1-redesign-plan.md's category
// audit) — this reuses the same `selectCocktailsByCategoryId` selector
// and the same "prefer one with a usable photo" scan `selectFeaturedCocktail`
// already uses for Hero, rather than introducing a second, separate
// category-preview query/selector. Its groups are already sorted by
// likes-then-recency (the same deterministic order Hero relies on) —
// taking the first photo-bearing entry is a deterministic pick, not a
// claim of "most popular," and nothing here labels it as such.
//
// IMPORTANT — publication-lifecycle dependency (not yet built, see
// ai/v1-redesign-plan.md): this reads from the same `selectAllCocktails`-
// derived cache every other public surface reads from. Once the backend
// adds published-only filtering to the underlying /cocktails response,
// this card's preview and the parent's counts inherit that for free —
// no change needed here. Until then, it reflects every cocktail record
// that exists, same as the rest of the app today.
function CategoryPreviewImage({ categoryId, categoryName }) {
	const cocktailsByCategory = useSelector(selectCocktailsByCategoryId)
	const cocktails = cocktailsByCategory.get(categoryId) ?? []
	const preview = cocktails.find((c) => c.photo) ?? cocktails[0]

	return (
		<div className={styles.image}>
			<CocktailImage
				src={preview?.photo}
				alt={preview?.name ?? ''}
				name={preview?.name ?? categoryName}
				className={styles.image__img}
			/>
			{preview && <div className={styles.overlay}> {preview.name}</div>}
		</div>
	)
}

const CategoryCard = ({ category }) => {
	const { id, name, definition } = category

	return (
		<div className={styles.card}>
			<CategoryPreviewImage categoryId={id} categoryName={name} />
			<div className={styles.info}>
				<Link to={`/categories/${id}`}>
					<h3>{name}</h3>
				</Link>
				<p>{definition}</p>
			</div>
			<Link to={`/categories/${id}`} className={styles.viewMore}>
				View More
			</Link>
		</div>
	)
}

export default CategoryCard
