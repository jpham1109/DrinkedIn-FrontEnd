import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import CategoryCard from "./CategoryCard";
import Workplace from "./Workplace";

export default function CocktailDetails() {
    const current_user = useSelector(state => state.user.user)
    const {id} = useParams()

    const [cocktail, setCocktail] = useState([])

    const { name, description, execution, ingredients, image, likes_count, category, user } = cocktail
    
    const [likesCount, setLikesCount] = useState(likes_count)
  
    useEffect(() => {
        fetch(`http://localhost:7000/cocktails/${id}`)
        .then(r => r.json())
        .then(cocktail => setCocktail(cocktail))
    }, [id])

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


    const {full_name, username, location, instagram_account, biography, insta_follower, insta_following, profile_pic} = user
    
    return user ? (
        <div>
            <div>Cocktail
                <div className="image-cocktail">
                    <img src={image} alt={name} />
                </div>
                <h3>{name}</h3>
                <p>{description}</p>
                <span>{ingredients}</span>
                <span>{execution}</span>
                <h5>Likes: {likesCount}
                    <button onClick={handleLikeClick}>💜</button>
                </h5>
                <div>Cocktail Category
                    <CategoryCard category={category}/>
                </div>
            </div>
            <div>User
            <img src={profile_pic} alt={instagram_account} />
                    <p>Name: {full_name} | DrinkedIn name: {username}</p>
                    <p>Location: {location}</p>
                    <p>Instagram: {instagram_account}</p>
                    <p>Bio: {biography}</p>
                    <p>Instagram followers: {insta_follower} | Instagram following: {insta_following}</p>
            </div>
            <div>Establishment
                <Workplace user={user}/>
            </div>
        </div>
    ) : " "
}