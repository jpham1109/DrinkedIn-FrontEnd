import React, { useState } from 'react'
import { useSelector } from 'react-redux'
import background from '../../images/bg.jpeg'
import CategoryCard from './CategoryCard'
import SearchCategory from './SearchCategory'
import { selectAllCategories } from './categoriesSlice'

const CategoriesContainer = () => {
	const [searchText, setSearchText] = useState('')
	const categories = useSelector(selectAllCategories)

	const handleSearchText = (event) => {
		setSearchText(event.target.value)
	}
	const searchedCategories = categories.filter((category) =>
		category.name.toLowerCase().includes(searchText.toLowerCase())
	)

	const categoryCards = searchedCategories.map((c) => (
		<CategoryCard key={c.id} category={c} />
	))

	return (
		<>
			<div className="categories-container">
				<SearchCategory searchText={searchText} onSearch={handleSearchText} />
				<img
					id="cocktails-img"
					src={background}
					alt="landscape"
					loading="lazy"
				/>
			</div>
			<div className="category">{categoryCards}</div>
		</>
	)
}

export default React.memo(CategoriesContainer)
