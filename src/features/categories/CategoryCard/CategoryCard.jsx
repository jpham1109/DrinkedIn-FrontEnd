import { Link } from 'react-router-dom'
import Styles from './CategoryCard.module.css'

const CategoryCard = ({ category }) => {
	const { id, name, definition, popular_drinks } = category
	const categoryCocktail =
		popular_drinks[Math.floor(Math.random() * popular_drinks.length)]

	return (
		<div className={Styles.card}>
			<div className={Styles.image}>
				<img
					src={categoryCocktail.image}
					alt={categoryCocktail.name}
					loading="lazy"
				/>
				<div className={Styles.overlay}> {categoryCocktail.name}</div>
			</div>
			<div className={Styles.info}>
				<Link to={`/categories/${id}`}>
					<h3>{name}</h3>
				</Link>
				<p>{definition}</p>
			</div>
			<Link to={`/categories/${id}`} className={Styles.viewMore}>
				View More
			</Link>
		</div>
	)
}

export default CategoryCard
