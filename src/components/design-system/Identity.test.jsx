import { render, screen } from '@testing-library/react'
import { PersonIdentity } from './Identity'

// Covers the 2026-11-16 CreatorIdentity -> PersonIdentity refactor
// (ai/v1-redesign-plan.md's creator/submitter attribution workstream,
// F1): the `role` prop must select the right byline prefix, and —
// critically — omitting `role` must still fall back to the original
// generic "by", unchanged, since no call site has real creator/submitter
// data to pass yet.
const person = { name: 'Jamie Pham', bar: undefined, location: undefined, avatarUrl: undefined }

// The byline prefix is a raw text node followed by a sibling <span> for
// the name, so the rendered text is split across nodes — a plain string
// matcher can't find it (confirmed: RTL's own error message for this
// exact shape recommends a function matcher). Matches on the normalized
// text of the smallest element that contains the whole byline phrase.
const byline = (expected) => (_, el) => el?.textContent?.replace(/\s+/g, ' ').trim() === expected

describe('PersonIdentity', () => {
	it('falls back to the generic "by" prefix when role is omitted', () => {
		render(<PersonIdentity person={person} />)
		expect(screen.getByText(byline('by Jamie Pham'))).toBeInTheDocument()
		expect(screen.queryByText(byline('Created by Jamie Pham'))).not.toBeInTheDocument()
		expect(screen.queryByText(byline('Added by Jamie Pham'))).not.toBeInTheDocument()
	})

	it('uses "Created by" for role="creator"', () => {
		render(<PersonIdentity person={person} role="creator" />)
		expect(screen.getByText(byline('Created by Jamie Pham'))).toBeInTheDocument()
	})

	it('uses "Added by" for role="submitter"', () => {
		render(<PersonIdentity person={person} role="submitter" />)
		expect(screen.getByText(byline('Added by Jamie Pham'))).toBeInTheDocument()
	})

	it('variant="full" renders the name with no byline prefix at all', () => {
		render(<PersonIdentity person={person} variant="full" />)
		expect(screen.getByText('Jamie Pham')).toBeInTheDocument()
		expect(screen.queryByText(byline('by Jamie Pham'))).not.toBeInTheDocument()
	})
})
