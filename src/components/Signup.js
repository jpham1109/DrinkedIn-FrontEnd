import React, { useState } from "react";
import { useHistory } from "react-router-dom";
import sign_up_page_img from "../images/signup.jpeg";
import { useDispatch } from 'react-redux'
import { updateUser } from '../features/user/userSlice'

function Signup() {
  const dispatch = useDispatch();
  const history = useHistory();
  const [errors, setErrors] = useState([])
  const [formData, setFormData] = useState({
    full_name: "",
    username: "",
    password: "",
    location: "",
    bartender: false,
    work_at: "",
    instagram_account: "",
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
    fetch("http://localhost:7000/signup", {
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
        localStorage.setItem("token", token);
        dispatch(updateUser(user));
        history.push("/cocktails");
      })
      .catch((error) => {
        setErrors(error.errors);
      });
  }

  const { full_name, username, password, location, bartender, work_at, instagram_account } = formData;

  return (
    <div className="signup-form">
        <div className="form-box">
            <form onSubmit={handleSubmit}>
                <h1 id="signup-text">Sign Up</h1><br></br>

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

                {errors.map(error => 
                <p style={{ color: "red"}} key={error}>
                {error}
                </p>
                )}

                <input type="submit" value="SIGN UP" className="signup-btn" />
            </form>
        </div>
        <img id="background-img" src={sign_up_page_img} alt="background-img"/>
    </div>
  );
}

export default Signup;