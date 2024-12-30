const handleLikeClick = async ({
	addNewLike,
	addUsersLike,
	currentUser,
	deleteLike,
	deleteUsersLike,
	dispatch,
	hasLiked,
	id,
	setHasLiked,
}) => {
	if (hasLiked) {
		try {
			await deleteLike(hasLiked.id).unwrap()
			setHasLiked(undefined)
			dispatch(deleteUsersLike(hasLiked.id))
		} catch (requestError) {
			console.error('Failed to unlike:', requestError)
		}
	} else {
		try {
			const newLike = await addNewLike({
				liker_id: currentUser.id,
				liked_cocktail_id: id,
			})
			setHasLiked(newLike)
			dispatch(addUsersLike(newLike.data))
		} catch (requestError) {
			console.error('Failed to like:', requestError)
		}
	}
}

export const handleLike = async ({
	addNewLike,
	addUsersLike,
	currentUser,
	deleteLike,
	deleteUsersLike,
	dispatch,
	hasLiked,
	id,
	setHasLiked,
	openPanel,
}) => {
	if (!currentUser) {
		openPanel('like')
		return
	}

	await handleLikeClick({
		addNewLike,
		addUsersLike,
		currentUser,
		deleteLike,
		deleteUsersLike,
		dispatch,
		hasLiked,
		id,
		setHasLiked,
	})
}
