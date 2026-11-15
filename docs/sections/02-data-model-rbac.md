# Section 2 — Data model, RBAC & project structure

Backend groundwork. No UI, no feature functions (those are Section 3).

## Goals

1. A folder structure where the path tells you what a file does before you open it.
2. Full schema for `users`, `tools`, `loans`.
3. RBAC enforced by construction: authenticated/admin function wrappers + ownership helpers.
4. Typed errors the UI can map to friendly messages.
5. A safe way to make the first admin.

## Project structure

### Convex

Convex requires `schema.ts`, `auth.config.ts` and `http.ts` at the root. Everything else is grouped by domain.
Each domain folder uses the same file names, so the API path reads naturally: `api.tools.queries.list`, `api.loans.mutations.approve`.

```
convex/
├── schema.ts              composes the tables from each domain
├── auth.config.ts         trusts Clerk JWTs
├── http.ts                (Section 6) n8n HTTP endpoints
├── lib/                   shared, never exposed as API
│   ├── functions.ts       userQuery / userMutation / adminQuery / adminMutation wrappers
│   ├── access.ts          requireToolOwner, requireLoanParty
│   ├── errors.ts          AppError codes + helpers
│   └── validators.ts      category / condition / status validators + constants
├── users/
│   ├── table.ts           users table definition
│   ├── queries.ts         current
│   ├── mutations.ts       store
│   └── internal.ts        setRole (CLI/dashboard only)
├── tools/
│   ├── table.ts
│   ├── queries.ts         (Section 3)
│   └── mutations.ts       (Section 3)
├── loans/
│   ├── table.ts
│   ├── queries.ts         (Section 3)
│   └── mutations.ts       (Section 3)
├── admin/
│   ├── queries.ts         (Section 3)
│   └── mutations.ts       (Section 3)
└── automation/            (Sections 5–6) outbox, signing, n8n handlers
```

File-name convention across domains:

| File           | Contains                                         |
| -------------- | ------------------------------------------------ |
| `table.ts`     | `defineTable(...)` for that domain                |
| `queries.ts`   | public queries                                    |
| `mutations.ts` | public mutations                                  |
| `internal.ts`  | internal functions (not callable from the client) |
| `actions.ts`   | actions (external calls)                          |

### Next.js

```
app/                       routes only (pages, layouts)
components/
├── ui/                    shadcn primitives (generated, untouched)
├── providers/             convex-client-provider, theme-provider
├── tools/                 (Section 4) tool cards, forms, filters
├── loans/                 (Section 4) loan cards, request form
└── layout/                (Section 4) header, nav
lib/                       framework-agnostic helpers (utils, authorized-origins)
proxy.ts                   Clerk middleware (Next 16 name for middleware)
```

## Schema

Dates are `"YYYY-MM-DD"` strings (no timezone drift when computing "overdue").

### users (unchanged)
`tokenIdentifier`, `clerkId`, `email`, `name`, `imageUrl?`, `role: "user" | "admin"`, `trustedLender: boolean`
Index: `by_token`, `by_email` (for `setRole`).

### tools
| Field         | Type                         |
| ------------- | ---------------------------- |
| `ownerId`     | `Id<"users">`                |
| `name`        | string (1–80)                |
| `category`    | category literal             |
| `condition`   | condition literal            |
| `description` | string (≤ 500)               |
| `removedAt?`  | number (soft delete)         |
| `removedBy?`  | `Id<"users">`                |

Indexes: `by_owner`, `by_category`.

Categories: `power_tools`, `hand_tools`, `garden`, `kitchen`, `camping`, `cleaning`, `ladders_moving`, `other`.
Conditions: `new`, `like_new`, `good`, `fair`, `worn`.

### loans
| Field          | Type                    |
| -------------- | ----------------------- |
| `toolId`       | `Id<"tools">`           |
| `borrowerId`   | `Id<"users">`           |
| `lenderId`     | `Id<"users">` (copied from tool) |
| `startDate`    | `"YYYY-MM-DD"`          |
| `endDate`      | `"YYYY-MM-DD"`          |
| `status`       | `requested` \| `approved` \| `declined` \| `cancelled` \| `returned` |
| `note?`        | string (≤ 280)          |
| `decidedAt?`   | number                  |
| `returnedAt?`  | number                  |

Indexes: `by_borrower`, `by_lender`, `by_tool`, `by_status_endDate`.

Automation tables (`webhookDeliveries`, `automationEvents`) are added in Sections 5–6.

## RBAC

### Wrappers (`convex/lib/functions.ts`, via `convex-helpers`)
- `userQuery` / `userMutation`: resolve the caller from the JWT, load their `users` row, throw `UNAUTHENTICATED` otherwise, expose `ctx.user`.
- `adminQuery` / `adminMutation`: same, plus throw `FORBIDDEN` unless `ctx.user.role === "admin"`.
- Raw `query` / `mutation` are allowed only for the public tool list and `users.mutations.store`.

### Ownership helpers (`convex/lib/access.ts`)
- `requireToolOwner(ctx, toolId)`: tool exists, is not removed, and `ownerId === ctx.user._id`.
- `requireLoanParty(ctx, loanId, "lender" | "borrower")`: loan exists and the caller is that party.
- Both throw `NOT_FOUND` (not `FORBIDDEN`) when the caller isn't the owner, so ids can't be probed.

### Admin scope
Admins are normal users too. Extra powers: remove any listing, view all loans, set Trusted Lender. Admins cannot edit other people's listings or act on other people's loans.

## Errors (`convex/lib/errors.ts`)
`ConvexError<{ code: "UNAUTHENTICATED" | "FORBIDDEN" | "NOT_FOUND" | "INVALID" | "CONFLICT", message: string }>`.

## Admin bootstrap
`internal.users.internal.setRole({ email, role })`, run from the Convex dashboard or:

```
npx convex run users/internal:setRole '{"email":"you@example.com","role":"admin"}'
```

## Done when
- [ ] Files moved to the structure above; `api.users.queries.current` / `api.users.mutations.store` used by the client.
- [ ] Schema deployed with all indexes.
- [ ] Wrappers, access helpers, errors, validators in `convex/lib/`.
- [ ] You are admin via `setRole`, and `/app` shows `"role": "admin"`.
