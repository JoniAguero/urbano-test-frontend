# Urbano Commerce — Frontend

> Premium Next.js frontend for an event-driven e-commerce backend built with NestJS and Hexagonal Architecture.

## ⚡ Overview

This project is a **real-time dashboard** that connects to a [NestJS hexagonal e-commerce backend](https://github.com/JoniAguero/nestjs-ecommerce) and visually demonstrates its **event-driven architecture**.

The key flow:

```
Create Product (Catalog Module)
        │
        ▼
 ProductCreatedEvent emitted
        │
        ▼
 Inventory Module reacts → initializes stock with qty 0
        │
        ▼
 Frontend detects the new inventory record via polling
```

## 🛠 Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | **Next.js 16** (App Router) |
| Language | **TypeScript** |
| Data Fetching | **React Query** (`@tanstack/react-query`) — polling, cache invalidation |
| Animations | **Framer Motion** — page transitions, modal, row animations |
| Icons | **Lucide React** |
| Styling | **Vanilla CSS** — custom design system with CSS custom properties |
| Auth | **JWT Bearer** stored in localStorage |

## 🎨 Design System

- **Dark mode** theme with Slate/Zinc palette
- **Glassmorphism** — `backdrop-filter: blur()` on cards and modals
- Violet (`#7C3AED`) and Cyan (`#06B6D4`) accents
- **Inter** font family from Google Fonts
- Micro-animations, shimmer skeleton loaders, toast notifications

## 📁 Project Structure

```
src/
├── app/
│   ├── globals.css              # Design system (colors, tokens, components)
│   ├── layout.tsx               # Root layout with Providers
│   ├── page.tsx                 # Auth redirect (→ /login or /dashboard)
│   ├── login/
│   │   └── page.tsx             # Glassmorphism login page
│   └── dashboard/
│       ├── layout.tsx           # Sidebar + auth guard
│       ├── page.tsx             # Overview with stat cards
│       ├── products/
│       │   └── page.tsx         # Product CRUD + create modal
│       └── inventory/
│           └── page.tsx         # Real-time inventory monitor (2s polling)
├── components/
│   ├── Toast.tsx                # Animated notifications
│   └── Skeleton.tsx             # Shimmer loading placeholders
└── lib/
    ├── types.ts                 # TypeScript interfaces
    ├── api.ts                   # Typed fetch wrapper for all endpoints
    ├── auth-context.tsx         # JWT auth state management
    └── providers.tsx            # React Query + Auth + Toast composition
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- Backend running on `http://localhost:3000` ([nestjs-ecommerce](https://github.com/JoniAguero/nestjs-ecommerce))

### Setup

```bash
# Clone & install
git clone <repo-url>
cd urbano-test-frontend
npm install

# Configure API URL
cp .env.local.example .env.local
# Default: NEXT_PUBLIC_API_URL=http://localhost:3000

# Start dev server
npm run dev -- --port 3001
```

Open [http://localhost:3001](http://localhost:3001) — login with the admin credentials from the backend `.env`.

## 🔑 Key Features

### 1. Auth Flow
- JWT login with form validation
- Token stored in `localStorage`, injected in every API call via `Authorization: Bearer`
- Dashboard routes protected with auth guard (auto-redirect to `/login`)

### 2. Product Creator
- CRUD table with animated rows (Framer Motion)
- Create modal with real-time validation
- On creation, two toasts fire: success + event dispatch notification

### 3. Real-Time Inventory Monitor ⭐
- **Polls `GET /inventory` every 2 seconds** via React Query's `refetchInterval`
- Detects new records appearing and shows a toast: *"Stock Initialized! — event-driven sync complete"*
- Animated row entry for new items (slide + purple highlight fade)
- Inline stock editing with keyboard support (Enter/Escape)
- LIVE status badge with pulse animation

## 🧪 Testing the Event-Driven Flow

1. Open **Products** page → click **New Product** → fill form → submit
2. Switch to **Inventory** page
3. Watch a new inventory record appear automatically (qty: 0)
4. This happened because:
   - Backend's `CreateProductUseCase` emitted a `ProductCreatedEvent`
   - Backend's `InitializeInventoryUseCase` reacted to the event
   - Frontend polling detected the new record

## 📦 Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server (Turbopack) |
| `npm run build` | Production build |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |

## 🏗️ Architecture Decisions

- **No Tailwind** — Vanilla CSS design system for full control and zero dependencies
- **React Query over SWR** — Better mutation support, query invalidation, and polling APIs
- **Client Components** — All pages use `'use client'` since they need interactivity (forms, auth state, animations)
- **No state management library** — React Query handles server state, Context API handles auth
- **Inline styles + CSS classes** — Hybrid approach: design tokens in CSS, dynamic styles inline
