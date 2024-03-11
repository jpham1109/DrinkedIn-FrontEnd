import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { setCredentials, useSignupUserMutation } from './authSlice'
import sign_up_page_img from '../../images/signup.jpeg'
import { registerOptions } from '../../data/formOptions'
import { useLocalStorage } from '../../hooks/use-local-storage'

function Signup() {
	// Query hook for signup
	const [signupUser, { isLoading, isSuccess }] = useSignupUserMutation()
	// Form hook for signup form
	const {
		register,
		handleSubmit,
		clearErrors,
		formState: { errors },
		watch,
	} = useForm()
	// watch to see if bartender checkbox is checked in order to render workplace input field
	const isBartender = watch('bartender')

	// custom hook to get token from local storage to improve performance
	const [token, setToken] = useLocalStorage('token', null)
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
					setToken(response.jwt)
					dispatch(setCredentials({ user: response.user, token: response.jwt }))
				})
		} catch (requestError) {
			console.error('Failed to sign up:', requestError)
		}
	}

	useEffect(() => {
		if (isSuccess) {
			navigate('/categories')
		}
	}, [isSuccess, navigate])

	return (
		<div className="signup-form">
			<div className="form-box">
				<form
					onSubmit={handleSubmit(handleSignup)}
					onClick={() => clearErrors()}
				>
					<h1 id="signup-text">Sign Up</h1>
					<br></br>

					<label>Full Name</label>
					<br></br>
					<input
						type="text"
						name="full_name"
						className="signup-box"
						{...register('full_name')}
					/>
					<br></br>

					<label>Username</label>
					<br></br>
					<input
						type="text"
						name="username"
						className="signup-box"
						onClick={() => setSignupError(null)}
						{...register('username', registerOptions.username)}
					/>
					<p style={{ color: 'red' }}>
						{errors.username?.message}

						{signupError && `This username ${signupError}`}
					</p>
					<br></br>

					<label>Password</label>
					<br></br>
					<input
						type="password"
						name="password"
						className="signup-box"
						{...register('password', registerOptions.password)}
					/>
					<p style={{ color: 'red' }}>{errors.password?.message}</p>
					<br></br>

					<label>Bartender</label>
					<input
						type="checkbox"
						name="bartender"
						className="signup-box"
						{...register('bartender')}
					/>
					<br></br>

					<button type="submit" disabled={isLoading} className="signup-btn">
						{isLoading ? 'LOADING...' : 'SIGN UP'}
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

export default Signup
