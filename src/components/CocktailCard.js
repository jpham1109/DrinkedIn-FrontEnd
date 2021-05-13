import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
// import { useHistory } from "react-router-dom";
import { useSelector } from "react-redux";


const CocktailCard = ({ cocktail }) => {
    console.log(cocktail, "cocktail")
    const { id, name, ingredients, image, likes, user } = cocktail

    const current_user = useSelector(state => state.user.user)

    const [ingredient, setIngredient] = useState([])
    const [likesCount, setLikesCount] = useState([])
    const [bartender, setBartender] = useState([])
 

    const handleLikeClick = () => {
        
        fetch(`http://localhost:7000/likes`, {
            method: 'POST',
            headers: {
                "content-Type": "application/json"
            },
            body: JSON.stringify({ user_id: current_user.id, cocktail_id: id })
        })
        .then(r => r.json())
        .then(() => {
            setLikesCount(likesCount => likesCount + 1)
        })
    }

    useEffect(() => {
        if (ingredients) {
    const ingredientItems = ingredients.map(i => 
        <li className="ingredients-list" key={i}>{i}</li>
        )
        setIngredient(ingredientItems)
        }
        if (user) {
            setBartender(user.full_name)
        }
        if (likes) {
            setLikesCount(likes.length)
        }
    }, [ingredients])
 

   
    return cocktail ? (
        <div className="cocktail-card">
            <div className="image-cocktail">
                <img src={image} alt={name} height="250px" width="260px"/>
            </div>
            <div className="cocktail-card-info">
                <h3>{name}</h3>
         
                <span>{ingredient}</span>
                <h5>
                    <button onClick={handleLikeClick}>💜{likesCount}</button><br></br>
                    
                </h5>
                <h5>{bartender}</h5>
            </div>
            <Link to={`/cocktails/${id}`} className="view-more-btn">View More</Link>
        </div>
    ) : ""
}

export default CocktailCard;