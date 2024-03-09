import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link, Route, Routes, useNavigate } from 'react-router-dom'
import Login from '../features/auth/Login'
import {
	logoutUser,
	selectCurrentUser,
	setCredentials,
	useGetUserQuery,
} from '../features/auth/authSlice'

const NavBar = () => {
	const currentUser = useSelector(selectCurrentUser)
	const dispatch = useDispatch()
	const navigate = useNavigate()

	// Query hook for current user on page reload and the store loses user state
	const { data: userData, isSuccess } = useGetUserQuery({ skip: !!currentUser })

	useEffect(() => {
		const token = localStorage.getItem('token')
		if (!currentUser && token && isSuccess) {
			dispatch(setCredentials({ token, user: userData }))
		}
	}, [dispatch, currentUser, userData, isSuccess])

	const handleLogOut = async () => {
		try {
			localStorage.removeItem('token')
			dispatch(logoutUser())
			navigate('/login')
		} catch (error) {
			console.error('Failed to log out:', error)
		}
	}

	return (
		<div className="navbar">
			<div className="home">
				<Link to="/" id="logo">
					<i className="fas fa-cocktail"></i>DRINKEDIN
				</Link>
			</div>
			<div>
				{currentUser ? (
					<div className="navbar-links">
						<Link to="/categories" className="categories-nav">
							Categories
						</Link>
						<Link to="/cocktails" className="cocktails-nav">
							Featured
						</Link>
						<Link to="/profile" className="profile-nav">
							<i className="far fa-user-circle" />
						</Link>
						<Link to="/" onClick={handleLogOut} className="logout-btn">
							Logout{' '}
							{currentUser.full_name
								? currentUser.full_name
								: currentUser.username}{' '}
						</Link>
					</div>
				) : (
					<div>
						<div className="navbar-links-logout">
							<Link to="/" className="loginicon">
								Log In
							</Link>
							<Link to="/signup" className="loggedinicon">
								Sign Up
							</Link>
						</div>
						<Routes>
							<Route path="/" element={<Login />} />
						</Routes>
					</div>
				)}
			</div>
		</div>
	)
}

export default NavBar
