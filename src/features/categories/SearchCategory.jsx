import React from "react";

const SearchCategory = ({searchText, onSearch}) => {
    return(
    <>
        {/* <div className="wrap-search"> */}
            <form className="search">
                <input className="search-category" type="text" placeholder="Search category by name..." value={searchText} onChange={onSearch} />
                <button className="search-button" type="submit"><i className="fas fa-search-location"/></button>
            </form>
        {/* </div> */}
            {/* <label id="checkbox-label">International</label>
            <input 
                    type="checkbox" 
                    id="checkbox"
                    checked={checkBox ? "true" : ""}
                    onChange={onCheckBox}
                />
            <label id="sort-text">Sort by</label>
            <select className="ui fluid dropdown" id="sort" value={sort} onChange={onSort}>
                <option value="popularity">Popularity</option>
                <option value="name">Name</option>
            </select> */}
    </>
    )
}

export default SearchCategory