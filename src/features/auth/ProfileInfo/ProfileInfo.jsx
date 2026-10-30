import { useState } from 'react'
import { Button } from '../../../components/design-system/Button'
import { Avatar, Tag } from '../../../components/design-system/Identity'
import { Overlay } from '../../../components/design-system/Overlay'
import UpdateProfile from '../UpdateProfile/UpdateProfile'

// Ported from Design/drinkedin-v0/components/profile/profile-view.tsx's
// header block (ai/v1-redesign-plan.md PR8) — v0 itself has no "Update
// profile" affordance (its prototype doesn't model account editing), so
// that button and its Overlay are a real addition, not a port; placed
// quietly below the description line rather than as a prominent CTA, same
// spirit as the category info block added to CocktailDetail in PR7.
// biography is deliberately not read from currentUser — UserSerializer
// (Backend/DrinkedIn_BackEnd/app/serializers/user_serializer.rb) has no
// such attribute, so it was always undefined; the original's
// `{biography && ...}` branch never rendered anything in production.
const ProfileInfo = ({ currentUser }) => {
	const { full_name, username, location, bartender, avatar } = currentUser
	const [editingOpen, setEditingOpen] = useState(false)
	const firstName = full_name?.split(' ')[0]

	return (
		<header className="flex flex-col gap-6 border-b border-foreground pb-8 sm:flex-row sm:items-end sm:gap-8 lg:pb-10">
			<Avatar name={full_name || username} src={avatar} size="xl" />
			<div className="flex min-w-0 flex-col gap-3">
				<div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-sm text-muted-foreground">
					<span>@{username}</span>
					{bartender && <Tag>Bartender</Tag>}
					{location && <span>{location}</span>}
				</div>
				<h1 className="type-h1 m-0 text-balance">{full_name}</h1>
				<p className="m-0 max-w-prose text-pretty leading-relaxed text-muted-foreground">
					{bartender
						? `Your recipes, the drinks you’ve saved and the people you follow, ${firstName}.`
						: `The drinks you’ve saved and the people you follow, ${firstName}. Your shortlist for next time.`}
				</p>
				<div>
					<Button variant="outline" size="sm" onClick={() => setEditingOpen(true)}>
						Update profile
					</Button>
				</div>
			</div>

			<Overlay
				open={editingOpen}
				onClose={() => setEditingOpen(false)}
				title="Update your profile"
				variant="drawer"
			>
				<UpdateProfile currentUser={currentUser} onDone={() => setEditingOpen(false)} />
			</Overlay>
		</header>
	)
}

export default ProfileInfo
