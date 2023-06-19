import React, { useEffect } from "react";
import { Switch, Route } from "react-router-dom";
import { useDispatch } from 'react-redux'
import { updateUser } from '../features/user/userSlice';
import '../App.css';
import NavBar from "./NavBar";
import Home from "./Home";
import Signup from "./Signup";
import Profile from "./Profile"
import CocktailsContainer from "./CocktailsContainer";
import CocktailDetail from "./CocktailDetail";
import CocktailEdit from "./CocktailEdit";
import CategoriesContainer from "./CategoriesContainer";
import CategoryDetail from "./CategoryDetail";
import { useHistory } from "react-router-dom/cjs/react-router-dom";
import Login from "./Login";

function App() {
    const history = useHistory();
    const dispatch = useDispatch();

    useEffect(() => {
    // GET /me
    const token = localStorage.getItem("token");
    const user = localStorage.getItem("user")
    
    if (token && user) {
      fetch("http://localhost:7000/me", {
        headers: {
          Authorization: `Bearer ${token}`,
          // "Cross-Origin-Resource-Policy": "cross-origin" 
        },
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
          if (user) {
            dispatch(updateUser(user));
          } else {
            history.push("/login")
          }
        });
      } else {
        history.push("/signup")
      }

  }, [dispatch, history]);


  return (
    <div className="App">
      <NavBar />
      <Switch>
          <Route exact path="/">
              <Home />
          </Route>
          <Route exact path="/signup">
              <Signup />
          </Route>
          <Route exact path="/login">
              <Login />
          </Route>
          <Route exact path="/profile">
              <Profile />
          </Route>
          <Route exact path="/cocktails">
              <CocktailsContainer />
          </Route>
          <Route exact path="/cocktails/:id">
              <CocktailDetail />
          </Route>
          <Route exact path="/cocktails/:id/edit">
              <CocktailEdit />
          </Route>
          <Route exact path="/categories">
              <CategoriesContainer />
          </Route>
          <Route exact path="/categories/:id">
              <CategoryDetail />
          </Route>
          <Route path="*">
              <h1>404 not found</h1>
          </Route>
      </Switch>
    </div>
  );
}

export default App;
