import { personFromBartender } from './personFromBartender'

describe('personFromBartender', () => {
	it('prefers full_name over username', () => {
		expect(personFromBartender({ full_name: 'Jamie Pham', username: 'jpham' })).toEqual({
			name: 'Jamie Pham',
			bar: undefined,
			location: undefined,
			avatarUrl: undefined,
		})
	})

	it('falls back to username when full_name is absent', () => {
		expect(personFromBartender({ full_name: null, username: 'jpham' }).name).toBe('jpham')
	})

	it('returns a falsy value for a null/undefined bartender rather than throwing', () => {
		expect(personFromBartender(null)).toBeFalsy()
		expect(personFromBartender(undefined)).toBeFalsy()
	})
})
