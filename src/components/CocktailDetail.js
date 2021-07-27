import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useParams } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import CategoryDetail from "./CategoryCard";
import Workplace from "./Workplace";
import { fetchCategories } from "../features/categories/categoriesSlice";
import { addUserFollow, addUserLike } from "../features/user/userSlice";

export default function CocktailDetail() {
    const current_user = useSelector(state => state.user.user)
    const followed_users = useSelector(state => state.user.followed_users)
    const likes = useSelector(state => state.user.likes)

    const dispatch = useDispatch()
    const { id } = useParams()
 
    const [loading, setLoading] = useState(false)
    const [cocktail, setCocktail] = useState([])
    const [category, setCategory] = useState([])
    const [bartender, setBartender] = useState([])
    const [bio, setBio] = useState([])
    const [bar, setBar] = useState([])
    const [ingredient, setIngredient] = useState([])
    const [follow, setFollow] = useState(false)
    const [like, setLike] = useState(false)

    useEffect(() => {
        fetch(`http://localhost:7000/cocktails/${id}`)
        .then(r => { 
            return r.json().then((data) => {
            if (r.ok) {
              return data;
            } else {
              throw data;
            }
          });
        })
        .then(cocktail => {
            setLoading(true)
            setCocktail(cocktail)
            setLikesCount(cocktail.likes_count)
            setCategory(cocktail.category)
            console.log(cocktail,id, "cocktail id")
            if (followed_users.find(f => f.follower.id === cocktail.bartender_id)) {
                setFollow(true)
            }
            if (likes.find(l => l.liked_cocktail_id === cocktail.id)) {
                setLike(true)
                console.log(like, "liked?")
            }

            fetch(`http://localhost:7000/users/${cocktail.bartender_id}`)
                .then(r => { 
                    return r.json().then((data) => {
                    if (r.ok) {
                      return data;
                    } else {
                      throw data;
                    }
                  });
                })
                .then(bartender => {
                    console.log(bartender, "bartender")
                    setBartender(bartender)
                    setBio(bartender.biography)
                    setBar(bartender.bars[bartender.bars.length - 1])
                 
                })
        })
    }, [id, dispatch, followed_users])

    const { name, description, execution, ingredients, image, likes_count } = cocktail
    
    const [likesCount, setLikesCount] = useState(likes_count)

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
            body: JSON.stringify({ liker_id: current_user.id, liked_cocktail_id: id })
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
        .then((new_like) => {
            
            setLike(prev => !prev)
            dispatch(addUserLike(new_like))
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
            dispatch(addUserFollow(follow))
        })
    }
   
    return loading ? (
        <div className="cocktail-detail">
            <div className="cocktail-detail-1">
                <img src={image} alt={name} />
                <h3>{name}</h3>
                <p>{description}</p>
                <span>{ingredient}</span><br></br>
                <span>{execution}</span>
                <h5>
                    <button className="follow-btn" onClick={handleLikeClick}> {likesCount} { like ? "You liked this " : "💜 "}  </button>
                </h5>
                <div >
                    <p className="cocktail-detail-1-category">Category: {category.name}</p>
                    <p>{category.definition}</p>
                    <Link to={`/categories/${category.id}`} className="view-more-btn">View More</Link>
                </div>
            </div>

            <div className="cocktail-detail-2">
                    <img src={bartender.profile_pic} alt={bartender.instagram_account} />
                    <h3>Bartender</h3>
                    <p>Name: {bartender.full_name} | DrinkedIn: {bartender.username}</p>
                    <p>Location: {bartender.location}</p>
                    <p>Instagram: {bartender.instagram_account}</p>
                    {(bio.length !== 0) ? <p>Bio: {bio}</p> : null}
                    <p>Instagram followers: {bartender.insta_follower} | Instagram following: {bartender.insta_following}</p>
                    { current_user.id !== bartender.id ?
                    <button className="follow-btn" onClick={handleFollow} id={bartender.id} >{follow ? "Followed" : "Follow"} {bartender.full_name}</button> : null}
            </div>

            <Workplace bar={bar}/>
            
        </div>
    ) : ""
}