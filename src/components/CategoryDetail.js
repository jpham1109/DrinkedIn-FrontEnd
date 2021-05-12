import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import CocktailCard from "./CocktailCard"

function CategoryDetail({}) {
    const [categoryDetail, setCategoryDetail] = useState([])
    const [popularDrinks, setPopularDrinks] = useState([])
    const [dICocktails, setdICocktails] = useState([])
    const {id} = useParams()

    useEffect(() => {
        fetch(`http://localhost:7000/categories/${id}`)
        .then(r => r.json())
        .then(data=> {
            setCategoryDetail(data)
            setPopularDrinks(data.popular_drinks)
            setdICocktails(data.cocktails)
    })}, [id])

    return (
        <div className="category-details">
            <h2>Category: {categoryDetail.name}</h2>
            <p>{categoryDetail.definition}</p>
            <div className="drinks-list">
                {popularDrinks.map(d => 
                    <div>
                        <img key={d.name} src={d.image} alt={d.name}/>
                        <p>The {d.name}</p>
                    </div>
                )}
            </div>
            <div className="cocktail-list">
                {dICocktails.map(cocktail => 
                    <CocktailCard key={cocktail.id} cocktail={cocktail} />
                    )}
            </div>
        </div>
    )
}

export default CategoryDetail
