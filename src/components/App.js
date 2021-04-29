import React, { useEffect, useState } from "react";
import { Switch, Route } from "react-router-dom";
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
