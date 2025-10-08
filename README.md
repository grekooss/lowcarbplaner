# LowCarbPlaner

![Build Status](https://img.shields.io/github/actions/workflow/status/your-username/lowcarbplaner/ci.yml?branch=main&style=for-the-badge)
![Version](https://img.shields.io/badge/version-0.1.0-blue?style=for-the-badge)
![License](https://img.shields.io/badge/license-MIT-green?style=for-the-badge)

An intelligent web application designed to simplify meal planning and macro tracking for individuals on a low-carbohydrate diet. It automatically generates personalized 7-day meal plans, creates shopping lists, and provides visual feedback on daily progress.

---

## Table of Contents

- [Project Description](#project-description)
- [Tech Stack](#tech-stack)
- [Getting Started Locally](#getting-started-locally)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
- [Available Scripts](#available-scripts)
- [Project Scope](#project-scope)
  - [Key Features (MVP)](#key-features-mvp)
  - [Out of Scope (MVP)](#out-of-scope-mvp)
- [Project Status](#project-status)
- [License](#license)

---

## Project Description

LowCarbPlaner addresses the common challenges of a low-carb diet: **decision fatigue** from daily meal planning and the **complexity of tracking macros**. The application automates these key processes, allowing users to focus on their goals rather than on tedious calculations.

After a quick onboarding process, the app's core algorithm generates a 7-day meal plan tailored to the user's individual caloric and macro needs. A key innovation is the ability to intelligently scale ingredient quantities in existing recipes to hit precise targets. This provides a truly personalized experience without manual effort.

### Core Features

- **Automated 7-Day Meal Plan:** Get a full week of breakfasts, lunches, and dinners generated automatically based on your goals.
- **Intelligent Ingredient Scaling:** Our algorithm adjusts ingredient amounts to perfectly match your caloric and macro targets.
- **Visual Progress Tracking:** Simple, intuitive progress bars for calories, protein, carbs, and fats.
- **Aggregated Shopping List:** A consolidated shopping list for the next 6 days is generated automatically, simplifying grocery shopping.
- **Recipe Management:** Swap meals you don't like and view detailed, step-by-step cooking instructions.
- **Offline Access:** Your 7-day plan and shopping list are cached locally for access without an internet connection.

## Tech Stack

This project is built with a modern, full-stack TypeScript architecture optimized for performance, developer experience, and scalability.

| Category                 | Technology / Tool                               | Purpose                                                          |
| :----------------------- | :---------------------------------------------- | :--------------------------------------------------------------- |
| **Full-stack Framework** | **Next.js 15+ (App Router)**                    | Foundation for UI, routing, and server-side logic (RSC).         |
| **Backend & Database**   | **Supabase (BaaS)**                             | Data management, PostgreSQL, Authentication, and Edge Functions. |
| **UI Framework**         | **Tailwind CSS + shadcn/ui**                    | Rapid and consistent development of a modern UI.                 |
| **Data Fetching**        | **TanStack Query (React Query)**                | Efficient server-state synchronization and caching.              |
| **Client State**         | **Zustand**                                     | Minimalist global state management on the client.                |
| **Forms & Validation**   | **React Hook Form + Zod**                       | Performant forms and type-safe data validation.                  |
| **Testing**              | **Vitest + React Testing Library + Playwright** | Comprehensive unit, integration, and E2E testing.                |
| **Deployment**           | **Cloudflare Pages**                            | Global CDN, automatic deployments, and serverless hosting.       |
| **CI/CD**                | **GitHub Actions**                              | Automated testing and deployment pipeline.                       |

## Getting Started Locally

Follow these instructions to set up the project on your local machine for development and testing purposes.

### Prerequisites

- [Node.js](https://nodejs.org/) (version 20.x or higher)
- [npm](https://www.npmjs.com/) (or your preferred package manager like Yarn or pnpm)
- A [Supabase](https://supabase.com/) account for the database and authentication.

### Installation

1.  **Clone the repository:**

    ```bash
    git clone https://github.com/your-username/lowcarbplaner.git
    cd lowcarbplaner
    ```

2.  **Install dependencies:**

    ```bash
    npm install
    ```

3.  **Set up environment variables:**
    Create a `.env.local` file in the root of the project by copying the example file:

    ```bash
    cp .env.example .env.local
    ```

    You will need to populate this file with your Supabase project URL and Anon Key. You can find these in your Supabase project's API settings.

    ```dotenv
    # .env.local
    NEXT_PUBLIC_SUPABASE_URL="YOUR_SUPABASE_URL"
    NEXT_PUBLIC_SUPABASE_ANON_KEY="YOUR_SUPABASE_ANON_KEY"
    SUPABASE_SERVICE_ROLE_KEY="YOUR_SERVICE_ROLE_KEY"
    ```

4.  **Set up the database:**

    a) **Link to remote Supabase project:**

    ```bash
    npx supabase link --project-ref YOUR_PROJECT_REF
    ```

    b) **Apply migrations:**

    ```bash
    npx supabase db push
    ```

    c) **Seed sample data (optional):**

    ```bash
    # Execute seed.sql in Supabase SQL Editor
    # or use: psql connection to run supabase/seed.sql
    ```

    For detailed migration status, see [MIGRATION_STATUS.md](./MIGRATION_STATUS.md).

5.  **Run the development server:**
    ```bash
    npm run dev
    ```

The application should now be running on [http://localhost:3000](http://localhost:3000).

## Available Scripts

This project includes several scripts to help with development:

- `npm run dev`: Starts the development server with hot-reloading.
- `npm run build`: Builds the application for production.
- `npm run start`: Starts the production server.
- `npm run lint`: Lints the code using ESLint.
- `npm run format`: Formats all files using Prettier.
- `npm run validate`: Runs type-checking, linting, and format checks.

## Project Scope

To ensure a focused development process, the scope for the Minimum Viable Product (MVP) is clearly defined.

### Key Features (MVP)

✔️ **User Authentication:** Sign up & log in with Email/Password and Google OAuth.
✔️ **Onboarding Calculator:** A step-by-step process to gather user data (age, weight, etc.) and calculate caloric/macro goals.
✔️ **Automatic Plan Generation:** A 7-day meal plan is generated and maintained in a "rolling window".
✔️ **Daily Dashboard:** A home screen showing today's meals and visual progress bars for macros.
✔️ **Meal Management:** Ability to swap a proposed meal for an alternative and modify scalable ingredient amounts.
✔️ **Recipe View:** A detailed view for each meal, including ingredients and preparation steps.
✔️ **Shopping List:** An aggregated list of all ingredients needed for the upcoming 6 days.
✔️ **Profile Management:** Users can update their weight and activity level, which recalculates their plan.
✔️ **Feedback Mechanism:** A simple in-app form for users to report issues or suggest improvements.
✔️ **Offline Functionality:** The generated plan and shopping list are available without an internet connection.

### Out of Scope (MVP)

❌ **Manual Food Logging:** Users cannot add their own products or build meals from scratch.
❌ **Custom Macro Ratios:** The macro split (15%C / 35%P / 50%F) is fixed.
❌ **Dietary Restrictions:** No support for allergies, intolerances, or dietary preferences (e.g., vegetarian).
❌ **Social & Gamification:** No community features, badges, or leaderboards.
❌ **Hardware Integration:** No integration with smartwatches or health apps.
❌ **Historical Data:** No tracking of long-term progress, weekly summaries, or plan archives.

## Project Status

**Status: MVP Development**

This project is currently in the Minimum Viable Product (MVP) stage. The primary goal is to validate the core functionality, test the technical stability of the meal plan generator, and gather qualitative feedback from early users.

Future development and feature prioritization will be heavily influenced by the feedback collected via the in-app form.

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details.
