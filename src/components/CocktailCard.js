import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
// import { useHistory } from "react-router-dom";
import { useSelector } from "react-redux";


const CocktailCard = ({ cocktail }) => {
    const { id, name, description, ingredients, image, likes_count, creator } = cocktail

    const current_user = useSelector(state => state.user.user)

    const [ingredient, setIngredient] = useState([])
    const [likesCount, setLikesCount] = useState(likes_count)
 

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
        <li key={i}>{i}</li>
        )
        setIngredient(ingredientItems)
    }
    }, [ingredients])
 
    console.log(likes_count, "likes_count")
   
    return image ? (
        <div className="cocktail-card">
            <div className="image-cocktail">
                <img src={image} alt={name} />
            </div>
            <h3>{name}</h3>
            <p>{description}</p>
            <span>{ingredient}</span>
            <h5>Likes: {likesCount}
                <button onClick={handleLikeClick}>💜</button>
            </h5>
            <h5>Creator: {creator}</h5>
            <Link to={`/cocktails/${id}`} className="view-more-btn">View More</Link>
        </div>
    ) : ""
}

export default CocktailCard;