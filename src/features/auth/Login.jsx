import { useEffect, useState } from 'react'
import { useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { setCredentials, useLoginUserMutation } from './authSlice'
import { useForm } from 'react-hook-form'
import { Error } from '../../components/Error'
import { registerOptions as loginOptions } from '../../data/formOptions'

const Login = () => {
	// Query hook for login
	const [loginUser, { isLoading, isSuccess }] = useLoginUserMutation()
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
					localStorage.setItem('token', response.jwt)
					dispatch(setCredentials({ user: response.user, token: response.jwt }))
				})
		} catch (requestError) {
			console.error('Failed to log in:', requestError)
			requestError &&
				setLoginError(
					requestError.data ? requestError.data.error : requestError.error
				)
		}
	}

	useEffect(() => {
		if (isSuccess) {
			navigate('/cocktails')
		}
	}, [isSuccess, navigate])

	return (
		<div className="login-form">
			<div className="form-box solid">
				<form
					onSubmit={handleSubmit(handleLogin)}
					onClick={() => clearErrors()}
				>
					<h1 className="login-text">Log In</h1>
					<label>Username</label>
					<br></br>
					<input
						type="text"
						name="username"
						className="login-box"
						onClick={() => setLoginError(null)}
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
						onClick={() => setLoginError(null)}
						{...register('password', loginOptions.password)}
					/>
					<p style={{ color: 'red' }}>{formErrors.password?.message}</p>
					<br></br>
					{loginError && <Error>{loginError}</Error>}
					<button type="submit" disabled={isLoading} className="login-btn">
						{isLoading ? 'LOADING...' : 'LOGIN'}
					</button>
				</form>
			</div>
		</div>
	)
}

export default Login
