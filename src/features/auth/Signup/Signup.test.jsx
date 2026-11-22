import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Provider } from 'react-redux'
import { MemoryRouter } from 'react-router-dom'
import { configureStore } from '@reduxjs/toolkit'
import { apiSlice } from '../../api/apiSlice'
import authReducer from '../authSlice'
import csrfReducer from '../../csrf/csrfSlice'
import Signup from './Signup'

// Kinpour email signup completion — the first test file for this
// component (none existed for Signup.jsx or Login.jsx before this).
// Scope: the email field being added here, plus a real regression suite
// for the rest of the form's existing behavior, per the approved plan.
// @testing-library/user-event is pinned to v12 here (package.json) —
// the v13+ `userEvent.setup()` API doesn't exist; v12's functions are
// called directly instead.

const mockNavigate = jest.fn()
jest.mock('react-router-dom', () => ({
	...jest.requireActual('react-router-dom'),
	useNavigate: () => mockNavigate,
}))

// A fresh store per test — real reducers/middleware shaped like
// src/app/store.js, but deliberately *without* redux-persist: no
// localStorage, no shared state between tests.
function createTestStore() {
	return configureStore({
		reducer: {
			auth: authReducer,
			csrf: csrfReducer,
			[apiSlice.reducerPath]: apiSlice.reducer,
		},
		middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(apiSlice.middleware),
	})
}

function renderSignup() {
	const store = createTestStore()
	const view = render(
		<Provider store={store}>
			<MemoryRouter>
				<Signup />
			</MemoryRouter>
		</Provider>
	)
	return { store, ...view }
}

// Duck-typed Response — doesn't depend on jsdom's fetch polyfill status,
// only on what fetchBaseQuery actually reads off the object (ok, status,
// headers.get, json()/text()).
function jsonResponse(status, body) {
	const response = {
		ok: status >= 200 && status < 300,
		status,
		headers: { get: (name) => (name.toLowerCase() === 'content-type' ? 'application/json' : null) },
		json: async () => body,
		text: async () => JSON.stringify(body),
	}
	// fetchBaseQuery calls response.clone() internally — a fresh,
	// equivalent object is fine here since nothing about this mock is
	// single-read/exhaustible the way a real Response body stream is.
	response.clone = () => jsonResponse(status, body)
	return response
}

// routes: { '/csrf_token': [queue...], '/signup': [queue...] }. Each
// queue entry is either { reject: error } or { status, body }. Calls
// beyond a queue's length repeat its last entry. Every call (url + body)
// is recorded in order, across all routes, for ordering assertions.
function mockFetch(routes) {
	const cursors = {}
	const calls = []
	// fetchBaseQuery calls fetch with a single real Request object, not a
	// (url, init) pair — confirmed by logging the actual arguments
	// received, not assumed. request.url is the resolved absolute URL;
	// the body has to be read asynchronously off a clone (the original
	// request's body stream is consumed by whoever reads it first).
	global.fetch = jest.fn(async (request) => {
		const url = request.url
		const bodyText = await request.clone().text()
		const parsedBody = bodyText ? JSON.parse(bodyText) : undefined
		calls.push({ url, body: parsedBody })

		const key = Object.keys(routes).find((k) => url.includes(k))
		const queue = routes[key] ?? []
		const index = cursors[key] ?? 0
		cursors[key] = index + 1
		const entry = queue[Math.min(index, queue.length - 1)]

		if (!entry) return jsonResponse(200, { data: {} })
		if (entry.reject) throw entry.reject
		return jsonResponse(entry.status, entry.body)
	})
	global.fetch.calls = calls
	return global.fetch
}

const csrfOk = (token = 'csrf-token') => ({ status: 200, body: { data: { csrf_token: token } } })
const validUser = { id: 1, username: 'jamie', full_name: 'Jamie Pham', email: 'jamie@example.com' }
const signupOk = (user = validUser) => ({ status: 201, body: { data: { user } } })

async function fillValidForm() {
	await userEvent.type(screen.getByLabelText(/full name/i), 'Jamie Pham')
	await userEvent.type(screen.getByLabelText(/username/i), 'jamie')
	await userEvent.type(screen.getByLabelText(/^email$/i), 'jamie@example.com')
	await userEvent.type(screen.getByLabelText(/^password$/i), 'password123')
	await userEvent.type(screen.getByLabelText(/confirm password/i), 'password123')
}

function submit() {
	return userEvent.click(screen.getByRole('button', { name: /create account/i }))
}

