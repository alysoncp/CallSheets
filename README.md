# CallSheets - Financial Management for Film & TV Professionals

A comprehensive financial management web application built specifically for Canadian film and TV industry professionals using Next.js 14+, TypeScript, Supabase, and Drizzle ORM.

## Features

- **Income Tracking**: Track all income sources with detailed categorization
- **Expense Management**: Organize and categorize business expenses
- **Receipt & Paystub Upload**: Upload receipts and paystubs with OCR processing
- **Vehicle Mileage Tracking**: Track vehicle usage for business deductions
- **Tax Calculator**: Calculate taxes using Canadian tax rules (federal, BC provincial, CPP)
- **Asset & CCA Management**: Track capital assets and calculate CCA
- **Lease Management**: Track lease contracts and payments
- **GST/HST Tracking**: Track GST/HST collected and paid
- **Subscription Tiers**: Basic (Free), Personal ($9.99/month), Corporate ($24.99/month)

## Tech Stack

- **Framework**: Next.js 14+ (App Router)
- **Frontend**: React 18+, TypeScript
- **Database**: Supabase (PostgreSQL) with Drizzle ORM
- **Authentication**: Supabase Auth
- **Charts**: Recharts
- **File Upload**: Supabase Storage
- **Date Handling**: date-fns
- **Styling**: Tailwind CSS with dark mode support
- **Forms**: React Hook Form with Zod validation

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Docker Desktop (for local Supabase)
- Supabase CLI (`npm install -g supabase` or use `npx supabase`)
- Veryfi API credentials (optional, for OCR)

### Local Development Setup

1. **Clone the repository:**
```bash
git clone <repository-url>
cd CallSheets
```

2. **Install dependencies:**
```bash
npm install
```

3. **Start Supabase locally:**
```bash
npm run supabase:start
```

This will start all Supabase services locally (PostgreSQL, Auth, Storage, API, etc.)

4. **Set up environment variables:**
The `.env.local` file is already configured with local Supabase credentials. After running `supabase start`, you'll see the connection details. Update `.env.local` if needed:
```env
DATABASE_URL=postgresql://postgres:postgres@127.0.0.1:54322/postgres
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=<from supabase start output>
SUPABASE_SERVICE_ROLE_KEY=<from supabase start output>
```

5. **Set up the database schema:**
```bash
npm run db:push
```

6. **Set up Supabase Storage buckets:**
   - Open Supabase Studio: http://127.0.0.1:54323
   - Create buckets: `receipts`, `paystubs`, `odometer-photos`
   - Configure RLS policies for each bucket

7. **Run the development server:**
```bash
npm run dev
```

8. **Open [http://localhost:3000](http://localhost:3000) in your browser.**

### Supabase CLI Commands

- `npm run supabase:start` - Start local Supabase
- `npm run supabase:stop` - Stop local Supabase
- `npm run supabase:status` - Check Supabase status
- `npm run supabase:reset` - Reset database (clears all data)

Access Supabase Studio at http://127.0.0.1:54323 to manage your local database.

## Database Setup

The application uses Drizzle ORM with PostgreSQL. The schema is defined in `lib/db/schema.ts`.

### Running Migrations

```bash
# Generate migrations from schema
npm run db:generate

# Push schema directly to database (development)
npm run db:push

# Run migrations (production)
npm run db:migrate
```

### Row-Level Security (RLS)

All tables have RLS policies ensuring users can only access their own data. Set up RLS policies in Supabase:

- `users`: `id = auth.uid()` for SELECT, INSERT, UPDATE
- All other tables: `user_id = auth.uid()` for all operations

## Project Structure

```
CallSheets/
├── app/                    # Next.js App Router pages
│   ├── (auth)/            # Authentication routes
│   ├── (dashboard)/       # Protected dashboard routes
│   └── api/                # API routes
├── components/             # React components
│   ├── ui/                # shadcn/ui components
│   ├── forms/             # Form components
│   ├── charts/             # Chart components
│   └── layout/             # Layout components
├── lib/                    # Utilities and configurations
│   ├── db/                 # Drizzle ORM setup
│   ├── supabase/           # Supabase clients
│   ├── validations/        # Zod schemas
│   ├── tax/                # Tax calculation logic
│   └── utils/              # Helper functions
└── drizzle/                # Database migrations
```

## Subscription Tiers

### Basic (Free)
- Income/expense tracking
- Receipt/paystub upload (10 OCR requests/month)
- Basic dashboard

### Personal ($9.99/month)
- All Basic features
- Vehicle mileage tracking
- Tax calculator
- Asset/CCA tracking
- Lease management
- 100 OCR requests/month

### Corporate ($24.99/month)
- All Personal features
- Unlimited OCR requests
- Advanced reporting
- Corporate tax features

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run db:generate` - Generate database migrations
- `npm run db:push` - Push schema to database
- `npm run db:migrate` - Run migrations
- `npm run db:studio` - Open Drizzle Studio
- `npm run supabase:start` - Start local Supabase
- `npm run supabase:stop` - Stop local Supabase
- `npm run supabase:status` - Check Supabase status
- `npm run supabase:reset` - Reset database

## Deployment

The application is configured for Vercel deployment. Set up environment variables in your Vercel project settings.

## License

ISC
