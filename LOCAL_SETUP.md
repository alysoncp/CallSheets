# Local Development Setup Guide

This guide will help you set up CallSheets for local development using Docker PostgreSQL.

## Prerequisites

- Docker Desktop installed and running
- Node.js 18+ and npm
- A Supabase project (for authentication - can use staging/production Supabase)

## Quick Start

### Option 1: Automated Setup (Recommended)

**Windows (PowerShell):**
```powershell
.\scripts\setup-local.ps1
```

**Mac/Linux:**
```bash
chmod +x scripts/setup-local.sh
./scripts/setup-local.sh
```

### Option 2: Manual Setup

1. **Start PostgreSQL container:**
   ```bash
   npm run docker:up
   ```
   Or manually:
   ```bash
   docker-compose up -d postgres
   ```

2. **Create `.env.local` file:**
   ```bash
   cp .env.local.example .env.local
   ```

3. **Update `.env.local` with your configuration:**
   ```env
   # Local PostgreSQL (already configured)
   DATABASE_URL=postgresql://callsheets:callsheets_dev_password@localhost:5432/callsheets_dev

   # Supabase (use your staging/production project for Auth)
   NEXT_PUBLIC_SUPABASE_URL=your_staging_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_staging_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_staging_supabase_service_role_key

   # Optional
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   ```

4. **Install dependencies:**
   ```bash
   npm install
   ```

5. **Set up database schema:**
   ```bash
   npm run db:generate
   npm run db:push
   ```

6. **Start development server:**
   ```bash
   npm run dev
   ```

## Database Management

### View Database in Drizzle Studio
```bash
npm run db:studio
```
This opens a web interface at http://localhost:4983 to view and edit your database.

### Stop PostgreSQL
```bash
npm run docker:down
```

### View PostgreSQL Logs
```bash
npm run docker:logs
```

### Reset Database
```bash
# Stop and remove container with data
docker-compose down -v

# Start fresh
npm run docker:up
npm run db:push
```

## Environment Setup

### Local Development
- **Database**: Local PostgreSQL (Docker)
- **Auth**: Supabase (staging or production project)
- **Storage**: Supabase Storage (staging or production)

### Staging
- **Database**: Supabase staging database
- **Auth**: Supabase staging
- **Storage**: Supabase staging storage

### Production
- **Database**: Supabase production database
- **Auth**: Supabase production
- **Storage**: Supabase production storage

## Troubleshooting

### PostgreSQL won't start
- Check if Docker is running
- Check if port 5432 is already in use
- View logs: `npm run docker:logs`

### Database connection errors
- Verify `.env.local` has correct `DATABASE_URL`
- Ensure PostgreSQL container is running: `docker ps`
- Test connection: `docker exec callsheets-postgres pg_isready -U callsheets`

### Migration errors
- Make sure database is running
- Try resetting: `npm run docker:down -v` then `npm run docker:up`
- Check schema file for errors

## Next Steps

1. Set up Supabase project for authentication
2. Configure Supabase Storage buckets (receipts, paystubs, odometer-photos)
3. Set up RLS policies in Supabase
4. Add Veryfi credentials for OCR (optional)

## Useful Commands

```bash
# Start PostgreSQL
npm run docker:up

# Stop PostgreSQL
npm run docker:down

# View database
npm run db:studio

# Generate migrations
npm run db:generate

# Push schema changes
npm run db:push

# Run migrations
npm run db:migrate

# Start dev server
npm run dev
```
