import { Link } from 'react-router-dom'
import styles from './CategoryCard.module.css'

const CategoryCard = ({ category }) => {
	const { id, name, definition, popular_drinks } = category
	const categoryCocktail =
		popular_drinks[Math.floor(Math.random() * popular_drinks.length)]

	return (
		<div className={styles.card}>
			<div className={styles.image}>
				<img
					className={styles.image__img}
					src={categoryCocktail.image}
					alt={categoryCocktail.name}
					loading="lazy"
				/>
				<div className={styles.overlay}> {categoryCocktail.name}</div>
			</div>
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
