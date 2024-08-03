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
import React, { useState } from 'react'
import { useCallback } from 'react'

const Profile = () => {
	const currentUser = useSelector(selectCurrentUser)

	const [activeTab, setActiveTab] = useState('creations')

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
			<div key={cocktail?.id} className={styles.card}>
				<CocktailCard id={cocktail.id} />
				<div className={styles.card__buttonsWrapper}>
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
				</div>
			</div>
		)
	)

	const likedItems = useSelector(selectCurrentUsersLikes).map((like) => (
		<div key={like?.id} className={styles.card}>
			<CocktailCard id={like.liked_cocktail_id} />
			<button id={like.id} onClick={handleDeleteLike} className={styles.button}>
				Delete
			</button>
		</div>
	))

	// cards of users who current user follows
	const followingItems = useSelector(selectUsersFollowedByCurrentUser).map(
		(followed) => (
			<div key={followed?.id} className={styles.card}>
				<UserCard id={followed.followee_id} />
				<button
					id={followed.id}
					onClick={handleUnfollow}
					className={styles.button}
				>
					Unfollow
				</button>
			</div>
		)
	)

	// cards of users who follows current user
	const followerItems = useSelector(selectCurrentUsersFollowers).map(
		(following) => (
			<div key={following?.id} className={styles.card}>
				<UserCard id={following.follower_id} />
				<button
					id={following.id}
					onClick={handleRemoveFollower}
					className={styles.button}
				>
					Remove
				</button>
			</div>
		)
	)

	return currentUser ? (
		<div className={styles.container}>
			<div className={styles.profileSection}>
				<ProfileInfo currentUser={currentUser} />
			</div>

			<div className={styles.tabs}>
				<div
					className={`${styles.tab} ${
						activeTab === 'creations' ? styles.active : ''
					}`}
					onClick={() => setActiveTab('creations')}
				>
					Creations
				</div>

				<div
					className={`${styles.tab} ${
						activeTab === 'liked' ? styles.active : ''
					}`}
					onClick={() => setActiveTab('liked')}
				>
					❤️
				</div>

				<div
					className={`${styles.tab} ${
						activeTab === 'followers' ? styles.active : ''
					}`}
					onClick={() => setActiveTab('followers')}
				>
					Followers
				</div>

				<div
					className={`${styles.tab} ${
						activeTab === 'following' ? styles.active : ''
					}`}
					onClick={() => setActiveTab('following')}
				>
					Following
				</div>
			</div>

			<div
				className={`${styles.tab__content} ${
					activeTab === 'creations' ? styles.active : ''
				}`}
			>
				{cocktailsCreatedItems.length !== 0 ? (
					<div className={styles.card__list}>{cocktailsCreatedItems}</div>
				) : (
					'Nothing to show here yet. Get started by creating a cocktail! 🍹'
				)}
			</div>

			<div
				className={`${styles.tab__content} ${
					activeTab === 'liked' ? styles.active : ''
				}`}
			>
				{likedItems.length !== 0 ? (
					<div className={styles.card__list}>{likedItems}</div>
				) : (
					'Nothing to show here yet. Get started by liking a cocktail! 🍹'
				)}
			</div>

			<div
				className={`${styles.tab__content} ${
					activeTab === 'followers' ? styles.active : ''
				}`}
			>
				{followingItems.length !== 0 ? (
					<div className={styles.card__list}>{followingItems}</div>
				) : (
					'Nothing to show here yet. Get started by following a bartender! 🍹'
				)}
			</div>

			<div
				className={`${styles.tab__content} ${
					activeTab === 'following' ? styles.active : ''
				}`}
			>
				{followerItems.length !== 0 ? (
					<div className={styles.card__list}>{followerItems}</div>
				) : (
					'No followers just yet. Share your profile to get started! 🍹'
				)}
			</div>

			{/* <img
				className={appStyles.backgroundImage}
				src={profile}
				alt="Background for profile page"
				loading="lazy"
			/> */}
		</div>
	) : (
		<Error>No user found</Error>
	)
}

export default React.memo(Profile)
