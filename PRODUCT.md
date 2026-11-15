# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Neighbors in a single shared neighborhood. They own tools they rarely use (drills, ladders, tents, mixers) and occasionally need one they don't own. They use LendLoop on their phone or laptop to:

- see what's available nearby,
- list a tool they're willing to lend,
- request a tool for specific dates,
- answer requests on their own tools and confirm returns.

Admins are neighbors with extra moderation duties: removing inappropriate listings, overseeing all loans, and marking reliable lenders as "Trusted Lender".

## Product Purpose

A neighborhood tool-lending board: borrow what you need, lend what you don't. Success means a borrower can find a tool and send a request in under a minute, a lender can approve or decline from a single screen, and nobody has to chase a late return manually because reminders are automated.

## Positioning

Trust and privacy first. Neighbors only see what they need: the public board shows tool name and category only, signed-in users see an owner's name and Trusted Lender badge but never contact details. Loan status is always explicit, and notifications and overdue reminders happen automatically, so lending to a neighbor doesn't mean awkward follow-ups.

## Operating Context

- Loan lifecycle: requested → approved / declined / cancelled; approved → returned. Approved loans past their end date are overdue.
- Notifications (new request, approval, decline, cancellation, return) and daily overdue reminders are sent by email via automated workflows. The app shows recent automation activity on each loan (e.g. "Reminder sent 2 days ago").
- Loans: at most 30 days long, start at most 90 days ahead; dates are whole days.

## Capabilities and Constraints

- Public page: name + tagline, read-only list of currently available tools (name and category only), sign-in CTA.
- Signed-in: browse all tools with availability and category filter; My listings; My requests; Incoming requests; Admin area for admins.
- Categories: power tools, hand tools, garden, kitchen, camping, cleaning, ladders & moving, other.
- Conditions: new, like new, good, fair, worn.
- Roles: `user`, `admin`. Every rule is enforced server-side; UI hides actions a user can't take but is never the security boundary.
- No tool photos, no messaging between neighbors, no payments.
- Stack: Next.js App Router, Clerk, Convex, shadcn/ui (Base UI), Tailwind v4.

## Brand Commitments

- Name: LendLoop.
- Tagline: "Borrow what you need. Lend what you don't."
- Voice: plain, friendly, neighborly; short sentences; no jargon.

## Evidence on Hand

None. No real neighborhoods, user counts, testimonials or stats exist; do not fabricate them.

## Product Principles

1. Show only what's needed: every screen exposes the minimum personal information for the task.
2. Status is never ambiguous: each loan clearly says where it stands and what happens next.
3. The next action is obvious: requests waiting on you are the first thing you see.
4. Automation is visible: when the system notifies or reminds someone, the loan shows it.

## Accessibility & Inclusion

WCAG 2.2 AA. shadcn/Base UI covers component-level semantics; the product owns contrast, non-color status cues, form labelling, landmarks/headings, touch target sizes, and reduced-motion support.
