import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useDispatch } from 'react-redux'
import { Error } from '../../components/Error'
import { registerOptions as profileOptions } from '../../data/formOptions'
import { updateUserProfile, useUpdateUserMutation } from './authSlice'

const UpdateProfile = ({ currentUser }) => {
	// Query hook for update profile
	const [updateUser] = useUpdateUserMutation()

	// Form hook for update profile form
	const {
		register,
		handleSubmit,
		clearErrors,
		formState: { errors },
		watch,
	} = useForm({
		defaultValues: {
			full_name: currentUser.full_name,
			location: currentUser.location,
			bartender: currentUser.bartender,
		},
	})
	// watch to see if bartender checkbox is checked in order to render workplace input field
	// const isBartender = watch('bartender')

	const [toggleForm, setToggleForm] = useState(false)
	const [updateProfileError, setUpdateProfileError] = useState(null)

	const dispatch = useDispatch()

	const handleToggleUpdate = () => {
		setToggleForm((prev) => !prev)
	}

	const handleUpdateProfile = async (data, e) => {
		e.preventDefault()

		const updatedFields = new FormData()
		// append updated fields to FormData object
		Object.entries(data).forEach(([key, value]) => {
			if (key === 'avatar') {
				if (value[0]) {
					updatedFields.append('user[avatar]', value[0])
				}
			} else if (value !== currentUser[key]) {
				updatedFields.append(`user[${key}]`, value)
			}
		})
		// append user's id to FormData object for Rails backend to find the user to update
		updatedFields.append('user[id]', currentUser.id)

		try {
			await updateUser(updatedFields)
				.unwrap()
				.then((updatedUser) => {
					dispatch(updateUserProfile(updatedUser))
					handleToggleUpdate()
				})
		} catch (requestError) {
			console.error('Failed to update profile:', requestError)
			requestError &&
				setUpdateProfileError(`Failed to update profile: ${requestError} `)
		}
	}

	return (
		<div>
			<button className="profile-btn" onClick={handleToggleUpdate}>
				Update Profile
			</button>
			{!toggleForm ? null : (
				<div className="profile-form">
					<form
						className="my-profile"
						onSubmit={handleSubmit(handleUpdateProfile)}
					>
						<h1>{currentUser.username}'s Profile</h1>
						<label>Full Name</label>
						<br></br>
						<input
							type="text"
							name="full_name"
							className="profile-box"
							{...register('full_name', profileOptions.full_name, {
								validate: (value) =>
									value !== currentUser.full_name || 'Full name is the same',
							})}
						/>
						{errors?.full_name ? (
							<Error> {errors.full_name.message}</Error>
						) : null}
						<br></br>

						<label>Location</label>
						<br></br>
						<input
							type="text"
							name="location"
							className="profile-box"
							{...register('location', profileOptions.location, {
								validate: (value) =>
									value !== currentUser.location || 'Location is the same',
							})}
						/>
						{errors?.location ? (
							<Error style={{ textColor: 'white' }}>
								{errors.location.message}
							</Error>
						) : null}
						<br></br>

						<label>Bartender</label>
						<input
							type="checkbox"
							name="bartender"
							className="profile-box"
							{...register('bartender')}
						/>
						<br></br>

						<br></br>
						<label>Change avatar</label>
						<input
							type="file"
							name="avatar"
							className="profile-box"
							accept="image/*"
							{...register('avatar')}
						/>
						<input type="submit" value="Update" className="update-btn" />
						{updateProfileError ? updateProfileError : null}
					</form>
				</div>
			)}
		</div>
	)
}

export default React.memo(UpdateProfile)
