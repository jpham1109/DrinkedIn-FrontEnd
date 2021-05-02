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
        dispatch(logoutUser())
        history.push('/login');
    }

    return (
        <div>
          <div className="navbar">
            <div className="home">
                <Link to="/" id="logo"><i className="fas fa-map-marked-alt"></i>DRINKEDIN</Link>
                <Link to="/" className="home-text">Home</Link>
            </div>
            <div>
                {user ? (
            <>
                <Link to="/categories" className="categories-btn">Cocktail Categories</Link>
                <Link to="/profile" className="favorite">Profile</Link>
                <Link to="/profile" className="profile"><i className="far fa-user-circle"/></Link>
                <Link to="/"onClick={logout} className="logout-btn">Logout</Link>
            </>
                ) : (
            <>
                <Link to="/" onClick={handleLoginClick} className="loginicon">{isShowLogin}Sign In</Link>
                <Link to="/signup" className="loggedinicon">Sign Up</Link>
              <Switch>
                <Route exact path="/">
                  <Login  isShowLogin={isShowLogin}/>
                </Route>
              </Switch>
            </>
                )}
            </div>
          </div>
        </div>
    )
}

export default NavBar