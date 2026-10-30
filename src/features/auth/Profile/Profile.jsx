import React, { useCallback, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Heart, Pencil, Trash2, UserRound, Users, Wine } from 'lucide-react'
import { Button, ButtonLink } from '../../../components/design-system/Button'
import { CreatorIdentity } from '../../../components/design-system/Identity'
import { Overlay } from '../../../components/design-system/Overlay'
import { EmptyState } from '../../../components/design-system/States'
import { Tabs } from '../../../components/design-system/Tabs'
import { FollowButton } from '../../../components/design-system/Toggles'
import { cn } from '../../../util/cn'
import CocktailCard from '../../cocktails/CocktailCard/CocktailCard'
import { selectCocktailById, useDeleteCocktailMutation } from '../../cocktails/cocktailsSlice'
import { useDeleteFollowMutation } from '../../follows/followsSlice'
import { selectUserById } from '../../users/usersSlice'
import { Error } from '../../../components/Error'
import ProfileInfo from '../ProfileInfo/ProfileInfo'
import {
	deleteUserFollowed,
	deleteUsersCocktail,
	deleteUsersFollower,
	selectCurrentUser,
	selectCurrentUsersCocktails,
	selectCurrentUsersFollowers,
	selectUsersFollowedByCurrentUser,
} from '../authSlice'

// Ported from Design/drinkedin-v0/components/profile/profile-view.tsx
// (ai/v1-redesign-plan.md PR8), restyled onto the V1 design system —
// first real wiring of Tabs.jsx anywhere in the app (already a complete
// WAI-ARIA tabs implementation, nothing to build there, just consume it).
const gridClass =
	'grid grid-cols-2 gap-x-4 gap-y-10 sm:gap-x-6 md:grid-cols-3 lg:grid-cols-4 lg:gap-x-8 lg:gap-y-12'

// Resolves a user id to the design system's CreatorIdentity shape.
// selectUserById DOES work — getUsers.initiate() is dispatched at app
// boot in index.js, same as cocktails/categories (confirmed by reading
// index.js directly, correcting an earlier, overstated claim in
// useFollowBartender.js that this cache "silently resolves to nothing").
// `action` is a render-prop (not a pre-built node) so callers can use the
// resolved name (e.g. for an aria-label) without a second, duplicate
// lookup.
function PersonRow({ userId, action }) {
	const user = useSelector((state) => selectUserById(state, userId))
	if (!user) return null

	const creator = {
		name: user.full_name || user.username,
		bar: undefined,
		location: user.location || undefined,
		avatarUrl: user.avatar || undefined,
	}

	return (
		<li className="flex items-center justify-between gap-4 border-b border-border py-4">
			<CreatorIdentity bartender={creator} variant="full" />
			{action(creator)}
		</li>
	)
}

// currentUser.cocktails entries are {id}-only (UserSerializer's nested
// cocktail serializer only returns the id — confirmed by reading
// Backend/DrinkedIn_BackEnd/app/serializers/user_serializer.rb), so the
// real name/likes_count for the Delete button's aria-label and the
// confirm dialog has to come from the fully-populated cocktailsSlice
// cache (same selectCocktailById CocktailCard itself already uses), not
// from the thin currentUser.cocktails array entry directly.
function CreationRow({ cocktailId, onDelete }) {
	const cocktail = useSelector((state) => selectCocktailById(state, cocktailId))
	if (!cocktail) return null

	return (
		<li className="flex flex-col gap-3">
			<CocktailCard id={cocktailId} />
			<div className="flex flex-wrap gap-2 border-t border-border pt-3">
				<ButtonLink to={`/cocktails/${cocktailId}/edit`} variant="ghost" size="sm">
					<Pencil aria-hidden="true" />
					Edit
				</ButtonLink>
				<Button variant="ghost" size="sm" onClick={onDelete} aria-label={`Delete ${cocktail.name}`}>
					<Trash2 aria-hidden="true" />
					Delete
				</Button>
			</div>
		</li>
	)
}

function PeopleList({ children }) {
	return (
		<ul className="m-0 grid list-none grid-cols-1 border-t border-border p-0 md:grid-cols-2 md:gap-x-10">
			{children}
		</ul>
	)
}

