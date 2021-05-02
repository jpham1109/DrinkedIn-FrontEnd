import { useSelector, useDispatch } from "react-redux";
import React, { useEffect } from "react";
import cocktails from "../images/cocktails.jpeg"
import CategoryCard from "./CategoryCard"
import { fetchCategories } from "../features/categories/categoriesSlice"

const CategoriesContainer = () => {
    const categories = useSelector(state => state.categories.entities)
    const dispatch = useDispatch()
    
    useEffect(() => {
        dispatch(fetchCategories())
    }, [dispatch])

    const categoryCards = categories.map(c => 
        <CategoryCard key={c.id} category={c}/>
    )


    return (
         <>
        <div className="cocktails-container">
            <h1>Cocktail Categories</h1>
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
            {categoryCards}
        </div>
    </>
    )
}

export default CategoriesContainer;