import React, { useCallback, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { Error } from '../../components/Error'
import { registerOptions as loginOptions } from '../../data/formOptions'
import sign_up_page_img from '../../images/signup.jpeg'
import { setCredentials, useLoginUserMutation } from './authSlice'
import { debounce } from '../../util/debounce'

const Login = () => {
	// Query hook for login
	const [loginUser, { isLoading }] = useLoginUserMutation()
	// Form hook for login form
	const {
		register,
		handleSubmit,
		clearErrors,
		formState: { errors: formErrors },
	} = useForm()

	// state to handle specific login error and display on page
	const [loginError, setLoginError] = useState(null)

	const dispatch = useDispatch()
	const navigate = useNavigate()

	const handleLogin = async (data, e) => {
		e.preventDefault()

		try {
			await loginUser(data)
				.unwrap()
				.then((response) => {
					// save user and token to store
					dispatch(setCredentials({ user: response.user, token: response.jwt }))
					navigate('/cocktails')
				})
		} catch (requestError) {
			console.error('Failed to log in:', requestError)
			requestError &&
				setLoginError(
					requestError.data ? requestError.data.error : requestError.error
				)
		}
	}

	// clear login error only if there is an error
	const clearLoginError = useCallback(() => {
		if (loginError) {
			setLoginError(null)
		}
	}, [loginError])
	// debounce clear login error so that the error message does not flash on the screen
	const debouncedClearLoginError = debounce(clearLoginError, 500)

	return (
		<div className="login-form">
			<div className="form-box solid">
				<form onSubmit={handleSubmit(handleLogin)}>
					<h1 className="login-text">Log In</h1>
					<label>Username</label>
					<br></br>
					<input
						type="text"
						name="username"
						className="login-box"
						onChange={() => {
							clearErrors('username')
							debouncedClearLoginError()
						}}
						{...register('username', loginOptions.username)}
					/>
					<p style={{ color: 'red' }}>{formErrors.username?.message}</p>
					<br></br>
					<label>Password</label>
					<br></br>
					<input
						type="password"
						name="password"
						className="login-box"
						onChange={() => {
							clearErrors('password')
							debouncedClearLoginError()
						}}
						{...register('password', loginOptions.password)}
					/>
					<p style={{ color: 'red' }}>{formErrors.password?.message}</p>
					<br></br>
					{loginError ? <Error>{loginError}</Error> : null}
					<button type="submit" disabled={isLoading} className="login-btn">
						{isLoading ? 'LOADING...' : 'LOGIN'}
					</button>
				</form>
			</div>
			<img
				id="signup-img"
				src={sign_up_page_img}
				alt="signup-img"
				loading="lazy"
			/>
		</div>
	)
}

export default React.memo(Login)
