# BTX – Bin Tuwaym Excellence

**Measuring Excellence in Food Safety Competency**

A professional, full-stack food safety competency assessment platform with a public website, participant portal, and admin portal.

## Features

### Public Website
- Home, About, Objectives, Target Audience, Contact
- User Registration & Login with Forgot Password
- Certificate Verification (QR code support)
- English & Arabic with RTL support

### Participant Portal
- Dashboard with exam status, competency level, notifications
- Exam booking system (3-month cooldown, admin approval)
- Secure MCQ examination (timer, anti-cheating, auto-save)
- Results with strengths/weaknesses analysis
- PDF certificate download with verification ID

### Admin Portal
- Analytics dashboard with charts
- Question bank management (400 questions, import/export)
- User management (approve/reject/suspend)
- Exam slot & booking management
- Reports export (PDF & Excel)
- Configurable competency thresholds

## Brand Colors

| Color | Hex |
|-------|-----|
| Primary | `#0F2744` |
| Secondary | `#C9A227` |
| Accent | `#00897B` |

## Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS v4
- **Database:** SQLite (dev) / PostgreSQL ready
- **ORM:** Prisma 7
- **Auth:** NextAuth.js v5
- **i18n:** next-intl
- **Charts:** Recharts
- **PDF:** jsPDF + QRCode

## Getting Started

```bash
# Install dependencies
npm install

# Set up database and seed data
npm run db:setup

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Demo Accounts

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@btx-excellence.com | Admin@123 |
| Participant | demo@btx-excellence.com | Demo@123 |

## Project Structure

```
src/
├── app/
│   ├── [locale]/
│   │   ├── (public)/     # Public website pages
│   │   ├── portal/       # Participant portal
│   │   └── admin/        # Admin portal
│   └── api/              # REST API routes
├── components/           # UI components
├── lib/                  # Utilities, auth, prisma
├── i18n/                 # Internationalization config
└── generated/prisma/     # Prisma client
messages/                 # en.json, ar.json translations
prisma/                   # Schema, migrations, seed
```

## Production Deployment

1. Set environment variables in `.env`:
   ```
   DATABASE_URL="postgresql://..."
   AUTH_SECRET="your-secure-secret"
   NEXTAUTH_URL="https://your-domain.com"
   ```

2. Run migrations: `npx prisma migrate deploy`
3. Seed database: `npm run db:seed`
4. Build: `npm run build`
5. Start: `npm start`

## License

Proprietary – Bin Tuwaym Excellence
