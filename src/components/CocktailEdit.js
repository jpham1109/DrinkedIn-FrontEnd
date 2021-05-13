import React, { useState, useEffect } from "react";
// import styled from 'styled-components';
import { useHistory, useParams } from "react-router-dom";
import edit from "../images/edit.jpeg";
import { useDispatch, useSelector } from 'react-redux'
// import { addUserCocktail  } from '../features/user/userSlice'
import { updateUserCocktail  } from '../features/user/userSlice'
import { cocktailUpdated } from '../features/cocktails/cocktailsSlice'


function CocktailEdit() {

  const [editCocktail, setEditCocktail] = useState([])
  const dispatch = useDispatch();
  const history = useHistory();
  const { id } = useParams()

  useEffect(() => {
    fetch(`http://localhost:7000/cocktails/${id}`)
    .then(r => r.json())
    .then(data => {
        // console.log(data, "cocktail to edit")
        setEditCocktail(data)
        setName(data.name)
        setDescription(data.description)
        setExecution(data.execution)
        setIngredients(data.ingredients)
        setCategory(data.category)
    })
  }, [id])
  
  const [name, setName] = useState(editCocktail.name)
  const [description, setDescription] = useState(editCocktail.description)
  const [execution, setExecution] = useState(editCocktail.execution)
  const [ingredients, setIngredients] = useState(editCocktail.ingredients)
  const [category, setCategory] = useState(editCocktail.category)
  const [photo, setPhoto] = useState({})

  function handleAddFile (event) {
    if (event.target.files[0]) {
      setPhoto({photo : event.target.files[0]})
    }
      // console.log(photo, "file attached")
  }

  function handleAttachPhoto (editedCocktail) {
    
    const cocktailPhoto = new FormData();
    cocktailPhoto.append("file", photo.photo);
 
    fetch(`http://localhost:7000/image/${editedCocktail.id}`, {
      method: "PATCH",
      body: cocktailPhoto
    })
      .then(res => res.json())
      .then(editedCocktail => {
     
        history.push("/profile")
        dispatch(cocktailUpdated(editedCocktail))
 
      });
  }

 

  function handleSubmit(event) {
    event.preventDefault();

    const updateData = {
      id: parseInt(id),
      name: name,
      description: description,
      execution: execution,
      ingredients: ingredients,
      category: category,
  };

    fetch(`http://localhost:7000/cocktails/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updateData),
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
      .then((editedCocktail) => {
        if (Object.keys(photo).length !== 0) {
            handleAttachPhoto(editedCocktail)
        } else {
            // dispatch(updateUserCocktail(editedCocktail))
            // history.push("/profile")
            dispatch(cocktailUpdated(editedCocktail))
            history.push(`/cocktails/${id}`)
        }
        setTimeout(function() {
            window.location.reload()
          }, 0)
      })
  }

// console.log(photo, "photo")

  return (
    <div className="cocktail-edit">
        <div className="cocktail-edit-form-box">
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
                  <option value="Snapper">Simple Sour</option>
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

                <input type="submit" value="Update Cocktail" className="cocktail-btn" />
            </form>
        </div>
        <img id="background-img" src={edit} alt="background-img"/>
    </div>
  );
}

export default CocktailEdit;