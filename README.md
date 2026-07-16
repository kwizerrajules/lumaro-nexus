# Lumaro Nexus Website

Next.js 14 (App Router) site for Lumaro Nexus — affordable African house plans, custom designs, and enquiry management.

**Production domain:** [https://lumaronexus.com](https://lumaronexus.com)

## Getting started

```bash
cp .env.example .env.local
# Fill in MongoDB, Cloudinary, JWT, email, and Google OAuth values

npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Required environment variables

| Variable | Purpose |
|----------|---------|
| `MONGODB_URI` | MongoDB connection string |
| `CLOUDINARY_*` | Image uploads |
| `JWT_ACCESS_SECRET` / `JWT_REFRESH_SECRET` | Auth tokens |
| `EMAIL_*` | Contact / reply email |
| `NEXT_PUBLIC_GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_ID` | Google sign-in |

See [`.env.example`](.env.example) for the full list.

## Scripts

```bash
npm run dev     # development
npm run build   # production build
npm run start   # serve production build
```

## Deploy (Vercel or similar)

1. Connect the repo to your host (e.g. Vercel).
2. Set all variables from `.env.example` in the project Environment Variables (Production + Preview as needed).
3. Deploy. The app serves `/sitemap.xml` via `app/sitemap.ts` and `public/robots.txt`.
4. Confirm admin login at `/login` and that public pages load with real catalog data.

## Main routes

| Route | Audience |
|-------|----------|
| `/` | Public home + catalog |
| `/catalog` | Full house plan catalog |
| `/custom-plan` | Custom plan builder |
| `/orders` | User enquiries (auth) |
| `/my-custom-plans` | User custom plans (auth) |
| `/login` | Staff admin login |
| `/admin/dashboard` | Admin panel |
