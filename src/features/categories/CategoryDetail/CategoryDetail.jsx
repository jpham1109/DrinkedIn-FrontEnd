import { useParams } from 'react-router-dom'
import appStyles from '../../../components/App/App.module.css'
import styles from './CategoryDetail.module.css'
import background from '../../../images/signup.jpeg'
import CocktailCard from '../../cocktails/CocktailCard/CocktailCard'
import { selectCategoryById } from '../categoriesSlice'
import { useSelector } from 'react-redux'
import React from 'react'

function CategoryDetail() {
	const { id } = useParams()
	const categoryDetail = useSelector((state) => selectCategoryById(state, id))

	const { name, definition, cocktails } = categoryDetail || {}

	return categoryDetail ? (
		<div className={styles.container}>
			<div className={styles.info}>
				<h2>{name}</h2>
				<p>{definition}</p>
			</div>
			<div className={styles.cocktailsGrid}>
				{cocktails.map((cocktail) => (
					<CocktailCard key={cocktail.id} id={cocktail.id} />
				))}
			</div>
			<img
				className={appStyles.backgroundImage}
				src={background}
				alt="landscape"
				loading="lazy"
			/>
		</div>
	) : (
		<div> No category found</div>
	)
}

export default React.memo(CategoryDetail)
