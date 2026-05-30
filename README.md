# 🚀 Antigravity Blog/CMS - Fullstack Next.js & Supabase

Welcome to the **Antigravity Blog/CMS**! This is a state-of-the-art, production-ready, dark-themed personal Blog and Content Management System built with **Next.js 14 (App Router)**, **TypeScript**, **Tailwind CSS**, **shadcn/ui aesthetics**, and **Supabase**.

---

## 🛠 Tech Stack & Core Features

*   **Frontend**: Next.js 14+ with App Router (strict TypeScript type safety).
*   **Styling**: Dark-mode-first glassmorphic UI using Tailwind CSS HSL variables and smooth micro-animations.
*   **Backend/Database**: Supabase PostgreSQL.
*   **Authentication**: Supabase Auth (Email / Password) protected routes via Next.js Middleware.
*   **Storage**: Supabase Storage bucket `post-thumbnails` for uploading visual post headers.
*   **Realtime**: Live Comment Threads using Supabase Realtime channel subscriptions.
*   **Mutations**: Next.js Server Actions with active author identity and Row-Level Security validation.
*   **Containerization**: Optimized multi-stage Docker build & Compose automation.

---

## 📁 Directory Structure

```
/app
  /(auth)/login/page.tsx        ← Beautiful dark-themed Login Page
  /(auth)/register/page.tsx     ← Auto profile-syncing Register Page
  /(blog)/page.tsx              ← Public Homepage grid, filters & searching
  /(blog)/[slug]/page.tsx       ← Post details with markdown rendering
  /dashboard/page.tsx           ← Management console table with search & filter
  /dashboard/posts/new/page.tsx ← Composition editor with automatic slug & upload
  /dashboard/posts/[id]/edit/page.tsx ← Edit page preloaded with server actions
/components/blog/               ← Theme togglers, Navbars, Footers, Comment sections
/lib/supabase/                  ← SSR client builders & token-renewal middlewares
/supabase/migrations/           ← SQL database migration definitions
/types/                         ← Strict TypeScript types
```

---

## ⚙️ Setup & Installation

### Step 1: Clone & Configure Workspace
Open the project directory in your favorite IDE:
```bash
cd C:\Users\Wanh\.gemini\antigravity-ide\scratch\supabase-blog-cms
```

### Step 2: Supabase Project Setup
1.  Create a free project at [Supabase](https://supabase.com).
2.  Go to the **SQL Editor** in the Supabase Dashboard, click **New Query**, copy the SQL contents from `./supabase/migrations/schema.sql`, paste them, and click **Run**. This will create:
    *   Tables (`profiles`, `posts`, `tags`, `post_tags`, `comments`).
    *   PostgreSQL trigger `handle_new_user` (automatically syncs registrations into profiles).
    *   Comprehensive Row Level Security (RLS) policies.
    *   The `increment_views` RPC security-definer function.

### Step 3: Create Storage Bucket
1.  In the Supabase Dashboard, go to **Storage**.
2.  Create a **New Bucket** called `post-thumbnails`.
3.  Set the bucket visibility to **Public** (required so thumbnails can be loaded directly from public URLs).
4.  *Note: The RLS policies for storage objects have already been defined in your SQL migration script.*

### Step 4: Enable Real-time Replication (CRITICAL)
For comments to stream instantly in real time across different browser tabs without reloading:
1.  Go to **Database** -> **Replication** in the Supabase Dashboard.
2.  Click on the **Source** row (usually `supabase_realtime`).
3.  Click **Edit Tables** (or toggle tables).
4.  Toggle and check the **`comments`** table, and click **Save**.
5.  *This allows clients to subscribe to insertions/deletions on the comment thread live!*

### Step 5: Environment Variables
Copy `.env.example` to `.env` and fill in your Supabase API credentials:
```bash
cp .env.example .env
```
Fill in the following fields:
*   `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase Project API URL (Settings -> API).
*   `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Your Anon Public API key.
*   `SUPABASE_SERVICE_ROLE_KEY`: Your Service Role Private key (never share this client-side).
*   `NEXT_PUBLIC_SITE_URL`: Set to `http://localhost:3000`.

---

## 🏃 Running the Application

### Option A: Local Development
Ensure Node.js is installed, then launch:
```bash
# Install dependencies
npm install

# Run build verification (or launch dev server)
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to see your app.

### Option B: Docker Production Build
To spin up a fully production-ready isolated container in 10 seconds:
```bash
# Build and run Next.js container
docker compose up -d --build
```
Your container will be running at [http://localhost:3000](http://localhost:3000) inside an ultra-optimized Alpine Node environment.

---

## 🤝 Coding Conventions (Conventional Commits)
When committing your changes, follow conventional commit formats to keep version control clean:
*   `feat: init nextjs app and styling config`
*   `feat: add supabase clients, server actions and session middleware`
*   `feat: implement authentication views and dashboard layouts`
*   `feat: implement post CRUD, storage file upload, and realtime comments`
