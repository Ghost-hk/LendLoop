# Section 3 — Core backend functions

All app behavior, enforced in Convex. Built on the Section 2 wrappers. No UI.

## Decisions

1. Only the **lender** marks a loan returned.
2. Owners **cannot remove** a tool with an approved (not yet returned) loan → `CONFLICT`. Admins can always remove; existing approved loans stay.
3. Approving a request **auto-declines** other pending requests whose dates overlap.
4. Removing a tool (owner or admin) **auto-declines** its pending requests.
5. Loans are at most **30 days** long and start at most **90 days** ahead.
6. "Today" is computed in **UTC** on the server.
7. Signed-in users see the owner's **name + Trusted Lender badge**. Public visitors see name + category only.

## Loan state machine

```
requested ──approve (lender)──▶ approved ──markReturned (lender)──▶ returned
    │
    ├──decline (lender)──▶ declined
    └──cancel (borrower)─▶ cancelled
```

Every transition calls `recordLoanEvent(ctx, loan, event)` (`convex/automation/events.ts`). It is a no-op until Section 5, where it writes to the outbox and schedules the n8n webhook.

## Files

```
convex/
├── lib/
│   ├── dates.ts           today(), addDays(), isIsoDate(), date range validation
│   └── input.ts           cleanText(): trim + required + max length
├── automation/
│   └── events.ts          recordLoanEvent() (no-op until Section 5)
├── tools/
│   ├── helpers.ts         retireTool(): soft delete + auto-decline pending
│   ├── queries.ts         publicList, list, mine
│   └── mutations.ts       create, update, remove
├── loans/
│   ├── helpers.ts         findApprovedOverlap(), toLoanView()
│   ├── queries.ts         myRequests, incoming
│   └── mutations.ts       request, approve, decline, cancel, markReturned
└── admin/
    ├── queries.ts         allLoans, users
    └── mutations.ts       removeTool, setTrustedLender
```

`helpers.ts` = plain functions shared inside a domain (not registered Convex functions).

## Index changes

- `tools`: `by_category` → `by_active_category` (`removedAt`, `category`) so active-tool listing is an index scan.
- `loans`: `by_tool` → `by_tool_status` (`toolId`, `status`) for availability, overlap and pending counts.

## Functions

### Tools
| Function     | Access | Notes |
| ------------ | ------ | ----- |
| `publicList` | public | Active tools → `{ name, category }` only. |
| `list`       | user   | Optional `category`. Returns details, owner `{ name, trustedLender }`, `isMine`, `availability` (`available` / `on_loan`), upcoming `bookedRanges`, `hasPendingRequest`. |
| `mine`       | user   | Own active tools + `pendingCount` + `availability`. |
| `create`     | user   | Validated name/category/condition/description. |
| `update`     | owner  | Same validation. |
| `remove`     | owner  | Blocked by approved loan. Soft delete + auto-decline. |

### Loans
| Function       | Access   | Rules |
| -------------- | -------- | ----- |
| `request`      | user     | Not own tool, tool active, valid dates, no overlap with approved, no existing pending request by caller for this tool. |
| `approve`      | lender   | `requested` only, end date not passed, no overlap; auto-declines overlapping pending. |
| `decline`      | lender   | `requested` only. |
| `cancel`       | borrower | `requested` only. |
| `markReturned` | lender   | `approved` only. |
| `myRequests`   | user     | Caller's loans as borrower, with tool name + lender name. |
| `incoming`     | user     | Caller's loans as lender, with tool name + borrower name. |

Loan views include `isOverdue` (`approved` and `endDate < today`). No emails are ever returned to non-admins.

### Admin
| Function           | Notes |
| ------------------ | ----- |
| `allLoans`         | All loans with tool, lender, borrower names. |
| `users`            | Name, email, role, trustedLender, active listing count. |
| `removeTool`       | Any active tool; records `removedBy`; auto-declines pending. |
| `setTrustedLender` | Toggle badge. |

## Done when
- [ ] All functions deployed, typecheck + lint clean.
- [ ] Exercised via `npx convex run` / dashboard: happy path + rejected cases (own tool, overlap, wrong party, non-admin).
