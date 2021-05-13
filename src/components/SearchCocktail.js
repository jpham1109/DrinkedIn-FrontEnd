import React from "react";

const SearchCocktail = ({searchText, onSearch, sort, onSort}) => {
    return(
    <div className="search-sort-wrapper">
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
            <div className="sort-wrapper">
                {/* <label id="sort-text">Sort by</label> */}
                <select className="sort" id="sort" value={sort} onChange={onSort}>
                    <option value="">Sort by</option>
                    <option value="name">Cocktail Name</option>
                    <option value="popularity">Popularity</option>
                </select>
            </div>
    </div>
    )
}

export default SearchCocktail