import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useParams } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import CategoryDetail from "./CategoryCard";
import Workplace from "./Workplace";
import { fetchCategories } from "../features/categories/categoriesSlice";

export default function CocktailDetail() {
    const current_user = useSelector(state => state.user.user)
    const dispatch = useDispatch()
    const { id } = useParams()
 
    const [cocktail, setCocktail] = useState([])
    const [category, setCategory] = useState([])
    const [user, setUser] = useState([])

    useEffect(() => {
        fetch(`http://localhost:7000/cocktails/${id}`)
        .then(r => r.json())
        .then(cocktail => {
            console.log(cocktail)
            dispatch(fetchCategories)
            setUser(cocktail.user)
            setCocktail(cocktail)
            setCategory(cocktail.category)
        })
    }, [id])
    
    const { name, description, execution, ingredients, image, likes_count } = cocktail
    
    // console.log(user.username, "creator")
    console.log(cocktail, "cocktail")
    console.log(cocktail.category, "category")
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
    
    console.log(cocktail.user, "user")

    // const {full_name, username, location, instagram_account, biography, insta_follower, insta_following, profile_pic} = user
    
    return  (
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
                <div>Category
                    <p>{category.name}</p>
                    <p>{category.definition}</p>
                    <Link to={`/categories/${category.id}`} className="view-more-btn">View More</Link>
                </div>
            </div>
            <div>Bartender
            <img src={user.profile_pic} alt={user.instagram_account} />
                    <p>Name: {user.full_name} | DrinkedIn name: {user.username}</p>
                    <p>Location: {user.location}</p>
                    <p>Instagram: {user.instagram_account}</p>
                    <p>Bio: {user.biography}</p>
                    <p>Instagram followers: {user.insta_follower} | Instagram following: {user.insta_following}</p>
                    <button>Follow {user.full_name}</button>
            </div>
            <div>Establishment
                <Workplace user={user}/>
            </div>
        </div>
    ) 
}