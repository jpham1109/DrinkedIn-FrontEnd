import React from "react";
import { Link } from "react-router-dom";
import { useHistory } from "react-router-dom";


const CategoryCard = ({ category }) => {
    // create state for likesCount and pass down to DestinationDetails
    const { id, name, definition, popular_drinks } = category
    const categoryCocktail = popular_drinks[Math.floor(Math.random() * popular_drinks.length)]
    
    const history = useHistory()
    const changeLocation = () => {
        history.push(`/categories/${id}`)
    }
  
    return (
        <div className="category-card">
            <div className="image-category">
                <img src={categoryCocktail["image"]} alt={categoryCocktail["name"]} />
                <p>{categoryCocktail["name"]}</p>
            </div>
            <h3>{name}</h3>
            <p>{definition}</p>
            <Link to={`/categories/${id}`} className="view-more-btn">View More</Link>
        </div>
    )
}

export default CategoryCard;