beforeEach(() => {
	mockNavigate.mockClear()
})

describe('Signup', () => {
	it('renders every expected field, including email', () => {
		mockFetch({})
		renderSignup()
		expect(screen.getByLabelText(/full name/i)).toBeInTheDocument()
		expect(screen.getByLabelText(/username/i)).toBeInTheDocument()
		expect(screen.getByLabelText(/^email$/i)).toBeInTheDocument()
		expect(screen.getByLabelText(/^password$/i)).toBeInTheDocument()
		expect(screen.getByLabelText(/confirm password/i)).toBeInTheDocument()
		expect(screen.getByLabelText(/bartender/i)).toBeInTheDocument()
	})

	it('blocks submission and shows a message when email is missing', async () => {
		const fetchMock = mockFetch({ '/csrf_token': [csrfOk()] })
		renderSignup()

		await userEvent.type(screen.getByLabelText(/username/i), 'jamie')
		await userEvent.type(screen.getByLabelText(/^password$/i), 'password123')
		await userEvent.type(screen.getByLabelText(/confirm password/i), 'password123')
		await submit()

		expect(await screen.findByText(/please enter an email address/i)).toBeInTheDocument()
		expect(fetchMock.calls.some((c) => c.url.includes('/signup'))).toBe(false)
	})

	it('shows a client-side validation message for a malformed email', async () => {
		mockFetch({})
		renderSignup()

		await userEvent.type(screen.getByLabelText(/^email$/i), 'not-an-email')
		await submit()

		expect(await screen.findByText(/please enter a valid email address/i)).toBeInTheDocument()
	})

	it('blocks submission when username or password is missing', async () => {
		const fetchMock = mockFetch({})
		renderSignup()

		await userEvent.type(screen.getByLabelText(/^email$/i), 'jamie@example.com')
		await submit()

		expect(await screen.findByText(/please enter a username/i)).toBeInTheDocument()
		expect(screen.getByText(/please enter a password/i)).toBeInTheDocument()
		expect(fetchMock.calls.some((c) => c.url.includes('/signup'))).toBe(false)
	})

	it('blocks submission when the password confirmation does not match', async () => {
		const fetchMock = mockFetch({})
		renderSignup()

		await fillValidForm()
		await userEvent.clear(screen.getByLabelText(/confirm password/i))
		await userEvent.type(screen.getByLabelText(/confirm password/i), 'somethingelse')
		await submit()

		expect(await screen.findByText(/passwords don.t match/i)).toBeInTheDocument()
		expect(fetchMock.calls.some((c) => c.url.includes('/signup'))).toBe(false)
	})

	it('sends email along with the other fields in a valid submission', async () => {
		const fetchMock = mockFetch({
			'/csrf_token': [csrfOk(), csrfOk()],
			'/signup': [signupOk()],
		})
		renderSignup()

		await fillValidForm()
		await submit()

		await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith('/cocktails'))
		const signupCall = fetchMock.calls.find((c) => c.url.includes('/signup'))
		expect(signupCall.body).toMatchObject({
			full_name: 'Jamie Pham',
			username: 'jamie',
			email: 'jamie@example.com',
			password: 'password123',
		})
	})

	it("submits the bartender checkbox's checked state correctly", async () => {
		const fetchMock = mockFetch({
			'/csrf_token': [csrfOk(), csrfOk()],
			'/signup': [signupOk()],
		})
		renderSignup()

		await fillValidForm()
		await userEvent.click(screen.getByLabelText(/bartender/i))
		await submit()

		await waitFor(() => expect(mockNavigate).toHaveBeenCalled())
		const signupCall = fetchMock.calls.find((c) => c.url.includes('/signup'))
		expect(signupCall.body.bartender).toBe(true)
	})

	it('renders a duplicate-username error beneath the username field', async () => {
		mockFetch({
			'/csrf_token': [csrfOk()],
			'/signup': [
				{
					status: 422,
					body: { errors: [{ code: 'validation_failed', field: 'username', message: 'Username has already been taken' }] },
				},
			],
		})
		renderSignup()

		await fillValidForm()
		await submit()

		expect(await screen.findByText(/username has already been taken/i)).toBeInTheDocument()
		expect(mockNavigate).not.toHaveBeenCalled()
	})

	it('renders an email validation error beneath the email field', async () => {
		mockFetch({
			'/csrf_token': [csrfOk()],
			'/signup': [
				{ status: 422, body: { errors: [{ code: 'validation_failed', field: 'email', message: 'Email is invalid' }] } },
			],
		})
		renderSignup()

		await fillValidForm()
		await submit()

		expect(await screen.findByText(/email is invalid/i)).toBeInTheDocument()
		expect(mockNavigate).not.toHaveBeenCalled()
	})

	it('updates auth state and navigates to /cocktails on a successful signup', async () => {
		mockFetch({
			'/csrf_token': [csrfOk(), csrfOk()],
			'/signup': [signupOk()],
		})
		const { store } = renderSignup()

		await fillValidForm()
		await submit()

		await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith('/cocktails'))
		expect(store.getState().auth.user).toEqual(validUser)
	})

	it('refreshes the CSRF token before submission and again after success, in order', async () => {
		const fetchMock = mockFetch({
			'/csrf_token': [csrfOk('pre-signup-token'), csrfOk('post-signup-token')],
			'/signup': [signupOk()],
		})
		renderSignup()

		await fillValidForm()
		await submit()

		await waitFor(() => expect(mockNavigate).toHaveBeenCalled())
		const relevantCalls = fetchMock.calls
			.map((c) => (c.url.includes('/csrf_token') ? 'csrf' : c.url.includes('/signup') ? 'signup' : null))
			.filter(Boolean)
		expect(relevantCalls).toEqual(['csrf', 'signup', 'csrf'])
	})

	it('does not authenticate or navigate when signup fails', async () => {
		mockFetch({
			'/csrf_token': [csrfOk()],
			'/signup': [
				{
					status: 422,
					body: { errors: [{ code: 'validation_failed', field: 'username', message: 'Username has already been taken' }] },
				},
			],
		})
		const { store } = renderSignup()

		await fillValidForm()
		await submit()

		await screen.findByText(/username has already been taken/i)
		expect(mockNavigate).not.toHaveBeenCalled()
		expect(store.getState().auth.user).toBeNull()
	})

	it('shows understandable, non-raw feedback when the pre-submit CSRF refresh fails', async () => {
		mockFetch({ '/csrf_token': [{ reject: new TypeError('Failed to fetch') }] })
		renderSignup()

		await fillValidForm()
		await submit()

		expect(await screen.findByText(/something went wrong/i)).toBeInTheDocument()
		expect(screen.queryByText(/typeerror/i)).not.toBeInTheDocument()
		expect(mockNavigate).not.toHaveBeenCalled()
	})

	it('toggles both password fields between masked and visible text', async () => {
		mockFetch({})
		renderSignup()

		expect(screen.getByLabelText(/^password$/i)).toHaveAttribute('type', 'password')
		expect(screen.getByLabelText(/confirm password/i)).toHaveAttribute('type', 'password')

		await userEvent.click(screen.getByLabelText(/show password/i))

		expect(screen.getByLabelText(/^password$/i)).toHaveAttribute('type', 'text')
		expect(screen.getByLabelText(/confirm password/i)).toHaveAttribute('type', 'text')
	})

	describe('a post-success CSRF refresh failure never undoes a successful signup', () => {
		it('recovers on an immediate retry — navigates, keeps the user authenticated, ends up with the fresh token', async () => {
			mockFetch({
				'/csrf_token': [
					csrfOk('pre-signup-token'),
					{ reject: new TypeError('Failed to fetch') },
					csrfOk('retried-token'),
				],
				'/signup': [signupOk()],
			})
			const { store } = renderSignup()

			await fillValidForm()
			await submit()

			await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith('/cocktails'))
			expect(store.getState().auth.user).toEqual(validUser)
			expect(screen.queryByText(/couldn.t create your account/i)).not.toBeInTheDocument()
			expect(store.getState().csrf.token).toBe('retried-token')
		})

		it('still navigates and keeps the account created even when both post-success attempts fail — clears the stale token', async () => {
			mockFetch({
				'/csrf_token': [
					csrfOk('pre-signup-token'),
					{ reject: new TypeError('Failed to fetch') },
					{ reject: new TypeError('Failed to fetch') },
				],
				'/signup': [signupOk()],
			})
			const { store } = renderSignup()

			await fillValidForm()
			await submit()

			await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith('/cocktails'))
			expect(store.getState().auth.user).toEqual(validUser)
			expect(screen.queryByText(/couldn.t create your account/i)).not.toBeInTheDocument()
			expect(store.getState().csrf.token).toBeNull()
		})
	})
})
