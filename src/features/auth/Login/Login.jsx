import React, { useCallback, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { Error } from '../../../components/Error'
import { registerOptions as loginOptions } from '../../../data/formOptions'
import sign_up_page_img from '../../../images/signup.jpeg'
import appStyles from '../../../components/App/App.module.css'
import styles from './Login.module.css'
import { setCredentials, useLoginUserMutation } from '../authSlice'
import { refreshCsrfToken, useLazyGetCsrfTokenQuery } from '../../csrf/csrfSlice'
import { debounce } from '../../../util/debounce'
import { extractErrorMessage } from '../../../util/extractApiError'

const Login = () => {
	// Query hook for login
	const [loginUser, { isLoading }] = useLoginUserMutation()
	const [triggerGetCsrfToken] = useLazyGetCsrfTokenQuery()
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

	// No mount-time CSRF fetch here — App.jsx fetches one once for the
	// whole app on initial load/hard refresh, which already covers
	// landing directly on this route. The pre-submit refresh below is
	// still needed on top of that: App.jsx's fetch only runs once per
	// mount, so it can't account for the session being rotated by
	// anything that happens after (e.g. a logout in another tab sharing
	// the same cookie jar, or NavBar's own logout-triggered refresh
	// landing out of order relative to it) — this guarantees the token
	// used for THIS submission actually matches the session's current
	// secret, regardless of how stale the one already in memory might be.

	const handleLogin = async (data, e) => {
		e.preventDefault()

		try {
			await refreshCsrfToken(dispatch, triggerGetCsrfToken)

			await loginUser(data)
				.unwrap()
				.then(async (response) => {
					// save user to store (no jwt — removed from the response in PR 5)
					dispatch(setCredentials({ user: response.user }))
					// Login calls reset_session server-side, rotating the
					// session's CSRF secret — the pre-login token is now
					// invalid. Refresh before navigating so the next
					// mutation (e.g. from the cocktails page) has a valid one.
					await refreshCsrfToken(dispatch, triggerGetCsrfToken)
					navigate('/cocktails')
				})
		} catch (requestError) {
			console.error('Failed to log in:', requestError)
			setLoginError(extractErrorMessage(requestError))
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
		<div className={styles.formContainer}>
			<form className={styles.form} onSubmit={handleSubmit(handleLogin)}>
				<h1 className={styles.form__h1}>Log In</h1>
				<label className={styles.form__label}>
					Username
					<input
						className={styles.form__input}
						type="text"
						name="username"
						onChange={() => {
							clearErrors('username')
							debouncedClearLoginError()
						}}
						{...register('username', loginOptions.username)}
					/>
				</label>
				{formErrors.username ? <p>{formErrors.username.message}</p> : null}
				<label className={styles.form__label}>
					Password
					<input
						className={styles.form__input}
						type="password"
						name="password"
						onChange={() => {
							clearErrors('password')
							debouncedClearLoginError()
						}}
						{...register('password', loginOptions.password)}
					/>
				</label>
				{formErrors.password ? <p>{formErrors.password.message}</p> : null}
				{loginError ? <Error>{loginError}</Error> : null}
				<button
					className={styles.form__button}
					type="submit"
					disabled={isLoading}
				>
					{isLoading ? 'LOADING...' : 'LOGIN'}
				</button>
			</form>
			<img
				className={appStyles.backgroundImage}
				src={sign_up_page_img}
				alt="signup-img"
				loading="lazy"
			/>
		</div>
	)
}

export default React.memo(Login)
