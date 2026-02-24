This is a [Next.js](https://nextjs.org) project for **ozelbirani.com** - a platform for creating personalized digital story websites.

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result in development mode.

Production site: [https://ozelbirani.com](https://ozelbirani.com)

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Email Notifications (Resend)

The project uses [Resend](https://resend.com/) for transactional emails:

- Welcome email on new user registration (via Clerk webhook)
- Payment success/receipt email with the live site URL
- Admin sales alert email for every successful sale
- Retention notifications (site expiration, edit window reminder, abandoned draft reminder)

Required environment variables:

```bash
RESEND_API_KEY=...
RESEND_FROM_EMAIL=\"Ozel Bir Ani <onboarding@resend.dev>\"
ADMIN_SALES_EMAILS=\"admin@yourdomain.com\" # optional fallback: ADMIN_EMAILS / ADMIN_EMAIL
NEXT_PUBLIC_APP_URL=\"https://ozelbirani.com\"
CRON_SECRET=\"long-random-secret\"
```

Clerk webhook setup:

- Endpoint: `POST /api/clerk-webhook`
- Event: `user.created`
- Signing secret env: `CLERK_WEBHOOK_SIGNING_SECRET`

Retention cron setup (Vercel):

- Endpoint: `GET /api/cron/retention-notifications`
- Auth: `Authorization: Bearer ${CRON_SECRET}`
- Schedule: hourly via `vercel.json`
- Idempotency: `site_notification_events` table (migration required)

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
