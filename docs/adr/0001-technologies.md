# 0001 — Technology choices for Backend Stackbuilders

## Context

This project implements a small HTTP API that crawls Hacker News, filters results, and optionally persists usage logs. It targets modern Node.js environments and aims for good developer ergonomics, testability, and simple deployability (Docker).

Key constraints and requirements:

- Fast development iteration and strong DX
- Type safety across the codebase
- Robust HTML parsing for scraping
- Optional persistence of usage logs in a document DB
- Auto-generated API documentation and basic security/hardening

## Decision

We use the following primary technologies:

- Node.js (v24+) — Chosen for ecosystem maturity and native modern JS/TS support.
- TypeScript — language for type safety and improved maintainability.
- Mongoose + MongoDB — ODM and database for usage logs.
- Redis (ioredis) — optional cache for Hacker News HTML responses.
- Jest + ts-jest — testing framework for unit and integration tests.
- Docker / Docker Compose — containerization for consistent environment.

## Rationale

- Express: Lightweight and well-known, keeping the app simple; integrates easily with middleware (validation, rate-limiting, docs).
- Redis: Fast in-memory store that reduces upstream requests while remaining optional for local/dev setups.

## Alternatives considered

- NestJS: Provides structure and DI, but would add framework complexity and boilerplate for this small service.
- Prisma + Postgres: Strong typed DB layer, but heavier operational requirements for just usage logs.

## Consequences

- Positive:
  - Quick onboarding and simple codebase.
  - Good developer experience and maintainability via TypeScript, ESLint, Prettier, and Jest.
  - Low runtime overhead; easy to deploy in containers.
- Negative / Risks:

Mitigations:

## Related

- None yet.

## Authors

Juan