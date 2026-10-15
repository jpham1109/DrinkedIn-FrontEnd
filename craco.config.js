// Injects Tailwind's PostCSS plugin into CRA's existing webpack build
// without ejecting. This is the only reason CRACO exists in this project
// — everything else about the CRA build (babel, jest, dev server) is
// untouched. ai/v1-redesign-plan.md PR1/PR2.
//
// `mode: 'file'` tells CRACO to stop managing postcss-loader's inline
// plugin array itself and instead let postcss-loader resolve a real
// postcss.config.js (see that file for why: CRACO's own inline
// `style.postcss.plugins` option can't put Tailwind first, which it must
// run — confirmed via a real browser smoke test, not assumed, after two
// other approaches silently produced zero generated Tailwind utility
// classes).
module.exports = {
  style: {
    postcss: {
      mode: 'file',
    },
  },
}
