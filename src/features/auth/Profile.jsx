import { useDispatch, useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import profile from '../../images/profile.jpeg'
import CocktailCard from '../cocktails/CocktailCard'
import { useDeleteCocktailMutation } from '../cocktails/cocktailsSlice'
import { useDeleteFollowMutation } from '../follows/followsSlice'
import { useDeleteLikeMutation } from '../likes/likesSlice'
import ProfileInfo from './ProfileInfo'
import UpdateProfile from './UpdateProfile'
import UserCard from '../users/UserCard'
import {
	deleteUserFollowed,
	deleteUsersCocktail,
	deleteUsersFollower,
	deleteUsersLike,
	selectCurrentUser,
	selectCurrentUsersCocktails,
	selectCurrentUsersFollowers,
	selectUsersFollowedByCurrentUser,
	selectCurrentUsersLikes,
} from './authSlice'
import { Error } from '../../components/Error'
import React from 'react'

const Profile = () => {
	const currentUser = useSelector(selectCurrentUser)

	const [deleteCocktail] = useDeleteCocktailMutation()
	const [deleteLike] = useDeleteLikeMutation()
	const [deleteFollow] = useDeleteFollowMutation()

	const dispatch = useDispatch()

	const handleDeleteCocktail = async (event) => {
		const id = parseInt(event.target.id, 10)

		try {
			await deleteCocktail(id)
				.unwrap()
				.then(() => {
					dispatch(deleteUsersCocktail(id))
				})
		} catch (requestError) {
			console.error('Failed to delete cocktail:', requestError)
		}
	}

	const handleDeleteLike = async (event) => {
		const id = parseInt(event.target.id, 10)

		try {
			await deleteLike(id)
				.unwrap()
				.then(() => {
					dispatch(deleteUsersLike(id))
				})
		} catch (requestError) {
			console.error('Failed to delete like:', requestError)
		}
	}

	const handleUnfollow = async (event) => {
		const id = parseInt(event.target.id, 10)

		try {
			await deleteFollow(id)
				.unwrap()
				.then(() => {
					// unfollow
					dispatch(deleteUserFollowed(id))
				})
		} catch (requestError) {
			console.error('Failed to delete follow:', requestError)
		}
	}

	const handleRemoveFollower = async (event) => {
		const id = parseInt(event.target.id, 10)

		try {
			await deleteFollow(id)
				.unwrap()
				.then(() => {
					// remove follower
					dispatch(deleteUsersFollower(id))
				})
		} catch (requestError) {
			console.error('Failed to delete follow:', requestError)
		}
	}

	const cocktailsCreatedItems = useSelector((state) =>
		selectCurrentUsersCocktails(state).map((cocktail) => (
			<div key={cocktail?.id} className="cocktail-item">
				{cocktail ? (
					<>
						<CocktailCard id={cocktail.id} />
						<Link to={`/cocktails/${cocktail.id}/edit`}>
							{' '}
							<button className="edit-btn">Edit</button>{' '}
						</Link>
						<button
							id={cocktail.id}
							onClick={handleDeleteCocktail}
							className="delete-btn"
						>
							Delete
						</button>
					</>
				) : null}
			</div>
		))
	)

	const likedItems = useSelector((state) =>
		selectCurrentUsersLikes(state).map((like) => (
			<div key={like?.id} className="liked-card">
				{like ? (
					<>
						<CocktailCard id={like.liked_cocktail_id} />
						<button
							id={like.id}
							onClick={handleDeleteLike}
							className="delete-btn"
						>
							Delete
						</button>
					</>
				) : null}
			</div>
		))
	)

	// cards of users who current user follows
	const followingItems = useSelector((state) =>
		selectUsersFollowedByCurrentUser(state).map((followed) => (
			<div key={followed?.id}>
				{followed ? (
					<>
						<UserCard id={followed.followee_id} />
						<button
							id={followed.id}
							onClick={handleUnfollow}
							className="delete-btn"
						>
							Unfollow
						</button>
					</>
				) : null}
			</div>
		))
	)

	// cards of users who follows current user
	const followerItems = useSelector((state) =>
		selectCurrentUsersFollowers(state).map((following) => (
			<div key={following?.id}>
				{following ? (
					<>
						<UserCard id={following.follower_id} />
						<button
							id={following.id}
							onClick={handleRemoveFollower}
							className="delete-btn"
						>
							Remove
						</button>
					</>
				) : null}
			</div>
		))
	)

	return currentUser ? (
		<>
			<div className="profile-container">
				<div className="profile-item-1">
					{cocktailsCreatedItems.length !== 0 ? (
						<div className="cocktail-creations">
							<h3 className="profile-item-1-title">Creations</h3>
							<div className="cocktail-list">{cocktailsCreatedItems}</div>
						</div>
					) : null}
				</div>

				<div className="profile-item-2">
					<h3 className="profile-item-2-title">Profile</h3>
					<div className="profile-wrapper">
						<ProfileInfo currentUser={currentUser} />
						<UpdateProfile currentUser={currentUser} />
					</div>
				</div>
				<div className="profile-item-3">
					{likedItems.length !== 0 ? (
						<div className="liked-cocktails">
							<h3 className="profile-item-3-tilte"> 💜 cocktails </h3>
							<div className="liked-list">{likedItems}</div>
						</div>
					) : null}
				</div>
				<div className="profile-item-4">
					{followingItems.length !== 0 ? (
						<div className="following">
							<h3 className="profile-item-4-tilte">Following </h3>
							<div className="following-card">{followingItems}</div>
						</div>
					) : null}
				</div>
				<div className="profile-item-5">
					{followerItems.length !== 0 ? (
						<div className="followed">
							<h3 className="profile-item-5-tilte">Followers </h3>
							<div className="followed-card">{followerItems}</div>
						</div>
					) : null}
				</div>
				<img id="profile-img" src={profile} alt="profile-img" />
			</div>
		</>
	) : (
		<Error>No user found</Error>
	)
}

export default React.memo(Profile)
