# LendLoop

Borrow what you need. Lend what you don't.

> Setup, architecture, and security sections are written in Section 9 (see `docs/PLAN.md`).

## Design decisions

### Roles are stored in Convex, not Clerk

User roles (`user` / `admin`) live in the Convex `users` table rather than in Clerk `publicMetadata`.

This is a deliberate choice driven by how Convex works. Convex queries are reactive: when a row changes, every subscribed client gets the new data immediately, and every function call reads the current database state. If an admin is demoted, the change takes effect on their very next call and their open UI updates instantly. A role carried inside the Clerk JWT would stay valid until the token refreshes (about 60 seconds).

With a conventional backend (NestJS, Express, or another plain REST API), I would keep the role in Clerk `publicMetadata` and read it from the session token. That avoids a database lookup on every request, and the short refresh window is an acceptable trade-off there.
