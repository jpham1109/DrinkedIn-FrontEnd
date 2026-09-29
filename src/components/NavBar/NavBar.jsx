import React, { useCallback, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link, useNavigate } from 'react-router-dom'
import {
	logoutUser,
	selectCurrentUser,
	useGetUserQuery,
	useLogoutSessionMutation,
} from '../../features/auth/authSlice'
import { refreshCsrfToken, useLazyGetCsrfTokenQuery } from '../../features/csrf/csrfSlice'
import styles from './NavBar.module.css'

const NavBar = () => {
	// state for mobile menu
	const [menuOpen, setMenuOpen] = useState(false)

	const currentUser = useSelector(selectCurrentUser)

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
	const isCheckingAuth = isUninitialized || isLoading
	const [logoutSession] = useLogoutSessionMutation()
	const [triggerGetCsrfToken] = useLazyGetCsrfTokenQuery()

	const handleLogOut = useCallback(async () => {
		try {
			// Ends the Rails session server-side (ai/auth-migration-plan.md
			// PR 2's DELETE /logout) — clearing only local Redux state, as
			// this did before, would leave the session alive on the
			// backend with no UI path left to end it. Idempotent even if
			// there's no live session (e.g. bearer-only auth pre-PR-3), so
			// this is safe to call unconditionally.
			await logoutSession().unwrap()
		} catch (error) {
			// Logout is best-effort from the UI's perspective — local
			// state still clears below even if the network call fails
			// (e.g. offline), matching the previous behavior's resilience.
			console.error('Failed to end session on the server:', error)
		} finally {
			dispatch(logoutUser())
			// reset_session on the backend rotates the session's CSRF
			// secret, invalidating whatever token was current — refresh so
			// the next login/signup on this page load has a valid one.
			refreshCsrfToken(dispatch, triggerGetCsrfToken)
			navigate('/login')
		}
	}, [dispatch, navigate, logoutSession, triggerGetCsrfToken])

	const toggleMenu = () => {
		setMenuOpen(!menuOpen)
	}
	const closeMenu = () => {
		setMenuOpen(false)
	}

	return (
		<div className={styles.container}>
			<Link to="/" className={styles.logo}>
				<i className="fas fa-cocktail"></i>DRINKEDIN
			</Link>

			<div className={styles.hamburger} onClick={toggleMenu}>
				<div className={`${styles.bar} ${menuOpen ? styles.open : ''}`}></div>
				<div className={`${styles.bar} ${menuOpen ? styles.open : ''}`}></div>
				<div className={`${styles.bar} ${menuOpen ? styles.open : ''}`}></div>
			</div>
			<div className={menuOpen ? styles.mobileMenu : styles.NavLinks}>
				{isCheckingAuth ? null : currentUser ? (
					<>
						<Link
							to="/categories"
							className={styles.loggedInLink}
							onClick={closeMenu}
						>
							Categories
						</Link>
						<Link
							to="/cocktails"
							className={styles.loggedInLink}
							onClick={closeMenu}
						>
							Featured
						</Link>
						<Link
							to="/profile"
							className={styles.profileLink}
							onClick={closeMenu}
						>
							<i className="far fa-user-circle" />
						</Link>
						<Link
							to="/"
							onClick={() => {
								handleLogOut()
								closeMenu()
							}}
							className={styles.loggedInLink}
						>
							Logout{' '}
							{currentUser.full_name
								? currentUser.full_name
								: currentUser.username}{' '}
						</Link>
					</>
				) : (
					<>
						<Link
							to="/categories"
							className={styles.loggedInLink}
							onClick={closeMenu}
						>
							Categories
						</Link>
						<Link
							to="/cocktails"
							className={styles.loggedInLink}
							onClick={closeMenu}
						>
							Featured
						</Link>
						<Link
							to="/login"
							className={styles.loggedOutLink}
							onClick={closeMenu}
						>
							Log In{' '}
						</Link>
						<Link
							to="/signup"
							className={styles.loggedOutLink}
							onClick={closeMenu}
						>
							Sign Up
						</Link>
					</>
				)}
			</div>
		</div>
	)
}

export default React.memo(NavBar)
