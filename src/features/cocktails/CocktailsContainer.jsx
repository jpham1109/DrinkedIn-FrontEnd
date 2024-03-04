import { useState } from 'react'
import { useSelector } from 'react-redux'
import cocktailsCon from '../../images/cocktailsCon.jpeg'
import { selectCurrentUser } from '../auth/authSlice'
import CocktailCard from './CocktailCard'
import CocktailForm from './CocktailForm'
import { selectAllCocktails, useGetCocktailsQuery } from './cocktailsSlice'

let SearchCocktail = ({ searchText, onSearch, sort, onSort }) => {
	return (
		<div className="search-sort-wrapper">
			<form className="search">
				<input
					className="search-ingredient"
					type="text"
					placeholder="Search cocktail ingredient..."
					value={searchText}
					onChange={onSearch}
				/>
				<button className="search-button" type="submit">
					<i className="fas fa-search-location" />
				</button>
			</form>
			<div className="sort-wrapper">
				<select className="sort" id="sort" value={sort} onChange={onSort}>
					<option value="">Sort by</option>
					<option value="name">Cocktail Name</option>
					<option value="popularity">Popularity</option>
				</select>
			</div>
		</div>
	)
}

const CocktailsContainer = () => {
	const { isLoading, isError } = useGetCocktailsQuery()
	const cocktailsEntities = useSelector(selectAllCocktails)

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
		content = <div> Hmm nothing to see here.. would you like to add some?</div>
	} else if (cocktailCards.length === 0) {
		content = <p> Sorry, no cocktail found with that ingredient!</p>
	} else {
		content = <div className="cocktail">{cocktailCards}</div>
	}

	if (isLoading) {
		return <div>Loading...</div>
	} else if (isError) {
		return <div>Something went wrong...</div>
	}

	return (
		<div className="cocktails-container">
			{!isBartender ? null : (
				<div>
					<button className="cocktail-btn" onClick={handleToggleClick}>
						{toggleCocktailForm ? 'Hide Cocktail Box' : 'Add Your Cocktail'}
					</button>
				</div>
			)}
			{!toggleCocktailForm ? null : <CocktailForm />}
			<h1>FEATURED COCKTAILS</h1>
			<SearchCocktail
				searchText={searchText}
				onSearch={handleSearchText}
				sort={sort}
				onSort={handleSort}
			/>
			{content}
			<img id="cocktails-img" src={cocktailsCon} alt="landscape" />
		</div>
	)
}

export default CocktailsContainer
