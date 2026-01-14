# Atlas - Project Structure Documentation

This document outlines the directory structure and organization of the Atlas task management platform.

## Directory Structure

```
atlas/
├── app/                          # Next.js App Router
│   ├── layout.tsx               # Root layout with providers
│   ├── page.tsx                 # Home page (active tasks)
│   ├── globals.css              # Global styles
│   ├── completed/
│   │   └── page.tsx             # Completed tasks page
│   └── insights/
│       └── page.tsx             # Analytics & insights page
│
├── src/                          # All application source code
│   ├── components/
│   │   ├── ui/                  # Shadcn/ui + Base components
│   │   │   ├── badge.tsx
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── chart.tsx
│   │   │   ├── dialog.tsx
│   │   │   ├── sidebar.tsx
│   │   │   ├── skeleton.tsx
│   │   │   ├── spinner.tsx
│   │   │   └── ... (other UI components)
│   │   │
│   │   ├── layout/              # App-wide layout components
│   │   │   ├── index.tsx        # AppSidebar component
│   │   │   ├── nav-user.tsx     # User navigation
│   │   │   └── workspace-toggler.tsx
│   │   │
│   │   └── features/            # Feature-specific components
│   │       ├── tasks/           # Task feature
│   │       │   ├── tasks-data-table.tsx
│   │       │   ├── columns.tsx
│   │       │   ├── priority-cell.tsx
│   │       │   ├── status-cell.tsx
│   │       │   ├── editable-cells.tsx
│   │       │   ├── task-detail-drawer.tsx
│   │       │   └── index.ts     # Feature exports
│   │       │
│   │       ├── insights/        # Insights/Analytics feature
│   │       │   ├── task-status-breakdown.tsx
│   │       │   ├── throughput-over-time.tsx
│   │       │   ├── cycle-time.tsx
│   │       │   ├── hours-saved-worked.tsx
│   │       │   ├── cumulative-flow.tsx
│   │       │   ├── tools-used.tsx
│   │       │   ├── assest-class-select.tsx
│   │       │   ├── insights-view.tsx
│   │       │   └── index.ts     # Feature exports
│   │       │
│   │       └── workspace/       # Workspace feature (ready for expansion)
│   │
│   ├── hooks/                   # Custom React hooks
│   │   ├── use-mobile.ts
│   │   └── index.ts
│   │
│   ├── lib/                     # Core business logic layer
│   │   ├── types/               # TypeScript type definitions
│   │   │   ├── project.ts       # Task, Status, Priority types
│   │   │   └── index.ts
│   │   │
│   │   ├── api/                 # TanStack Query hooks & API calls
│   │   │   ├── tasks.query.ts   # Query hooks for tasks
│   │   │   └── index.ts
│   │   │
│   │   ├── constants/           # App constants & query keys
│   │   │   ├── tasks.keys.ts    # TanStack Query keys
│   │   │   └── index.ts
│   │   │
│   │   ├── utils/               # Utility functions
│   │   │   ├── cn.ts            # Class name utility
│   │   │   ├── analytics.ts     # Data transformation for charts
│   │   │   └── index.ts
│   │   │
│   │   ├── db/                  # Database & ORM
│   │   │   ├── schema.ts        # Drizzle ORM schema
│   │   │   └── index.ts
│   │   │
│   │   └── services/            # Business logic services
│   │       └── index.ts         # Ready for future implementation
│   │
│   ├── providers/               # React Context & Providers
│   │   ├── react-query-provider.tsx
│   │   ├── workspace-provider.tsx
│   │   └── index.ts
│   │
│   └── data/                    # Mock data & development fixtures
│       ├── mock-tasks.ts        # Mock task data
│       └── index.ts
│
├── db/                          # Database configuration (deprecated, use src/lib/db)
│   ├── index.ts
│   └── schema.ts
│
├── public/                      # Static assets (images, fonts, etc.)
├── drizzle/                     # Drizzle migrations
├── docs/                        # Project documentation
├── package.json
├── tsconfig.json               # TypeScript configuration with path aliases
├── next.config.ts              # Next.js configuration
└── drizzle.config.ts           # Drizzle ORM configuration
```

## Key Directories Explained

### `/app`
- Next.js App Router directory
- Contains page files and route segments
- Root layout includes all global providers
- Each route can have its own layout.tsx

### `/src`
- All application source code lives here
- This is the recommended organization for scalability
- Uses path alias `@/src/` for cleaner imports

### `/src/components`
- **`ui/`** - Reusable UI components from shadcn/ui and custom base components
- **`layout/`** - Application layout components (sidebar, navigation, etc.)
- **`features/`** - Feature-specific component groups (tasks, insights, workspace)

### `/src/lib`
- **`types/`** - All TypeScript type definitions and interfaces
- **`api/`** - TanStack Query hooks and API client code
- **`constants/`** - Query keys, constants, and configuration
- **`utils/`** - Utility and helper functions
- **`db/`** - Database schema and ORM configuration
- **`services/`** - Business logic layer (ready for service implementations)

### `/src/hooks`
- Custom React hooks (e.g., `use-mobile.ts`)

### `/src/providers`
- React Context providers and wrapper components
- `ReactQueryProvider` - TanStack Query setup
- `WorkspaceProvider` - Workspace context

### `/src/data`
- Mock data for development and testing
- Should be replaced with real API calls in production

## Import Path Conventions

```typescript
// Components
import { Button } from "@/src/components/ui/button";
import { TasksDataTable } from "@/src/components/features/tasks";

// Hooks
import { useWorkspace } from "@/src/providers";

// Types
import type { Task, Status } from "@/src/lib/types";

// Utilities
import { cn } from "@/src/lib/utils";

// API
import { useTasks } from "@/src/lib/api";
```

## TanStack Query Integration

### Current Setup
- Query hooks located in `/src/lib/api/tasks.query.ts`
- Query keys defined in `/src/lib/constants/tasks.keys.ts`
- ReactQueryProvider setup in `/src/providers/react-query-provider.tsx`

### Future Expansion
- Create additional query files in `/src/lib/api/` for other features
- Add services in `/src/lib/services/` for server-side logic
- Implement mutation hooks for create/update/delete operations

## Best Practices

1. **Feature-First Organization** - Components are grouped by feature for easier navigation
2. **Separation of Concerns** - UI, business logic, and types are clearly separated
3. **Scalability** - Structure supports growth without major refactoring
4. **Type Safety** - All types centralized in `/src/lib/types/`
5. **Reusability** - Common utilities and components are easily imported

## Adding New Features

When adding a new feature:

1. Create a folder in `/src/components/features/{feature-name}/`
2. Add feature-specific components there
3. Create query hooks in `/src/lib/api/{feature}.query.ts`
4. Add query keys in `/src/lib/constants/{feature}.keys.ts`
5. Export from index files for cleaner imports

Example structure for a new "Projects" feature:
```
src/
├── components/features/projects/
│   ├── projects-list.tsx
│   ├── project-card.tsx
│   └── index.ts
├── lib/
│   ├── api/projects.query.ts
│   └── constants/projects.keys.ts
```

## Database Integration

- **ORM**: Drizzle ORM
- **Schema**: `/src/lib/db/schema.ts`
- **Client**: PostgreSQL (configured in `drizzle.config.ts`)
- **Migrations**: Stored in `/drizzle/` directory

## Development Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Database operations
npm run db:generate  # Generate migrations
npm run db:push     # Push schema to database
npm run db:studio   # Open Drizzle studio

# Linting
npm run lint
```
