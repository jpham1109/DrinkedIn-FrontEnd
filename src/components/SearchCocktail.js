import React from "react";

const SearchCocktail = ({searchText, onSearch, sort, onSort}) => {
    return(
    <>
        {/* <div className="wrap-search"> */}
            <form className="search">
                <input className="search-ingredient" type="text" placeholder="Search cocktail ingredient..." value={searchText} onChange={onSearch} />
                <button className="search-button" type="submit"><i className="fas fa-search-location"/></button>
            </form>
        {/* </div> */}
            {/* <label id="checkbox-label">International</label>
            <input 
                    type="checkbox" 
                    id="checkbox"
                    checked={checkBox ? "true" : ""}
                    onChange={onCheckBox}
                /> */}
            <label id="sort-text">Sort by</label>
            <select className="ui fluid dropdown" id="sort" value={sort} onChange={onSort}>
                <option value="name">Cocktail Name</option>
                <option value="popularity">Popularity</option>
            </select>
    </>
    )
}

export default SearchCocktail