import { useCallback, useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useAuthGate } from '../../components/design-system/AuthGate'
import { addUsersLike, deleteUsersLike, selectCurrentUser } from '../auth/authSlice'
import { useAddNewLikeMutation, useDeleteLikeMutation } from '../likes/likesSlice'
import { selectCocktailById } from './cocktailsSlice'

// Extracted from the original CocktailCard.jsx (ai/v1-redesign-plan.md
// PR6) — same mutations, same Redux updates, same AuthGate integration,
// now reusable. requireAuth itself already distinguishes logged-in from
// logged-out (runs `toggle`'s inner action only when logged in, opens the
// AuthGate prompt otherwise), so this replaces the original's manual
// `if (!currentUser) openPanel(...)` check with the same mechanism
// Toggles.jsx's own v0 source models for exactly this case — not a new
// behavior, just letting requireAuth do what it already does.
//
// One bug fixed during extraction, confirmed by reading the original code
// (not assumed): the original call site did `await addNewLike(...)`
// without `.unwrap()`, so the local "do I currently have a like" state
// held the raw RTK Query result wrapper ({ data, meta }) instead of the
// like record itself — dispatch(addUsersLike(...)) was already correctly
// reading `.data` for Redux, so the bug was invisible there, but the next
// unlike click read `.id` off the wrapper (undefined) and called
// deleteLike(undefined), which silently failed (caught, logged, UI stuck
// showing "liked"). `.unwrap()` here makes the local state and the Redux
// dispatch use the same, correctly-shaped value.
//
// count is NOT optimistically incremented — same as the original, which
// displayed `cocktail.likes_count` straight from the store. Both
// mutations already `invalidatesTags` the Cocktail list/detail tags, so
// the real count arrives via the existing RTK Query refetch, not invented
// local math.
export function useLikeCocktail(id) {
	const dispatch = useDispatch()
	const currentUser = useSelector(selectCurrentUser)
	const cocktail = useSelector((state) => selectCocktailById(state, id))
	const { requireAuth } = useAuthGate()

	const [addNewLike, { isLoading: isLiking }] = useAddNewLikeMutation()
	const [deleteLike, { isLoading: isUnliking }] = useDeleteLikeMutation()

	// Holds the like record itself (so its id is available to delete
	// later), not a bare boolean — same shape the original used.
	const initialLike = useMemo(
		() => currentUser?.likes?.find((like) => like.liked_cocktail_id === id) || null,
		[currentUser, id]
	)
	const [likeRecord, setLikeRecord] = useState(initialLike)

	const toggle = useCallback(() => {
		requireAuth({ kind: 'like', subject: cocktail?.name }, async () => {
			if (likeRecord) {
				try {
					await deleteLike(likeRecord.id).unwrap()
					setLikeRecord(null)
					dispatch(deleteUsersLike(likeRecord.id))
				} catch (requestError) {
					console.error('Failed to unlike:', requestError)
				}
			} else {
				try {
					const newLike = await addNewLike({
						liker_id: currentUser.id,
						liked_cocktail_id: id,
					}).unwrap()
					setLikeRecord(newLike)
					dispatch(addUsersLike(newLike))
				} catch (requestError) {
					console.error('Failed to like:', requestError)
				}
			}
		})
	}, [addNewLike, cocktail?.name, currentUser?.id, deleteLike, dispatch, id, likeRecord, requireAuth])

	return {
		liked: Boolean(likeRecord),
		count: cocktail?.likes_count ?? 0,
		toggle,
		pending: isLiking || isUnliking,
	}
}
