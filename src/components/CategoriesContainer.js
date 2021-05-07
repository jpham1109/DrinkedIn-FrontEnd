import { useSelector, useDispatch } from "react-redux";
import React, { useEffect, useState } from "react";
import cocktails from "../images/cocktails.jpeg"
import CategoryCard from "./CategoryCard"
import { fetchCategories } from "../features/categories/categoriesSlice"
import SearchCategory from "./SearchCategory";

const CategoriesContainer = () => {
    const categories = useSelector(state => state.categories.entities)
    const dispatch = useDispatch()

    const [searchText, setSearchText] = useState("")
    
    useEffect(() => {
        dispatch(fetchCategories())
    }, [dispatch])

    const handleSearchText = (event) => {
        setSearchText(event.target.value)
    }
    const searchedCategories = categories.filter((category) => category.name.toLowerCase().includes(searchText.toLowerCase()))

    const categoryCards = searchedCategories.map(c => 
        <CategoryCard key={c.id} category={c}/>
    )


    return (
         <>
        <div className="categories-container">
            <h1>Cocktail Categories</h1>
            <SearchCategory 
            searchText={searchText} 
            onSearch={handleSearchText} 
            />
            <img id="landscape-img" src={cocktails} alt="landscape"/>
        </div>
        <div className="category">
            {categoryCards}
        </div>
    </>
    )
}

export default CategoriesContainer;