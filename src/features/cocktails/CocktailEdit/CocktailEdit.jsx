import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate, useParams } from 'react-router-dom'
import { Error } from '../../../components/Error'
import { cocktailFormOptions } from '../../../data/formOptions'
import { updateUsersCocktail } from '../../auth/authSlice'
import { selectCocktailById, useEditCocktailMutation } from '../cocktailsSlice'
import appStyles from '../../../components/App/App.module.css'
import styles from './CocktailEdit.module.css'
import cocktailEditImage from '../../../images/edit.jpeg'

function CocktailEdit() {
	const { id } = useParams()

	// read the cocktail data from getCocktails query endpoint
	const cocktail = useSelector((state) =>
		selectCocktailById(state, parseInt(id, 10))
	)
	//  Mutation hook to edit cocktail data
	const [editCocktail] = useEditCocktailMutation()

	// React hook form
	const {
		register,
		handleSubmit,
		formState: { errors },
		reset,
	} = useForm()

	// Use effect to reset the form with default values once the cocktail data is available
	useEffect(() => {
		if (cocktail) {
			reset({
				name: cocktail.name,
				description: cocktail.description,
				execution: cocktail.execution,
				ingredients: cocktail.ingredients,
				category_id: cocktail.category.id,
			})
		}
	}, [cocktail, reset])

	const [editCocktailError, setEditCocktailError] = useState(null)

	const dispatch = useDispatch()
	const navigate = useNavigate()

	const handleEditCocktail = async (data, event) => {
		event.preventDefault()

		// change only the fields that have been updated
		const updatedFields = new FormData()
		// append updated fields to FormData object
		Object.entries(data).forEach(([key, value]) => {
			// If the photo field is not empty, append the photo to the FormData object
			if (key === 'photo') {
				if (Object.keys(value).length !== 0) {
					updatedFields.append('cocktail[photo]', value[0])
				}
				// updatedFields.append('cocktail[photo]', value[0])
			} else if (key === 'category_id') {
				// Compare category name instead of the category object
				if (value !== cocktail.category.id) {
					updatedFields.append('cocktail[category_id]', value)
				}
			} else if (value !== '' && value !== cocktail[key]) {
				updatedFields.append(`cocktail[${key}]`, value)
			}
		})
		updatedFields.append('id', id)

		try {
			await editCocktail(updatedFields)
				.unwrap()
				.then((updatedCocktail) => {
					dispatch(updateUsersCocktail(updatedCocktail))
					navigate(`/cocktails/${updatedCocktail.id}`)
				})
		} catch (requestError) {
			console.error('Failed to update cocktail:', requestError)
			requestError && setEditCocktailError('Failed to update cocktail')
		}
	}

	return cocktail ? (
		<div className={appStyles.formContainer}>
			<form className={styles.form} onSubmit={handleSubmit(handleEditCocktail)}>
				<h1>Update Cocktail</h1>

				<label>
					Cocktail Name
					<textarea
						type="text"
						name="name"
						{...register('name', cocktailFormOptions.name, {
							validate: (value) =>
								value !== cocktail.name || 'Name is the same as before',
						})}
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
					Execution
					<textarea
						type="text"
						name="execution"
						{...register('execution', cocktailFormOptions.execution)}
					/>
				</label>
				{errors.execution && <Error> {errors.execution.message}</Error>}

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
					Cocktail Category
					<select
						name="catergory"
						{...register('category_id', cocktailFormOptions.category)}
					>
						<option hidden disabled value="">
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
					Upload a different featured image
					<input
						type="file"
						name="photo"
						accept="image/*"
						{...register('photo')}
					/>
				</label>

				{editCocktailError ? <Error>{editCocktailError}</Error> : null}
				<button type="submit">Update Cocktail</button>
			</form>
			<img
				className={appStyles.backgroundImage}
				src={cocktail.photo ?? cocktailEditImage}
				alt={cocktail.name}
				loading="lazy"
			/>
		</div>
	) : (
		<Error> Cocktail not found </Error>
	)
}

export default CocktailEdit
