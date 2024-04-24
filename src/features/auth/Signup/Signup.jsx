import { useCallback, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { registerOptions } from '../../../data/formOptions'
import sign_up_page_img from '../../../images/signup.jpeg'
import styles from './Signup.module.css'
import { debounce } from '../../../util/debounce'
import { setCredentials, useSignupUserMutation } from '../authSlice'

function Signup() {
	// Query hook for signup
	const [signupUser, { isLoading }] = useSignupUserMutation()
	// Form hook for signup form
	const {
		register,
		handleSubmit,
		clearErrors,
		formState: { errors },
	} = useForm()

	// state to handle specific sign up error from server for username
	const [signupError, setSignupError] = useState(null)

	const dispatch = useDispatch()
	const navigate = useNavigate()

	const handleSignup = async (data, e) => {
		e.preventDefault()

		try {
			await signupUser(data)
				.unwrap()
				.then((response) => {
					// save user and token to store
					dispatch(setCredentials({ user: response.user, token: response.jwt }))
					navigate('/cocktails')
				})
		} catch (requestError) {
			console.error('Failed to sign up:', requestError)
			requestError &&
				setSignupError(
					requestError.data ? requestError.data.error : requestError.error
				)
		}
	}

	// clear signup error only if there is an error
	const clearSignupError = useCallback(() => {
		if (signupError) {
			setSignupError(null)
		}
	}, [signupError])
	// debounce clear signup error so that the error message does not flash on the screen
	const debouncedClearSignupError = debounce(clearSignupError, 500)

	return (
		<div className={styles.container}>
			<form className={styles.form} onSubmit={handleSubmit(handleSignup)}>
				<h1>Sign Up</h1>

				<label>Full Name</label>
				<input
					type="text"
					name="full_name"
					onChange={() => {
						clearErrors('full_name')
						debouncedClearSignupError()
					}}
					{...register('full_name')}
				/>

				<label>Username</label>
				<input
					type="text"
					name="username"
					onChange={() => {
						clearErrors('username')
						debouncedClearSignupError()
					}}
					{...register('username', registerOptions.username)}
				/>
				{errors.username || signupError ? (
					<p>
						{errors.username?.message}
						{signupError && `This username ${signupError}`}
					</p>
				) : null}

				<label>Password</label>
				<input
					type="password"
					name="password"
					onChange={() => {
						clearErrors('password')
						debouncedClearSignupError()
					}}
					{...register('password', registerOptions.password)}
				/>
				{errors.password ? <p>{errors.password.message}</p> : null}

				<label className={styles.label}>Bartender</label>
				<input type="checkbox" name="bartender" {...register('bartender')} />

				<button className={styles.button} type="submit" disabled={isLoading}>
					{isLoading ? 'LOADING...' : 'SIGN UP'}
				</button>
			</form>
			<img
				className="background-img"
				src={sign_up_page_img}
				alt="signup-img"
				loading="lazy"
			/>
		</div>
	)
}

export default Signup
