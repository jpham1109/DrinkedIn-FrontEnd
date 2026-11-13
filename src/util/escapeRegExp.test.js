import { escapeRegExp } from './escapeRegExp'

// Replaces the stale CRA-default src/App.test.js (asserted "learn react
// link" text that hasn't existed since before the V1 redesign, and its
// `import App from './App'` pointed at a path App.jsx no longer lives
// at — it was failing to even resolve, not just failing its assertion).
//
// A real App-level render smoke test needs a Redux Provider, a Router,
// and mocked network responses (App.jsx dispatches real queries on
// mount: refreshCsrfToken, useGetUserQuery) — none of that test
// infrastructure (MSW or equivalent, a shared test-utils wrapper) exists
// in this project yet. That's a genuine separate piece of work, not
// something to improvise correctly here — this file instead covers the
// one existing dependency-free, correctness-sensitive utility, so
// `npm test` is green and testing something real rather than either
// failing or passing on dead code.
describe('escapeRegExp', () => {
	it('escapes regex metacharacters so they match literally', () => {
		expect(escapeRegExp('old fashioned (classic)')).toBe('old fashioned \\(classic\\)')
	})

	it('leaves plain text unchanged', () => {
		expect(escapeRegExp('margarita')).toBe('margarita')
	})

	it('escapes a dot so it does not match "any character"', () => {
		const escaped = escapeRegExp('o.d fashioned')
		expect(new RegExp(escaped, 'i').test('oxd fashioned')).toBe(false)
		expect(new RegExp(escaped, 'i').test('o.d fashioned')).toBe(true)
	})

	it('does not throw on an unbalanced paren', () => {
		expect(() => new RegExp(escapeRegExp('('), 'i')).not.toThrow()
	})
})
