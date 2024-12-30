import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link, useParams } from 'react-router-dom'
import { handleFollow } from '../../../util/user/AddUserFollow'
import { handleLike } from '../../../util/cocktail/AddCocktailLike'
import {
	addUserToFollow,
	addUsersLike,
	deleteUserFollowed,
	deleteUsersLike,
	selectCurrentUser,
	selectCurrentUsersLikes,
	selectUsersFollowedByCurrentUser,
} from '../../auth/authSlice'
import {
	useAddNewFollowMutation,
	useDeleteFollowMutation,
} from '../../follows/followsSlice'
import {
	useAddNewLikeMutation,
	useDeleteLikeMutation,
} from '../../likes/likesSlice'
import { selectUserById } from '../../users/usersSlice'
import { selectCocktailById } from '../cocktailsSlice'
import cocktailDefault from '../../../images/cocktail-default.jpeg'
import appStyles from '../../../components/App/App.module.css'
import styles from './CocktailDetail.module.css'
import { Error } from '../../../components/Error'
import SlideInPanel from '../../../components/SlideInPanel/SlideInPanel'
import useSlideInPanel from '../../../hooks/use-slide-in-panel'

const CocktailDetail = () => {
	// Get query arg from URL
	const { id } = useParams()

	// reading the cocktail data from the normalized data resulted from the query getCocktails initiated when app is mounted in index.js
	const cocktail = useSelector((state) => selectCocktailById(state, id))

	//custom hook to manage state for the slide in panel
	const { isPanelOpen, openPanel, closePanel, unauthorizedAction } =
		useSlideInPanel()
	// Mutation hook to add new like and follow to the cocktail
	const [addNewLike] = useAddNewLikeMutation()
	const [deleteLike] = useDeleteLikeMutation()
	const [addNewFollow] = useAddNewFollowMutation()
	const [deleteFollow] = useDeleteFollowMutation()
	const {
		category,
		bartender_id,
		name,
		description,
		execution,
		ingredients,
		likes_count: likesCount,
		photo,
	} = cocktail ?? {}

	// reading data from the store
	const currentUser = useSelector(selectCurrentUser) ?? undefined
	const likes = useSelector(selectCurrentUsersLikes)
	const followedUsers = useSelector(selectUsersFollowedByCurrentUser)
	const bartender =
		useSelector((state) => selectUserById(state, bartender_id)) ?? undefined

	let ingredientItems = null
	if (ingredients) {
		ingredientItems = ingredients?.map((i) => (
			<li className="ingredients-list" key={i}>
				{i}
			</li>
		))
	}

	// state to set if the current user has already liked the cocktail
	const [hasLiked, setHasLiked] = useState(undefined)
	// state to set if the current user has already followed the bartender
	const [hasFollowed, setHasFollowed] = useState(undefined)

	const dispatch = useDispatch()

	// useEffect to set the state of hasLiked and hasFollowed when the component is mounted
	useEffect(() => {
		if (currentUser && cocktail) {
			setHasLiked(
				likes?.find((like) => like.liked_cocktail_id === cocktail?.id) ?? false
			)

			setHasFollowed(
				followedUsers?.find((user) => user.followee_id === bartender.id) ??
					false
			)
		}
	}, [currentUser, cocktail, bartender, followedUsers, likes])

	return cocktail ? (
		<div className={styles.container}>
			<div className={styles.cocktail}>
				<div className={styles.image}>
					<img
						src={photo ?? cocktailDefault}
						alt={name ?? null}
						loading="lazy"
					/>
					<h3>{name}</h3>
				</div>
				<div className={styles.about}>
					<h3>About</h3>
					<p>{description}</p>
					<span>{ingredientItems}</span>
					<p>{execution}</p>
					<button
						className={styles.followButton}
						onClick={() =>
							handleLike({
								hasLiked,
								setHasLiked,
								deleteLike,
								addNewLike,
								dispatch,
								deleteUsersLike,
								addUsersLike,
								currentUser,
								id,
								openPanel,
							})
						}
					>
						{hasLiked ? '💜' : '🤍'} {likesCount}
					</button>
					{category ? (
						<div className={styles.category}>
							<span>Category: {category.name}</span>
							<p>{category.definition}</p>
							<Link
								to={`/categories/${category.id}`}
								className={appStyles.viewMoreButton}
							>
								View More
							</Link>
						</div>
					) : null}
				</div>
			</div>

			<div className={styles.bartender}>
				<div className={styles.avatar}>
					{bartender.avatar ? (
						<img src={bartender.avatar} alt={bartender.name} loading="lazy" />
					) : null}
					<h3>Bartender</h3>
				</div>
				<div className={styles.info}>
					<p>
						Name:{' '}
						{bartender.full_name
							? `${bartender.full_name}`
							: `${bartender.username}`}
					</p>
					{bartender.location && <p>Location: {bartender.location}</p>}
				</div>

				{currentUser?.id !== bartender.id ? (
					<button
						className={styles.followButton}
						onClick={() =>
							handleFollow({
								hasFollowed,
								setHasFollowed,
								deleteFollow,
								addNewFollow,
								dispatch,
								deleteUserFollowed,
								addUserToFollow,
								currentUser,
								bartender,
								openPanel,
							})
						}
						id={bartender.id}
					>
						{hasFollowed ? 'Following' : 'Follow'}{' '}
						{bartender.full_name ?? bartender.username}
					</button>
				) : null}
			</div>
			<SlideInPanel
				isOpen={isPanelOpen}
				onClose={closePanel}
				unauthorizedAction={unauthorizedAction}
			/>
		</div>
	) : (
		<Error> Cocktail not found </Error>
	)
}

export default React.memo(CocktailDetail)
