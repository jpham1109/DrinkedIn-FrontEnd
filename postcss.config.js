// Real postcss.config.js, loaded via craco.config.js's `mode: 'file'`.
//
// Not CRACO's inline `style.postcss.plugins` option: that path only
// engages when `plugins` is a plain array (CRACO's extendsPostcss gates
// its whole plugin-merge body on `isArray(plugins) || env` — confirmed by
// reading node_modules/@craco/craco's source, not assumed), and even the
// array form only APPENDS after CRA's own postcss-preset-env/
// postcss-normalize/postcss-flexbugs-fixes, which must run AFTER
// Tailwind expands its `@theme`/`@utility`/`@source`/`@import` at-rules,
// not before. A real config file is the documented, unambiguous way to
// get Tailwind first. Confirmed via a real browser smoke test
// (ai/v1-redesign-plan.md PR2) that CRA's bundled preset-env/normalize
// are not needed for anything this app's existing CSS actually uses —
// autoprefixer alone covers vendor prefixing.
module.exports = {
	plugins: {
		'@tailwindcss/postcss': {},
		autoprefixer: {},
	},
}
