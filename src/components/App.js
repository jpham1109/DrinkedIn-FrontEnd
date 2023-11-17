import React from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import "../App.css";
import ProtectedRoute from "../routing/ProtectedRoute";
import CategoriesContainer from "../features/categories/CategoriesContainer";
import CategoryDetail from "../features/categories/CategoryDetail";
import CocktailDetail from "../features/cocktails/CocktailDetail";
import CocktailEdit from "../features/cocktails/CocktailEdit";
import CocktailsContainer from "../features/cocktails/CocktailsContainer";
import Home from "./Home";
import Login from "./Login";
import NavBar from "./NavBar";
import Profile from "./Profile";
import Signup from "./Signup";

function App() {
  //   const history = useHistory();
  //   const dispatch = useDispatch();

  //   useEffect(() => {
  //   // GET /me
  //   const token = localStorage.getItem("token");
  //   const user = localStorage.getItem("user")
  //   console.log(localStorage, "local storage")
  //   console.log({token, user}, "token & user")
  //   if (token && user) {
  //     fetch(`${process.env.REACT_APP_BACKEND_URL}/me`, {
  //       headers: {
  //         Authorization: `Bearer ${token}`,
  //         // "Cross-Origin-Resource-Policy": "cross-origin"
  //       },
  //     })
  //       .then((r) => {
  //         return r.json().then((data) => {
  //           if (r.ok) {
  //             return data;
  //           } else {
  //             throw data;
  //           }
  //         });
  //       })
  //       .then((user) => {
  //         if (user) {
  //           dispatch(updateUser(user));
  //         } else {
  //           history.push("/login")
  //         }
  //       });
  //     } else {
  //       history.push("/signup")
  //     }

  // }, [dispatch, history]);

  return (
    <div className="App">
      <NavBar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
        <Route element={<ProtectedRoute />}>
          <Route path="/profile" element={<Profile />} />
          <Route path="/cocktails" element={<CocktailsContainer />} />
          <Route path="/cocktails/:id" element={<CocktailDetail />} />
          <Route path="/cocktails/:id/edit" element={<CocktailEdit />} />
        </Route>
        <Route path="/categories" element={<CategoriesContainer />} />
        <Route path="/categories/:id" element={<CategoryDetail />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}

export default App;
