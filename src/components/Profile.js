import React, {useState} from "react";
import { useDispatch, useSelector } from 'react-redux'
import { updateUser } from '../features/user/userSlice'
import Workplace from './Workplace'

const Profile = () => {
    const user = useSelector(state => state.user.user)
    const dispatch = useDispatch()
    console.log(user, "user")
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
                dispatch(updateUser(user));
              });
      }

const { full_name, username, password, location, bartender, work_at, instagram_account  } = formData;

const { biography, insta_follower, insta_following, profile_pic } = user
const insta_profile = profile_pic.replace("&", "&amp;")
console.log(insta_profile)

    return(
    <div className="container-box">
        <button>Update Profile</button>
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

                <input type="submit" value="Update" className="update-btn" />
            </form>
        </div>
        <div className="favorite-list">
            <img src={profile_pic} alt={instagram_account} />
            <p>{biography}</p>
            <p>Instagram followers: {insta_follower}</p>
            <p>Instagram following: {insta_following}</p>
            {!work_at ? null : <Workplace user={user}/>}
        </div>
        <div className="favorite-list">
            {/* <FavoriteList user={user} handleAddFavorite={handleAddFavorite} handleDeleteFavorite={handleDeleteFavorite} favoriteList={favoriteList} isLoaded={isLoaded} /> */}
        </div>
    </div>
    )
}

export default Profile;