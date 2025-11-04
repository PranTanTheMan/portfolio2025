# Repository Guidelines

## Project Structure & Module Organization
This Next.js App Router project keeps page-level components and API handlers under `src/app` (for example, `src/app/sign` for the sign-in flow and `src/app/api` for server actions). Reusable UI lives in `src/components`, split into `ui` building blocks and `magicui` motion/animation helpers. Utility logic belongs in `src/lib`. Static assets, fonts, and icons should be added to `public`. Use the `@/` path alias (defined in `tsconfig.json`) instead of relative `../../` imports.

## Build, Test, and Development Commands
Run `npm run dev` to start the local dev server with Turbopack at `http://localhost:3000`. Use `npm run build` for a production build and confirm it before deployment. `npm run start` serves the optimized build locally. Always execute `npm run lint` so Next.js/ESLint can surface TypeScript, accessibility, and Tailwind issues early.

## Coding Style & Naming Conventions
Follow the existing 2-space indentation and TypeScript strict mode. Author React components as functions in PascalCase (`NavBar`), hooks and helpers in camelCase (`useLoadingState`). Keep files small and colocated with the feature that owns them. When composing Tailwind classes, mirror the existing order: layout ➝ spacing ➝ typography ➝ color. Prefer `Link` from `next/link` and shared wrappers in `src/components` over raw HTML anchors.

## Testing Guidelines
A formal automated test suite has not been set up yet, so linting plus manual verification is required. Before opening a PR, exercise key user journeys (landing page, drawing board, authentication) in multiple viewports while the dev server runs. If you introduce a testing framework, colocate `.test.tsx` files beside the component they cover and document any new commands in `package.json`.

## Commit & Pull Request Guidelines
Commits in this repo use sentence-style, descriptive subjects (for example, “Update Discord status display and modify link targets in navigation”). Write focused commits that explain the motivation, not just the code. Pull requests should:
- Explain the change and impacted routes/components.
- Link to any tracking issue or design reference.
- Include screenshots or clips when UI shifts.
- Note manual test steps and lint/build status.

## Environment & Configuration
Secrets and API keys belong in `.env.local`, which is git-ignored—never commit credentials. Keep configuration changes documented in the PR description so deploy previews can be double-checked. When adding third-party services, describe required environment variables and update onboarding docs accordingly.
