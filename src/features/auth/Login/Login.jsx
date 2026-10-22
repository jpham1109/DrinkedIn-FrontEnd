import React, { useCallback, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useDispatch } from 'react-redux'
import { Link, useNavigate } from 'react-router-dom'
import { Button } from '../../../components/design-system/Button'
import { Input } from '../../../components/design-system/Field'
import { ErrorState } from '../../../components/design-system/States'
import { registerOptions as loginOptions } from '../../../data/formOptions'
import { setCredentials, useLoginUserMutation } from '../authSlice'
import { refreshCsrfToken, useLazyGetCsrfTokenQuery } from '../../csrf/csrfSlice'
import { debounce } from '../../../util/debounce'
import { extractErrorMessage } from '../../../util/extractApiError'

// Ported from Design/drinkedin-v0/components/auth/auth-form.tsx (mode:
// 'login'), restyled only — v0's own doc comment: "The container owns the
// existing auth mutation." This container is unchanged from before the
// redesign: same useLoginUserMutation, same pre-submit + post-success
// refreshCsrfToken calls, same extractErrorMessage envelope parsing
// (ai/v1-redesign-plan.md PR5 — these are verified-working behaviors, not
// implementation details v0's prototype gets to replace).
//
// v0's AuthForm renders its own `<main id="main">` — dropped here, since
// App.jsx already wraps every route in exactly one `<main id="main">` for
// the Navbar's skip link (PR4); a second one would duplicate the id and
// break the skip link's anchor jump.
const Login = () => {
	const [loginUser, { isLoading }] = useLoginUserMutation()
	const [triggerGetCsrfToken] = useLazyGetCsrfTokenQuery()
	const {
		register,
		handleSubmit,
		clearErrors,
		formState: { errors: formErrors },
	} = useForm()

	const [loginError, setLoginError] = useState(null)
	const [showPassword, setShowPassword] = useState(false)

	const dispatch = useDispatch()
	const navigate = useNavigate()

	// register() returns a new handler closure each call — captured once
	// per render so the onChange wrapper below can call the real
	// react-hook-form handler and still add the debounced-error-clear
	// side effect, instead of two independent registrations fighting
	// over which onChange wins.
	const usernameField = register('username', loginOptions.username)
	const passwordField = register('password', loginOptions.password)

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
		// text-left: the app's legacy `.App` wrapper (App.module.css) sets
		// `text-align: center`, which — being an inherited property —
		// cascades down into every route, including this one, unless
		// overridden; v0's own auth-form.tsx has no centered text anywhere
		// in this screen (confirmed by reading it, not assumed), so this
		// restores v0's actual left-aligned intent rather than introducing
		// a new one. Same fix already applied to CocktailCard.jsx and
		// CocktailsContainer.jsx for the same inherited rule.
		<div className="mx-auto flex w-full max-w-md flex-col gap-8 px-5 pb-8 pt-12 md:pt-20 text-left">
			<header className="flex flex-col gap-3">
				<h1 className="type-h1 text-balance">Welcome back.</h1>
				<p className="text-pretty leading-relaxed text-muted-foreground">
					Log in to see the drinks you’ve saved and the people you follow.
				</p>
			</header>

			{loginError && <ErrorState title="Couldn’t log you in" description={loginError} />}

			<form onSubmit={handleSubmit(handleLogin)} noValidate className="flex flex-col gap-5">
				<Input
					id="login-username"
					label="Username"
					autoComplete="username"
					autoCapitalize="none"
					spellCheck={false}
					autoFocus
					disabled={isLoading}
					error={formErrors.username?.message}
					{...usernameField}
					onChange={(e) => {
						usernameField.onChange(e)
						clearErrors('username')
						debouncedClearLoginError()
					}}
				/>
				<Input
					id="login-password"
					type={showPassword ? 'text' : 'password'}
					label="Password"
					autoComplete="current-password"
					disabled={isLoading}
					error={formErrors.password?.message}
					{...passwordField}
					onChange={(e) => {
						passwordField.onChange(e)
						clearErrors('password')
						debouncedClearLoginError()
					}}
				/>

				<label className="flex w-fit cursor-pointer items-center gap-2.5 text-sm text-muted-foreground">
					<input
						type="checkbox"
						checked={showPassword}
						onChange={(e) => setShowPassword(e.target.checked)}
						className="size-4 accent-primary"
					/>
					Show password
				</label>

				<Button type="submit" size="lg" loading={isLoading} loadingLabel="Logging in" className="mt-1 w-full">
					Log in
				</Button>
			</form>

			<p className="border-t border-border pt-6 text-[0.9375rem] text-muted-foreground">
				New to DrinkedIn?{' '}
				<Link
					to="/signup"
					className="font-medium text-foreground underline decoration-border-strong underline-offset-4 hover:decoration-foreground"
				>
					Create a free account
				</Link>
			</p>
		</div>
	)
}

export default React.memo(Login)
