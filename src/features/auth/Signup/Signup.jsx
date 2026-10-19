import { useCallback, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useDispatch } from 'react-redux'
import { Link, useNavigate } from 'react-router-dom'
import { Button } from '../../../components/design-system/Button'
import { Input } from '../../../components/design-system/Field'
import { ErrorState } from '../../../components/design-system/States'
import { registerOptions } from '../../../data/formOptions'
import { debounce } from '../../../util/debounce'
import { setCredentials, useSignupUserMutation } from '../authSlice'
import { refreshCsrfToken, useLazyGetCsrfTokenQuery } from '../../csrf/csrfSlice'
import { extractApiErrors } from '../../../util/extractApiError'

// Ported from Design/drinkedin-v0/components/auth/auth-form.tsx (mode:
// 'signup'), restyled only — same container unchanged from before the
// redesign: same useSignupUserMutation, same pre-submit + post-success
// refreshCsrfToken calls, same extractApiErrors envelope parsing
// (ai/v1-redesign-plan.md PR5 — these are verified-working behaviors, not
// implementation details v0's prototype gets to replace).
//
// Two adaptations beyond v0's prototype, which only modeled username +
// password:
// - full_name / bartender fields: real, backend-meaningful data v0's demo
//   form never needed. Kept using the existing field names/shape.
// - password_confirmation: v0's own comment claims has_secure_password
//   "auto-validates [it] for free if the param is present" — checked
//   against the actual Rails code (ai/v1-redesign-plan.md's claim doesn't
//   hold): UsersController#user_params only permits :full_name, :username,
//   :password, :location, :bartender, :avatar — password_confirmation
//   isn't in that list, so strong parameters silently drops it before it
//   ever reaches the model; confirmed empirically (a mismatched
//   confirmation submitted via curl still returned 201). Validated
//   client-side only below — a real typo safeguard, just not a
//   server-enforced one. Not fixing the backend permit list here: out of
//   scope for a frontend redesign PR, and no security exposure (the
//   confirmation step is a UX safeguard against the user's own typos, not
//   an authorization boundary).
//
// v0's AuthForm renders its own `<main id="main">` — dropped here, since
// App.jsx already wraps every route in exactly one `<main id="main">` for
// the Navbar's skip link (PR4); a second one would duplicate the id and
// break the skip link's anchor jump.
function Signup() {
	const [signupUser, { isLoading }] = useSignupUserMutation()
	const [triggerGetCsrfToken] = useLazyGetCsrfTokenQuery()
	const {
		register,
		handleSubmit,
		watch,
		clearErrors,
		formState: { errors },
	} = useForm()

	const [signupError, setSignupError] = useState(null)
	const [showPassword, setShowPassword] = useState(false)

	const dispatch = useDispatch()
	const navigate = useNavigate()

	// register() returns a new handler closure each call — captured once
	// per render so each onChange wrapper below can call the real
	// react-hook-form handler and still add the debounced-error-clear
	// side effect, instead of two independent registrations fighting
	// over which onChange wins.
	const fullNameField = register('full_name')
	const usernameField = register('username', registerOptions.username)
	const passwordField = register('password', registerOptions.password)
	const passwordConfirmationField = register('password_confirmation', {
		required: 'Please confirm your password',
		validate: (value) => value === watch('password') || 'Passwords don’t match',
	})

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

	const handleSignup = async (data, e) => {
		e.preventDefault()

		try {
			await refreshCsrfToken(dispatch, triggerGetCsrfToken)

			await signupUser(data)
				.unwrap()
				.then(async (response) => {
					// save user to store (no jwt — removed from the response in PR 5)
					dispatch(setCredentials({ user: response.user }))
					// Signup calls reset_session server-side too, rotating the
					// session's CSRF secret — refresh before navigating.
					await refreshCsrfToken(dispatch, triggerGetCsrfToken)
					navigate('/cocktails')
				})
		} catch (requestError) {
			console.error('Failed to sign up:', requestError)
			const apiErrors = extractApiErrors(requestError)
			const usernameMessage = apiErrors?.find((err) => err.field === 'username')?.message
			// Same fix as extractErrorMessage (util/extractApiError.js): don't
			// fall back to requestError.error — that's RTK Query's raw
			// transport-level string (e.g. a literal "TypeError: Failed to
			// fetch" on a forced pre-submit CSRF-refresh failure, confirmed
			// live), not user-facing copy.
			const genericMessage = apiErrors
				? apiErrors
						.filter((err) => err.field !== 'username')
						.map((err) => err.message)
						.join(' ') || null
				: 'Something went wrong. Please try again.'
			setSignupError({ username: usernameMessage ?? null, generic: genericMessage })
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
		<div className="mx-auto flex w-full max-w-md flex-col gap-8 px-5 pb-8 pt-12 md:pt-20">
			<header className="flex flex-col gap-3">
				<h1 className="type-h1 text-balance">Pull up a stool.</h1>
				<p className="text-pretty leading-relaxed text-muted-foreground">
					A free account lets you like drinks and follow the bartenders who make them.
				</p>
			</header>

			{signupError?.generic && (
				<ErrorState title="Couldn’t create your account" description={signupError.generic} />
			)}

			<form onSubmit={handleSubmit(handleSignup)} noValidate className="flex flex-col gap-5">
				<Input
					id="signup-full-name"
					label="Full name"
					autoComplete="name"
					autoFocus
					disabled={isLoading}
					{...fullNameField}
					onChange={(e) => {
						fullNameField.onChange(e)
						debouncedClearSignupError()
					}}
				/>
				<Input
					id="signup-username"
					label="Username"
					autoComplete="username"
					autoCapitalize="none"
					spellCheck={false}
					disabled={isLoading}
					error={errors.username?.message ?? signupError?.username}
					{...usernameField}
					onChange={(e) => {
						usernameField.onChange(e)
						clearErrors('username')
						debouncedClearSignupError()
					}}
				/>
				<Input
					id="signup-password"
					type={showPassword ? 'text' : 'password'}
					label="Password"
					autoComplete="new-password"
					disabled={isLoading}
					error={errors.password?.message}
					{...passwordField}
					onChange={(e) => {
						passwordField.onChange(e)
						clearErrors('password')
						debouncedClearSignupError()
					}}
				/>
				<Input
					id="signup-password-confirmation"
					type={showPassword ? 'text' : 'password'}
					label="Confirm password"
					autoComplete="new-password"
					disabled={isLoading}
					error={errors.password_confirmation?.message}
					{...passwordConfirmationField}
					onChange={(e) => {
						passwordConfirmationField.onChange(e)
						clearErrors('password_confirmation')
						debouncedClearSignupError()
					}}
				/>

				<div className="flex flex-col gap-3">
					<label className="flex w-fit cursor-pointer items-center gap-2.5 text-sm text-muted-foreground">
						<input
							type="checkbox"
							checked={showPassword}
							onChange={(e) => setShowPassword(e.target.checked)}
							className="size-4 accent-primary"
						/>
						Show password
					</label>
					<label className="flex w-fit cursor-pointer items-center gap-2.5 text-sm text-muted-foreground">
						<input type="checkbox" className="size-4 accent-primary" {...register('bartender')} />
						I’m a bartender
					</label>
				</div>

				<Button type="submit" size="lg" loading={isLoading} loadingLabel="Creating account" className="mt-1 w-full">
					Create account
				</Button>
			</form>

			<p className="border-t border-border pt-6 text-[0.9375rem] text-muted-foreground">
				Already have an account?{' '}
				<Link
					to="/login"
					className="font-medium text-foreground underline decoration-border-strong underline-offset-4 hover:decoration-foreground"
				>
					Log in
				</Link>
			</p>
		</div>
	)
}

export default Signup
