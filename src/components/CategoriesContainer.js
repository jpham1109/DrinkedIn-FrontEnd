import { useSelector, useDispatch } from "react-redux";
import React, { useEffect, useState } from "react";
import background from "../images/bg.jpeg"
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
            {/* <h2>Cocktail Families</h2> */}
            <SearchCategory 
            searchText={searchText} 
            onSearch={handleSearchText} 
            />
            <img id="cocktails-img" src={background} alt="landscape"/>
        </div>
        <div className="category">
            {categoryCards}
        </div>
    </>
    )
}

export default CategoriesContainer;