import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";

export default function CocktailDetails() {
    const [cocktail, setCocktail] = useState([])
    const {id} = useParams()

    useEffect(() => {
        fetch(`http://localhost:7000/cocktails/${id}`)
        .then(r => r.json())
        .then(cocktail => setCocktail(cocktail))
    }, [id])

    const { name, description, execution, ingredients, image, likes_count, creator, user } = cocktail

    return (
        <div>
            <div>Cocktail
                
            </div>
            <div>User
                
            </div>
            <div>Establishment
    
            </div>
        </div>
    )
}