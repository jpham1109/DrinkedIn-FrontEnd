import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { addUserLike, updateUser } from '../features/user/userSlice'


const CocktailCard = ({ cocktail }) => {

    const { id, name, ingredients, image, likes_count, user } = cocktail

    const current_user = useSelector(state => state.user.user)
    const dispatch = useDispatch()

    const [ingredient, setIngredient] = useState([])
    const [likesCount, setLikesCount] = useState(likes_count)
    const [bartender, setBartender] = useState([])
 

    const handleLikeClick = () => {
        
        fetch(`http://localhost:7000/likes`, {
            method: 'POST',
            headers: {
                "content-Type": "application/json"
            },
            body: JSON.stringify({ liker_id: current_user.id, liked_cocktail_id: id })
        })
        .then((r) => {
            return r.json().then((data) => {
              if (r.ok) {
                return data;
              } else {
                throw data;
              }
            });
          })
        .then((new_like) => {
            console.log(new_like, "new like")
            // dispatch(updateUser(new_like))
            dispatch(addUserLike(new_like))
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
        if (likes_count) {
            setLikesCount(likes_count)
        }
    }, [ingredients, likes_count, user])
 

   
    return cocktail ? (
        <div className="cocktail-card">
            <div className="image-cocktail">
                <img src={image} alt={name} height="250px" width="260px"/>
            </div>
            <div className="cocktail-card-info">
                <h3>{name}</h3>
         
                <span>{ingredient}</span>
                <h5>
                    <button onClick={handleLikeClick}>💜 {likesCount}</button><br></br>
                    
                </h5>
                <h5>{bartender}</h5>
            </div>
            <Link to={`/cocktails/${id}`} className="view-more-btn">View More</Link>
        </div>
    ) : ""
}

export default CocktailCard;