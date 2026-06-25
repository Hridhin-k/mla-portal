# MLA Constituency Digital Portal

A premium, cinematic digital platform for MLA constituency transparency, citizen engagement, and public service management.

## Tech Stack

- **Next.js 16** (App Router) + TypeScript
- **Tailwind CSS 4** + ShadCN-style UI components
- **Supabase** (Auth, Database, Storage)
- **next-intl** (English / Malayalam)
- **Framer Motion** animations
- **Recharts** admin analytics
- **TanStack Table** complaint management
- **React Hook Form** + **Zod** form validation

## Getting Started

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Environment Variables

Copy `.env.example` to `.env.local` and configure:

- `NEXT_PUBLIC_SUPABASE_URL` — Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` — Supabase anon key
- `SUPABASE_SERVICE_ROLE_KEY` — Service role key (server only)
- `NEXT_PUBLIC_SITE_URL` — Production site URL
- `NEXT_PUBLIC_GOOGLE_MAPS_EMBED_URL` — Google Maps embed URL

## Database Setup

1. Create a new Supabase project
2. Run the migration in `supabase/migrations/001_initial_schema.sql`
3. Create storage buckets: `news`, `projects`, `gallery`, `complaints`, `avatars`
4. Create an admin user via Supabase Auth, then set their role in `profiles`:

```sql
UPDATE profiles SET role = 'admin' WHERE email = 'your@email.com';
```

## Features

### Public Website
- Cinematic homepage with parallax hero, impact stats, project showcase
- Development projects with search, filters, detail pages
- News & announcements with editorial layout
- Masonry gallery with lightbox
- Contact page with Google Maps
- Multi-step grievance portal with file uploads
- Complaint tracking with visual timeline

### Admin Dashboard (`/admin`)
- Secure Supabase Auth login
- Dashboard with Recharts analytics
- Complaint management with status updates
- CSV/Excel export
- News, projects, gallery, and user management

### Multilingual
- English (`/en`) and Malayalam (`/ml`)
- Instant locale switching via next-intl
- All UI text in `messages/en.json` and `messages/ml.json`

## Demo Mode

Without Supabase configured, the app runs in demo mode with sample data from `lib/data/demo.ts`. Grievance submissions work locally.

## Design System

| Token | Value |
|-------|-------|
| Ivory | `#FAF8F5` |
| Charcoal | `#1A1A1A` |
| Gold | `#C9A86A` |
| Emerald | `#0D5C4B` (accent only) |

Typography: Playfair Display (headings) + Inter (body)

## Scripts

```bash
npm run dev      # Development server
npm run build    # Production build
npm run start    # Start production server
npm run lint     # ESLint
```
