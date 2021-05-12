import React, { useState } from "react";
import { useHistory, Link } from "react-router-dom";
import { useDispatch } from 'react-redux';
import { updateUser } from '../features/user/userSlice';

const Login = ({isShowLogin}) => {
  const dispatch = useDispatch();
  const history = useHistory();
  const [errors, setErrors] = useState([]);

  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });

  function handleChange(e) {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  }

  function handleSubmit(e) {
    e.preventDefault();
    fetch("http://localhost:7000/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
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
      .then((data) => {
        const { user, token } = data;
        console.log(user, "user")
        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(user));
        dispatch(updateUser(user));
        history.push("/categories");
      })
      .catch((error) => {
        console.log(error, "login error")
        if (error) {
        setErrors(error.errors);
        }
      });
  }

  return (
<div className={`${isShowLogin ? "active" : ""} show`}>
<div className="login-form">
    <div className="form-box solid">
      <form onSubmit={handleSubmit}>
        <h1 className="login-text">Sign In</h1>
        <label>Username</label><br></br>
        <input
          type="text"
          name="username"
          className="login-box"
          value={formData.username}
          onChange={handleChange}
        /><br></br>
        <label>Password</label><br></br>
        <input
          type="password"
          name="password"
          className="login-box"
          value={formData.password}
          onChange={handleChange}
        /><br></br>
        {errors.map(error => 
        <p style={{ color: "red"}} key={error}>
          {error}
        </p>
        )}
        <input type="submit" value="LOGIN" className="login-btn" />
      </form>
    </div>
</div>
</div>
  );
}

export default Login;