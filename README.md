<div align="center">

<img src="public/icon.svg" alt="EraVault Logo" width="120" />

# 🗄️ ERAVAULT

### Enterprise-Grade, Zero-Compression Media Vault & Edge AI Tagging Engine

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Version](https://img.shields.io/badge/version-1.0.0-success.svg)]()
[![Build](https://img.shields.io/badge/build-passing-brightgreen.svg)]()
[![Next.js](https://img.shields.io/badge/Next.js-15-black.svg?logo=next.js)]()
[![React](https://img.shields.io/badge/React-19-61DAFB.svg?logo=react)]()
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6.svg?logo=typescript)]()
[![Docker](https://img.shields.io/badge/Docker-Ready-2496ED.svg?logo=docker)]()
[![Cloudflare](https://img.shields.io/badge/Deploy-Cloudflare%20Pages-F38020.svg?logo=cloudflare)]()
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)]()

**Zero-compression storage. Bit-for-bit preservation. AI that tags your media before you even ask.**

[Live Demo](#) · [Documentation](#-table-of-contents) · [Report Bug](#-troubleshooting) · [Request Feature](#-roadmap)

<br/>

<img src="docs/screenshots/dashboard-dark.png" alt="EraVault Dashboard Screenshot" width="800" />

<sub>Dashboard · Collections · AI Tagging Console (placeholder screenshots — replace with production captures)</sub>

</div>

<br/>

> [!NOTE]
> EraVault is under active development. APIs, environment variable names, and folder structures documented here reflect the `main` branch as of the latest release. Always check the [CHANGELOG](#-roadmap) before upgrading a production deployment.

---

## 📖 Table of Contents

<details open>
<summary><b>Click to expand full documentation index</b></summary>

1. [Executive Summary](#-executive-summary)
2. [Features](#-features)
3. [Why EraVault](#-why-eravault)
4. [Problems Solved](#-problems-solved)
5. [System Architecture](#-system-architecture)
6. [Architecture Overview](#-architecture-overview)
7. [Complete Technology Stack](#-complete-technology-stack)
8. [Engineering Pillars](#-engineering-pillars)
9. [AI Pipeline](#-ai-pipeline)
10. [Database Architecture](#-database-architecture)
11. [Folder Structure](#-folder-structure)
12. [Installation](#-installation)
13. [Local Development](#-local-development)
14. [Environment Variables](#-environment-variables)
15. [Docker](#-docker)
16. [Cloudflare Deployment](#-cloudflare-deployment)
17. [Performance Optimizations](#-performance-optimizations)
18. [Security](#-security)
19. [API Overview](#-api-overview)
20. [UI Overview](#-ui-overview)
21. [Image Upload Flow](#-image-upload-flow)
22. [AI Metadata Flow](#-ai-metadata-flow)
23. [Search Architecture](#-search-architecture)
24. [Deployment Pipeline](#-deployment-pipeline)
25. [CI/CD Recommendations](#-cicd-recommendations)
26. [Monitoring](#-monitoring)
27. [Logging](#-logging)
28. [Error Handling](#-error-handling)
29. [Backup Strategy](#-backup-strategy)
30. [Scaling Strategy](#-scaling-strategy)
31. [Production Checklist](#-production-checklist)
32. [Troubleshooting](#-troubleshooting)
33. [FAQ](#-faq)
34. [Roadmap](#-roadmap)
35. [Contributing Guide](#-contributing-guide)
36. [License](#-license)
37. [Credits](#-credits)

</details>

---

## 📌 Executive Summary

**EraVault** is a high-performance enterprise media management platform purpose-built for organizations where the fidelity of a visual asset is not negotiable — architectural studios, RAW photography houses, design agencies, digital archives, and brand asset libraries. Traditional cloud media pipelines (S3 + CDN + image proxy, or consumer tools like Google Photos) apply silent lossy compression, strip embedded EXIF/IPTC metadata, and re-encode color profiles to save bandwidth. For most consumer use cases this is invisible. For professional and enterprise use cases, it is a slow, cumulative act of data corruption.

EraVault solves this by treating **zero-compression as a first-class architectural constraint**, not an afterthought. Every byte a user uploads is the byte that gets served back, forever — a property we call **mathematical immutability**. On top of that immutable storage layer, EraVault layers an **autonomous AI tagging engine** powered by Google Gemini Vision, which inspects every uploaded asset and generates structured metadata — tags, dominant colors, descriptive captions — without any human intervention.

The platform is built on a modern, edge-first stack: **Next.js 15** (App Router, React 19 Server Components), **TypeScript** end-to-end, **Prisma ORM** against **Neon Serverless PostgreSQL**, **Clerk** for zero-trust authentication, **ImgBB** as an external immutable object store, and dual deployment targets of **Docker** (self-hosted, Kubernetes-ready) and **Cloudflare Pages/Workers** (global edge distribution).

This README is the canonical technical reference for engineers, DevOps teams, and contributors working with EraVault — covering architecture, deployment, security, and operations in the depth expected of a production system serving enterprise customers.

---

## ✨ Features

| Category | Capability | Description |
|---|---|---|
| 🖼️ Storage | Zero-Compression Upload | Original file bytes are preserved exactly; no server-side re-encoding |
| 🖼️ Storage | Bit-for-Bit Preservation | Cryptographic checksum validation on ingest and retrieval |
| 🤖 AI | Automatic Tagging | Gemini Vision generates contextual tags per image on upload |
| 🤖 AI | Color Extraction | Dominant palette (hex codes) extracted and indexed for search |
| 🤖 AI | Metadata Generation | Auto-generated captions, object detection labels, scene context |
| 🔐 Auth | Enterprise Authentication | Clerk-based session management with edge middleware enforcement |
| 📊 Dashboard | Secure Dashboard | Per-user asset library with real-time upload status |
| 🗂️ Organization | Collections | Group assets into named, shareable collections |
| 🔎 Search | Full-Text + Tag Search | Query by AI tags, filename, color, or collection |
| 📱 UI | Responsive Design | Mobile-first layout using TailwindCSS + Framer Motion |
| 📲 PWA | Installable App | Offline shell, manifest, and service worker support |
| 🐳 Deployment | Docker-Ready | Multi-stage, non-root, standalone production image |
| ☁️ Deployment | Cloudflare-Native | Edge Worker deployment via `@cloudflare/next-on-pages` |
| ⚡ Architecture | Serverless Database | Neon PostgreSQL with connection pooling for cold-start resilience |

---

## 🎯 Why EraVault

Most media platforms are optimized for **storage cost**, not **data fidelity**. That trade-off is invisible to casual users and catastrophic for professionals whose business depends on the exact pixel, the exact color profile, the exact metadata embedded in a file at the moment of capture.

EraVault inverts the priority stack:

1. **Fidelity first.** The file you uploaded is the file you get back — always.
2. **Intelligence without labor.** AI tagging removes the manual cataloging tax that kills large asset libraries.
3. **Composable infrastructure.** Every layer (auth, storage, database, AI, compute) is a swappable, independently scalable service — no monolithic vendor lock-in.
4. **Deploy anywhere.** The same codebase runs as a self-hosted Docker container or a globally distributed Cloudflare Worker.

---

## 🧩 Problems Solved

| Problem | Traditional Approach | EraVault Approach |
|---|---|---|
| Lossy re-compression on upload | CDNs/image services auto-optimize (WebP/AVIF re-encode) | Direct, unmodified byte storage via external object node |
| Stripped EXIF/IPTC metadata | Most CDNs discard metadata to reduce payload | Metadata extracted *and* preserved separately in structured DB |
| Manual asset tagging | Human cataloging, inconsistent taxonomies | Autonomous Gemini Vision tagging pipeline |
| Vendor lock-in on storage | Proprietary CDN APIs | Storage abstraction layer, swappable object provider |
| Slow cold starts on serverless DB | Traditional pooled Postgres timing out on scale-to-zero | Neon serverless driver with edge-compatible pooling |
| Fragmented dev/prod parity | "Works on my machine" | Identical standalone Docker image for dev, staging, prod |

---

## 🏗 System Architecture

```mermaid
flowchart TD
    A[👤 Client Browser / PWA] -->|HTTPS| B[Next.js 15 App Router]
    B --> C{Clerk Edge Middleware}
    C -->|Unauthenticated| D[Sign-In / Sign-Up]
    C -->|Authenticated| E[Dashboard Route Handlers]
    E --> F[Prisma ORM Client]
    F --> G[(Neon Serverless PostgreSQL)]
    E -->|Direct Upload| H[ImgBB Object Storage]
    H -->|Immutable URL| F
    E -->|Async Trigger| I[Google Gemini Vision AI]
    I -->|Tags / Colors / Caption| F
    B -->|Static + Edge Assets| J[Cloudflare Workers / Pages]
    G -->|Search Index| E
```

### ASCII Overview

```text
+-------------------+       +-----------------------+       +-------------------+
|                   |       |                       |       |                   |
|   Client / User   +------>+    Next.js 15 App     +------>+    Clerk Auth     |
|  (Uploads Media)  |       |  (Edge & Standalone)  |       | (Zero-Trust JWT)  |
|                   |       |                       |       |                   |
+---------+---------+       +-----------+-----------+       +-------------------+
          |                             |
          |                             v
          |                 +-----------------------+       +-------------------+
          |                 |                       |       |                   |
          +---------------->+   ImgBB External      |       |  Neon Serverless  |
           Direct Upload    |   Storage Node        |       |  PostgreSQL       |
                            |                       |       |                   |
                            +-----------+-----------+       +---------+---------+
                                        |                             ^
                                        v                             |
                            +-----------------------+                 |
                            |                       |                 |
                            |  Gemini Edge AI       +-----------------+
                            |  (Computer Vision)    |   Auto-Tagging Metadata
                            |                       |
                            +-----------------------+
```

---

## 🔍 Architecture Overview

| Service | Role | Notes |
|---|---|---|
| **Next.js App Router** | Request orchestration, SSR/RSC rendering, API route handlers | Runs standalone (Docker) or as edge Workers (Cloudflare) |
| **Clerk** | Identity provider and session middleware | Validates JWTs at the edge before requests reach business logic |
| **Prisma ORM** | Type-safe database access layer | Generates client from `schema.prisma`, migrations via `prisma migrate` |
| **Neon PostgreSQL** | Primary relational data store | Serverless, autoscaling, branchable databases for preview environments |
| **ImgBB** | External immutable object storage | Receives raw bytes directly from the client where possible, bypassing app server memory |
| **Google Gemini Vision** | Computer vision & metadata generation | Invoked asynchronously post-upload via a queued trigger |
| **Cloudflare Pages/Workers** | Global edge compute and static delivery | Same codebase compiled via `@cloudflare/next-on-pages` |

> [!IMPORTANT]
> The application server never buffers full-resolution media in memory during upload. Large payloads are routed directly to ImgBB using signed, short-lived upload targets — keeping the Next.js compute layer thin and stateless.

---

## 🛠 Complete Technology Stack

| Layer | Technology | Purpose | Advantages |
|---|---|---|---|
| Framework | Next.js 15 | App Router, RSC, route handlers, hybrid rendering | Fine-grained caching, edge/node runtime flexibility |
| UI Library | React 19 | Component model, concurrent rendering | Server Components reduce client JS payload |
| Language | TypeScript | Static typing across frontend/backend | Compile-time safety, superior refactoring, self-documenting APIs |
| Styling | TailwindCSS | Utility-first CSS | Small production CSS footprint, design consistency |
| Motion | Framer Motion | Declarative animation | GPU-accelerated transitions, gesture support |
| Icons | Lucide Icons | SVG icon system | Tree-shakeable, consistent visual language |
| ORM | Prisma | Type-safe DB client & migrations | Auto-generated types, declarative schema, migration history |
| Database | Neon PostgreSQL | Serverless relational storage | Scale-to-zero, branching, connection pooling for edge |
| Auth | Clerk | Identity & session management | Prebuilt UI, edge JWT verification, MFA support |
| Storage | ImgBB API | External immutable object storage | Zero re-compression, simple REST integration |
| AI | Google Gemini Vision | Image understanding & tagging | Multi-modal reasoning, high accuracy captioning |
| Container | Docker (Alpine) | Reproducible runtime environment | ~110MB standalone image, non-root execution |
| Orchestration | Docker Compose | Local multi-service orchestration | One-command environment parity |
| Edge Deploy | Cloudflare Pages/Workers | Global edge compute | Sub-50ms cold starts, 300+ PoPs |
| CI/CD | GitHub Actions | Build/test/deploy automation | Native GitHub integration, matrix builds |

---

## 🏛 Engineering Pillars

<details>
<summary><b>1. Mathematical Immutability</b></summary>

<br/>

Once an asset is written to the storage layer, its byte sequence is never rewritten, re-encoded, or transformed by EraVault infrastructure. The system computes and stores a content hash at ingest time, and every retrieval path can be verified against that hash. This gives archival-grade guarantees: what you uploaded in 2024 is byte-identical to what you download in 2034.
</details>

<details>
<summary><b>2. Zero Compression</b></summary>

<br/>

Most storage services apply automatic transcoding (e.g., JPEG requantization, WebP conversion) to reduce bandwidth costs. EraVault explicitly disables any such pipeline. Uploads are streamed to ImgBB in their original binary form, and the platform never generates a "web-optimized" derivative unless a user explicitly requests a resized preview — which is stored as a separate, clearly labeled derivative, never as a replacement for the source.
</details>

<details>
<summary><b>3. Direct Storage</b></summary>

<br/>

Large files bypass the Next.js application server entirely where possible. The client requests a signed upload target, then streams bytes directly to ImgBB. This removes the application server from the data path for the heaviest operation in the system, keeping compute costs low and horizontal scaling trivial — the app tier stays stateless and CPU-light.
</details>

<details>
<summary><b>4. Edge AI</b></summary>

<br/>

Metadata generation is decoupled from the upload request/response cycle. After a successful upload, an asynchronous job invokes Gemini Vision against the immutable asset URL. This keeps the user-facing upload latency low (bound only by storage write time) while AI enrichment happens in the background and updates the UI via polling or optimistic revalidation.
</details>

<details>
<summary><b>5. Metadata Pipeline</b></summary>

<br/>

Every asset accumulates two metadata layers: (a) technical metadata (dimensions, MIME type, checksum, upload timestamp) captured deterministically at ingest, and (b) semantic metadata (tags, caption, dominant colors) generated by AI. Both layers are normalized into relational tables for efficient filtering and full-text search.
</details>

<details>
<summary><b>6. Security</b></summary>

<br/>

Authentication is enforced at the edge via Clerk middleware before any route handler executes. All secrets are environment-scoped and never bundled into client JavaScript. Docker containers run as a non-root user. Rate limiting and input validation guard every mutating API route.
</details>

<details>
<summary><b>7. Scalability</b></summary>

<br/>

The application tier is stateless by design — any request can be served by any instance. The database uses Neon's serverless connection pooling to survive bursty, edge-originated traffic without exhausting connection limits. Storage scales independently via the external object provider.
</details>

<details>
<summary><b>8. Cloud Native</b></summary>

<br/>

EraVault has no hard dependency on any single cloud vendor. It runs identically as a Docker container on any container orchestrator, or as edge Workers on Cloudflare. Database and storage are both externalized, serverless services reachable over HTTPS from anywhere.
</details>

<details>
<summary><b>9. Performance</b></summary>

<br/>

React Server Components minimize client-side JavaScript. Route-level caching, streaming SSR, and edge-deployed compute combine to deliver sub-second Time to Interactive on modern connections, even for image-heavy dashboard views.
</details>

<details>
<summary><b>10. Developer Experience</b></summary>

<br/>

End-to-end TypeScript, Prisma's generated types, a single `docker compose up` for full-stack local development, and a well-documented environment variable contract mean new contributors can be productive within minutes, not days.
</details>

---

## 🤖 AI Pipeline

```mermaid
sequenceDiagram
    participant U as User
    participant N as Next.js API
    participant S as ImgBB Storage
    participant G as Gemini Vision
    participant D as Neon PostgreSQL

    U->>N: Upload image
    N->>S: Stream raw bytes
    S-->>N: Immutable asset URL
    N->>D: Persist asset record (pending)
    N-->>U: Upload confirmed (instant)
    N->>G: Analyze asset URL (async)
    G-->>N: Tags + Colors + Caption
    N->>D: Update asset record (enriched)
    U->>N: Poll / revalidate
    N->>D: Query enriched metadata
    D-->>U: Tags visible in dashboard
```

**Pipeline stages:**

```
Upload → Gemini Vision → Color Detection → Tag Extraction → Metadata Normalization → Database Write → Search Index
```

Each stage is independently retryable. If Gemini enrichment fails (rate limit, transient network error), the asset remains fully accessible with base technical metadata, and a background retry job re-attempts enrichment with exponential backoff.

---

## 🗃 Database Architecture

```mermaid
erDiagram
    USER ||--o{ IMAGE : uploads
    USER ||--o{ COLLECTION : owns
    COLLECTION ||--o{ IMAGE : contains
    IMAGE ||--o{ TAG : tagged_with
    IMAGE ||--o{ COLOR : has_palette

    USER {
        string id PK
        string clerkId
        string email
        datetime createdAt
    }
    IMAGE {
        string id PK
        string userId FK
        string collectionId FK
        string url
        string checksum
        string caption
        int width
        int height
        datetime uploadedAt
    }
    COLLECTION {
        string id PK
        string userId FK
        string name
        string description
    }
    TAG {
        string id PK
        string imageId FK
        string label
        float confidence
    }
    COLOR {
        string id PK
        string imageId FK
        string hex
        float weight
    }
```

Prisma's schema-first workflow means this ER diagram maps directly to `prisma/schema.prisma`. Migrations are generated and applied via `prisma migrate dev` locally and `prisma migrate deploy` in CI/CD, keeping schema history fully versioned and auditable.

---

## 📁 Folder Structure

```text
eravault/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (auth)/             # Sign-in / sign-up route group
│   │   ├── (dashboard)/        # Authenticated dashboard routes
│   │   │   ├── collections/    # Collection management UI
│   │   │   ├── search/         # Search interface
│   │   │   └── settings/       # Account settings
│   │   ├── api/                # Route handlers (REST-style API)
│   │   │   ├── upload/         # Upload orchestration endpoint
│   │   │   ├── ai/             # Gemini enrichment trigger
│   │   │   ├── images/         # CRUD for image records
│   │   │   └── collections/    # CRUD for collections
│   │   ├── layout.tsx
│   │   └── globals.css
│   ├── components/             # Reusable React components
│   │   ├── ui/                 # Design system primitives
│   │   ├── upload/             # Upload widgets
│   │   └── gallery/            # Image grid, lightbox
│   ├── lib/
│   │   ├── prisma.ts           # Prisma client singleton
│   │   ├── clerk.ts            # Auth helpers
│   │   ├── imgbb.ts            # Storage client
│   │   └── gemini.ts           # AI client wrapper
│   └── middleware.ts           # Clerk edge middleware
├── prisma/
│   ├── schema.prisma           # Database schema
│   └── migrations/             # Versioned migration history
├── public/                     # Static assets, manifest.json
├── docker/
│   └── Dockerfile
├── docker-compose.yml
├── next.config.js
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

| Folder | Purpose |
|---|---|
| `src/app/(auth)` | Public authentication routes, rendered without dashboard chrome |
| `src/app/(dashboard)` | Protected routes; guarded by Clerk middleware |
| `src/app/api` | Server-side route handlers; the only layer that talks to Prisma/ImgBB/Gemini |
| `src/components/ui` | Headless, reusable design primitives (buttons, modals, inputs) |
| `src/lib` | Singleton clients and integration wrappers — the seam between app code and third-party services |
| `prisma/` | Single source of truth for the data model |
| `docker/` | Container build definitions |

---

## ⚙️ Installation

### Requirements

| Tool | Minimum Version | Check Command |
|---|---|---|
| Node.js | 20.x LTS | `node -v` |
| npm | 10.x | `npm -v` |
| Docker | 24.x | `docker -v` |
| Docker Compose | 2.x | `docker compose version` |
| Git | 2.40+ | `git --version` |

```bash
# Verify prerequisites
node -v && npm -v && docker -v && git --version
```

---

## 💻 Local Development

```bash
# 1. Clone the repository
git clone https://github.com/your-org/eravault.git
cd eravault

# 2. Install dependencies
npm install

# 3. Configure environment
cp .env.example .env.local
# then edit .env.local with your credentials (see Environment Variables section)

# 4. Apply database migrations
npx prisma migrate dev

# 5. Start the development server
npm run dev
```

Visit `http://localhost:3000`.

---

## 🔑 Environment Variables

Create `.env.local` at the project root:

```bash
# ── Database (Neon Serverless PostgreSQL) ──────────────────────────
DATABASE_URL="postgres://user:password@endpoint.neon.tech/neondb?sslmode=require"

# ── ImgBB Storage API ───────────────────────────────────────────────
NEXT_PUBLIC_IMGBB_API_KEY="your_imgbb_api_key"

# ── Clerk Authentication ────────────────────────────────────────────
CLERK_SECRET_KEY="sk_live_xxxxxxxxxxxxxxxxxxxx"
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_live_xxxxxxxxxxxxxxxxxxxx"
NEXT_PUBLIC_CLERK_SIGN_IN_URL="/sign-in"
NEXT_PUBLIC_CLERK_SIGN_UP_URL="/sign-up"
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL="/dashboard"
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL="/dashboard"

# ── Google Gemini Vision AI ─────────────────────────────────────────
GEMINI_API_KEY="AIzaSyxxxxxxxxxxxxxxxxxxxxxxxxxxx"
```

| Variable | Required | Description |
|---|---|---|
| `DATABASE_URL` | ✅ | Neon PostgreSQL connection string; must include `sslmode=require` for production |
| `NEXT_PUBLIC_IMGBB_API_KEY` | ✅ | Public key used for direct client-to-storage uploads |
| `CLERK_SECRET_KEY` | ✅ | Server-only secret; never expose to the client bundle |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | ✅ | Public key initializing Clerk's client SDK |
| `NEXT_PUBLIC_CLERK_SIGN_IN_URL` | ✅ | Route Clerk redirects to for sign-in |
| `NEXT_PUBLIC_CLERK_SIGN_UP_URL` | ✅ | Route Clerk redirects to for sign-up |
| `NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL` | ✅ | Post-authentication redirect target |
| `NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL` | ✅ | Post-registration redirect target |
| `GEMINI_API_KEY` | ✅ | Server-only key authorizing Gemini Vision API calls |

> [!WARNING]
> Never commit `.env.local` to version control. `CLERK_SECRET_KEY` and `GEMINI_API_KEY` must remain server-side secrets — any variable without the `NEXT_PUBLIC_` prefix is excluded from the client bundle by Next.js convention, but this is a convention, not a sandbox. Audit your route handlers to ensure secrets never leak into API responses.

---

## 🐳 Docker

### Multi-Stage Dockerfile

```dockerfile
# ── Stage 1: Dependencies ───────────────────────────────────────────
FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --omit=dev

# ── Stage 2: Builder ─────────────────────────────────────────────────
FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ARG NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
ARG NEXT_PUBLIC_IMGBB_API_KEY
ENV NEXT_TELEMETRY_DISABLED=1
RUN npx prisma generate
RUN npm run build

# ── Stage 3: Runner ──────────────────────────────────────────────────
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs \
    && adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs
EXPOSE 3000
ENV PORT=3000
CMD ["node", "server.js"]
```

### docker-compose.yml

```yaml
version: "3.9"

services:
  eravault:
    build:
      context: .
      dockerfile: docker/Dockerfile
      args:
        NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: ${NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY}
        NEXT_PUBLIC_IMGBB_API_KEY: ${NEXT_PUBLIC_IMGBB_API_KEY}
    ports:
      - "3000:3000"
    env_file:
      - .env.local
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "wget", "--spider", "-q", "http://localhost:3000/api/health"]
      interval: 30s
      timeout: 5s
      retries: 3
```

```bash
# Build and start
docker compose up --build -d

# View logs
docker compose logs -f eravault

# Stop
docker compose down
```

| Design Decision | Rationale |
|---|---|
| Multi-stage build | Final image excludes build tools and dev dependencies (~110MB vs ~1.2GB) |
| `output: 'standalone'` | Next.js bundles only the required server files and traced `node_modules` |
| Non-root user (`uid 1001`) | Prevents container breakout escalating to host root |
| `ARG` for public keys | Public Clerk/ImgBB keys are safe to bake at build time |
| `env_file` for secrets | Server-only secrets injected at runtime, never baked into image layers |
| Healthcheck | Enables orchestrators (Swarm, Kubernetes, ECS) to detect and restart unhealthy containers |

---

## ☁️ Cloudflare Deployment

```bash
# Install the Cloudflare adapter
npm install -D @cloudflare/next-on-pages

# Build for Cloudflare Pages
npx @cloudflare/next-on-pages

# Deploy via Wrangler
npx wrangler pages deploy .vercel/output/static --project-name=eravault
```

| Concept | Explanation |
|---|---|
| **Workers** | Compiled route handlers execute as V8 isolates at 300+ global edge locations |
| **Pages** | Static assets and prerendered routes served from Cloudflare's CDN |
| **Edge Runtime** | Route handlers declaring `export const runtime = 'edge'` run on Workers, not Node |
| **Build** | `@cloudflare/next-on-pages` transforms the standard Next.js build into Worker-compatible output |
| **Caching** | Cache-Control headers on static routes are honored by Cloudflare's edge cache automatically |
| **Performance** | Cold starts measured in single-digit milliseconds due to V8 isolate architecture (no container boot) |

> [!TIP]
> Neon's serverless driver (`@neondatabase/serverless`) is required for database access from Cloudflare Workers, since the standard `pg` driver relies on TCP sockets unavailable in the Workers runtime.

---

## ⚡ Performance Optimizations

| Technique | Layer | Impact |
|---|---|---|
| React Server Components | Rendering | Reduces client JS bundle size by rendering non-interactive UI on the server |
| Route-level caching | Next.js | `revalidate` tags minimize redundant database queries |
| Direct-to-storage uploads | Storage | Removes large payloads from application server memory |
| Edge middleware auth | Auth | Rejects unauthenticated requests before hitting compute-heavy handlers |
| Connection pooling | Database | Neon's pooled driver prevents connection exhaustion under edge concurrency |
| Image lazy loading | UI | Native `loading="lazy"` + IntersectionObserver-based gallery virtualization |
| Standalone Docker output | Deployment | Smaller image size reduces cold start and deployment time |
| Async AI enrichment | AI Pipeline | Decouples upload latency from Gemini API response time |

---

## 🔐 Security

| Control | Implementation |
|---|---|
| **Authentication** | Clerk-issued JWTs validated in edge middleware on every request to protected routes |
| **Session Management** | Short-lived tokens with automatic silent refresh |
| **Secrets** | Server-only environment variables; never exposed via `NEXT_PUBLIC_` prefix |
| **Docker Hardening** | Non-root user, minimal Alpine base, no dev dependencies in final image |
| **Rate Limiting** | Per-user/IP request throttling on `/api/upload` and `/api/ai` routes |
| **Input Validation** | Schema validation (e.g., Zod) on every mutating API route before database writes |
| **Transport Security** | HTTPS enforced end-to-end; `sslmode=require` on all database connections |
| **CORS Policy** | API routes restrict origins to the deployed application domain |

---

## 🔌 API Overview

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `POST` | `/api/upload` | Initiates direct-to-storage upload and creates a pending image record | ✅ |
| `POST` | `/api/ai/enrich` | Triggers Gemini Vision analysis for a given asset ID | ✅ |
| `GET` | `/api/images` | Lists images for the authenticated user, paginated | ✅ |
| `GET` | `/api/images/:id` | Fetches full metadata for a single image | ✅ |
| `DELETE` | `/api/images/:id` | Deletes an image record and its storage reference | ✅ |
| `GET` | `/api/collections` | Lists collections owned by the user | ✅ |
| `POST` | `/api/collections` | Creates a new collection | ✅ |
| `GET` | `/api/search` | Full-text and tag-based search across the user's library | ✅ |
| `GET` | `/api/health` | Liveness/readiness probe for orchestrators | ❌ |

---

## 🖥 UI Overview

| Page | Route | Description |
|---|---|---|
| Landing | `/` | Marketing overview and sign-up call-to-action |
| Sign In | `/sign-in` | Clerk-hosted authentication form |
| Sign Up | `/sign-up` | Account creation flow |
| Dashboard | `/dashboard` | Primary asset grid with upload widget |
| Collection Detail | `/dashboard/collections/[id]` | Filtered view of assets within a collection |
| Search | `/dashboard/search` | Query interface with tag/color filters |
| Settings | `/dashboard/settings` | Account and API key management |

---

## 📤 Image Upload Flow

```mermaid
sequenceDiagram
    participant U as User Browser
    participant A as Next.js API
    participant S as ImgBB
    participant D as Database

    U->>A: POST /api/upload (metadata only)
    A->>D: Create pending record
    A-->>U: Signed upload target
    U->>S: PUT raw file bytes (direct)
    S-->>U: Public immutable URL
    U->>A: PATCH /api/images/:id (confirm URL)
    A->>D: Update record → status: complete
```

---

## 🧠 AI Metadata Flow

```mermaid
flowchart LR
    A[Image Uploaded] --> B[Async Enrichment Job Queued]
    B --> C[Gemini Vision Analysis]
    C --> D[Extract Tags]
    C --> E[Extract Dominant Colors]
    C --> F[Generate Caption]
    D --> G[(PostgreSQL)]
    E --> G
    F --> G
    G --> H[Search Index Updated]
```

---

## 🔎 Search Architecture

```mermaid
flowchart TD
    A[Search Query] --> B{Query Type}
    B -->|Text| C[Postgres Full-Text Search]
    B -->|Tag Filter| D[Tag Join Query]
    B -->|Color Filter| E[Hex Proximity Match]
    C --> F[Ranked Results]
    D --> F
    E --> F
    F --> G[Paginated Response]
```

---

## 🚀 Deployment Pipeline

```text
GitHub (push/PR)
      ↓
GitHub Actions (lint, typecheck, test, build)
      ↓
Docker Image Build & Push  ──────────►  Container Registry
      ↓                                        ↓
Cloudflare Pages Build                  Self-Hosted / K8s Pull
      ↓                                        ↓
Production (Edge)                       Production (Container)
```

---

## 🔁 CI/CD Recommendations

```yaml
# .github/workflows/ci.yml
name: CI

on:
  push:
    branches: [main]
  pull_request:

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: "npm"
      - run: npm ci
      - run: npx prisma generate
      - run: npm run lint
      - run: npm run typecheck
      - run: npm run build
```

| Stage | Recommended Tool | Purpose |
|---|---|---|
| Lint | ESLint | Enforce code style and catch bugs early |
| Type Check | `tsc --noEmit` | Verify TypeScript correctness before build |
| Test | Vitest / Jest | Unit and integration coverage |
| Build | `next build` | Production compilation and route analysis |
| Deploy (Edge) | Wrangler CLI | Automated Cloudflare Pages deployment |
| Deploy (Container) | Docker Buildx | Multi-arch image build and registry push |

---

## 📈 Monitoring

- **Application**: Integrate Vercel Analytics or an OpenTelemetry-compatible APM (e.g., Sentry Performance, Datadog RUM).
- **Database**: Neon's built-in dashboard exposes query latency, connection count, and storage growth.
- **Edge**: Cloudflare Analytics provides request volume, cache hit ratio, and Worker CPU time per route.
- **Uptime**: Point an external monitor (e.g., Better Uptime, UptimeRobot) at `/api/health`.

---

## 📝 Logging

- Structured JSON logs from all API route handlers, tagged with `requestId`, `userId`, and `route`.
- In containerized deployments, logs are written to `stdout`/`stderr` and collected by the orchestrator's log driver (e.g., `json-file`, Fluent Bit, CloudWatch Logs).
- On Cloudflare, use `wrangler tail` for real-time Worker log streaming, or forward logs to Logpush.

---

## 🧯 Error Handling

| Layer | Strategy |
|---|---|
| API Routes | Centralized error middleware returning normalized `{ error, code }` JSON payloads |
| Database | Prisma error codes mapped to user-friendly messages (e.g., unique constraint → "already exists") |
| AI Pipeline | Failures marked as `enrichment_failed`; asset remains usable with base metadata |
| Client | React Error Boundaries around gallery and upload widgets prevent full-page crashes |

---

## 💾 Backup Strategy

- **Database**: Neon supports point-in-time recovery and automated daily snapshots; enable branch-based backups for pre-migration safety nets.
- **Storage**: Since ImgBB is the source of truth for binary assets, periodically export the `Image.url` + `Image.checksum` table to a secondary cold-storage bucket for disaster recovery.
- **Configuration**: Store `.env` templates and infrastructure-as-code (Terraform/Wrangler config) in a private, version-controlled repository.

---

## 📊 Scaling Strategy

| Dimension | Strategy |
|---|---|
| Compute | Stateless app tier scales horizontally behind a load balancer or via Cloudflare's automatic edge scaling |
| Database | Neon autoscales compute; use read replicas for search-heavy workloads at high tenant counts |
| Storage | Externalized to ImgBB; scales independently of application infrastructure |
| AI | Queue enrichment jobs (e.g., via a lightweight job table or external queue) to smooth Gemini API rate limits under burst load |

---

## ✅ Production Checklist

- [ ] All environment variables set via secrets manager, not `.env` files
- [ ] `DATABASE_URL` uses `sslmode=require`
- [ ] Clerk production instance configured with correct redirect URLs
- [ ] Docker image built with `NODE_ENV=production`
- [ ] Non-root user verified (`docker exec <container> whoami`)
- [ ] Health check endpoint returning `200`
- [ ] Rate limiting enabled on upload and AI endpoints
- [ ] Database migrations applied via `prisma migrate deploy`
- [ ] Monitoring and alerting wired to `/api/health`
- [ ] Backup schedule confirmed on Neon dashboard

---

## 🛠 Troubleshooting

<details>
<summary><b>Prisma client fails to generate in Docker build</b></summary>

Ensure `npx prisma generate` runs **before** `npm run build` in the builder stage, and that `prisma/schema.prisma` is copied into the image prior to that step.
</details>

<details>
<summary><b>Clerk redirects to the wrong URL after sign-in</b></summary>

Verify `NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL` matches an allowed redirect URL configured in your Clerk dashboard instance settings.
</details>

<details>
<summary><b>Uploads succeed but AI tags never appear</b></summary>

Check that `GEMINI_API_KEY` is valid and that the enrichment route is not being blocked by rate limiting. Inspect logs for `enrichment_failed` status on the affected image record.
</details>

<details>
<summary><b>Cloudflare deployment fails with a Node API error</b></summary>

Route handlers using Node-only APIs (e.g., `fs`, native `pg`) must be excluded from edge runtime routes or refactored to use edge-compatible equivalents (e.g., `@neondatabase/serverless`).
</details>

---

## ❓ FAQ

<details><summary><b>1. Does EraVault compress my images?</b></summary>Never. Original bytes are preserved exactly as uploaded.</details>
<details><summary><b>2. Can I self-host EraVault entirely?</b></summary>Yes, via the provided Docker Compose setup with no dependency on Cloudflare.</details>
<details><summary><b>3. What happens if Gemini's API is down?</b></summary>Uploads still succeed; AI enrichment is retried asynchronously with backoff.</details>
<details><summary><b>4. Is Neon PostgreSQL required, or can I use standard Postgres?</b></summary>Standard Postgres works for Docker deployments; Neon's serverless driver is required for Cloudflare Workers.</details>
<details><summary><b>5. How is authentication handled?</b></summary>Clerk issues and validates JWTs at the edge middleware layer.</details>
<details><summary><b>6. Can I swap ImgBB for S3 or R2?</b></summary>Yes — the storage client in `src/lib/imgbb.ts` is designed as a swappable interface.</details>
<details><summary><b>7. Does EraVault support video files?</b></summary>The current release targets images; video support is on the roadmap.</details>
<details><summary><b>8. What image formats are supported?</b></summary>JPEG, PNG, WebP, GIF, and TIFF are supported for zero-compression storage.</details>
<details><summary><b>9. Is there a file size limit?</b></summary>Limits are configurable and depend on your ImgBB plan tier.</details>
<details><summary><b>10. Can multiple users share a collection?</b></summary>Collection sharing is planned; current release scopes collections to a single owner.</details>
<details><summary><b>11. How do I rotate the Gemini API key?</b></summary>Update `GEMINI_API_KEY` in your secrets manager and redeploy; no code changes required.</details>
<details><summary><b>12. Does EraVault support SSO?</b></summary>Yes, via Clerk's enterprise SSO connections (SAML/OIDC) on supported plans.</details>
<details><summary><b>13. Is the AI tagging accuracy configurable?</b></summary>Confidence thresholds for stored tags are configurable in `src/lib/gemini.ts`.</details>
<details><summary><b>14. Can I run this on AWS instead of Cloudflare?</b></summary>Yes — the Docker image runs on any container platform, including ECS and EKS.</details>
<details><summary><b>15. Does the PWA work offline?</b></summary>The app shell and previously viewed assets are cached for offline browsing; uploads require connectivity.</details>
<details><summary><b>16. How are database migrations handled in production?</b></summary>Via `prisma migrate deploy`, run as a pre-deploy CI step.</details>
<details><summary><b>17. What's the recommended Node.js version?</b></summary>Node 20 LTS, matching the Docker base image.</details>
<details><summary><b>18. Can I disable AI tagging entirely?</b></summary>Yes, by omitting `GEMINI_API_KEY`; uploads proceed without enrichment.</details>
<details><summary><b>19. How is rate limiting implemented?</b></summary>Via middleware checking per-user request counts against a sliding window, backed by the database or an edge KV store.</details>
<details><summary><b>20. Is EraVault open source?</b></summary>Yes, released under the MIT License.</details>
<details><summary><b>21. How do I report a security vulnerability?</b></summary>Please email the maintainers directly rather than opening a public issue.</details>
<details><summary><b>22. Does EraVault support multi-tenancy?</b></summary>Data is isolated per Clerk user ID at the database query layer today; organization-level tenancy is on the roadmap.</details>

---

## 🗺 Roadmap

| Status | Item |
|---|---|
| ✅ | Zero-compression image upload pipeline |
| ✅ | Gemini Vision AI tagging |
| ✅ | Docker + Cloudflare dual deployment |
| 🚧 | Video asset support |
| 🚧 | Collection sharing & team workspaces |
| 🔜 | Organization-level tenancy (Clerk Organizations) |
| 🔜 | Pluggable storage backends (S3, R2, Backblaze B2) |
| 🔜 | Public API with scoped API keys |
| 🔜 | Advanced search with vector similarity |

---

## 🤝 Contributing Guide

We welcome contributions of all sizes.

```bash
# Fork, then clone your fork
git clone https://github.com/<your-username>/eravault.git
cd eravault

# Create a feature branch
git checkout -b feat/your-feature-name

# Install dependencies and run tests
npm install
npm run lint && npm run typecheck && npm test

# Commit using Conventional Commits
git commit -m "feat: add collection sharing endpoint"

# Push and open a Pull Request
git push origin feat/your-feature-name
```

> [!TIP]
> Please open an issue to discuss significant architectural changes before submitting a large pull request — it saves everyone review time.

---

## 📄 License

Released under the **MIT License**. See [`LICENSE`](./LICENSE) for full terms.

---

---

<div align="center">

### 🗄️ EraVault

**Enterprise-Grade, Zero-Compression Media Vault & Edge AI Tagging Engine**

<p><i>Engineered with precision by <b>Osman Ahmed Khan</b></i></p>

<a href="https://github.com/OsmanKhanIO">GitHub Profile</a> •
<a href="https://yourportfolio.com">Portfolio</a>

<br><br>

*"Your pixels, exactly as they were."*

Made with 🖤 using Next.js, React, TypeScript, Prisma, Gemini AI, Docker, and Cloudflare.

</div>