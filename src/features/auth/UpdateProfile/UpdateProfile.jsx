import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useDispatch } from 'react-redux'
import { Button } from '../../../components/design-system/Button'
import { Input } from '../../../components/design-system/Field'
import { ErrorState } from '../../../components/design-system/States'
import { registerOptions as profileOptions } from '../../../data/formOptions'
import { updateUserProfile, useUpdateUserMutation } from '../authSlice'

// Restyled onto the V1 design system (ai/v1-redesign-plan.md PR8) — same
// mutation (useUpdateUserMutation), same FormData construction, same
// dispatch(updateUserProfile(...)) success handling, completely unchanged.
// `onDone` replaces the original's `handleToggleModal` — now rendered
// inside the shared Overlay (ProfileInfo.jsx), which already provides its
// own close affordance (an IconButton in its header), so this no longer
// renders its own separate close control (the original's `&times;` span)
// to avoid a duplicate.
//
// profileOptions.full_name / profileOptions.location are both undefined
// (registerOptions in data/formOptions.js only defines `username`/
// `password` keys) — confirmed by reading the file, not assumed. The
// inline `validate` functions below are passed as a stray third argument
// to register(), which only accepts two (name, options) — react-hook-form
// silently ignores it. Net effect, unchanged from the original: neither
// field has any required/duplicate-value validation actually enforced
// today. Preserved exactly as-is per "preserve existing validation
// behavior" — not a bug this PR is scoped to fix.
const UpdateProfile = ({ currentUser, onDone }) => {
	const [updateUser, { isLoading }] = useUpdateUserMutation()

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
					onDone()
				})
		} catch (requestError) {
			console.error('Failed to update profile:', requestError)
			requestError &&
				setUpdateProfileError(`Failed to update profile: ${requestError} `)
		}
	}

	return (
		<form onSubmit={handleSubmit(handleUpdateProfile)} noValidate className="flex flex-col gap-5">
			<Input
				id="update-profile-full-name"
				label="Full name"
				error={errors?.full_name?.message}
				onChange={() => clearErrors('full_name')}
				{...register('full_name', profileOptions.full_name, {
					validate: (value) =>
						value !== currentUser.full_name || 'Full name is the same',
				})}
			/>

			<Input
				id="update-profile-location"
				label="Location"
				error={errors?.location?.message}
				onChange={() => clearErrors('location')}
				{...register('location', profileOptions.location, {
					validate: (value) =>
						value !== currentUser.location || 'Location is the same',
				})}
			/>

			<label className="flex w-fit cursor-pointer items-center gap-2.5 text-sm text-muted-foreground">
				<input type="checkbox" className="size-4 accent-primary" {...register('bartender')} />
				Bartender
			</label>

			<Input
				id="update-profile-avatar"
				type="file"
				label="Change avatar"
				accept="image/*"
				{...register('avatar')}
			/>

			{updateProfileError && (
				<ErrorState title="Couldn’t update your profile" description={updateProfileError} />
			)}

			<Button type="submit" loading={isLoading} loadingLabel="Updating" className="mt-1">
				Update profile
			</Button>
		</form>
	)
}

export default React.memo(UpdateProfile)
