import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import background from '../../images/signup.jpeg'
import CocktailCard from "../cocktails/CocktailCard"

function CategoryDetail() {
    const [categoryDetail, setCategoryDetail] = useState([])
    const [popularDrinks, setPopularDrinks] = useState([])
    const [dICocktails, setdICocktails] = useState([])
    const {id} = useParams()

    useEffect(() => {
        fetch(`${process.env.REACT_APP_BACKEND_URL}/categories/${id}`)
        .then(r => r.json())
        .then(data=> {
            setCategoryDetail(data)
            setPopularDrinks(data.popular_drinks)
            setdICocktails(data.cocktails)
    })}, [id])

    return (
        <div className="category-details">
            <div className="category-details-info">
            <h2>Category: {categoryDetail.name}</h2>
            <p>{categoryDetail.definition}</p>
            </div>
            <div className="drinks-list">
                {popularDrinks.map(d => 
                    <div className="drinks-list-info" key={d.name}>
                        <img  src={`${process.env.REACT_APP_BACKEND_URL}${d.image}`} alt={d.name}/>
                        <p>The {d.name}</p>
                    </div>
                )}
            </div>
            <div className="cocktail-list">
                {dICocktails.map(cocktail => 
                    <CocktailCard key={cocktail.id} cocktail={cocktail} />
                    )}
            </div>
            <img id="cocktails-img" src={background} alt="landscape"/>
        </div>
    )
}

export default CategoryDetail
