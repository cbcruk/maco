# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- `pnpm dev` - Start development server with Turbopack
- `pnpm build` - Build the application for production
- `pnpm start` - Start production server
- `pnpm lint` - Run ESLint

## Tech Stack & Architecture

This is a Next.js 15 application built with React 19 RC, TypeScript, and Korean localization (Noto Sans KR). The architecture follows a modular service-oriented pattern using Effect.

### Core Technologies
- **Next.js 15** with App Router and Server Components
- **React 19 RC** with Suspense patterns
- **Effect** for functional programming and dependency injection
- **Drizzle ORM** with Turso (LibSQL) database
- **NextAuth v5 Beta** for GitHub OAuth authentication
- **TailwindCSS** for styling
- **Framer Motion** for animations

### Architecture Patterns

**Service Layer with Effect:**
- All business logic is encapsulated in Effect services (`services/` directory)
- Services use dependency injection and functional composition
- Error handling through Effect's tagged error system (`NotFoundError`)
- Database operations are wrapped in Effect pipelines

**Database Architecture:**
- Schema defined in `db/schema.ts` using Drizzle
- Two main entities: `users` and `commits` with user-commit relationship  
- Uses Zod schemas for validation (`drizzle-zod` integration)
- Configured for Turso/LibSQL with auth tokens
- Migrations live in `drizzle/` (`pnpm db:generate` / `pnpm db:migrate`)

**Write Path — Local-First (see `docs/local-first.md`):**
- A row in `commits` is one **immutable revision** of a memo, keyed by a content
  hash the browser computes. `note_id` is the memo's stable identity across edits.
- Editing appends a revision (`parent_hash` → previous); deleting appends a
  tombstone (`deleted`). Never `UPDATE` or `DELETE` a row — offline deletes would
  resurrect on sync, and mutation breaks idempotent push.
- "Current content" = the revision with the largest `hlc` for a `note_id`.
- Writes go to an IndexedDB outbox first (`lib/outbox.ts`) and flush to
  `pushCommitsAction` in the background (`lib/sync.ts`). Reads still come from the
  server via RSC.
- The server recomputes the hash with the session's `user_id` and rejects
  mismatches. Never trust `user_id` from a payload or form field.

**Component Structure:**
- Server Components for data fetching (`*.server.tsx`)
- Render props pattern for data passing between server/client boundaries
- Modular component organization in `app/components/`
- CSS Modules alongside global TailwindCSS

**Authentication Flow:**
- GitHub OAuth via NextAuth
- Automatic user creation on first sign-in
- Session management with user ID injection
- Middleware-protected routes using `auth` from NextAuth

**State Management:**
- Server state via RSC and Effect services
- Client state with React hooks (see `CommitListNav.hooks.ts`)
- Session context via NextAuth's SessionProvider

### Key Conventions
- Korean language interface (`lang="ko"`)
- Date handling with timezone support (`@date-fns/tz`)
- Absolute imports using `@/*` alias
- Effect-style error handling throughout services
- Functional composition over class inheritance

### Development Patterns
- Server Components fetch data through Effect service composition
- Client Components handle user interactions and UI state
- Form actions use Next.js Server Actions pattern
- Render props for component composition with server data
- Tailwind utility classes for styling with CSS Modules for component-specific styles

The codebase emphasizes functional programming principles, strong typing, and separation of concerns through Effect's service layer architecture.