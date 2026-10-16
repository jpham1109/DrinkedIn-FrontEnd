import * as React from 'react'
import { useSelector } from 'react-redux'
import { selectCurrentUser, useGetUserQuery } from '../../features/auth/authSlice'
import { ButtonLink } from './Button'
import { Overlay } from './Overlay'

// Ported from Design/drinkedin-v0/components/drinkedin/auth-gate.tsx, stripped
// of TypeScript. ai/v1-redesign-plan.md PR3.
//
// v0's version took `status` as a prop supplied by a prototype-only page
// wrapper. The real app has no such wrapper, so this derives status itself
// from the same tri-state check already proven in ProtectedRoute.jsx and
// NavBar.jsx (`isUninitialized || isLoading` -> 'checking'), reading the
// same useGetUserQuery() cache entry App.jsx's bootstrap effect already
// subscribes to — this adds no new request. Deliberately NOT extracted into
// a shared hook alongside ProtectedRoute/NavBar's copies of this same check:
// out of scope for this PR (no unnecessary refactoring of auth
// infrastructure already working and tested).
const AuthGateContext = React.createContext(null)

export function useAuthGate() {
	const ctx = React.useContext(AuthGateContext)
	if (!ctx) throw new Error('useAuthGate must be used inside <AuthGateProvider>')
	return ctx
}

const copy = {
	like: (subject) => ({
		title: subject ? `Save ${subject} for later` : 'Save this for later',
		description:
			'Log in or create a free account to like drinks and build a list of what you want to try next.',
	}),
	follow: (subject) => ({
		title: subject ? `Follow ${subject}` : 'Follow this bartender',
		description:
			'Log in or create a free account to follow bartenders and see their new creations first.',
	}),
}

export function AuthGateProvider({ children }) {
	const currentUser = useSelector(selectCurrentUser)
	const { isLoading, isUninitialized } = useGetUserQuery()
	const status = isUninitialized || isLoading ? 'checking' : currentUser ? 'loggedIn' : 'loggedOut'

	const [intent, setIntent] = React.useState(null)

	// Intentionally no branch runs `action` during 'checking' — requireAuth
	// is a silent no-op then, so a click mid-check can neither flash an
	// authenticated action through nor wrongly show the logged-out prompt.
	const requireAuth = React.useCallback(
		(nextIntent, action) => {
			if (status === 'loggedIn') action()
			else if (status === 'loggedOut') setIntent(nextIntent)
		},
		[status]
	)

	const text = intent ? copy[intent.kind](intent.subject) : copy.like('')

	return (
		<AuthGateContext.Provider value={{ status, requireAuth }}>
			{children}
			<Overlay
				open={intent !== null}
				onClose={() => setIntent(null)}
				title={text.title}
				description={text.description}
			>
				<div className="flex flex-col gap-3">
					<ButtonLink to="/signup" size="lg" className="w-full">
						Create a free account
					</ButtonLink>
					<ButtonLink to="/login" size="lg" variant="outline" className="w-full">
						Log in
					</ButtonLink>
				</div>
				<p className="text-center text-sm text-muted-foreground">
					No account needed to browse. Look around as long as you like.
				</p>
			</Overlay>
		</AuthGateContext.Provider>
	)
}
