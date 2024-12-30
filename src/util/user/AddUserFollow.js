const handleFollowClick = async ({
	addNewFollow,
	addUserToFollow,
	bartender,
	currentUser,
	deleteFollow,
	deleteUserFollowed,
	dispatch,
	hasFollowed,
	setHasFollowed,
}) => {
	if (hasFollowed) {
		try {
			await deleteFollow(hasFollowed.id).unwrap() // delete the follow
			setHasFollowed(undefined) // reset the state
			dispatch(deleteUserFollowed(hasFollowed.id)) // remove the follow from the store
		} catch (requestError) {
			console.error('Failed to unfollow:', requestError)
		}
	} else {
		try {
			const newFollow = await addNewFollow({
				follower_id: currentUser.id,
				followee_id: bartender.id,
			})
			setHasFollowed(newFollow) // set the new follow
			dispatch(addUserToFollow(newFollow.data)) // add the follow to the store
		} catch (requestError) {
			console.error('Failed to follow:', requestError)
		}
	}
}

export const handleFollow = async ({
	addNewFollow,
	addUserToFollow,
	bartender,
	currentUser,
	deleteFollow,
	deleteUserFollowed,
	dispatch,
	hasFollowed,
	openPanel,
	setHasFollowed,
}) => {
	if (!currentUser) {
		openPanel('follow')
		return
	}

	await handleFollowClick({
		addNewFollow,
		addUserToFollow,
		bartender,
		currentUser,
		deleteFollow,
		deleteUserFollowed,
		dispatch,
		hasFollowed,
		setHasFollowed,
	})
}
