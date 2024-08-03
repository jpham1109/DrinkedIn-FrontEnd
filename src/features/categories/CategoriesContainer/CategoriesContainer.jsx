import React, { useState } from 'react'
import { useSelector } from 'react-redux'
import appStyles from '../../../components/App/App.module.css'
import styles from './CategoriesContainer.module.css'
import background from '../../../images/bg.jpeg'
import CategoryCard from '../CategoryCard/CategoryCard'
import { selectAllCategories } from '../categoriesSlice'

let SearchCategory = ({ searchText, onSearch }) => {
	return (
		<input
			type="text"
			placeholder="Search category by name..."
			value={searchText}
			onChange={onSearch}
		/>
	)
}

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
		<div className={styles.container}>
			<SearchCategory searchText={searchText} onSearch={handleSearchText} />
			<div className={styles.categoriesGrid}>{categoryCards}</div>
			<img
				className={appStyles.backgroundImage}
				src={background}
				alt="landscape"
				loading="lazy"
			/>
		</div>
	)
}

export default React.memo(CategoriesContainer)
