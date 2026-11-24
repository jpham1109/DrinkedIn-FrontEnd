import { useCallback, useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useAuthGate } from '../../components/design-system/AuthGate'
import { deleteUserFollowed, selectCurrentUser, selectUsersFollowedByCurrentUser } from '../auth/authSlice'
import { useAddNewFollowMutation, useDeleteFollowMutation } from '../follows/followsSlice'

// Extracted from the original CocktailDetail.jsx's handleFollow/handleFollowClick
// (util/user/AddUserFollow.js, ai/v1-redesign-plan.md PR7) — same mutations,
// same Redux updates, same AuthGate integration, now reusable, modeled
// directly on the cocktails feature's useLikeCocktail.js (same shape: a
// stored record rather than a bare boolean, requireAuth replacing the
// original's manual `if (!currentUser) openPanel(...)` check).
//
// Takes the bartender object itself (not just an id): the public `/users`
// list cache (ai/v1-redesign-plan.md's privacy-first-user-discovery
// workstream, 2026-11-23) no longer exists at all — CocktailDetail already
// has the embedded `cocktail.bartender` ({id, full_name, username} —
// BartenderSerializer) on hand from its own getCocktail(id) fetch; this
// hook just takes that directly rather than depending on any separate
// cache.
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
					// addNewFollow's own invalidatesTags: ['Follow', 'User']
					// (followsSlice.js) already triggers a background refetch of
					// the enriched /me payload — dispatching the bare POST
					// /follows response straight into auth.user.followed_users
					// here used to inject an identity-less entry into that same
					// array in the interval before that refetch resolves, which
					// Profile.jsx's Following tab (reading the nested `followee`
					// identity directly, not a separate /users lookup) would hit
					// as a blank/incomplete row. followRecord below still drives
					// this button's own immediate feedback, independent of that
					// array, so removing the dispatch costs nothing here.
					const newFollow = await addNewFollow({
						follower_id: currentUser.id,
						followee_id: bartenderId,
					}).unwrap()
					setFollowRecord(newFollow)
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
