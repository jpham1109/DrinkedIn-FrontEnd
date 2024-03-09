const SearchCategory = ({ searchText, onSearch }) => {
	return (
		<>
			<form className="search">
				<input
					className="search-category"
					type="text"
					placeholder="Search category by name..."
					value={searchText}
					onChange={onSearch}
				/>
				<button className="search-button" type="submit">
					<i className="fas fa-search-location" />
				</button>
			</form>
		</>
	)
}

export default SearchCategory
