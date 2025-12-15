# LowCarbPlaner

![Next.js](https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=for-the-badge&logo=typescript)
![Supabase](https://img.shields.io/badge/Supabase-BaaS-3ECF8E?style=for-the-badge&logo=supabase)
![Vercel](https://img.shields.io/badge/Vercel-Deployed-000?style=for-the-badge&logo=vercel)

**Live Demo:** [lowcarbplaner.vercel.app](https://lowcarbplaner.vercel.app)

An intelligent web application designed to simplify meal planning and macro tracking for individuals on a low-carbohydrate diet. It automatically generates personalized 7-day meal plans, creates shopping lists, and provides visual feedback on daily progress.

---

## Table of Contents

- [Project Description](#project-description)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Getting Started Locally](#getting-started-locally)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
- [Available Scripts](#available-scripts)
- [Project Structure](#project-structure)
- [Project Status](#project-status)
- [License](#license)

---

## Project Description

LowCarbPlaner addresses the common challenges of a low-carb diet: **decision fatigue** from daily meal planning and the **complexity of tracking macros**. The application automates these key processes, allowing users to focus on their goals rather than on tedious calculations.

After a quick onboarding process, the app's core algorithm generates a 7-day meal plan tailored to the user's individual caloric and macro needs. A key innovation is the ability to intelligently scale ingredient quantities in existing recipes to hit precise targets. This provides a truly personalized experience without manual effort.

## Features

### Core Functionality

- **Automated 7-Day Meal Plan** - Full week of breakfasts, lunches, and dinners generated automatically based on your goals
- **Intelligent Ingredient Scaling** - Algorithm adjusts ingredient amounts to perfectly match your caloric and macro targets
- **Visual Progress Tracking** - Intuitive progress bars for calories, protein, carbs, and fats with real-time updates
- **Aggregated Shopping List** - Consolidated shopping list for the upcoming days, grouped by category
- **Recipe Management** - Swap meals, view detailed cooking instructions with step-by-step mode on mobile

### User Experience

- **Responsive Design** - Glassmorphism UI optimized for mobile and desktop
- **Recipe Preview Modal** - Quick preview of replacement recipes before swapping
- **Interactive Calendar Strip** - Navigate between days with visual indicators
- **Step-by-Step Cooking Mode** - Mobile-friendly guided cooking instructions

### Authentication & Profile

- **Multiple Auth Methods** - Email/Password and Google OAuth
- **Personalized Onboarding** - Step-by-step wizard to calculate caloric/macro goals
- **Profile Management** - Update weight, activity level, and recalculate targets
- **Feedback System** - In-app form for reporting issues or suggestions

## Tech Stack

| Category                 | Technology                                      | Purpose                                                 |
| :----------------------- | :---------------------------------------------- | :------------------------------------------------------ |
| **Full-stack Framework** | **Next.js 16 (App Router)**                     | Foundation for UI, routing, and server-side logic (RSC) |
| **Backend & Database**   | **Supabase (BaaS)**                             | PostgreSQL, Authentication, Row Level Security          |
| **UI Framework**         | **Tailwind CSS 4 + shadcn/ui + Radix UI**       | Modern glassmorphism design system                      |
| **Data Fetching**        | **TanStack Query (React Query)**                | Efficient server-state synchronization and caching      |
| **Client State**         | **Zustand**                                     | Minimalist global state management                      |
| **Forms & Validation**   | **React Hook Form + Zod**                       | Performant forms with type-safe validation              |
| **Charts**               | **Recharts**                                    | Data visualization for macro tracking                   |
| **Testing**              | **Vitest + React Testing Library + Playwright** | Comprehensive unit, integration, and E2E testing        |
| **Deployment**           | **Vercel**                                      | Production hosting with automatic deployments           |
| **CI/CD**                | **GitHub Actions**                              | Automated testing and deployment pipeline               |

## Getting Started Locally

### Prerequisites

- [Node.js](https://nodejs.org/) (version 20.x or higher)
- [npm](https://www.npmjs.com/) (or pnpm/yarn)
- A [Supabase](https://supabase.com/) account for the database and authentication

### Installation

1. **Clone the repository:**

   ```bash
   git clone https://github.com/grekooss/lowcarbplaner.git
   cd lowcarbplaner
   ```

2. **Install dependencies:**

   ```bash
   npm install
   ```

3. **Set up environment variables:**

   ```bash
   cp .env.example .env.local
   ```

   Configure with your Supabase credentials:

   ```dotenv
   NEXT_PUBLIC_SUPABASE_URL="YOUR_SUPABASE_URL"
   NEXT_PUBLIC_SUPABASE_ANON_KEY="YOUR_SUPABASE_ANON_KEY"
   SUPABASE_SERVICE_ROLE_KEY="YOUR_SERVICE_ROLE_KEY"
   ```

4. **Set up the database:**

   ```bash
   npx supabase link --project-ref YOUR_PROJECT_REF
   npx supabase db push
   ```

5. **Run the development server:**

   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000) in your browser.

## Available Scripts

### Development & Build

| Command             | Description                             |
| ------------------- | --------------------------------------- |
| `npm run dev`       | Start development server                |
| `npm run dev:turbo` | Start development server with Turbopack |
| `npm run build`     | Build for production                    |
| `npm run start`     | Start production server                 |
| `npm run lint`      | Run ESLint                              |
| `npm run format`    | Format code with Prettier               |
| `npm run validate`  | Type-check, lint, and format check      |

### Testing

| Command               | Description                         |
| --------------------- | ----------------------------------- |
| `npm run test`        | Run unit tests with Vitest          |
| `npm run test:ui`     | Run tests with Vitest UI            |
| `npm run test:e2e`    | Run E2E tests with Playwright       |
| `npm run test:e2e:ui` | Run E2E tests in Playwright UI mode |

### Database

| Command                | Description                          |
| ---------------------- | ------------------------------------ |
| `npm run db:clone`     | Clone schema + test data (Linux/Mac) |
| `npm run db:clone:win` | Clone schema + test data (Windows)   |

> See [scripts/README.md](scripts/README.md) for detailed database management documentation.

## Project Structure

```
lowcarbplaner/
├── app/                    # Next.js App Router pages
│   ├── (public)/           # Public routes (auth, onboarding)
│   ├── api/                # API routes
│   ├── dashboard/          # Main dashboard
│   ├── meal-plan/          # Weekly meal plan view
│   ├── profile/            # User profile
│   ├── recipes/            # Recipe browser & details
│   └── shopping-list/      # Shopping list
├── src/
│   ├── components/         # React components
│   │   ├── auth/           # Authentication forms
│   │   ├── dashboard/      # Dashboard components
│   │   ├── meal-plan/      # Meal planning components
│   │   ├── onboarding/     # Onboarding wizard steps
│   │   ├── profile/        # Profile management
│   │   ├── recipes/        # Recipe components
│   │   ├── shared/         # Shared components
│   │   ├── shopping-list/  # Shopping list components
│   │   └── ui/             # shadcn/ui primitives
│   ├── hooks/              # Custom React hooks
│   ├── lib/                # Utilities, configs, queries
│   ├── services/           # Business logic services
│   └── types/              # TypeScript types & DTOs
├── tests/                  # Test files
├── scripts/                # Database & utility scripts
└── supabase/               # Supabase migrations & config
```

## Project Status

**Status: MVP - Live**

The application is deployed and functional at [lowcarbplaner.vercel.app](https://lowcarbplaner.vercel.app). Core features are implemented:

- User authentication (Email + Google OAuth)
- Personalized onboarding with macro calculation
- Automated 7-day meal plan generation
- Daily dashboard with macro tracking
- Recipe browser with detailed views
- Meal swapping functionality
- Shopping list generation
- Profile management

### Roadmap

Future enhancements being considered:

- Dietary restrictions support (vegetarian, allergies)
- Custom macro ratios
- Historical data tracking
- PWA offline support improvements

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details.
