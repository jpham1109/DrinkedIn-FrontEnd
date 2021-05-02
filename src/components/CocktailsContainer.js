import React, { useState } from "react";
import cocktails from "../images/cocktails.jpeg"

const CocktailsContainer = () => {

    return (
         <>
        <div className="cocktails-container">
            <h1>FEATURED COCKTAILS</h1>
            {/* <Search 
            searchText={searchText} 
            onSearch={handleSearchText} 
            checkBox={checkBox} 
            onCheckBox={handleCheckBox}
            sort={sort}
            onSort={handleSort}
            /> */}
            <img id="landscape-img" src={cocktails} alt="landscape"/>
        </div>
        <div className="cocktail">
            {/* {destinationCards} */}
        </div>
    </>
    )
}

export default CocktailsContainer;