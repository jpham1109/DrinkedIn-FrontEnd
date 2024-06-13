import { useDispatch, useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import appStyles from '../../../components/App/App.module.css'
import styles from './Profile.module.css'
import profile from '../../../images/profile.jpeg'
import CocktailCard from '../../cocktails/CocktailCard/CocktailCard'
import { useDeleteCocktailMutation } from '../../cocktails/cocktailsSlice'
import { useDeleteFollowMutation } from '../../follows/followsSlice'
import { useDeleteLikeMutation } from '../../likes/likesSlice'
import ProfileInfo from '../ProfileInfo/ProfileInfo'
import UpdateProfile from '../UpdateProfile/UpdateProfile'
import UserCard from '../../users/UserCard/UserCard'
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
} from '../authSlice'
import { Error } from '../../../components/Error'
import React from 'react'
import { useCallback } from 'react'

const Profile = () => {
	const currentUser = useSelector(selectCurrentUser)

	const [deleteCocktail] = useDeleteCocktailMutation()
	const [deleteLike] = useDeleteLikeMutation()
	const [deleteFollow] = useDeleteFollowMutation()

	const dispatch = useDispatch()

	const handleDeleteCocktail = useCallback(
		async (event) => {
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
		},
		[deleteCocktail, dispatch]
	)

	const handleDeleteLike = useCallback(
		async (event) => {
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
		},
		[deleteLike, dispatch]
	)

	const handleUnfollow = useCallback(
		async (event) => {
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
		},
		[deleteFollow, dispatch]
	)

	const handleRemoveFollower = useCallback(
		async (event) => {
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
		},
		[deleteFollow, dispatch]
	)

	const cocktailsCreatedItems = useSelector(selectCurrentUsersCocktails).map(
		(cocktail) => (
			<div key={cocktail?.id} className={styles.createdCocktails__list}>
				{cocktail ? (
					<>
						<CocktailCard id={cocktail.id} />
						<Link to={`/cocktails/${cocktail.id}/edit`}>
							{' '}
							<button className={styles.button}>Edit</button>{' '}
						</Link>
						<button
							id={cocktail.id}
							onClick={handleDeleteCocktail}
							className={styles.button}
						>
							Delete
						</button>
					</>
				) : null}
			</div>
		)
	)

	const likedItems = useSelector(selectCurrentUsersLikes).map((like) => (
		<div key={like?.id}>
			{like ? (
				<>
					<CocktailCard id={like.liked_cocktail_id} />
					<button
						id={like.id}
						onClick={handleDeleteLike}
						className={styles.button}
					>
						Delete
					</button>
				</>
			) : null}
		</div>
	))

	// cards of users who current user follows
	const followingItems = useSelector(selectUsersFollowedByCurrentUser).map(
		(followed) => (
			<div key={followed?.id}>
				{followed ? (
					<>
						<UserCard id={followed.followee_id} />
						<button
							id={followed.id}
							onClick={handleUnfollow}
							className={styles.button}
						>
							Unfollow
						</button>
					</>
				) : null}
			</div>
		)
	)

	// cards of users who follows current user
	const followerItems = useSelector(selectCurrentUsersFollowers).map(
		(following) => (
			<div key={following?.id}>
				{following ? (
					<>
						<UserCard id={following.follower_id} />
						<button
							id={following.id}
							onClick={handleRemoveFollower}
							className={styles.button}
						>
							Remove
						</button>
					</>
				) : null}
			</div>
		)
	)

	return currentUser ? (
		<div className={styles.container}>
			{cocktailsCreatedItems.length !== 0 ? (
				<div className={styles.createdCocktails__list}>
					<h3>Creations</h3>
					{cocktailsCreatedItems}
				</div>
			) : null}

			<div className={styles.bio}>
				<h3>Profile</h3>
				<div className={styles.bio__info}>
					<ProfileInfo currentUser={currentUser} />
					<UpdateProfile currentUser={currentUser} />
				</div>
			</div>
			{likedItems.length !== 0 ? (
				<div className={styles.likedCocktails}>
					<h3> 💜 cocktails </h3>
					<div className={styles.likedCocktails__list}>{likedItems}</div>
				</div>
			) : null}

			{followingItems.length !== 0 ? (
				<div className={styles.following}>
					<h3>Following </h3>
					<div className={styles.following__list}>{followingItems}</div>
				</div>
			) : null}

			{followerItems.length !== 0 ? (
				<div className={styles.followers}>
					<h3>Followers </h3>
					<div className={styles.followers__list}>{followerItems}</div>
				</div>
			) : null}
			<img
				className={appStyles.backgroundImage}
				src={profile}
				alt="Background for profile page"
				loading="lazy"
			/>
		</div>
	) : (
		<Error>No user found</Error>
	)
}

export default React.memo(Profile)
