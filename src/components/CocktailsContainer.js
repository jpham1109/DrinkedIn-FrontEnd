import React, { useState, useEffect } from "react";
import cocktailsbackground from "../images/cocktails.jpeg"
import { useSelector, useDispatch } from "react-redux";
import CocktailForm from "./CocktailForm"
import CocktailCard from "./CocktailCard"
import { fetchCocktails } from "../features/cocktails/cocktailsSlice"

const CocktailsContainer = () => {
    const user = useSelector(state => state.user)
    const cocktails = useSelector(state => state.cocktails.entities)
    console.log(cocktails, "cocktails")
    const dispatch = useDispatch()

    const [isBartender, setIsBartender] = useState(false)
    const [toggleCocktailForm, setToggleCocktailForm] = useState(false)

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

    const cocktailCards = cocktails.map(cocktail => 
        <CocktailCard key={cocktail.id} cocktail={cocktail} />
        )

    // console.log(isBartender, "bartender")
    // console.log(user, "user")
    console.log(cocktailCards, "cocktail cards")
    return (
         
        <div className="cocktails-container">
            {!isBartender ? null : 
            <div>
                <button className="cocktail-btn" onClick={handleToggleClick}>{toggleCocktailForm ? "Hide Cocktail Box" : "Add Your Cocktail"}</button>
            </div>}
            {!toggleCocktailForm ? null : <CocktailForm />}
            <h1>FEATURED COCKTAILS</h1>
            {/* <Search 
            searchText={searchText} 
            onSearch={handleSearchText} 
            checkBox={checkBox} 
            onCheckBox={handleCheckBox}
            sort={sort}
            onSort={handleSort}
            /> */}
            <div className="cocktail">
            {cocktailCards}
            </div>
            <img id="landscape-img" src={cocktailsbackground} alt="landscape"/>
        </div>
        // <div className="cocktail">
        //     {/* {destinationCards} */}
        // </div>
    
    )
}

export default CocktailsContainer;