# Contract Farming Frontend

Vite + React + TypeScript starter with TanStack Query/Router, Zustand, Tailwind v4, and Shadcn UI.

## Scripts

| Script | Description |
| --- | --- |
| `pnpm dev` | Start the Vite dev server |
| `pnpm build` | Typecheck and production build |
| `pnpm preview` | Preview the production build |
| `pnpm lint` | Lint and format-check with Biome |
| `pnpm format` | Format with Biome |
| `pnpm test` | Run Vitest |

## Stack

- React 19 + Vite 8
- TanStack Router, Query, Form
- Zustand (auth store scaffold)
- Tailwind CSS v4 + Shadcn UI
- Axios API client
- Biome (lint + format)

## Getting started

```bash
cp .env.example .env
pnpm install
pnpm dev
```

Login UI is present but uses a placeholder submit handler until the new backend auth endpoint is wired.
