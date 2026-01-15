# AGENTS.md - OpenWebUI Monitor

## Project Overview

OpenWebUI Monitor is a Next.js 14 application for monitoring and analyzing OpenWebUI usage data. It tracks user balances, model pricing, and usage records with a PostgreSQL database backend.

**Tech Stack:**

- Next.js 14 (App Router)
- TypeScript (strict mode)
- PostgreSQL with raw SQL queries (via `pg` and `@vercel/postgres`)
- Tailwind CSS + shadcn/ui components
- i18next for internationalization (en, zh, es)
- pnpm package manager

---

## Build, Dev & Lint Commands

```bash
# Development
pnpm dev              # Start dev server (next dev)

# Build
pnpm build            # Production build (next build)
pnpm start            # Start production server

# Linting & Formatting
pnpm lint             # Run ESLint
pnpm lint:fix         # Run ESLint with auto-fix
pnpm format           # Format all files with Prettier
pnpm format:check     # Check formatting without writing

# Database
pnpm db:generate      # Generate Drizzle migrations
pnpm db:push          # Run database initialization script
```

**No test suite is configured.** If adding tests, consider Vitest or Jest with React Testing Library.

---

## Code Style Guidelines

### Formatting (Prettier)

Configuration in `.prettierrc`:

```json
{
    "trailingComma": "es5",
    "tabWidth": 4,
    "semi": false,
    "singleQuote": true
}
```

- **4 spaces** for indentation
- **No semicolons**
- **Single quotes** for strings
- **Trailing commas** in ES5-valid positions (objects, arrays)

### TypeScript

- **Strict mode enabled** - all strict checks are on
- Use explicit types for function parameters and return types
- Prefer `interface` for object shapes, `type` for unions/intersections
- Use `type` imports when importing only types:

```typescript
// Good
import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

// Also acceptable (mixed)
import { NextResponse, type NextRequest } from 'next/server'
```

### Import Order

Follow this general order (enforced by ESLint):

1. React/Next.js imports
2. External libraries
3. Internal aliases (`@/lib/*`, `@/components/*`)
4. Relative imports
5. Type-only imports

```typescript
import { NextResponse } from 'next/server'
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'

import { query } from '@/lib/db/client'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

import type { User } from './types'
```

### Path Aliases

Use the `@/` alias for absolute imports (configured in `tsconfig.json`):

- `@/*` maps to `./*`
- `@/lib/*` maps to `./lib/*`

### Naming Conventions

| Type               | Convention           | Example                              |
| ------------------ | -------------------- | ------------------------------------ |
| Components         | PascalCase           | `UserCard`, `DatabaseBackup`         |
| Files (components) | PascalCase.tsx       | `Header.tsx`, `AuthCheck.tsx`        |
| Files (utilities)  | kebab-case.ts        | `inlet-cost.ts`, `use-toast.ts`      |
| Functions          | camelCase            | `fetchUsers`, `handleUpdateBalance`  |
| Constants          | SCREAMING_SNAKE_CASE | `ACCESS_TOKEN`, `API_KEY`            |
| Interfaces/Types   | PascalCase           | `User`, `ModelPrice`                 |
| Database tables    | snake_case           | `user_usage_records`, `model_prices` |
| Database columns   | snake_case           | `input_price`, `created_at`          |

### Error Handling

**API Routes:**

```typescript
export async function POST(req: Request) {
    try {
        // ... logic
        return NextResponse.json({ success: true, data })
    } catch (error) {
        console.error('Descriptive error message:', error)
        return NextResponse.json(
            {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error',
                error_type:
                    error instanceof Error ? error.name : 'UNKNOWN_ERROR',
            },
            { status: 500 }
        )
    }
}
```

**Client Components:**

```typescript
try {
    const res = await fetch('/api/v1/endpoint')
    const data = await res.json()
    if (!res.ok) throw new Error(data.error)
    // handle success
} catch (err) {
    console.error('Failed to fetch:', err)
    toast.error(t('error.message')) // Use i18n for user-facing messages
}
```

---

## Architecture

### Directory Structure

```
app/                    # Next.js App Router pages
  api/v1/              # API routes (versioned)
    inlet/             # Inlet endpoint (pre-request)
    outlet/            # Outlet endpoint (post-request)
    users/             # User management
    models/            # Model pricing
    panel/             # Dashboard data
  (pages)/             # Page components (users, models, panel, etc.)

components/            # React components
  ui/                  # shadcn/ui primitives
  panel/               # Dashboard-specific components

lib/                   # Utilities and business logic
  db/                  # Database functions
    client.ts          # DB connection pool
    users.ts           # User queries
    index.ts           # Table initialization
  utils.ts             # General utilities (cn function)
  auth.ts              # Token verification

hooks/                 # Custom React hooks
locales/               # i18n translation files (en, zh, es)
```

### API Authentication

Two tokens are used:

- `API_KEY`: For inlet/outlet endpoints (OpenWebUI function calls)
- `ACCESS_TOKEN`: For panel/config/users/models endpoints (dashboard access)

Authentication is handled in `middleware.ts` and `lib/auth.ts`.

### Database Patterns

- Raw SQL queries via the `query()` function in `lib/db/client.ts`
- Supports both Vercel Postgres and standard PostgreSQL
- Tables are auto-created on first access (`ensureTablesExist`)
- Use parameterized queries to prevent SQL injection:

```typescript
const result = await query('SELECT * FROM users WHERE id = $1', [userId])
```

### Component Patterns

**Client Components** - Mark with `'use client'` directive:

```typescript
'use client'

import { useState, useEffect } from 'react'
// ...
```

**shadcn/ui Components** - Located in `components/ui/`, use the `cn()` utility for conditional classes:

```typescript
import { cn } from '@/lib/utils'

<div className={cn('base-class', condition && 'conditional-class')} />
```

**Internationalization** - Use `useTranslation` hook:

```typescript
const { t } = useTranslation('common')
// ...
<span>{t('users.title')}</span>
```

---

## Common Patterns

### API Response Format

Success:

```json
{ "success": true, "data": { ... } }
```

Error:

```json
{ "success": false, "error": "message", "error_type": "ERROR_NAME" }
```

### Toast Notifications

Use `sonner` for toasts:

```typescript
import { toast } from 'sonner'

toast.success(t('message.success'))
toast.error(t('message.error'))
```

### Environment Variables

Required variables (see `.env.example`):

- `ACCESS_TOKEN` - Dashboard login
- `API_KEY` - OpenWebUI function authentication
- `OPENWEBUI_DOMAIN` - OpenWebUI instance URL
- `OPENWEBUI_API_KEY` - For fetching model list

Database (optional, uses Docker PostgreSQL by default):

- `POSTGRES_HOST`, `POSTGRES_PORT`, `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DATABASE`
