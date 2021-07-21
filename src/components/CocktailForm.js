import React, { useState } from "react";
// import styled from 'styled-components';
import { useHistory } from "react-router-dom";
// import sign_up_page_img from "../images/signup.jpeg";
import { useDispatch, useSelector } from 'react-redux'
import { addUserCocktail  } from '../features/user/userSlice'
import { cocktailAdded } from '../features/cocktails/cocktailsSlice'

// const Button = styled.button`
//   width: 20%;
//   border-radius: 20px;
//   background-color: #706897;
//   color: #F3C397;
//   font-weight: 600;
//   opacity: 0.7;
//   cursor: pointer;
// `
function CocktailForm() {
  const user = useSelector(state => state.user.user)
  const dispatch = useDispatch();
  const history = useHistory();
  
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [execution, setExecution] = useState("")
  const [ingredients, setIngredients] = useState([])
  const [category, setCategory] = useState("")
  const [photo, setPhoto] = useState({})
  

  // const hiddenFileInput = React.useRef(null)

  // const handleClick = event => {
  //   hiddenFileInput.current.click();
  // };

  function handleAddFile (event) {
    if (event.target.files[0]) {
      setPhoto({photo : event.target.files[0]})
    }
      // console.log(photo, "file attached")
  }

  function handleAttachPhoto (cocktail) {
    
    const cocktailPhoto = new FormData();
    cocktailPhoto.append("file", photo.photo);
    // console.log(photo, "photo file")
    // console.log(cocktailPhoto, "formPhoto")
    // console.log(cocktail, "newCocktail 2b patched")
    // configure your fetch url appropriately
    fetch(`http://localhost:7000/image/${cocktail.id}`, {
      method: "PATCH",
      body: cocktailPhoto
    })
      .then(res => res.json())
      .then(newCocktail => {
        // history.push("/profile")
        dispatch(cocktailAdded(newCocktail))
        dispatch(addUserCocktail(newCocktail))
        history.push(`/cocktails/${cocktail.id}`)
      //  console.log(newCocktail, "newCocktail")
      });
  }

  function handleSubmit(event) {
    event.preventDefault();

    const formData = {
      user_id: parseInt(user.id),
      name: name,
      description: description,
      execution: execution,
      ingredients: [ingredients],
      category: category,
  };

    fetch("http://localhost:7000/cocktails", {
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
      .then((cocktail) => {
        // console.log(cocktail, "posted cocktail")
       handleAttachPhoto(cocktail)
       
      })

  }


  return (
    <div className="signup-form">
        <div className="form-box">
            <form onSubmit={handleSubmit}>
                <h1 id="signup-text">Add Your Cocktail</h1><br></br>

                <label>Cocktail Name</label><br></br>
                <textarea
                    type="text"
                    name="name"
                    className="cocktail-box"
                    value={name}
                    onChange={event => setName(event.target.value)}
                /><br></br>


                <label>Description</label><br></br>
                <textarea
                    type="text"
                    name="description"
                    className="cocktail-box"
                    value={description}
                    onChange={event => setDescription(event.target.value)}
                /><br></br>

                <label>Execution</label><br></br>
                <textarea
                    type="text"
                    name="execution"
                    className="cocktail-box"
                    value={execution}
                    onChange={event => setExecution(event.target.value)}
                /><br></br>

                <label>Ingredients</label><br></br>
                <textarea
                    type="text"
                    name="ingredients"
                    className="cocktail-box"
                    value={ingredients}
                    onChange={event => setIngredients(event.target.value)}
                /><br></br>

                <label>Cocktail Category</label>
                <select className="cocktail-box" name="catergory" value={category} onChange={event => setCategory(event.target.value)}>
                  <option value="">Choose a cocktail category</option>
                  <option value="Ancestral">Ancestral</option>
                  <option value="Duos and Trios">Duos and Trios</option>
                  <option value="French Italian">French Italian</option>
                  <option value="Enhanced Sour">Enhanced Sour</option>
                  <option value="New Orleans Sour">New Orleans Sour</option>
                  <option value="International Sour">International Sour</option>
                  <option value="Sparkling Sour">Sparkling Sour</option>
                  <option value="Champagne Cocktail">Champagne Cocktail</option>
                  <option value="Frozen">Frozen</option>
                  <option value="Highball">Highball</option>
                  <option value="Toddy">Toddy</option>
                  <option value="Flips and Nogs">Flips and Nogs</option>
                  <option value="Juleps and Smashes">Juleps and Smashes</option>
                  <option value="Punch">Punch</option>
                  <option value="Pousse">Pousse</option>
                  <option value="Tiki">Tiki</option>
                  <option value="Simple Sour">Simple Sour</option>
                  <option value="Snapper">Snapper</option>
                  <option value="Orphan">Orphan</option>
                </select><br></br>

                <label>Add an image to your cocktail</label>
                <br></br>
                <br></br>
                
                {/* <Button onClick={handleClick}>
                  Upload 
                </Button> */}
            
                <input
                    type="file"
                    name="newImage"
                    // ref={hiddenFileInput}
                    className="cocktail-box"
                    accept="image/png, image/jpeg"
                    onChange={handleAddFile}
                    // style={{display: 'none'}}
                />
                <br></br>
                <br></br>

                <input type="submit" value="Add Cocktail" className="cocktail-edit-btn" />
            </form>
        </div>
        {/* <img id="background-img" src={sign_up_page_img} alt="background-img"/> */}
    </div>
  );
}

export default CocktailForm;