import { ButtonLink } from '../../components/design-system/Button'
import { useAuthGate } from '../../components/design-system/AuthGate'

// Ported from Design/drinked-in-ui-redesign/components/home/join-and-footer.tsx's
// JoinCta (ai/v1-redesign-plan.md PR9). v0 renders unless status is
// exactly 'loggedIn'; the real app has a third status ('checking',
// still waiting on useGetUserQuery — see AuthGate.jsx) that v0's own
// prototype-only preview switch never has to account for. Checking
// status === 'loggedOut' explicitly (not `!== 'loggedIn'`) so this
// section stays hidden, not briefly flashing then disappearing, while
// auth is still being determined on first load.
export function JoinCta() {
	const { status } = useAuthGate()
	if (status !== 'loggedOut') return null

	return (
		<section aria-labelledby="join-title" className="mx-auto max-w-wide px-5 text-left md:px-8 lg:px-12">
			<div className="flex flex-col gap-8 border-y border-border-strong py-14 md:flex-row md:items-center md:justify-between lg:py-20">
				<div className="flex max-w-xl flex-col gap-3">
					<h2 id="join-title" className="type-h2 m-0 text-balance">
						Keep a list of what to drink next.
					</h2>
					<p className="m-0 text-pretty leading-relaxed text-muted-foreground">
						A free account lets you like cocktails, follow bartenders, and pick up where you left off.
					</p>
				</div>
				<div className="flex flex-wrap items-center gap-3">
					<ButtonLink to="/signup" size="lg">
						Create a free account
					</ButtonLink>
					<ButtonLink to="/login" size="lg" variant="outline">
						Log in
					</ButtonLink>
				</div>
			</div>
		</section>
	)
}
