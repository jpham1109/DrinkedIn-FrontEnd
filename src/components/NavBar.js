import React, { useEffect, useState } from "react";
import { Link, Route, Routes } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import {
  logoutUser,
  selectCurrentUser,
  setCurrentUser,
  useGetUserQuery,
} from "../features/user/userSlice";
import Login from "./Login";

const NavBar = () => {
  const currentUser = useSelector(selectCurrentUser);
  const dispatch = useDispatch();

  // Automatically fetch user every 15 minutes, unless user is not logged in (no token in localStorage)
  const { data, isFetching } = useGetUserQuery("user", {
    skip: !localStorage.getItem("token"),
    pollingInterval: 900000,
  });

  useEffect(() => {
    if (data) {
      dispatch(setCurrentUser(data));
    }
  }, [data, dispatch]);

  const navigate = useNavigate();

  const handleLogOut = () => {
    localStorage.removeItem("token");
    dispatch(logoutUser());
    navigate("/login");
  };

  return (
    <div>
      <div className="navbar">
        <div className="home">
          <Link to="/" id="logo">
            <i className="fas fa-cocktail"></i>DRINKEDIN
          </Link>
          {/* <Link to="/" className="home-text">Home</Link> */}
        </div>
        <div>
          {currentUser ? (
            <div className="navbar-links">
              <Link to="/categories" className="categories-nav">
                Categories
              </Link>
              <Link to="/cocktails" className="cocktails-nav">
                Featured
              </Link>
              {/* <Link to="/profile" className="favorite-nav">Profile</Link> */}
              <Link to="/profile" className="profile-nav">
                <i className="far fa-user-circle" />
              </Link>
              <Link to="/" onClick={handleLogOut} className="logout-btn">
                Logout {currentUser.full_name ?? currentUser.username}{" "}
              </Link>
            </div>
          ) : (
            <div>
              <div className="navbar-links-logout">
                <Link to="/" className="loginicon">
                  Log In
                </Link>
                <Link to="/signup" className="loggedinicon">
                  Sign Up
                </Link>
              </div>
              <Routes>
                <Route path="/" element={<Login />} />
              </Routes>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NavBar;