const Profile = () => {
	const currentUser = useSelector(selectCurrentUser)
	const dispatch = useDispatch()

	const [deleteCocktail] = useDeleteCocktailMutation()
	const [deleteFollow] = useDeleteFollowMutation()

	// Liked-tab snapshot (approved behavior, ai/v1-redesign-plan.md PR8,
	// decision #8): captured ONCE at mount from currentUser.likes — never
	// re-read from the live selector on every render. currentUser is
	// guaranteed non-null here (ProtectedRoute, App.jsx's route config,
	// never renders Profile otherwise — verified, not assumed), so this
	// lazy initializer always has real data the one time it runs. Each
	// card's own heart/count still updates live and immediately: that's
	// CocktailCard's own useLikeCocktail(id), completely independent of
	// this snapshot — unliking a cocktail here does NOT remove its card
	// from the list, matching v0's own explicit copy below. Revisiting
	// /profile (a fresh mount) re-derives the snapshot from current data.
	// Persists across tab switches for free: Tabs.jsx keeps all four tab
	// panels mounted (hidden via CSS, not unmounted), and this state lives
	// on Profile itself, one level above Tabs entirely.
	const [likedSnapshot] = useState(() => currentUser?.likes ?? [])

	const cocktailsCreated = useSelector(selectCurrentUsersCocktails)
	const followedUsers = useSelector(selectUsersFollowedByCurrentUser)
	const followers = useSelector(selectCurrentUsersFollowers)

	// Pending destructive action, mirroring v0's own Pending union exactly
	// (profile-view.tsx) — a single shared confirm Overlay for both kinds,
	// per the approved decision to follow v0 exactly (delete-cocktail and
	// remove-follower only; unfollow and unlike are NOT confirm-gated,
	// matching v0's own scope).
	const [confirm, setConfirm] = useState(null)
	const [confirming, setConfirming] = useState(false)
	const [notice, setNotice] = useState('')
	// Per-row pending state for the (non-confirmed) Unfollow action, since
	// deleteFollow's own isLoading is shared across every row using this
	// one mutation hook instance — without this, clicking Unfollow on one
	// row would show every row's FollowButton as pending simultaneously.
	const [pendingFollowId, setPendingFollowId] = useState(null)

	const confirmCocktail = useSelector((state) =>
		confirm?.kind === 'delete' ? selectCocktailById(state, confirm.id) : undefined
	)

	const handleUnfollow = useCallback(
		async (followedId) => {
			setPendingFollowId(followedId)
			try {
				await deleteFollow(followedId).unwrap()
				dispatch(deleteUserFollowed(followedId))
			} catch (requestError) {
				console.error('Failed to unfollow:', requestError)
			} finally {
				setPendingFollowId(null)
			}
		},
		[deleteFollow, dispatch]
	)

	const runConfirm = useCallback(async () => {
		if (!confirm) return
		setConfirming(true)
		try {
			if (confirm.kind === 'delete') {
				const deletedName = confirmCocktail?.name
				await deleteCocktail(confirm.id).unwrap()
				dispatch(deleteUsersCocktail(confirm.id))
				setNotice(`${deletedName} was deleted.`)
			} else {
				await deleteFollow(confirm.id).unwrap()
				dispatch(deleteUsersFollower(confirm.id))
				setNotice(`${confirm.name} was removed from your followers.`)
			}
			setConfirm(null)
		} catch (requestError) {
			// Mutation failed — leave the item in place and the dialog open
			// rather than optimistically removing it or announcing success;
			// no dispatch, no notice. The ErrorState pattern isn't used here
			// (no per-mutation-failure UI exists in v0's own reference
			// either); the dialog simply stays open so the user can retry.
			console.error('Failed to confirm action:', requestError)
		} finally {
			setConfirming(false)
		}
	}, [confirm, confirmCocktail, deleteCocktail, deleteFollow, dispatch])

	const creationsTab = {
		id: 'creations',
		label: 'Creations',
		count: cocktailsCreated.length,
		content:
			cocktailsCreated.length === 0 ? (
				<EmptyState
					icon={<Wine />}
					title="No creations yet"
					description={
						currentUser.bartender
							? 'Recipes you add will be collected here, ready to edit whenever you tweak a spec.'
							: 'Recipes added by bartender accounts are collected here.'
					}
					action={
						currentUser.bartender ? (
							<ButtonLink to="/cocktails" variant="outline">
								Go to cocktails
							</ButtonLink>
						) : undefined
					}
				/>
			) : (
				<ul className={cn(gridClass, 'list-none m-0 p-0')}>
					{cocktailsCreated.map((cocktail) => (
						<CreationRow
							key={cocktail.id}
							cocktailId={cocktail.id}
							onDelete={() => setConfirm({ kind: 'delete', id: cocktail.id })}
						/>
					))}
				</ul>
			),
	}

	const likedTab = {
		id: 'liked',
		label: 'Liked',
		count: likedSnapshot.length,
		content:
			likedSnapshot.length === 0 ? (
				<EmptyState
					icon={<Heart />}
					title="Nothing liked yet"
					description="Tap the heart on any drink and it lands here, so you can find it again next time you’re at the bar."
					action={
						<ButtonLink to="/cocktails" variant="outline">
							Browse cocktails
						</ButtonLink>
					}
				/>
			) : (
				<div className="flex flex-col gap-6">
					<p className="m-0 text-[0.9375rem] text-muted-foreground">
						Unliking keeps a drink here until you leave the page, in case you change your mind.
					</p>
					<ul className={cn(gridClass, 'list-none m-0 p-0')}>
						{likedSnapshot.map((like) => (
							<li key={like.id}>
								<CocktailCard id={like.liked_cocktail_id} />
							</li>
						))}
					</ul>
				</div>
			),
	}

	const followingTab = {
		id: 'following',
		label: 'Following',
		count: followedUsers.length,
		content:
			followedUsers.length === 0 ? (
				<EmptyState
					icon={<UserRound />}
					title="You’re not following anyone yet"
					description="Follow bartenders from any drink they’ve made and you’ll see who you trust in one place."
					action={
						<ButtonLink to="/cocktails" variant="outline">
							Find bartenders
						</ButtonLink>
					}
				/>
			) : (
				<PeopleList>
					{followedUsers.map((followed) => (
						<PersonRow
							key={followed.id}
							userId={followed.followee_id}
							action={(creator) => (
								<FollowButton
									following
									name={creator.name}
									onToggle={() => handleUnfollow(followed.id)}
									pending={pendingFollowId === followed.id}
								/>
							)}
						/>
					))}
				</PeopleList>
			),
	}

	const followersTab = {
		id: 'followers',
		label: 'Followers',
		count: followers.length,
		content:
			followers.length === 0 ? (
				<EmptyState
					icon={<Users />}
					title="No followers yet"
					description="When someone follows you, they’ll show up here."
				/>
			) : (
				<PeopleList>
					{followers.map((follower) => (
						<PersonRow
							key={follower.id}
							userId={follower.follower_id}
							action={(creator) => (
								<Button
									variant="outline"
									size="sm"
									onClick={() => setConfirm({ kind: 'remove', id: follower.id, name: creator.name })}
									aria-label={`Remove ${creator.name} from your followers`}
								>
									Remove
								</Button>
							)}
						/>
					))}
				</PeopleList>
			),
	}

	// v0's own conditional tab order (profile-view.tsx), per the approved
	// decision: bartenders see their creations first, everyone else sees
	// what they've liked first. currentUser (and therefore .bartender) is
	// already resolved by the time this component ever renders — no
	// loading phase to race against, so the initial order Tabs.jsx reads
	// via its own items[0] default is correct on the very first render.
	const tabs = currentUser.bartender
		? [creationsTab, likedTab, followingTab, followersTab]
		: [likedTab, creationsTab, followingTab, followersTab]

	const confirmCopy =
		confirm?.kind === 'delete'
			? {
					title: `Delete ${confirmCocktail?.name}?`,
					description: `This removes the recipe and its ${confirmCocktail?.likes_count ?? 0} likes. This can’t be undone.`,
					keep: 'Keep it',
					action: 'Delete cocktail',
					busy: 'Deleting',
				}
			: confirm?.kind === 'remove'
				? {
						title: `Remove ${confirm.name}?`,
						description: `${confirm.name.split(' ')[0]} won’t be notified, and can follow you again later.`,
						keep: 'Cancel',
						action: 'Remove follower',
						busy: 'Removing',
					}
				: { title: '', description: '', keep: '', action: '', busy: '' }

	return currentUser ? (
		<div className="mx-auto max-w-wide px-5 pb-8 pt-8 text-left md:px-8 lg:px-12 lg:pt-12">
			<ProfileInfo currentUser={currentUser} />

			<Tabs items={tabs} label="Your profile" className="mt-6 lg:mt-8" />

			<p role="status" aria-live="polite" className="sr-only">
				{notice}
			</p>

			<Overlay
				open={confirm !== null}
				onClose={() => !confirming && setConfirm(null)}
				title={confirmCopy.title}
				description={confirmCopy.description}
			>
				<div className="mt-2 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
					{/* data-autofocus, not autoFocus: see Overlay.jsx's own comment —
					    React's autoFocus silently fails here since the dialog isn't
					    open yet when it fires; this is Overlay's real, working
					    mechanism for defaulting focus to the safe action instead of
					    the destructive one, confirmed live. */}
					<Button
						variant="outline"
						onClick={() => setConfirm(null)}
						disabled={confirming}
						data-autofocus=""
					>
						{confirmCopy.keep}
					</Button>
					<Button variant="accent" onClick={runConfirm} loading={confirming} loadingLabel={confirmCopy.busy}>
						{confirmCopy.action}
					</Button>
				</div>
			</Overlay>
		</div>
	) : (
		<Error>No user found</Error>
	)
}

export default React.memo(Profile)
