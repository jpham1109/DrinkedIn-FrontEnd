// The backend's error envelope is { errors: [{ code, message, field? }] }
// (app/controllers/concerns/api_responses.rb, documented in
// ai/api-contract.md) — NOT a bare { error: '...' } field. Login.jsx and
// Signup.jsx were reading requestError.data.error (singular, undefined on
// every real response), so a genuine server error — csrf_invalid,
// authentication_required, validation_failed — was silently swallowed:
// requestError.data.error is undefined, so the `<Error>` block's
// `{loginError ? ... : null}` check never rendered anything.
export function extractApiErrors(requestError) {
	const errors = requestError?.data?.errors
	return Array.isArray(errors) && errors.length > 0 ? errors : null
}

// Single human-readable string for call sites that only show one generic
// message (e.g. Login). Falls back to RTK Query's own transport-level
// error string (e.g. 'FETCH_ERROR' on a network failure, present at
// requestError.error, not requestError.data) and finally a generic
// message, so an unexpected response shape still shows *something*.
export function extractErrorMessage(requestError) {
	const errors = extractApiErrors(requestError)
	if (errors) return errors.map((e) => e.message).join(' ')
	return requestError?.error || 'Something went wrong. Please try again.'
}
