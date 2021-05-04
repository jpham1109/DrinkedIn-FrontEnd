import React from "react";
import { Link } from "react-router-dom";
import { useHistory } from "react-router-dom";


const CocktailCard = ({ cocktail }) => {
    // create state for likesCount and pass down to DestinationDetails
    const { id, name, description, ingredients, photo, likes, user } = cocktail

    const ingredientItems = ingredients.map(i => 
        <li key={i}>{i}</li>
        )
    
    return (
        <div className="cocktail-card">
            <div className="image-container">
                <img src={photo.record.image} alt={name} />
            </div>
            <h3>{name}</h3>
            <p>{description}</p>
            <span>{ingredientItems}</span>
            <h5>Likes: {likes.length}</h5>
            <h5>Creator: {user.full_name}</h5>
            <Link to={`/cocktails/${id}`} className="view-more-btn">View More</Link>
        </div>
    )
}

export default CocktailCard;