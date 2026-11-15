## Local setup (Node version)

This project requires **Node >= 20** (see `package.json`'s `engines`
field) — Tailwind v4's native CSS engine (`@tailwindcss/oxide`) only
ships a platform-specific binding for Node 20+; under an older Node,
`npm install` silently skips it instead of erroring, and the dev
server/build fails later with a confusing "Cannot find native binding"
error that looks unrelated to the Node version.

Pinned exact version: **22.23.5** (`.nvmrc`). Using
[nvm](https://github.com/nvm-sh/nvm):

```sh
nvm install   # first time only — installs the version in .nvmrc
nvm use       # reads .nvmrc automatically; run this every time you cd in
npm ci        # installs exactly what's in package-lock.json
npm start
```

If you ever delete `node_modules` and reinstall, make sure `nvm use` has
selected 22.23.5 *first* — installing under an unsupported Node version
(e.g. an older system-wide/Homebrew `node` on `PATH` ahead of nvm) will
silently produce a broken `node_modules` that only fails later, not at
install time.

On Apple Silicon, confirm the installed version is the native arm64
build, not an x86_64 build running under Rosetta (this can happen if
`nvm install` is run from a shell binary that isn't itself a native
arm64/universal binary):

```sh
node -p "process.arch"   # should print "arm64"
file "$(which node)"     # should mention arm64, not only x86_64
```

## Deployment

See `ai/deployment-plan.md` (repo root's sibling `Phase5-DrinkedIn/ai/`
directory) for the Render architecture, required environment variables
(`REACT_APP_BACKEND_URL` is build-time only, see `.env.example`), deploy
order, and smoke-test procedure. `render.yaml` and `public/_redirects`
in this repo are the reproducible parts of that plan. Render's own
Node-version selection is governed by `render.yaml`'s `NODE_VERSION` env
var (highest precedence there), kept in sync with `.nvmrc` (used for
local nvm-based development).

---

# Getting Started with Create React App

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Available Scripts

In the project directory, you can run:

### `yarn start`

Runs the app in the development mode.\
Open [http://localhost:7000](http://localhost:7000) to view it in the browser.

The page will reload if you make edits.\
You will also see any lint errors in the console.

### `yarn test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `yarn build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `yarn eject`

**Note: this is a one-way operation. Once you `eject`, you can’t go back!**

If you aren’t satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you’re on your own.

You don’t have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn’t feel obligated to use this feature. However we understand that this tool wouldn’t be useful if you couldn’t customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).

### Code Splitting

This section has moved here: [https://facebook.github.io/create-react-app/docs/code-splitting](https://facebook.github.io/create-react-app/docs/code-splitting)

### Analyzing the Bundle Size

This section has moved here: [https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size](https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size)

### Making a Progressive Web App

This section has moved here: [https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app](https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app)

### Advanced Configuration

This section has moved here: [https://facebook.github.io/create-react-app/docs/advanced-configuration](https://facebook.github.io/create-react-app/docs/advanced-configuration)

### Deployment

This section has moved here: [https://facebook.github.io/create-react-app/docs/deployment](https://facebook.github.io/create-react-app/docs/deployment)

### `yarn build` fails to minify

This section has moved here: [https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify](https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify)
