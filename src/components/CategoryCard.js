import React from "react";
import { Link } from "react-router-dom";
import { useHistory } from "react-router-dom";


const CategoryCard = ({ category }) => {
    // create state for likesCount and pass down to DestinationDetails
    const { id, name, definition, popular_drinks } = category
    const cocktail = popular_drinks[Math.floor(Math.random() * popular_drinks.length)]
    
    const history = useHistory()
    const changeLocation = () => {
        history.push(`/categories/${id}`)
    }
  
    return (
        <div className="cocktail-card">
            <div className="image-container">
                <img src={cocktail["image"]} alt={cocktail["name"]} />
                <p>{cocktail["name"]}</p>
            </div>
            <h3>{name}</h3>
            <p>{definition}</p>
            <Link to={`/categories/${id}`} className="view-more-btn">View More</Link>
        </div>
    )
}

export default CategoryCard;