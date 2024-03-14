import React, { useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import { Error } from '../../components/Error'
import { handleLikeClick } from '../../util/cocktail/AddCocktailLike'
import {
	addUsersLike,
	deleteUsersLike,
	selectCurrentUser,
} from '../auth/authSlice'
import {
	useAddNewLikeMutation,
	useDeleteLikeMutation,
} from '../likes/likesSlice'
import { selectUserById } from '../users/usersSlice'
import { selectCocktailById } from './cocktailsSlice'

const CocktailCard = ({ id }) => {
	//reading the cocktail data from the store
	const cocktail = useSelector((state) => selectCocktailById(state, id))
	// current logged in user, to distinguish from the cocktail creator
	const currentUser = useSelector(selectCurrentUser)
	const dispatch = useDispatch()

	const {
		name,
		ingredients,
		image,
		likes_count: likesCount,
		bartender_id,
		photo_url: photo,
	} = cocktail ?? {}

	const cocktailCreator =
		useSelector((state) => selectUserById(state, bartender_id)) ?? undefined

	// Mutation hook to add new like and remove like to the cocktail
	const [addNewLike] = useAddNewLikeMutation()
	const [deleteLike] = useDeleteLikeMutation()

	const initialHasLiked = useMemo(
		() => currentUser.likes.some((like) => like.liked_cocktail_id === id),
		[currentUser.likes, id]
	)

	// state to set if the current user has already liked the cocktail
	const [hasLiked, setHasLiked] = useState(initialHasLiked)

	const ingredientItems = Array.isArray(ingredients)
		? ingredients?.map((i) => (
				<li className="ingredients-list" key={i}>
					{i}
				</li>
		  ))
		: null

	return cocktail ? (
		<div className="cocktail-card">
			<div className="image-cocktail">
				<Link to={`/cocktails/${id}`}>
					{/* seeded cocktails have featured pic in image field while cocktails submitted by users via upload have photo_url field, which was renamed photo during destructuring (line 31)*/}
					<img
						src={image ?? photo}
						alt={name}
						height="250px"
						width="260px"
						loading="lazy"
					/>
				</Link>
			</div>
			<div className="cocktail-card-info">
				<Link to={`/cocktails/${id}`}>
					<h3>{name}</h3>
				</Link>

				{ingredientItems ? <span>{ingredientItems}</span> : null}

				<h5>
					<button
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
					<br></br>
				</h5>
				<h5>
					{cocktailCreator?.full_name
						? cocktailCreator?.full_name
						: cocktailCreator?.username}
				</h5>
			</div>
			<Link to={`/cocktails/${id}`} className="view-more-btn">
				View More
			</Link>
		</div>
	) : (
		<Error> Cocktail not found</Error>
	)
}

export default React.memo(CocktailCard)
