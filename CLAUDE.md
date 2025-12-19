# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Quick Commands

```bash
# Development
npm run dev              # Start dev server (http://localhost:3000)
npm run dev:turbo        # Start with Turbopack (faster)

# Quality checks
npm run validate         # Type-check + lint + format check (run before commits)
npm run lint             # ESLint only
npm run format           # Prettier format all files

# Testing
npm run test             # Unit tests (Vitest, watch mode)
npm run test:ui          # Vitest with interactive UI
npm run test:e2e         # Playwright E2E tests
npm run test:e2e:ui      # Playwright with interactive UI

# Build
npm run build            # Production build

# Database (Supabase Cloud only - never use local Docker)
npm run db:clone:win     # Clone schema + test data (Windows)
npx supabase gen types typescript --project-id "<project-ref>" --schema public --schema content > src/types/database.types.ts
```

## Architecture Overview

### Two-Layer API Architecture

```
Server Component → Server Action → Supabase
                        ↑
Client Component → API Route → Server Action → Supabase
```

- **Server Actions** (`src/lib/actions/*.ts`): Business logic, validation, database operations. Return `ActionResult<T>` discriminated union.
- **API Route Handlers** (`app/api/**/route.ts`): Thin HTTP layer calling Server Actions.

Prefer Server Actions directly in Server Components for better performance.

### Database Schema (Supabase)

Two PostgreSQL schemas:

- **`content`**: Master data (ingredients, recipes, recipe_ingredients) - admin-managed, read-only for users
- **`public`**: User data (profiles, planned_meals, feedback) - RLS protected

Key ENUM types: `gender_enum`, `activity_level_enum`, `goal_enum`, `meal_type_enum`, `ingredient_category_enum`

### State Management

- **TanStack Query**: Server state (Supabase data). Query keys follow hierarchical pattern: `['entity', id, 'sub-entity']`
- **Zustand**: Client state (UI preferences, local state). Stores in `src/lib/zustand/stores/`

### Key Business Logic

**Nutrition Calculator** (`src/services/nutrition-calculator.ts`):

- BMR: Mifflin-St Jeor formula
- TDEE: BMR × activity multiplier
- Macro ratio: 15% carbs, 35% protein, 50% fats
- Minimum calories: 1400 kcal (female), 1600 kcal (male)

**Meal Plan Generator** (`src/services/meal-plan-generator.ts`):

- 7-day rolling plan generation
- Recipe matching: target ± 15% calories
- Ingredient scaling: ± 20% max change

## Project Structure

```
app/                      # Next.js App Router pages
├── (public)/             # Auth routes (login, register, onboarding)
├── api/                  # API Route Handlers
├── dashboard/            # Main daily view
├── meal-plan/            # Weekly plan view
├── recipes/              # Recipe browser
└── shopping-list/        # Shopping list

src/
├── components/
│   ├── ui/               # shadcn/ui components (22 files)
│   ├── dashboard/        # Dashboard-specific components
│   ├── meal-plan/        # Meal planning components
│   └── ...
├── lib/
│   ├── actions/          # Server Actions (main business logic)
│   ├── supabase/         # Supabase client/server setup
│   ├── validation/       # Zod schemas
│   ├── react-query/      # TanStack Query hooks
│   └── zustand/          # Zustand stores
├── services/             # Core business logic (calculators, generators)
└── types/                # TypeScript types (including generated database.types.ts)
```

## Tech Stack

- **Framework**: Next.js 16 (App Router, React 19)
- **Database**: Supabase (PostgreSQL + Auth + Storage)
- **UI**: Tailwind CSS 4 + shadcn/ui + Radix UI
- **State**: TanStack Query + Zustand
- **Forms**: React Hook Form + Zod
- **Testing**: Vitest + React Testing Library + Playwright

## Design System

**Glassmorphism-first** design with:

- Primary color: `#dc2626` (red)
- Meal category colors: breakfast (yellow), lunch (green), snack (pink), dinner (indigo)
- Font: Montserrat (Google Fonts)
- Glass effect: `bg-white/[20-60]` + `backdrop-blur-[md-xl]` + `border-2 border-white`
- Border radius: 6px (badge) → 8px (input/button) → 12px (card)

Use `cn()` utility from `src/lib/utils.ts` for conditional class merging.

## Key Conventions

- **Imports**: Use `@/` path alias (e.g., `@/components/ui/button`)
- **Components**: PascalCase files (e.g., `MealCard.tsx`)
- **Utilities**: camelCase files (e.g., `calculateBMR.ts`)
- **Server Actions**: Return `{ data: T } | { error: string }` pattern
- **Validation**: All user input validated with Zod schemas in `src/lib/validation/`

## Important Notes

- **Supabase**: Cloud only. Never suggest `supabase start` or local Docker.
- **TypeScript**: Strict mode enabled. All business logic must be strictly typed.
- **Commits**: Follow Conventional Commits (feat, fix, docs, refactor, test, chore)
- **RLS**: Row Level Security enabled on all user tables. Users can only access their own data.

## Detailed Documentation

See `.claude/docs/` for comprehensive documentation:

| File                                                          | Description                                      |
| ------------------------------------------------------------- | ------------------------------------------------ |
| [README.md](.claude/docs/README.md)                           | Documentation index and navigation guide         |
| [01-architecture.md](.claude/docs/01-architecture.md)         | Full project structure, path aliases, config     |
| [02-development.md](.claude/docs/02-development.md)           | Development workflow, commands, debugging        |
| [03-state-management.md](.claude/docs/03-state-management.md) | TanStack Query + Zustand patterns                |
| [04-forms-validation.md](.claude/docs/04-forms-validation.md) | React Hook Form + Zod schemas                    |
| [05-security.md](.claude/docs/05-security.md)                 | RLS policies, auth, security best practices      |
| [06-database.md](.claude/docs/06-database.md)                 | Migrations, relations, queries, seed data        |
| [07-testing.md](.claude/docs/07-testing.md)                   | Vitest, RTL, Playwright test strategies          |
| [08-performance.md](.claude/docs/08-performance.md)           | Next.js optimization, caching, bundle analysis   |
| [09-ci-cd.md](.claude/docs/09-ci-cd.md)                       | GitHub Actions, Cloudflare Pages deployment      |
| [10-examples.md](.claude/docs/10-examples.md)                 | Code snippets: Server/Client Components, Actions |
| [11-shadcn-ui.md](.claude/docs/11-shadcn-ui.md)               | shadcn/ui components configuration               |
| [12-style-guide.md](.claude/docs/12-style-guide.md)           | Complete design system, glassmorphism, colors    |
