import React, { useState, useEffect } from "react";
import cocktailsbackground from "../images/cocktails.jpeg"
import { useSelector, useDispatch } from "react-redux";
import CocktailForm from "./CocktailForm"
import CocktailCard from "./CocktailCard"
import { fetchCocktails } from "../features/cocktails/cocktailsSlice"
import SearchCocktail from "./SearchCocktail"

const CocktailsContainer = () => {
    const user = useSelector(state => state.user)
    const cocktails = useSelector(state => state.cocktails.entities)
  
    const dispatch = useDispatch()

    const [isBartender, setIsBartender] = useState(false)
    const [toggleCocktailForm, setToggleCocktailForm] = useState(false)
    const [searchText, setSearchText] = useState("")
    const [sort, setSort] = useState("name")

    const handleSearchText = (event) => {
        setSearchText(event.target.value)
    }

    const handleSort = (event) => {
        setSort(event.target.value)
    }

    const handleToggleClick = () => {
        setToggleCocktailForm(prev => !prev)
    }
    useEffect(() => {
        dispatch(fetchCocktails())
    }, [dispatch])

    useEffect(() => {
        if (user.user.bartender) {
            setIsBartender(true)
        }
    }, [user])

    const re = new RegExp(searchText)
    const searchedCocktails = cocktails.filter((cocktail) => re.test(cocktail.ingredients.join("\n")))

    const cocktailsToDisplay = [...searchedCocktails].sort((a, b) => {
        if (sort === "name") {
            return a.name.localeCompare(b.name)
        } else if (sort === "popularity") {
            return b.likes_count - a.likes_count
        } else {
            return 0
        }
    })

    const cocktailCards = cocktailsToDisplay.map(cocktail => 
        <CocktailCard key={cocktail.id} cocktail={cocktail} />
        )

    return (
         
        <div className="cocktails-container">
            {!isBartender ? null : 
            <div>
                <button className="cocktail-btn" onClick={handleToggleClick}>{toggleCocktailForm ? "Hide Cocktail Box" : "Add Your Cocktail"}</button>
            </div>}
            {!toggleCocktailForm ? null : <CocktailForm />}
            <h1>FEATURED COCKTAILS</h1>
            <SearchCocktail 
            searchText={searchText} 
            onSearch={handleSearchText} 
            // checkBox={checkBox} 
            // onCheckBox={handleCheckBox}
            sort={sort}
            onSort={handleSort}
            /> 
            <div className="cocktail">
            {cocktailCards}
            </div>
            <img id="landscape-img" src={cocktailsbackground} alt="landscape"/>
        </div>
    
    )
}

export default CocktailsContainer;