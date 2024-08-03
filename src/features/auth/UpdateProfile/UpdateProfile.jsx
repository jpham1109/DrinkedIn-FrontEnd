import React, { useState } from 'react'
import styles from './UpdateProfile.module.css'
import { useForm } from 'react-hook-form'
import { useDispatch } from 'react-redux'
import { Error } from '../../../components/Error'
import { registerOptions as profileOptions } from '../../../data/formOptions'
import { updateUserProfile, useUpdateUserMutation } from '../authSlice'

const UpdateProfile = ({ currentUser, handleToggleModal }) => {
	// Query hook for update profile
	const [updateUser] = useUpdateUserMutation()

	// Form hook for update profile form
	const {
		register,
		handleSubmit,
		clearErrors,
		formState: { errors },
	} = useForm({
		defaultValues: {
			full_name: currentUser.full_name,
			location: currentUser.location,
			bartender: currentUser.bartender,
		},
	})

	const [updateProfileError, setUpdateProfileError] = useState(null)

	const dispatch = useDispatch()

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

		try {
			await updateUser(updatedFields)
				.unwrap()
				.then((updatedUser) => {
					dispatch(updateUserProfile(updatedUser))
					handleToggleModal()
				})
		} catch (requestError) {
			console.error('Failed to update profile:', requestError)
			requestError &&
				setUpdateProfileError(`Failed to update profile: ${requestError} `)
		}
	}

	return (
		<div className={styles.formContainer}>
			<form
				className={styles.form}
				onSubmit={handleSubmit(handleUpdateProfile)}
			>
				<span className={styles.close} onClick={handleToggleModal}>
					&times;
				</span>
				<label className={styles.form__label}>
					Full Name
					<input
						type="text"
						name="full_name"
						className={styles.form__input}
						onChange={() => clearErrors('full_name')}
						{...register('full_name', profileOptions.full_name, {
							validate: (value) =>
								value !== currentUser.full_name || 'Full name is the same',
						})}
					/>
				</label>

				{errors?.full_name ? <Error> {errors.full_name.message}</Error> : null}

				<label className={styles.form__label}>
					Location
					<input
						type="text"
						name="location"
						className={styles.form__input}
						onChange={() => clearErrors('location')}
						{...register('location', profileOptions.location, {
							validate: (value) =>
								value !== currentUser.location || 'Location is the same',
						})}
					/>
				</label>

				{errors?.location ? (
					<Error style={{ textColor: 'white' }}>
						{errors.location.message}
					</Error>
				) : null}

				<label className={styles.form__label}>
					Bartender
					<input
						type="checkbox"
						name="bartender"
						className={styles.form__input}
						{...register('bartender')}
					/>
				</label>

				<label className={styles.form__label}>
					Change avatar
					<input
						type="file"
						name="avatar"
						className={styles.form__input}
						accept="image/*"
						{...register('avatar')}
					/>
				</label>
				<button type="submit" className={styles.form__button}>
					Update
				</button>
				{updateProfileError ? updateProfileError : null}
			</form>
		</div>
	)
}

export default React.memo(UpdateProfile)
