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
- Supabase account and project
- Veryfi API credentials (optional, for OCR)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd CallSheets
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.local.example .env.local
```

4. Fill in your environment variables in `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
DATABASE_URL=your_database_connection_string
VERYFI_CLIENT_ID=your_veryfi_client_id
VERYFI_CLIENT_SECRET=your_veryfi_client_secret
VERYFI_USERNAME=your_veryfi_username
VERYFI_API_KEY=your_veryfi_api_key
```

5. Set up the database:
```bash
# Generate migrations
npm run db:generate

# Apply migrations (or push schema)
npm run db:push
```

6. Set up Supabase Storage buckets:
   - Create buckets: `receipts`, `paystubs`, `odometer-photos`
   - Configure RLS policies for each bucket

7. Run the development server:
```bash
npm run dev
```

8. Open [http://localhost:3000](http://localhost:3000) in your browser.

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

## Deployment

The application is configured for Vercel deployment. Set up environment variables in your Vercel project settings.

## License

ISC
