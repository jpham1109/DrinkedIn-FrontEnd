import React, { useState } from 'react'
import { useSelector } from 'react-redux'
import appStyles from '../../../components/App/App.module.css'
import styles from './CocktailsContainer.module.css'
import cocktailsCon from '../../../images/cocktailsCon.jpeg'
import { selectCurrentUser } from '../../auth/authSlice'
import CocktailCard from '../CocktailCard/CocktailCard'
import CocktailForm from '../CocktailForm/CocktailForm'
import { selectAllCocktails } from '../cocktailsSlice'

let SearchCocktail = ({ searchText, onSearch, sort, onSort }) => {
	return (
		<div className={styles.toolbar}>
			<input
				className={styles.search}
				type="text"
				placeholder="Search cocktail ingredient..."
				value={searchText}
				onChange={onSearch}
			/>
			<select className={styles.sort} id="sort" value={sort} onChange={onSort}>
				<option value="">Sort by</option>
				<option value="name">Cocktail Name</option>
				<option value="popularity">Popularity</option>
			</select>
		</div>
	)
}

const CocktailsContainer = () => {
	// select all cocktails from the normalized result of the query initiated when app is mounted in index.js
	const cocktailsEntities = useSelector(selectAllCocktails)
	// select the current user from the store
	const user = useSelector(selectCurrentUser)
	const isBartender = user?.bartender ?? false

	const [toggleCocktailForm, setToggleCocktailForm] = useState(false)
	const [searchText, setSearchText] = useState('')
	const [sort, setSort] = useState('')

	const handleSearchText = (event) => {
		setSearchText(event.target.value)
	}

	const handleSort = (event) => {
		setSort(event.target.value)
	}

	const handleToggleClick = () => {
		setToggleCocktailForm((prev) => !prev)
	}

	// 'i' flag makes the search case-insensitive
	const re = new RegExp(searchText, 'i')

	const searchedCocktails =
		[...cocktailsEntities].filter((cocktail) => {
			const ingredientsMatch = re.test(cocktail.ingredients?.join('\n'))
			const nameMatch = re.test(cocktail.name)
			const bartenderName = re.test(
				cocktail.bartender?.full_name
					? cocktail.bartender?.full_name
					: cocktail.bartender?.username
			)
			return ingredientsMatch || nameMatch || bartenderName
		}) ?? []

	const cocktailsToDisplay = [...searchedCocktails].sort((a, b) => {
		if (sort === 'name') {
			return a.name.localeCompare(b.name)
		} else if (sort === 'popularity') {
			return b.likes_count - a.likes_count
		} else {
			return 0
		}
	})

	const cocktailCards = cocktailsToDisplay.map((cocktail) => (
		<CocktailCard key={cocktail.id} id={cocktail.id} />
	))

	let content

	if (cocktailsEntities.length === 0) {
		content = <p> Hmm nothing to see here.. would you like to add some?</p>
	} else if (cocktailCards.length === 0) {
		content = <p> Sorry, no cocktail found with that ingredient!</p>
	} else {
		content = <div className={styles.cocktailsGrid}>{cocktailCards}</div>
	}

	return (
		<div className={styles.container}>
			{!isBartender ? null : (
				<button className={styles.addCocktail} onClick={handleToggleClick}>
					{toggleCocktailForm ? 'Hide Cocktail Form' : 'Add Cocktail'}
				</button>
			)}
			{!toggleCocktailForm ? null : <CocktailForm />}
			<SearchCocktail
				searchText={searchText}
				onSearch={handleSearchText}
				sort={sort}
				onSort={handleSort}
			/>
			{content}
			<img
				className={appStyles.backgroundImage}
				src={cocktailsCon}
				alt="landscape"
				loading="lazy"
			/>
		</div>
	)
}

export default React.memo(CocktailsContainer)
