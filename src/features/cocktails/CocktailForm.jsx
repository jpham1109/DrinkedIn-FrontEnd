import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { Error } from '../../components/Error'
import { cocktailFormOptions } from '../../data/formOptions'
import { addUserCocktail, selectCurrentUsersId } from '../auth/authSlice'
import { useAddNewCocktailMutation } from './cocktailsSlice'

function CocktailForm() {
	const [addNewCocktail] = useAddNewCocktailMutation()
	const userId = useSelector(selectCurrentUsersId)
	const dispatch = useDispatch()
	const navigate = useNavigate()

	const {
		formState: { errors },
		handleSubmit,
		register,
	} = useForm()

	const [addCocktailError, setAddCocktailError] = useState(null)

	const handleAddCocktail = async (data, e) => {
		e.preventDefault()

		const body = new FormData()
		// append form fields to body FormData object
		Object.entries(data).forEach(([key, value]) => {
			if (key === 'photo') {
				if (value[0]) {
					body.append('cocktail[photo]', value[0])
				}
			} else {
				body.append(`cocktail[${key}]`, value)
			}
		})
		// append userId to body FormData object in snake case form for Rails backend
		body.append('cocktail[user_id]', userId)

		try {
			await addNewCocktail(body)
				.unwrap()
				.then((cocktail) => {
					dispatch(addUserCocktail(cocktail))
					navigate(`/cocktails/${cocktail.id}`)
				})
		} catch (requestError) {
			console.error('Failed to add cocktail:', requestError)
			requestError &&
				setAddCocktailError(`Failed to add cocktail: ${requestError} `)
		}
	}

	return (
		<div className="signup-form">
			<div className="form-box">
				<form onSubmit={handleSubmit(handleAddCocktail)}>
					<h1 id="signup-text">Add Your Cocktail</h1>
					<br></br>

					<label>Cocktail Name</label>
					<br></br>
					<textarea
						type="text"
						name="name"
						className="cocktail-box"
						{...register('name', cocktailFormOptions.name)}
					/>
					{errors.name && <Error> {errors.name.message}</Error>}
					<br></br>

					<label>Description</label>
					<br></br>
					<textarea
						type="text"
						name="description"
						className="cocktail-box"
						{...register('description', cocktailFormOptions.description)}
					/>
					{errors.description && <Error> {errors.description.message}</Error>}
					<br></br>

					<label>Ingredients</label>
					<br></br>
					<textarea
						type="text"
						name="ingredients"
						className="cocktail-box"
						{...register('ingredients', cocktailFormOptions.ingredients)}
					/>
					{errors.ingredients && <Error> {errors.ingredients.message}</Error>}
					<br></br>

					<label>Execution</label>
					<br></br>
					<textarea
						type="text"
						name="execution"
						className="cocktail-box"
						{...register('execution', cocktailFormOptions.execution)}
					/>
					{errors.execution && <Error> {errors.execution.message}</Error>}
					<br></br>

					<label>Cocktail Category</label>
					<select
						className="cocktail-box"
						name="category"
						{...register('category', cocktailFormOptions.category)}
					>
						<option hidden disabled selected value="">
							Choose a cocktail category
						</option>
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
					</select>
					{errors.category && <Error> {errors.category.message}</Error>}
					<br></br>

					<label>Add an image to your cocktail</label>
					<br></br>
					<br></br>

					<input
						type="file"
						name="photo"
						className="cocktail-box"
						accept="image/*"
						{...register('photo')}
					/>
					<br></br>
					<br></br>

					<input
						type="submit"
						value="Add Cocktail"
						className="cocktail-edit-btn"
					/>
					{addCocktailError ? <Error>{addCocktailError}</Error> : null}
				</form>
			</div>
		</div>
	)
}

export default CocktailForm
