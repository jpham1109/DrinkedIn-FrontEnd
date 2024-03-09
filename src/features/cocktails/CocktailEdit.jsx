import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useDispatch } from 'react-redux'
import { useNavigate, useParams } from 'react-router-dom'
import { Error } from '../../components/Error'
import { cocktailFormOptions } from '../../data/formOptions'
import { updateUsersCocktail } from '../auth/authSlice'
import { useEditCocktailMutation, useGetCocktailQuery } from './cocktailsSlice'

function CocktailEdit() {
	const { id } = useParams()

	// Query hook to fetch cocktail data
	const { data: cocktail, isLoading } = useGetCocktailQuery(parseInt(id, 10))

	//  Mutation hook to edit cocktail data
	const [editCocktail] = useEditCocktailMutation()

	// React hook form
	const {
		register,
		handleSubmit,
		formState: { errors },
	} = useForm({
		defaultValues: {
			name: cocktail?.name,
			description: cocktail?.description,
			execution: cocktail?.execution,
			ingredients: cocktail?.ingredients,
			category: cocktail?.category.name,
		},
	})

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
			} else if (key === 'category') {
				// Compare category name instead of the category object
				if (value !== cocktail.category.name) {
					updatedFields.append('cocktail[category]', value)
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

	if (isLoading) {
		return <div>Loading...</div>
	}

	return (
		<div className="cocktail-edit">
			<div className="cocktail-edit-form-box">
				<form onSubmit={handleSubmit(handleEditCocktail)}>
					<h1 id="signup-text">Add Your Cocktail</h1>
					<br></br>

					{/* <div>
            <img src={cocktail.image} alt={cocktail.name} />
          </div> */}

					<label>Cocktail Name</label>
					<br></br>

					<textarea
						type="text"
						name="name"
						className="cocktail-box"
						{...register('name', cocktailFormOptions.name, {
							validate: (value) =>
								value !== cocktail.name || 'Name is the same as before',
						})}
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

					<label>Cocktail Category</label>
					<select
						className="cocktail-box"
						name="catergory"
						{...register('category', cocktailFormOptions.category)}
					>
						<option hidden disabled value="">
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
					<br></br>

					<label>Upload a different featured image</label>
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
					{editCocktailError ? <Error>{editCocktailError}</Error> : null}
					<input
						type="submit"
						value="Update Cocktail"
						className="cocktail-edit-btn"
					/>
				</form>
			</div>
			<img
				id="background-img"
				src={cocktail.image ?? cocktail.photo_url}
				alt={cocktail.name}
			/>
		</div>
	)
}

export default CocktailEdit
