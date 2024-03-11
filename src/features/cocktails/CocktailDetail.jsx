import classNames from 'classnames'
import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link, useParams } from 'react-router-dom'
import { Spinner } from '../../components/Spinner'
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
import { useGetCocktailQuery } from './cocktailsSlice'
import cocktailDefault from '../../images/cocktail-default.jpeg'

export default function CocktailDetail() {
	// Get query arg from URL
	const { id } = useParams()

	// Query hook to fetch cocktail data
	const {
		data: cocktail,
		isLoading,
		isFetching,
		isError,
		error,
	} = useGetCocktailQuery(parseInt(id, 10))

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

	// state to set if the current user has already liked the cocktail
	const [hasLiked, setHasLiked] = useState(undefined)
	// state to set if the current user has already followed the bartender
	const [hasFollowed, setHasFollowed] = useState(undefined)
	// state for ingredient items
	const [ingredientItems, setIngredientItems] = useState([])

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

	const containerClassname = classNames('cocktail-detail', {
		disabled: isFetching,
	})

	useEffect(() => {
		if (ingredients) {
			setIngredientItems(
				ingredients?.map((i) => (
					<li className="ingredients-list" key={i}>
						{i}
					</li>
				))
			)
		}
		if (currentUser && cocktail) {
			setHasLiked(likes.find((like) => like.liked_cocktail_id === cocktail?.id))

			setHasFollowed(
				followedUsers.find((user) => user.followee_id === bartender.id)
			)
		}
	}, [ingredients, currentUser, cocktail, bartender, followedUsers, likes])

	if (isLoading) {
		return <Spinner text="Loading cocktail..." />
	}
	if (isError) {
		return <div>{error}</div>
	}

	return (
		<div className={containerClassname}>
			<div className="cocktail-detail-1">
				<img src={image ?? photo ?? cocktailDefault} alt={name ?? null} />
				<h3>{name}</h3>
				<p>{description}</p>
				<span>{ingredientItems ?? null}</span>
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
					<img src={bartender.profile_pic} alt={bartender.name} />
				) : null}
				<h3>Bartender</h3>
				<p>
					Name:{' '}
					{bartender.full_name
						? `${bartender.full_name}`
						: `${bartender.username}`}
				</p>
				{bartender.location && <p>Location: {bartender.location}</p>}

				{/* <p>Instagram: {bartender.instagram_account}</p>
                      {(bio.length !== 0) ? <p>Bio: {bio}</p> : null}
                      <p>Instagram followers: {bartender.insta_follower} | Instagram following: {bartender.insta_following}</p> */}
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

			{/* <Workplace bar={bar}/> */}
		</div>
	)
}
