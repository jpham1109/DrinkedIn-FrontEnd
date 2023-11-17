import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import CocktailCard from "../features/cocktails/CocktailCard";
import {
  deleteUserCocktail,
  deleteUserFollow,
  deleteUserFollowing,
  deleteUserLike,
  selectCurrentUser,
  selectUserBars,
  selectUserCocktails,
  selectUserFollowers,
  selectUserFollowings,
  selectUserLikes,
  updateUser,
} from "../features/user/userSlice";
import profile from "../images/profile.jpeg";
import avatarDefault from "../images/user-avatar.jpg";
import UserCard from "./UserCard";

const Profile = () => {
  const currentUser = useSelector(selectCurrentUser);
  const bars = useSelector(selectUserBars) ?? null;
  //Cocktails that I added
  const cocktails = useSelector(selectUserCocktails);
  //Cocktails that I like
  const likes = useSelector(selectUserLikes);
  //Users that I follow
  const following = useSelector(selectUserFollowings);
  //Users that follow me
  const followed = useSelector(selectUserFollowers);

  const dispatch = useDispatch();

  const [avatar, setAvatar] = useState({});
  const [toggleForm, setToggleForm] = useState(false);
  const [cocktailCreated, setCocktailCreated] = useState([]);
  const [likedCocktails, setLikedCocktails] = useState([]);
  const [followedUsers, setFollowedUsers] = useState([]);
  const [followingUsers, setFollowingUsers] = useState([]);

  useEffect(() => {
    if (cocktails) {
      setCocktailCreated(cocktails);
    }
    if (likes) {
      setLikedCocktails(likes);
    }
    if (following) {
      setFollowedUsers(following);
    }
    if (followed) {
      setFollowingUsers(followed);
    }
  }, [cocktails, likes, following, followed]);

  const handleToggleUpdate = () => {
    setToggleForm((prev) => !prev);
  };

  const handleDeleteCocktail = (event) => {
    const id = event.target.id;
    fetch(`${process.env.REACT_APP_BACKEND_URL}/cocktails/${id}`, {
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
      .then((cocktail) => {
        dispatch(deleteUserCocktail(cocktail));
        handleRemoveCocktail(cocktail);
      });
  };

  function handleRemoveCocktail(cocktailToRemove) {
    const newCocktails = cocktailCreated.filter(
      (cocktail) => cocktail.id !== cocktailToRemove.id
    );
    setCocktailCreated(newCocktails);
  }

  const handleDeleteLike = (event) => {
    const id = event.target.id;
    fetch(`${process.env.REACT_APP_BACKEND_URL}/likes/${id}`, {
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
      .then((likeToRemove) => {
        // console.log(likeToRemove, "deleted liked cocktail")
        dispatch(deleteUserLike(likeToRemove));
        handleRemoveLike(likeToRemove);
        //  setTimeout(function() {
        // window.location.reload()
        // }, 0)
      });
  };

  function handleRemoveLike(likeToRemove) {
    const newLikes = likedCocktails.filter(
      (likedCocktail) =>
        likedCocktail.liked_cocktail_id !== likeToRemove.liked_cocktail_id
    );
    setLikedCocktails(newLikes);
    console.log(newLikes, "new Likes");
  }

  const handleUnfollow = (event) => {
    const id = event.target.id;
    fetch(`${process.env.REACT_APP_BACKEND_URL}/follows/${id}`, {
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
      .then((followedToRemove) => {
        dispatch(deleteUserFollow(followedToRemove.follower));
        handleRemoveFollowedUser(followedToRemove);
      });
  };

  function handleRemoveFollowedUser(followedToRemove) {
    const newFollowing = followedUsers.filter(
      (followedUser) =>
        followedUser.follower_id !== followedToRemove.follower_id
    );

    setFollowedUsers(newFollowing);
  }

  const handleRemoveFollower = (event) => {
    const id = event.target.id;
    fetch(`${process.env.REACT_APP_BACKEND_URL}/follows/${id}`, {
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
      .then((followingToRemove) => {
        dispatch(deleteUserFollowing(followingToRemove.followee));
        handleRemoveFollowingUser(followingToRemove);
      });
  };

  function handleRemoveFollowingUser(followingToRemove) {
    const newFollowed = followingUsers.filter(
      (following) => following.followee_id !== followingToRemove.followee_id
    );

    setFollowingUsers(newFollowed);
  }

  const [formData, setFormData] = useState({
    full_name: currentUser.full_name,
    username: currentUser.username,
    password: currentUser.password,
    location: currentUser.location,
    bartender: currentUser.bartender,
    work_at: currentUser.work_at ?? undefined,
    instagram_account: currentUser.instagram_account ?? undefined,
  });

  function handleChange(event) {
    const key = event.target.name;
    const value =
      event.target.type === "checkbox"
        ? event.target.checked
        : event.target.value;

    setFormData({
      ...formData,
      [key]: value,
    });
  }

  function handleAddFile(event) {
    if (event.target.files[0]) {
      setAvatar({ avatar: event.target.files[0] });
    }
    console.log(avatar, "file attached");
  }

  function handleAttachAvatar(user) {
    const userAvatar = new FormData();
    userAvatar.append("file", avatar.avatar);

    fetch(`${process.env.REACT_APP_BACKEND_URL}/avatar/${user.id}`, {
      method: "PATCH",
      body: userAvatar,
    })
      .then((res) => res.json())
      .then((updatedUser) => {
        // history.push("/profile")
        dispatch(updateUser(updatedUser));
        // console.log(updatedUser, "updated user")
      });
  }

  function handleSubmit(e) {
    e.preventDefault();
    // TODO: update the user's profile
    const token = localStorage.getItem("token");
    fetch(`${process.env.REACT_APP_BACKEND_URL}/me`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(formData),
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
      .then((user) => {
        if (Object.keys(avatar).length !== 0) {
          handleAttachAvatar(user);
        }
        dispatch(updateUser(user));
        handleToggleUpdate();
      });
  }

  const {
    full_name,
    username,
    password,
    location,
    bartender,
    work_at,
    instagram_account,
  } = formData;

  const { biography, insta_follower, insta_following, profile_pic } =
    currentUser;

  const cocktailItems = cocktailCreated.map((cocktail) => (
    <div key={cocktail.id} className="cocktail-item">
      <CocktailCard cocktail={cocktail} />
      <Link to={`/cocktails/${cocktail.id}/edit`}>
        {" "}
        <button className="edit-btn">Edit</button>{" "}
      </Link>
      <button
        id={cocktail.id}
        onClick={handleDeleteCocktail}
        className="delete-btn"
      >
        Delete
      </button>
    </div>
  ));

  const likedItems = likedCocktails.map((like) => (
    // <li key={cocktail.id}>Cocktail name: {cocktail.name}</li>
    <div key={like.id} className="liked-card">
      <CocktailCard cocktail={like.liked_cocktail} />
      <button id={like.id} onClick={handleDeleteLike} className="delete-btn">
        Delete
      </button>
    </div>
  ));

  const followingUserItems = followedUsers.map((followed) => (
    <div key={followed.id}>
      <UserCard user={followed.follower} />
      <button id={followed.id} onClick={handleUnfollow} className="delete-btn">
        Delete
      </button>
    </div>
  ));

  const followedUserItems = followingUsers.map((following) => (
    <div key={following.id}>
      <UserCard user={following.followee} />
      <button
        id={following.id}
        onClick={handleRemoveFollower}
        className="delete-btn"
      >
        Delete
      </button>
    </div>
  ));

  return currentUser ? (
    <>
      <div className="profile-container">
        <div className="profile-item-1">
          {Object.keys(cocktails).length !== 0 ? (
            <div className="cocktail-creations">
              <h3 className="profile-item-1-title">Creations</h3>
              <div className="cocktail-list">
                {/* <Slider {...settings}> */}
                {cocktailItems}
                {/* </Slider> */}
              </div>
            </div>
          ) : null}
        </div>

        <div className="profile-item-2">
          <h3 className="profile-item-2-title">Profile</h3>
          <div className="profile-wrapper">
            <div className="profile-info">
              {instagram_account ? (
                <div>
                  <h3>Instagram</h3>
                  <img
                    src={profile_pic ?? avatarDefault}
                    alt={instagram_account}
                  />
                  <p>{biography}</p>
                  <p>
                    Instagram followers: {insta_follower} | Instagram following:{" "}
                    {insta_following}
                  </p>
                </div>
              ) : (
                <img src={profile_pic ?? avatarDefault} alt="profile-pic" />
              )}
              {/*bars ? (
                <div className="work_info">
                  <h5>Bartender at: {bars.name} </h5>
                  <img src={bars.photos[0]} alt={bars.name} />
                  <p>Address: {bars.address}</p>
                  <p>
                    {bars.rating} ⭐️ | {bars.total_ratings} reviews
                  </p>
                  
                </div>
              ) : null*/}
            </div>
            <div>
              <button className="profile-btn" onClick={handleToggleUpdate}>
                Update Profile
              </button>
              {!toggleForm ? null : (
                <div className="profile-form">
                  <form className="my-profile" onSubmit={handleSubmit}>
                    <h1>{currentUser.username}'s Profile</h1>
                    <label>Full Name</label>
                    <br></br>
                    <input
                      type="text"
                      name="full_name"
                      className="profile-box"
                      value={full_name}
                      onChange={handleChange}
                    />
                    <br></br>

                    <label>Username</label>
                    <br></br>
                    <input
                      type="text"
                      name="username"
                      className="profile-box"
                      value={username}
                      onChange={handleChange}
                    />
                    <br></br>

                    <label>Password</label>
                    <br></br>
                    <input
                      type="password"
                      name="password"
                      className="profile-box"
                      value={password}
                      onChange={handleChange}
                    />
                    <br></br>

                    <label>Location</label>
                    <br></br>
                    <input
                      type="text"
                      name="location"
                      className="profile-box"
                      value={location}
                      onChange={handleChange}
                    />
                    <br></br>

                    <label>Bartender</label>
                    <input
                      type="checkbox"
                      name="bartender"
                      className="profile-box"
                      checked={bartender}
                      onChange={handleChange}
                    />
                    <br></br>

                    {!bartender ? null : (
                      <div>
                        <label>Work At</label>
                        <br></br>
                        <input
                          type="text"
                          name="work_at"
                          className="profile-box"
                          value={work_at}
                          onChange={handleChange}
                        />
                      </div>
                    )}
                    <br></br>

                    <label>Instagram Username</label>
                    <br></br>
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
                    <input
                      type="submit"
                      value="Update"
                      className="update-btn"
                    />
                  </form>
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="profile-item-3">
          {Object.keys(likes).length !== 0 ? (
            <div className="liked-cocktails">
              <h3 className="profile-item-3-tilte"> 💜 cocktails </h3>
              <div className="liked-list">{likedItems}</div>
            </div>
          ) : null}
        </div>
        <div className="profile-item-4">
          {Object.keys(following).length !== 0 ? (
            <div className="following">
              <h3 className="profile-item-4-tilte">Following </h3>
              <div className="following-card">{followingUserItems}</div>
            </div>
          ) : null}
        </div>
        <div className="profile-item-5">
          {Object.keys(followed).length !== 0 ? (
            <div className="followed">
              <h3 className="profile-item-5-tilte">Followers </h3>
              <div className="followed-card">{followedUserItems}</div>
            </div>
          ) : null}
        </div>
        <img id="profile-img" src={profile} alt="profile-img" />
      </div>
    </>
  ) : (
    ""
  );
};

export default Profile;
