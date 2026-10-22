import React, { useCallback, useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useLocation, useNavigate } from 'react-router-dom'
import { Navbar } from '../design-system/Navbar'
import { Button } from '../design-system/Button'
import { ErrorState } from '../design-system/States'
import {
	authApi,
	logoutUser,
	selectCurrentUser,
	useGetUserQuery,
	useLogoutSessionMutation,
} from '../../features/auth/authSlice'
import { refreshCsrfToken, useLazyGetCsrfTokenQuery } from '../../features/csrf/csrfSlice'
import { extractApiErrors, extractErrorMessage } from '../../util/extractApiError'

const NavBar = () => {
	const currentUser = useSelector(selectCurrentUser)
	const { pathname } = useLocation()

	const dispatch = useDispatch()
	const navigate = useNavigate()

	// Auth-state revalidation (persisted state vs. the live Rails session)
	// happens once at app bootstrap, in App.jsx — not here. NavBar only
	// renders whatever `currentUser` currently is; it doesn't own
	// verifying it. See App.jsx for the /me reconciliation logic.
	//
	// Shares that same app-mount query's cache entry (see ProtectedRoute)
	// so nav doesn't flash logged-out links before the initial check
	// resolves (ai/auth-migration-plan.md PR 4).
	const { isLoading, isUninitialized } = useGetUserQuery()
	const status = isUninitialized || isLoading ? 'checking' : currentUser ? 'loggedIn' : 'loggedOut'
	const [logoutSession] = useLogoutSessionMutation()
	const [triggerGetCsrfToken] = useLazyGetCsrfTokenQuery()

	// Surfaces a confirmed logout failure (see handleLogOut below) instead
	// of silently pretending the session ended — fix/logout-csrf-reliability.
	const [logoutError, setLogoutError] = useState(null)
	// Guards against overlapping runs (e.g. an impatient double-click)
	// racing each other through the retry/confirm sequence below. A ref,
	// not state — this must be readable synchronously on the very next
	// call, not after a re-render.
	const loggingOutRef = useRef(false)

	// Only called once the server side is actually confirmed ended (a
	// successful DELETE /logout, or a fresh /me 401 — see handleLogOut).
	// Unlike before, this is no longer run unconditionally for every
	// logout attempt regardless of outcome.
	const finishAsLoggedOut = useCallback(() => {
		dispatch(logoutUser())
		// reset_session on the backend rotates the session's CSRF secret,
		// invalidating whatever token was current — refresh so the next
		// login/signup on this page load has a valid one. Deliberately not
		// awaited: navigation below must not wait on it. If it fails (e.g.
		// offline), that's non-fatal — Login.jsx/Signup.jsx each do their
		// own pre-submit refresh regardless, so a missing token here just
		// means that later refresh does the work instead. Caught explicitly
		// so a rejection (confirmed via a forced-failure test) surfaces as
		// a logged error instead of an unhandled promise rejection; it must
		// not dispatch anything that could restore auth state after logout.
		refreshCsrfToken(dispatch, triggerGetCsrfToken).catch((error) => {
			console.error('Failed to refresh CSRF token after logout:', error)
		})
		navigate('/login')
	}, [dispatch, navigate, triggerGetCsrfToken])

	// Attempts the server-side logout, with exactly one retry after a
	// fresh CSRF token, but ONLY when the rejection is actually the known
	// stale-per-tab-token race (confirmed via
	// Backend/.../spec/requests/session_login_signup_logout_spec.rb:
	// login/signup/logout in any tab rotates the shared session's CSRF
	// secret, so another already-open tab's in-memory token goes stale —
	// a fresh token is the only thing that can fix this specific cause).
	// Resolves on confirmed success; rethrows the last real error
	// otherwise, for the caller to decide what "not confirmed" means.
	const attemptServerLogout = useCallback(async () => {
		try {
			await logoutSession().unwrap()
			return
		} catch (error) {
			if (!extractApiErrors(error)?.some((e) => e.code === 'csrf_invalid')) {
				throw error
			}
			await refreshCsrfToken(dispatch, triggerGetCsrfToken)
			await logoutSession().unwrap()
		}
	}, [dispatch, logoutSession, triggerGetCsrfToken])

	const handleLogOut = useCallback(async () => {
		if (loggingOutRef.current) return
		loggingOutRef.current = true
		setLogoutError(null)

		try {
			await attemptServerLogout()
			finishAsLoggedOut()
		} catch (lastError) {
			// Our own attempt(s) didn't confirm success. Before showing an
			// error, check whether the session is actually already dead for
			// an unrelated reason (e.g. it had already expired, or another
			// tab logged it out independently) via a forced, non-cached /me
			// check — the existing getUser cache entry must not be trusted
			// here (fix/cocktails-grid-card-redesign's cache-staleness bug
			// is exactly why), only a fresh network response counts as
			// confirmation either way.
			//
			// subscribe: false — this is a one-off confirmation check, not
			// a live subscription; App.jsx/ProtectedRoute.jsx/AuthGate.jsx
			// already hold the real long-lived subscriptions to this same
			// cache entry. Without this, every failed-logout retry would
			// register and never release another subscriber on it.
			try {
				await dispatch(
					authApi.endpoints.getUser.initiate(undefined, { forceRefetch: true, subscribe: false })
				).unwrap()
				// /me still succeeds — a session is genuinely still live
				// server-side. Do not represent logout as successful.
				console.error('Failed to end session on the server:', lastError)
				setLogoutError(extractErrorMessage(lastError))
			} catch (meError) {
				if (meError?.status === 401) {
					// No live session after all — already logged out server-side.
					finishAsLoggedOut()
				} else {
					console.error('Failed to end session on the server:', lastError)
					setLogoutError(extractErrorMessage(lastError))
				}
			}
		} finally {
			loggingOutRef.current = false
		}
	}, [attemptServerLogout, dispatch, finishAsLoggedOut])

	return (
		<>
			<Navbar status={status} user={currentUser ?? undefined} currentPath={pathname} onLogout={handleLogOut} />
			{logoutError && (
				<div className="mx-auto max-w-wide px-5 pt-4 md:px-8 lg:px-12">
					<ErrorState
						title="We couldn’t log you out"
						description={logoutError}
						action={
							<Button variant="outline" size="sm" onClick={handleLogOut}>
								Try again
							</Button>
						}
					/>
				</div>
			)}
		</>
	)
}

export default React.memo(NavBar)
