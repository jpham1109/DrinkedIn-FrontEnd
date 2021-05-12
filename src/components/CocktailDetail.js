import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useParams } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import CategoryDetail from "./CategoryCard";
import Workplace from "./Workplace";
import { fetchCategories } from "../features/categories/categoriesSlice";
import { updateUser } from "../features/user/userSlice";

export default function CocktailDetail() {
    const current_user = useSelector(state => state.user.user)
    const dispatch = useDispatch()
    const { id } = useParams()
 
    const [cocktail, setCocktail] = useState([])
    const [category, setCategory] = useState([])
    const [user, setUser] = useState([])
    const [ingredient, setIngredient] = useState([])
    const [follow, setFollow] = useState(false)

    // console.log(follow, "follow")

    useEffect(() => {
        fetch(`http://localhost:7000/cocktails/${id}`)
        .then(r => r.json())
        .then(cocktail => {
            console.log(cocktail)
            dispatch(fetchCategories)
            setUser(cocktail.user)
            setCocktail(cocktail)
            setLikesCount(cocktail.likes_count)
            
            if (current_user.followed_users.find(f => f.follower.id === cocktail.user.id)) {
                setFollow(true)
            }
        })
    }, [id])
    
    const { name, description, execution, ingredients, image, likes_count } = cocktail
    
    const [likesCount, setLikesCount] = useState(likes_count)
    // console.log(likesCount, "num of likes")
    useEffect(() => {
        if (ingredients) {
    const ingredientItems = ingredients.map(i => 
        <li className="ingredients-list" key={i}>{i}</li>
        )
        setIngredient(ingredientItems)
    }
    }, [ingredients])
    
    const handleLikeClick = () => {
        
        fetch(`http://localhost:7000/likes`, {
            method: 'POST',
            headers: {
                "content-Type": "application/json"
            },
            body: JSON.stringify({ user_id: current_user.id, cocktail_id: id })
        })
        .then(r => { 
            return r.json().then((data) => {
            if (r.ok) {
              return data;
            } else {
              throw data;
            }
          });
        })
        .then((data) => {
            // console.log(data, "error?")
            setLikesCount(likesCount => likesCount + 1)
        })
    }

    const handleFollow = (event) => {
        const id = event.target.id

        fetch(`http://localhost:7000/follows`, {
            method: 'POST',
            headers: {
                "content-Type": "application/json"
            },
            body: JSON.stringify({ user_id: id, current_user_id: current_user.id })
        })
        .then(r => { 
            return r.json().then((data) => {
            if (r.ok) {
              return data;
            } else {
              throw data;
            }
          });
        })
        .then((follow) => {
            console.log(follow, "new follow")
            setFollow(prev => !prev)
            dispatch(updateUser(follow))
        })
    }
    
    
    return  (
        <div className="cocktail-detail">
            <div className="cocktail-detail-1">
                <img src={image} alt={name} />
                <h3>{name}</h3>
                <p>{description}</p>
                <span>{ingredient}</span>
                <span>{execution}</span>
                <h5>Likes: {likesCount}
                    <button onClick={handleLikeClick}>💜</button>
                </h5>
                <div>
                    <p>Category: {category.name}</p>
                    <p>{category.definition}</p>
                    <Link to={`/categories/${category.id}`} className="view-more-btn">View More</Link>
                </div>
            </div>

            <div className="cocktail-detail-2">
                    <img src={user.profile_pic} alt={user.instagram_account} />
                    <p>Name: {user.full_name} | DrinkedIn name: {user.username}</p>
                    <p>Location: {user.location}</p>
                    <p>Instagram: {user.instagram_account}</p>
                    <p>Bio: {user.biography}</p>
                    <p>Instagram followers: {user.insta_follower} | Instagram following: {user.insta_following}</p>
                    { current_user.id !== user.id ?
                    <button onClick={handleFollow} id={user.id} >{follow ? "Followed" : "Follow"} {user.full_name}</button> : null}
            </div>

            <Workplace user={user}/>
        </div>
    ) 
}