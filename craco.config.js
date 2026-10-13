// Injects Tailwind's PostCSS plugin into CRA's existing webpack/PostCSS
// pipeline without ejecting. This is the only reason CRACO exists in this
// project — everything else about the CRA build (babel, jest, dev server)
// is untouched. ai/v1-redesign-plan.md PR1.
module.exports = {
  style: {
    postcss: {
      plugins: [require('@tailwindcss/postcss')],
    },
  },
}
