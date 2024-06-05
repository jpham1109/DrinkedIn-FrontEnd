import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { Error } from '../../../components/Error'
import { cocktailFormOptions } from '../../../data/formOptions'
import { addUserCocktail, selectCurrentUsersId } from '../../auth/authSlice'
import { useAddNewCocktailMutation } from '../cocktailsSlice'
import appStyles from '../../../components/App/App.module.css'
import styles from './CocktailForm.module.css'

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
		<div className={appStyles.formContainer}>
			<form className={styles.form} onSubmit={handleSubmit(handleAddCocktail)}>
				<h1>Add A New Cocktail</h1>

				<label>
					Cocktail Name
					<textarea
						type="text"
						name="name"
						{...register('name', cocktailFormOptions.name)}
					/>
				</label>
				{errors.name && <Error> {errors.name.message}</Error>}

				<label>
					Description
					<textarea
						type="text"
						name="description"
						{...register('description', cocktailFormOptions.description)}
					/>
				</label>
				{errors.description && <Error> {errors.description.message}</Error>}

				<label>
					Ingredients
					<textarea
						type="text"
						name="ingredients"
						{...register('ingredients', cocktailFormOptions.ingredients)}
					/>
				</label>
				{errors.ingredients && <Error> {errors.ingredients.message}</Error>}

				<label>
					Execution
					<textarea
						type="text"
						name="execution"
						{...register('execution', cocktailFormOptions.execution)}
					/>
				</label>
				{errors.execution && <Error> {errors.execution.message}</Error>}

				<label>
					Cocktail Category
					<select
						name="category"
						{...register('category_id', cocktailFormOptions.category)}
					>
						<option hidden disabled selected value="">
							Choose a cocktail category
						</option>
						<option value="1">Ancestral</option>
						<option value="2">Duos and Trios</option>
						<option value="3">French Italian</option>
						<option value="4">Simple Sour</option>
						<option value="5">Enhanced Sour</option>
						<option value="6">New Orleans Sour</option>
						<option value="7">International Sour</option>
						<option value="8">Sparkling Sour</option>
						<option value="9">Champagne Cocktail</option>
						<option value="10">Frozen</option>
						<option value="11">Highball</option>
						<option value="12">Toddy</option>
						<option value="13">Flips and Nogs</option>
						<option value="14">Juleps and Smashes</option>
						<option value="15">Punch</option>
						<option value="16">Pousse</option>
						<option value="17">Tiki</option>
						<option value="18">Snapper</option>
						<option value="19">Orphan</option>
					</select>
				</label>
				{errors.category_id && <Error> {errors.category_id.message}</Error>}
				<label>
					Add an image to your cocktail
					<input
						type="file"
						name="photo"
						accept="image/*"
						{...register('photo', cocktailFormOptions.photo)}
					/>
				</label>
				{errors.photo && <Error> {errors.photo.message}</Error>}

				<button type="submit">Submit</button>
				{addCocktailError ? <Error>{addCocktailError}</Error> : null}
			</form>
		</div>
	)
}

export default CocktailForm
