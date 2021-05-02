import React, { useEffect, useState } from "react";
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
import CocktailForm from "./CocktailForm";
import CategoriesContainer from "./CategoriesContainer";
import CategoryDetail from "./CategoryDetail";

function App() {
    // const history = useHistory();
    const dispatch = useDispatch();
    const [isLoaded, setIsLoaded] = useState(false)
    // const [userPhotos, setUserPhotos] = useState(null)

    useEffect(() => {
    // GET /me
    const token = localStorage.getItem("token");
    fetch("http://localhost:7000/me", {
      headers: {
        Authorization: `Bearer ${token}`,
        "Cross-Origin-Resource-Policy": "cross-origin" 
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
        console.log(user)
        dispatch(updateUser(user));
        console.log(user.photos, "user's photos")
        // setUserPhotos(user.photos)
        setIsLoaded(true)
      });
  }, [dispatch]);

  useEffect(() => {
    const getUser = localStorage.getItem("user")
    if (getUser) {
      dispatch(updateUser(JSON.parse(getUser)))
    }
  }, [])

  return (
    <div className="App">
      <NavBar />
      <Switch>
          <Route exact path="/">
              <Home />
          </Route>
          <Route path="/signup">
              <Signup />
          </Route>
          <Route path="/profile">
              <Profile />
          </Route>
          <Route exact path="/cocktails">
              <CocktailsContainer />
          </Route>
          <Route path="/cocktails/:id">
              <CocktailDetail />
          </Route>
          <Route path="/cocktails/new">
              <CocktailForm />
          </Route>
          <Route path="/categories">
              <CategoriesContainer />
          </Route>
          <Route path="/categories/:id">
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
