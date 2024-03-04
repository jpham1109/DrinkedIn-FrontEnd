export const handleLikeClick = async ({
	hasLiked,
	setHasLiked,
	deleteLike,
	addNewLike,
	dispatch,
	deleteUsersLike,
	addUsersLike,
	currentUser,
	id,
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
