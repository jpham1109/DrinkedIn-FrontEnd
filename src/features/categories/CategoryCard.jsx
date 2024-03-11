import { Link } from 'react-router-dom'

const CategoryCard = ({ category }) => {
	const { id, name, definition, popular_drinks } = category
	const categoryCocktail =
		popular_drinks[Math.floor(Math.random() * popular_drinks.length)]

	return (
		<div className="category-card">
			<div className="image-category">
				<img
					src={categoryCocktail.image}
					alt={categoryCocktail.name}
					loading="lazy"
				/>
				<p>{categoryCocktail['name']}</p>
			</div>
			<h3>{name}</h3>
			<p>{definition}</p>
			<Link to={`/categories/${id}`} className="view-more-btn">
				View More
			</Link>
		</div>
	)
}

export default CategoryCard
