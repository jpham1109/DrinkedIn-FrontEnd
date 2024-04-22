import React, { useCallback, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link, Route, Routes, useNavigate } from 'react-router-dom'
import Login from '../../features/auth/Login/Login'
import {
	logoutUser,
	selectCurrentUser,
	selectCurrentUsersToken,
	setCredentials,
	useGetUserQuery,
} from '../../features/auth/authSlice'
import styles from './NavBar.module.css'

const NavBar = () => {
	const currentUser = useSelector(selectCurrentUser)
	const token = useSelector(selectCurrentUsersToken)
	const dispatch = useDispatch()
	const navigate = useNavigate()

	// Query hook for current user on page reload and the store loses user state
	const { data: userData, isSuccess } = useGetUserQuery({ skip: !!currentUser })

	useEffect(() => {
		if (!currentUser && token && isSuccess) {
			dispatch(setCredentials({ token, user: userData }))
		}
	}, [dispatch, currentUser, isSuccess, token, userData])

	const handleLogOut = useCallback(async () => {
		try {
			dispatch(logoutUser())
			navigate('/login')
		} catch (error) {
			console.error('Failed to log out:', error)
		}
	}, [dispatch, navigate])

	return (
		<div className={styles.container}>
			<Link to="/" className={styles.logo}>
				<i className="fas fa-cocktail"></i>DRINKEDIN
			</Link>

			{currentUser ? (
				<div className={styles.NavLinks}>
					<Link to="/categories" className={styles.loggedInLink}>
						Categories
					</Link>
					<Link to="/cocktails" className={styles.loggedInLink}>
						Featured
					</Link>
					<Link to="/profile" className={styles.profileLink}>
						<i className="far fa-user-circle" />
					</Link>
					<Link to="/" onClick={handleLogOut} className={styles.loggedInLink}>
						Logout{' '}
						{currentUser.full_name
							? currentUser.full_name
							: currentUser.username}{' '}
					</Link>
				</div>
			) : (
				<div className={styles.NavLinks}>
					<Link to="/login" className={styles.loggedOutLink}>
						Log In{' '}
					</Link>
					<Link to="/signup" className={styles.loggedOutLink}>
						Sign Up
					</Link>
				</div>
			)}
		</div>
	)
}

export default React.memo(NavBar)
