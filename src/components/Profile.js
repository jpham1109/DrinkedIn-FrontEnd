import React, {useState, useEffect} from "react";
import { useDispatch, useSelector } from 'react-redux'
import { updateUser } from '../features/user/userSlice'
import profile from "../images/profile.jpeg";
import Workplace from './Workplace'
import CocktailCard from "./CocktailCard";

const Profile = () => {
    const user = useSelector(state => state.user.user)
    const dispatch = useDispatch()

    const [avatar, setAvatar] = useState({})
    const [toggleForm, setToggleForm] = useState(false)
    const [cocktailCreated, setCocktailCreated] = useState([])
    const [likedCocktails, setLikedCocktails] = useState([])

    useEffect(() => {
        dispatch(updateUser(user))
    }, [dispatch, user])

    useEffect(() => {
        if (cocktails) {
            setCocktailCreated(cocktails)
        }
        if (likes) {
            setLikedCocktails(likes)
        }
    }, [])

    const handleToggleUpdate = () => {
        setToggleForm(prev => !prev)
    }

   
    const [formData, setFormData] = useState({
        full_name: user.full_name,
        username: user.username,
        password: user.password,
        location: user.location,
        bartender: user.bartender,
        work_at: user.work_at,
        instagram_account: user.instagram_account,
      });
    
      function handleChange(event) {
        const key = event.target.name
        const value = event.target.type === "checkbox" ? event.target.checked : event.target.value

        setFormData({
        ...formData,
        [key]: value,
        });
      }
      
      function handleAddFile (event) {
        if (event.target.files[0]) {
          setAvatar({avatar : event.target.files[0]})
        }
        //   console.log(avatar, "file attached")
      }

      function handleAttachAvatar (user) {
    
        const userAvatar = new FormData();
        userAvatar.append("file", avatar.avatar);
       
        fetch(`http://localhost:7000/avatar/${user.id}`, {
          method: "PATCH",
          body: userAvatar
        })
          .then(res => res.json())
          .then(updatedUser => {
            // history.push("/profile")
            dispatch(updateUser(updatedUser))
            // console.log(updatedUser, "updated user")
          });
      }

    function handleSubmit(e) {
        e.preventDefault();
        // TODO: update the user's profile
            const token = localStorage.getItem("token");
            fetch("http://localhost:7000/me", {
              method: "PATCH",
              headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify(formData),
            })
              .then(r => r.json())
              .then(user => {
                // console.log(user)
                handleAttachAvatar(user)
                dispatch(updateUser(user));
              });
      }

    const { full_name, username, password, location, bartender, work_at, instagram_account  } = formData;

    const { biography, insta_follower, insta_following, profile_pic, workplace_rating, workplace_ratings_total, likes, cocktails } = user
    // console.log(likes, "liked cocktails")
    console.log(cocktails, "created cocktails")
    const cocktailItems = cocktailCreated.map(cocktail => 
        // <li key={cocktail.id} >Cocktail name: {cocktail.name}</li>
        <CocktailCard key={cocktail.id} cocktail={cocktail}/>
    )
    
    const likedItems = likedCocktails.map(cocktail => 
        // <li key={cocktail.id}>Cocktail name: {cocktail.name}</li>
        <CocktailCard key={cocktail.id} cocktail={cocktail.cocktail}/>
        )

    return user ? 
    (
        <>
        <div className="profile-container">
            <div className="profile-item-1">
                {cocktailCreated ? 
                <div>
                    <h3>Your cocktails</h3>
                    <div className="cocktail-list">
                    {cocktailItems}
                    </div>
                </div> : null}
            </div>
            
            <div className="profile-item 2">
                <div>
                {instagram_account? <div className="favorite-list">
                    <img src={profile_pic} alt={instagram_account} />
                    <p>{biography}</p>
                    <p>Instagram followers: {insta_follower} | Instagram following: {insta_following}</p>
                </div> : null}
                    {work_at ? 
                        <div> 
                            <h5>Bartender at: {work_at} </h5>
                            <p>{workplace_rating} ⭐️ | {workplace_ratings_total} reviews</p>
                            {/* <Workplace user={user}/>  */}
                        </div>: null}
                </div>                    
                <button onClick={handleToggleUpdate}>Update Profile</button>
                {!toggleForm ? null :
                <div className="profile-form">
                    <form className="my-profile" onSubmit={handleSubmit}>
                        <h1>{user.username}'s Profile</h1>
                        <label>Full Name</label><br></br>
                            <input
                                type="text"
                                name="full_name"
                                className="signup-box"
                                value={full_name}
                                onChange={handleChange}
                            /><br></br>


                            <label>Username</label><br></br>
                            <input
                                type="text"
                                name="username"
                                className="signup-box"
                                value={username}
                                onChange={handleChange}
                            /><br></br>

                            <label>Password</label><br></br>
                            <input
                                type="password"
                                name="password"
                                className="signup-box"
                                value={password}
                                onChange={handleChange}
                            /><br></br>

                            <label>Location</label><br></br>
                            <input
                                type="text"
                                name="location"
                                className="signup-box"
                                value={location}
                                onChange={handleChange}
                            /><br></br>

                            <label>Bartender</label>
                            <input
                                type="checkbox"
                                name="bartender"
                                className="signup-box"
                                checked={bartender}
                                onChange={handleChange}
                            /><br></br>

                            {!bartender ? null : (<div>
                                <label>Work At</label><br></br>
                                <input
                                    type="text"
                                    name="work_at"
                                    className="signup-box"
                                    value={work_at}
                                    onChange={handleChange}
                                />
                            </div>)}  
                            <br></br>

                            <label>Instagram Username</label><br></br>
                            <input
                                type="text"
                                name="instagram_account"
                                className="signup-box"
                                value={instagram_account}
                                onChange={handleChange}
                            />
                            <br></br>
                            <label>Add an avatar</label>
                            <input
                            type="file"
                            name="newImage"
                            // ref={hiddenFileInput}
                            className="cocktail-box"
                            accept="image/png, image/jpeg"
                            onChange={handleAddFile}
                            // style={{display: 'none'}}
                        />
                        <input type="submit" value="Update" className="update-btn" />
                    </form>
                </div>}
                
            </div>
            <div className="liked-list">
                {likedCocktails ? <ul>You liked these cocktails:
                {likedItems}
                </ul> : null}
            </div>
            <img id="profile-img" src={profile} alt="profile-img"/>
    </div>
    </>
    ) :  ""
}

export default Profile;