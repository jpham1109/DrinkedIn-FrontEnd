import React, {useState, useEffect} from "react";
import { useDispatch, useSelector } from 'react-redux'
import { Link } from "react-router-dom";
import { fetchUser, updateUser, deleteUserLike, deleteUserCocktail, deleteUserFollow, deleteUserFollowing } from '../features/user/userSlice'
import profile from "../images/profile.jpeg";
import Workplace from './Workplace'
import CocktailCard from "./CocktailCard";
import UserCard from "./UserCard";



const Profile = () => {
    const user = useSelector(state => state.user.user)
    const bar = useSelector(state => state.user.bars[state.user.bars.length - 1])
    console.log(bar, "bar")
    const cocktails = useSelector(state => state.user.cocktails)
    const liked_cocktails = useSelector(state => state.user.liked_cocktails)
    const following = useSelector(state => state.user.followed_users)
    const followed = useSelector(state => state.user.following_users)

    const dispatch = useDispatch()

    const [avatar, setAvatar] = useState({})
    const [toggleForm, setToggleForm] = useState(false)
    const [cocktailCreated, setCocktailCreated] = useState([])
    const [likedCocktails, setLikedCocktails] = useState([])
    const [followedUsers, setFollowedUsers] = useState([])
    const [followingUsers, setFollowingUsers] = useState([])


    useEffect(() => {
        dispatch(fetchUser())
    }, [dispatch, bar, cocktails, liked_cocktails, following, followed])

    useEffect(() => {
        
        if (cocktails) {
            setCocktailCreated(cocktails)
        }
        if (liked_cocktails) {
            setLikedCocktails(liked_cocktails)
        }
        if (following) {
            setFollowedUsers(following)
        }
        if (followed) {
            setFollowingUsers(followed)
        }
    }, [cocktails, liked_cocktails, following, followed])

    const handleToggleUpdate = () => {
        setToggleForm(prev => !prev)
    }

    const handleDeleteCocktail = (event) => {
        const id = event.target.id
        fetch(`http://localhost:7000/cocktails/${id}`, {
            method: "DELETE",
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
        .then(cocktail => {
            dispatch(deleteUserCocktail(cocktail))
            handleRemoveCocktail(cocktail)
        })
    }

    function handleRemoveCocktail(cocktailToRemove) {
        const newCocktails = cocktailCreated.filter((cocktail) => cocktail.id !== cocktailToRemove.id)
        setCocktailCreated(newCocktails)
    }

    const handleDeleteLike = (event) => {
        const id = event.target.id
        fetch(`http://localhost:7000/likes/${id}`, {
            method: "DELETE",
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
        .then(likeToRemove => {
            // console.log(likeToRemove, "deleted liked cocktail")
            dispatch(deleteUserLike(likeToRemove.liked_cocktail))
            handleRemoveLike(likeToRemove)
        })
    }

    function handleRemoveLike(likeToRemove) {
        const newLikes = likedCocktails.filter((likedCocktail) => likedCocktail.id !== likeToRemove.liked_cocktail_id)
        setLikedCocktails(newLikes)
    }

    const handleUnfollow = (event) => {
        const id = event.target.id
        fetch(`http://localhost:7000/follows/${id}`, {
            method: "DELETE",
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
        .then(followedToRemove => {
           
            dispatch(deleteUserFollow(followedToRemove.follower))
            handleRemoveFollowedUser(followedToRemove)
        })
    }

    function handleRemoveFollowedUser(followedToRemove) {
        const newFollowing = followedUsers.filter(followedUser => followedUser.follower_id !== followedToRemove.follower_id)
        
        setFollowedUsers(newFollowing)
    }

    const handleRemoveFollower = (event) => {
        const id = event.target.id 
        fetch(`http://localhost:7000/follows/${id}`, {
            method: "DELETE",
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
        .then(followingToRemove => {
            dispatch(deleteUserFollowing(followingToRemove.followee))
            handleRemoveFollowingUser(followingToRemove)
        })  
    }

    function handleRemoveFollowingUser(followingToRemove) {
        const newFollowed = followingUsers.filter(following => following.followee_id !== followingToRemove.followee_id)

        setFollowingUsers(newFollowed)
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
                if (Object.keys(avatar).length !== 0) {
                handleAttachAvatar(user)
                dispatch(updateUser(user));
                } else {
                    dispatch(updateUser(user));
                }
                handleToggleUpdate();
              });
      }

    const { full_name, username, password, location, bartender, work_at, instagram_account  } = formData;

    const { biography, insta_follower, insta_following, profile_pic } = user
    // if (bar) {
    // const { name, photos, rating, total_ratings, address } = bar
    // }
    console.log(bar, "bar")
 
    const cocktailItems = cocktailCreated.map(cocktail => 
        <div key={cocktail.id} className="cocktail-item">
        <CocktailCard  cocktail={cocktail}/>
        <Link to={`/cocktails/${cocktail.id}/edit`}> <button className="edit-btn">Edit</button> </Link>
        <button id={cocktail.id} onClick={handleDeleteCocktail} className="delete-btn">Delete</button>
        </div>
    )
    
    const likedItems = likedCocktails.map(cocktail => 
        // <li key={cocktail.id}>Cocktail name: {cocktail.name}</li>
        <div key={cocktail.id} className="liked-card">
            <CocktailCard  cocktail={cocktail}/>
            <button id={cocktail.id} onClick={handleDeleteLike} className="delete-btn">Delete</button>
        </div>
        )

    const followingUserItems = followedUsers.map(followed => 
        <div key={followed.id}>
            <UserCard user={followed.follower} />
            <button id={followed.id} onClick={handleUnfollow} className="delete-btn">Delete</button>
        </div>
        )

    const followedUserItems = followingUsers.map(following => 
        <div key={following.id}>
            <UserCard user={following.followee} />
            <button id={following.id} onClick={handleRemoveFollower} className="delete-btn">Delete</button>
        </div>
        )
   
    return user ? 
    (
        <>
        <div className="profile-container">
            <div className="profile-item-1">
                {Object.keys(cocktails).length !== 0 ? 
                <div className="cocktail-creations">
                    <h3 className="profile-item-1-title">Creations</h3>
                    <div className="cocktail-list">
                        {/* <Slider {...settings}> */}
                            {cocktailItems}
                        {/* </Slider> */}
                    </div>
                </div> : null}
            </div>
            
            <div className="profile-item-2">
                <h3 className="profile-item-2-title">Profile</h3>
                <div className="profile-wrapper"> 
                <div className="profile-info">
                {instagram_account? <div >
                    <h3>Instagram</h3>
                    <img src={profile_pic} alt={instagram_account} />
                    <p>{biography}</p>
                    <p>Instagram followers: {insta_follower} | Instagram following: {insta_following}</p>
                </div> : <img src={profile_pic} alt="profile-pic"/>}
                    { bar ? 
                        <div className="work_info"> 
                            <h5>Bartender at: {bar.name} </h5>
                            <img src={bar.photos[0]} alt={bar.name}/>
                            <p>Address: {bar.address}</p>
                            <p>{bar.rating} ⭐️ | {bar.total_ratings} reviews</p>
                            {/* <Workplace user={user}/>  */}
                        </div>: null}
                </div>
                <div>                    
                    <button className="profile-btn" onClick={handleToggleUpdate}>Update Profile</button>
                    {!toggleForm ? null :
                    <div className="profile-form">
                        <form className="my-profile" onSubmit={handleSubmit}>
                            <h1>{user.username}'s Profile</h1>
                            <label>Full Name</label><br></br>
                                <input
                                    type="text"
                                    name="full_name"
                                    className="profile-box"
                                    value={full_name}
                                    onChange={handleChange}
                                /><br></br>


                                <label>Username</label><br></br>
                                <input
                                    type="text"
                                    name="username"
                                    className="profile-box"
                                    value={username}
                                    onChange={handleChange}
                                /><br></br>

                                <label>Password</label><br></br>
                                <input
                                    type="password"
                                    name="password"
                                    className="profile-box"
                                    value={password}
                                    onChange={handleChange}
                                /><br></br>

                                <label>Location</label><br></br>
                                <input
                                    type="text"
                                    name="location"
                                    className="profile-box"
                                    value={location}
                                    onChange={handleChange}
                                /><br></br>

                                <label>Bartender</label>
                                <input
                                    type="checkbox"
                                    name="bartender"
                                    className="profile-box"
                                    checked={bartender}
                                    onChange={handleChange}
                                /><br></br>

                                {!bartender ? null : (<div>
                                    <label>Work At</label><br></br>
                                    <input
                                        type="text"
                                        name="work_at"
                                        className="profile-box"
                                        value={work_at}
                                        onChange={handleChange}
                                    />
                                </div>)}  
                                <br></br>

                                <label>Instagram Username</label><br></br>
                                <input
                                    type="text"
                                    name="instagram_account"
                                    className="profile-box"
                                    value={instagram_account}
                                    onChange={handleChange}
                                />
                                <br></br>
                                <label>Add an avatar</label>
                                <input
                                type="file"
                                name="newImage"
                                // ref={hiddenFileInput}
                                className="profile-box"
                                accept="image/png, image/jpeg"
                                onChange={handleAddFile}
                                // style={{display: 'none'}}
                            />
                            <input type="submit" value="Update" className="update-btn" />
                        </form>
                    </div>}
                </div>
                </div>
            </div>
            <div className="profile-item-3">
                {Object.keys(liked_cocktails).length !== 0 ? <div className="liked-cocktails">
                    <h3 className="profile-item-3-tilte"> 💜 cocktails </h3>
                    <div className="liked-list">
                        {likedItems}
                    </div>
                </div> : null}
            </div>
            <div className="profile-item-4">
                {Object.keys(following).length !== 0 ? 
                    <div className="following">
                        <h3 className="profile-item-4-tilte">Following </h3>
                        <div className="following-card">
                            {followingUserItems}
                        </div>
                    </div> : null}                        
            </div>
            <div className="profile-item-5">
                {Object.keys(followed).length !== 0 ? 
                <div className="followed">
                   <h3 className="profile-item-5-tilte">Followers </h3>
                   <div className="followed-card">
                       {followedUserItems}
                   </div>
                </div> : null}

            </div>
            <img id="profile-img" src={profile} alt="profile-img"/>
    </div>
    </>
    ) :  ""
}

export default Profile;