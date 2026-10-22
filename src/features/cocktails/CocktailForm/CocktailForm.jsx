import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { Button } from '../../../components/design-system/Button'
import { Input, Select, Textarea } from '../../../components/design-system/Field'
import { ErrorState } from '../../../components/design-system/States'
import { cocktailFormOptions } from '../../../data/formOptions'
import { selectAllCategories } from '../../categories/categoriesSlice'
import { addUserCocktail, selectCurrentUsersId } from '../../auth/authSlice'
import { useAddNewCocktailMutation } from '../cocktailsSlice'

// Restyled onto the V1 design system (ai/v1-redesign-plan.md PR6).
// Deliberately NOT swapped for v0's AddCocktailForm (add-cocktail-form.tsx)
// — that prototype assumes an `imageUrl` text field and a free-text
// `category`, but the real backend requires an actual file upload
// (multipart FormData, validated by ImageAttachable) and a `category_id`
// foreign key. Reusing those fields as-is would mean rebuilding them from
// scratch, not restyling, so this keeps the original field set, the
// existing cocktailFormOptions validation, the existing FormData/
// useAddNewCocktailMutation submission, and the existing
// addUserCocktail/navigate success behavior completely unchanged — only
// the markup underneath each field is new. CSRF is handled globally in
// apiSlice.js's prepareHeaders for every mutation already; no per-form
// CSRF logic existed here before and none is added now.
function CocktailForm({ onCancel }) {
	const [addNewCocktail, { isLoading }] = useAddNewCocktailMutation()
	const userId = useSelector(selectCurrentUsersId)
	const categories = useSelector(selectAllCategories)
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

	// A plain (not disabled — Field.jsx's Select has no per-option disabled
	// support, and extending a shared primitive for this one form is out of
	// scope) empty option so category_id starts unselected and the existing
	// `required` validation can still catch "nothing chosen", same as the
	// original's `<option value="0" disabled>` + defaultValue="0" pattern.
	const categoryOptions = [
		{ value: '', label: 'Choose a cocktail category' },
		...categories.map((category) => ({ value: String(category.id), label: category.name })),
	]

	return (
		<form onSubmit={handleSubmit(handleAddCocktail)} noValidate className="flex flex-col gap-5">
			<Input
				id="new-cocktail-name"
				label="Cocktail Name"
				autoComplete="off"
				error={errors.name?.message}
				{...register('name', cocktailFormOptions.name)}
			/>
			<Textarea
				id="new-cocktail-description"
				label="Description"
				rows={3}
				error={errors.description?.message}
				{...register('description', cocktailFormOptions.description)}
			/>
			<Textarea
				id="new-cocktail-ingredients"
				label="Ingredients"
				rows={5}
				error={errors.ingredients?.message}
				{...register('ingredients', cocktailFormOptions.ingredients)}
			/>
			<Textarea
				id="new-cocktail-execution"
				label="Execution"
				rows={5}
				error={errors.execution?.message}
				{...register('execution', cocktailFormOptions.execution)}
			/>
			<Select
				id="new-cocktail-category"
				label="Cocktail Category"
				defaultValue=""
				options={categoryOptions}
				error={errors.category_id?.message}
				{...register('category_id', cocktailFormOptions.category)}
			/>
			<Input
				id="new-cocktail-photo"
				type="file"
				label="Add an image to your cocktail"
				accept="image/*"
				error={errors.photo?.message}
				{...register('photo', cocktailFormOptions.photo)}
			/>

			{addCocktailError && <ErrorState title="Couldn’t add your cocktail" description={addCocktailError} />}

			<div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
				{onCancel && (
					<Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
						Cancel
					</Button>
				)}
				<Button type="submit" loading={isLoading} loadingLabel="Publishing">
					Publish cocktail
				</Button>
			</div>
		</form>
	)
}

export default CocktailForm
