import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link, useParams } from 'react-router-dom'
import { handleLikeClick } from '../../util/cocktail/AddCocktailLike'
import {
	addUserToFollow,
	addUsersLike,
	deleteUserFollowed,
	deleteUsersLike,
	selectCurrentUser,
	selectCurrentUsersLikes,
	selectUsersFollowedByCurrentUser,
} from '../auth/authSlice'
import {
	useAddNewFollowMutation,
	useDeleteFollowMutation,
} from '../follows/followsSlice'
import {
	useAddNewLikeMutation,
	useDeleteLikeMutation,
} from '../likes/likesSlice'
import { selectUserById } from '../users/usersSlice'
import { selectCocktailById } from './cocktailsSlice'
import cocktailDefault from '../../images/cocktail-default.jpeg'
import { Error } from '../../components/Error'

const CocktailDetail = () => {
	// Get query arg from URL
	const { id } = useParams()

	// reading the cocktail data from the normalized data resulted from the query getCocktails initiated when app is mounted in index.js
	const cocktail = useSelector((state) => selectCocktailById(state, id))

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
		image,
		likes_count: likesCount,
		photo_url: photo,
	} = cocktail ?? {}
	// reading data from the store
	const currentUser = useSelector(selectCurrentUser)
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

	const handleFollow = async () => {
		if (hasFollowed) {
			try {
				await deleteFollow(hasFollowed.id).unwrap()
				setHasFollowed(undefined)
				dispatch(deleteUserFollowed(hasFollowed.id))
			} catch (requestError) {
				console.error('Failed to unfollow:', requestError)
			}
		} else {
			try {
				const newFollow = await addNewFollow({
					follower_id: currentUser.id,
					followee_id: bartender.id,
				})
				setHasFollowed(newFollow)
				dispatch(addUserToFollow(newFollow.data))
			} catch (requestError) {
				console.error('Failed to follow:', requestError)
			}
		}
	}

	useEffect(() => {
		if (currentUser && cocktail) {
			setHasLiked(likes.find((like) => like.liked_cocktail_id === cocktail?.id))

			setHasFollowed(
				followedUsers.find((user) => user.followee_id === bartender.id)
			)
		}
	}, [currentUser, cocktail, bartender, followedUsers, likes])

	return cocktail ? (
		<div className="cocktail-detail">
			<div className="cocktail-detail-1">
				<img
					src={image ?? photo ?? cocktailDefault}
					alt={name ?? null}
					loading="lazy"
				/>
				<h3>{name}</h3>
				<p>{description}</p>
				<span>{ingredientItems}</span>
				<br></br>
				<span>{execution}</span>
				<h5>
					<button
						className="follow-btn"
						onClick={() =>
							handleLikeClick({
								hasLiked,
								setHasLiked,
								deleteLike,
								addNewLike,
								dispatch,
								deleteUsersLike,
								addUsersLike,
								currentUser,
								id,
							})
						}
					>
						{hasLiked ? '💜' : '🤍'} {likesCount}
					</button>
				</h5>
				{category ? (
					<div>
						<p className="cocktail-detail-1-category">
							Category: {category.name}
						</p>
						<p>{category.definition}</p>
						<Link to={`/categories/${category.id}`} className="view-more-btn">
							View More
						</Link>
					</div>
				) : null}
			</div>

			<div className="cocktail-detail-2">
				{bartender.profile_pic ? (
					<img
						src={bartender.profile_pic}
						alt={bartender.name}
						loading="lazy"
					/>
				) : null}
				<h3>Bartender</h3>
				<p>
					Name:{' '}
					{bartender.full_name
						? `${bartender.full_name}`
						: `${bartender.username}`}
				</p>
				{bartender.location && <p>Location: {bartender.location}</p>}

				{currentUser.id !== bartender.id ? (
					<button
						className="follow-btn"
						onClick={handleFollow}
						id={bartender.id}
					>
						{hasFollowed ? 'Following' : 'Follow'}{' '}
						{bartender.full_name ?? bartender.username}
					</button>
				) : null}
			</div>
		</div>
	) : (
		<Error> Cocktail not found </Error>
	)
}

export default React.memo(CocktailDetail)
