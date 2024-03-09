import { useParams } from 'react-router-dom'
import background from '../../images/signup.jpeg'
import CocktailCard from '../cocktails/CocktailCard'
import { selectCategoryById } from './categoriesSlice'
import { useSelector } from 'react-redux'

function CategoryDetail() {
	const { id } = useParams()
	const categoryDetail = useSelector((state) => selectCategoryById(state, id))

	const {
		name,
		definition,
		popular_drinks: popularDrinks,
		cocktails,
	} = categoryDetail || {}

	return categoryDetail ? (
		<div className="category-details">
			<div className="category-details-info">
				<h2>Category: {name}</h2>
				<p>{definition}</p>
			</div>
			<div className="drinks-list">
				{popularDrinks.map((d) => (
					<div className="drinks-list-info" key={d.name}>
						<img src={d.image} alt={d.name} />
						<p>The {d.name}</p>
					</div>
				))}
			</div>
			<div className="cocktail-list">
				{cocktails.map((cocktail) => (
					<CocktailCard key={cocktail.id} id={cocktail.id} />
				))}
			</div>
			<img id="cocktails-img" src={background} alt="landscape" />
		</div>
	) : (
		<div> No category found</div>
	)
}

export default CategoryDetail
