# AGENTS.md - Development Guide for OpenWebUI Monitor

## Overview

OpenWebUI Monitor is a Next.js 14 application for tracking usage and managing user balances in OpenWebUI. Built with TypeScript, React, PostgreSQL, and Tailwind CSS.

**Tech Stack:**

- Next.js 14.1.0 (App Router)
- TypeScript 5.3.3 (strict mode)
- React 18.2.0
- PostgreSQL (via @vercel/postgres or pg)
- Tailwind CSS + shadcn/ui + Ant Design
- pnpm (package manager)

## Build/Lint/Test Commands

### Development

```bash
pnpm dev              # Start development server (port 3000)
pnpm build            # Build for production
pnpm start            # Start production server
pnpm lint             # Run ESLint
```

### Database

```bash
pnpm db:generate      # Generate Drizzle migrations
pnpm db:push          # Initialize database schema
```

### Docker (Local Development)

```bash
docker-compose up -d           # Start containers
docker-compose down            # Stop containers
docker-compose logs -f         # View logs
docker-compose pull            # Pull latest images
```

### Testing

**Note:** Testing infrastructure does not currently exist. When adding tests, consider using Jest or Vitest with React Testing Library.

### Running a Single Test

No test runner configured yet. Future implementation should support:

```bash
# Example for future implementation
pnpm test <test-file>          # Run specific test file
pnpm test:watch                # Watch mode
```

## Code Style Guidelines

### Import Organization

Organize imports in this order:

1. React/Next.js imports
2. Third-party libraries
3. Local components (@ aliases)
4. Local utilities/types
5. Styles/assets

```typescript
// Example
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { message, Modal } from 'antd'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Dialog } from '@/components/ui/dialog'
import { query } from '@/lib/db/client'
import { verifyApiToken } from '@/lib/auth'
import type { User } from '@/types'
```

### TypeScript Conventions

**Strict Mode:** Always enabled. All code must be type-safe.

**Interfaces vs Types:**

- Use `interface` for object shapes and component props
- Use `type` for unions, intersections, and complex types

```typescript
// Component props
interface EditableCellProps {
    value: number
    isEditing: boolean
    onEdit: () => void
    onSubmit: (value: number) => Promise<void>
}

// Data models
interface User {
    id: string
    email: string
    name: string
    role: string
    balance: number
}
```

**Type Annotations:**

- Always annotate function parameters
- Return types are optional but recommended for public APIs
- Use proper typing for async functions: `Promise<T>`

### Component Structure

**Client vs Server Components:**

- Use `"use client"` directive at the top for client components (state, effects, browser APIs)
- Server components (default) for static content and data fetching
- Keep client components minimal to optimize bundle size

```typescript
'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'

export default function MyComponent() {
    const [count, setCount] = useState(0)
    // ...
}
```

**Component Organization:**

```typescript
// 1. Imports
// 2. Type definitions
// 3. Component definition
// 4. Helper functions (if any)
```

### Naming Conventions

- **Files:** kebab-case for utilities, PascalCase for components
    - Components: `Header.tsx`, `DatabaseBackup.tsx`
    - Utils: `editable-cell.tsx`, `use-mobile.tsx`
    - Routes: `route.ts`, `page.tsx`
- **Variables/Functions:** camelCase (`getUserData`, `isLoading`)
- **Constants:** UPPER_SNAKE_CASE (`API_KEY`, `ACCESS_TOKEN`)
- **Components:** PascalCase (`EditableCell`, `UserTable`)
- **Types/Interfaces:** PascalCase (`User`, `EditableCellProps`)

### Formatting

**Tailwind CSS:**

- Use Tailwind utility classes, avoid inline styles
- Group classes logically (layout, spacing, colors, effects)
- Use `cn()` helper from `@/lib/utils` for conditional classes
- Prefer `@/components/ui/*` shadcn components over custom styling

```typescript
import { cn } from "@/lib/utils";

<div className={cn(
  "px-2 py-1 rounded-lg",
  "transition-colors duration-200",
  disabled ? "opacity-50 cursor-not-allowed" : "hover:bg-primary/5"
)} />
```

**Strings:**

