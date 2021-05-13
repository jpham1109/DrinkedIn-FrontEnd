import React, { useState } from "react"
import { Link, Switch, Route } from "react-router-dom"
import { useHistory } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux'
import { logoutUser } from '../features/user/userSlice';
import Login from "./Login"

const NavBar = () => {
    const user = useSelector((state) => state.user.loggedin)
    const dispatch = useDispatch();
    const history = useHistory();
    const [isShowLogin, setIsShowLogin] = useState(true)

    const handleLoginClick = () => {
        setIsShowLogin((isShowLogin) => !isShowLogin)
         console.log(isShowLogin)
      }
  
    const logout = () => {
        localStorage.removeItem("token")
        localStorage.removeItem("user")
        dispatch(logoutUser())
        history.push('/login');
    }

    return (
        <div>
          <div className="navbar">
            <div className="home">
                <Link to="/" id="logo"><i className="fas fa-cocktail"></i>DRINKEDIN</Link>
                {/* <Link to="/" className="home-text">Home</Link> */}
            </div>
            <div>
                {user ? (
            <div className="navbar-links">
                <Link to="/categories" className="categories-nav">Categories</Link>
                <Link to="/cocktails" className="cocktails-nav">Featured</Link>
                {/* <Link to="/profile" className="favorite-nav">Profile</Link> */}
                <Link to="/profile" className="profile-nav"><i className="far fa-user-circle"/></Link>
                <Link to="/"onClick={logout} className="logout-btn">Logout</Link>
            </div>
                ) : (
            <div>
              <div className="navbar-links-logout">
                <Link to="/" onClick={handleLoginClick} className="loginicon">{isShowLogin}Sign In</Link>
                <Link to="/signup" className="loggedinicon">Sign Up</Link>
              </div>
              <Switch>
                <Route exact path="/">
                  <Login  isShowLogin={isShowLogin}/>
                </Route>
              </Switch>
            </div>
                )}
            </div>
          </div>
        </div>
    )
}

export default NavBar