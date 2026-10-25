import { useCallback, useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useAuthGate } from '../../components/design-system/AuthGate'
import {
	addUserToFollow,
	deleteUserFollowed,
	selectCurrentUser,
	selectUsersFollowedByCurrentUser,
} from '../auth/authSlice'
import { useAddNewFollowMutation, useDeleteFollowMutation } from '../follows/followsSlice'

// Extracted from the original CocktailDetail.jsx's handleFollow/handleFollowClick
// (util/user/AddUserFollow.js, ai/v1-redesign-plan.md PR7) — same mutations,
// same Redux updates, same AuthGate integration, now reusable, modeled
// directly on the cocktails feature's useLikeCocktail.js (same shape: a
// stored record rather than a bare boolean, requireAuth replacing the
// original's manual `if (!currentUser) openPanel(...)` check).
//
// Takes the bartender object itself (not just an id): unlike cocktails,
// there is no working selectUserById/getUsers cache to resolve a bartender
// from an id alone — useGetUsersQuery() has zero real consumers anywhere in
// the app today, confirmed via grep, so that lookup silently resolves to
// nothing in production. CocktailDetail already has the embedded
// `cocktail.bartender` ({id, full_name, username} — BartenderSerializer)
// on hand from its own getCocktail(id) fetch; this hook just takes that
// directly rather than re-deriving it from a cache that doesn't work.
export function useFollowBartender(bartender) {
	const dispatch = useDispatch()
	const currentUser = useSelector(selectCurrentUser)
	const followedUsers = useSelector(selectUsersFollowedByCurrentUser)
	const { requireAuth } = useAuthGate()

	const [addNewFollow, { isLoading: isFollowing }] = useAddNewFollowMutation()
	const [deleteFollow, { isLoading: isUnfollowing }] = useDeleteFollowMutation()

	const bartenderId = bartender?.id
	const subjectName = bartender?.full_name || bartender?.username

	// Holds the follow record itself (so its id is available to delete
	// later), not a bare boolean — same shape the original used.
	const initialFollow = useMemo(
		() => followedUsers?.find((follow) => follow.followee_id === bartenderId) || null,
		[followedUsers, bartenderId]
	)
	const [followRecord, setFollowRecord] = useState(initialFollow)

	const toggle = useCallback(() => {
		requireAuth({ kind: 'follow', subject: subjectName }, async () => {
			if (followRecord) {
				try {
					await deleteFollow(followRecord.id).unwrap()
					setFollowRecord(null)
					dispatch(deleteUserFollowed(followRecord.id))
				} catch (requestError) {
					console.error('Failed to unfollow:', requestError)
				}
			} else {
				try {
					const newFollow = await addNewFollow({
						follower_id: currentUser.id,
						followee_id: bartenderId,
					}).unwrap()
					setFollowRecord(newFollow)
					dispatch(addUserToFollow(newFollow))
				} catch (requestError) {
					console.error('Failed to follow:', requestError)
				}
			}
		})
	}, [addNewFollow, bartenderId, currentUser?.id, deleteFollow, dispatch, followRecord, requireAuth, subjectName])

	return {
		following: Boolean(followRecord),
		toggle,
		pending: isFollowing || isUnfollowing,
	}
}