- Use double quotes for JSX attributes
- Use double quotes in TypeScript/JavaScript (enforced by Prettier config implied)
- Use template literals for string interpolation

### Path Aliases

- `@/*` - Root directory
- `@/lib/*` - Library utilities
- `@/components/*` - React components
- `@/app/*` - App router pages

## Architecture Patterns

### Directory Structure

```
app/                    # Next.js App Router
  api/v1/              # API routes (versioned)
    panel/             # Panel endpoints
    models/            # Model management
    users/             # User management
  [page]/page.tsx      # Page components
  layout.tsx           # Root layout
components/            # React components
  ui/                  # shadcn/ui components
  [feature]/           # Feature-specific components
lib/                   # Utilities and shared logic
  db/                  # Database clients and queries
  utils/               # Helper functions
hooks/                 # Custom React hooks
```

### API Routes

**Structure:** Follow REST patterns in `/app/api/v1/**/route.ts`

**Route Handlers:**

```typescript
import { NextResponse } from 'next/server'
import { query } from '@/lib/db/client'
import { verifyApiToken } from '@/lib/auth'

export async function GET(req: Request) {
    // 1. Verify authentication
    const authError = verifyApiToken(req)
    if (authError) return authError

    try {
        // 2. Parse request
        const { searchParams } = new URL(req.url)

        // 3. Database operations
        const result = await query('SELECT * FROM users')

        // 4. Return response
        return NextResponse.json(result.rows)
    } catch (error) {
        console.error('Error:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}
```

### Database Access

**Always use the abstraction layer:**

```typescript
import { query } from '@/lib/db/client'

// Parameterized queries only (prevents SQL injection)
const result = await query('SELECT * FROM users WHERE id = $1', [userId])

// Access results
const users = result.rows
const count = result.rowCount
```

**Never:**

- Construct raw SQL with string concatenation
- Access `pg` or `@vercel/postgres` directly outside `lib/db/client.ts`

### Authentication

**Middleware:** Authentication is handled in `middleware.ts` for most routes.

**API Routes:** Use `verifyApiToken()` helper:

```typescript
import { verifyApiToken } from '@/lib/auth'

export async function GET(req: Request) {
    const authError = verifyApiToken(req)
    if (authError) return authError
    // ... proceed with authenticated logic
}
```

**Token Types:**

- `ACCESS_TOKEN` - For panel/admin routes and page access
- `API_KEY` - For inlet/outlet API calls from OpenWebUI

## Error Handling

**API Routes:**

```typescript
try {
    // ... operation
} catch (error) {
    console.error('Descriptive error message:', error)
    return NextResponse.json(
        { error: 'User-friendly message' },
        { status: 500 }
    )
}
```

**Client Components:**

```typescript
import { toast } from 'sonner'

try {
    await apiCall()
    toast.success('Operation successful')
} catch (error) {
    console.error('Error:', error)
    toast.error('Operation failed')
}
```

**Always:**

- Log errors with `console.error()` for debugging
- Return user-friendly error messages
- Use appropriate HTTP status codes (400, 401, 404, 500)
- Handle edge cases (null checks, empty arrays)

## Development Workflow

### Environment Setup

1. Copy `.env.example` to `.env`
2. Configure required variables:
    - `OPENWEBUI_DOMAIN` - OpenWebUI instance URL
    - `OPENWEBUI_API_KEY` - API key from OpenWebUI
    - `ACCESS_TOKEN` - Admin authentication token
    - `API_KEY` - Function authentication token
3. Optional: PostgreSQL configuration (uses Docker by default)

### Local Development

```bash
# Install dependencies
pnpm install

# Initialize database
pnpm db:push

# Start development server
pnpm dev
```

### Making Changes

1. Run development server (`pnpm dev`)
2. Make changes (hot reload enabled)
3. Check ESLint warnings (`pnpm lint`)
4. Build to verify production compatibility (`pnpm build`)
5. Test in browser (no automated tests yet)

### Best Practices

- Keep components small and focused
- Prefer composition over complexity
- Use TypeScript strict mode (no `any` types)
- Handle loading and error states in UI
- Use React hooks appropriately (avoid unnecessary effects)
- Optimize database queries (use indexes, limit results)
- Follow existing patterns in the codebase
