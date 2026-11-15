import React from 'react'
import { Button } from '../design-system/Button'
import { ErrorState } from '../design-system/States'

// Error boundaries must be class components — React has no hook
// equivalent of componentDidCatch/getDerivedStateFromError.
//
// Scope: everything RTK Query already handles (loading/error/empty data
// states on individual screens) is a different failure class from this —
// an uncaught render-time exception anywhere in the routed tree, which
// without a boundary unmounts the whole React tree and leaves a blank
// white page with no recovery path. A page reload (not a retry/refetch)
// is the correct recovery here, since the error is in rendering itself,
// not in a request that can be retried.
//
// Wraps <Routes> only (see App.jsx), not the whole app — NavBar/Footer
// stay mounted and functional on a route crash, so the user can navigate
// away instead of being stuck.
export class RouteErrorBoundary extends React.Component {
	constructor(props) {
		super(props)
		this.state = { hasError: false }
	}

	static getDerivedStateFromError() {
		return { hasError: true }
	}

	componentDidCatch(error, info) {
		console.error('Unhandled render error:', error, info)
	}

	render() {
		if (this.state.hasError) {
			return (
				<div className="mx-auto max-w-wide px-5 py-16 text-left md:px-8 lg:px-12">
					<ErrorState
						title="Something went wrong"
						description="This page hit an unexpected error. Reloading usually fixes it."
						action={
							<div>
								<Button variant="outline" size="sm" onClick={() => window.location.reload()}>
									Reload page
								</Button>
							</div>
						}
					/>
				</div>
			)
		}

		return this.props.children
	}
}
