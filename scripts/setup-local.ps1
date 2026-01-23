# Setup script for local development (PowerShell)

Write-Host "🚀 Setting up CallSheets for local development..." -ForegroundColor Cyan

# Check if Docker is running
try {
    docker info | Out-Null
} catch {
    Write-Host "❌ Docker is not running. Please start Docker and try again." -ForegroundColor Red
    exit 1
}

# Start PostgreSQL container
Write-Host "📦 Starting PostgreSQL container..." -ForegroundColor Yellow
docker-compose up -d postgres

# Wait for PostgreSQL to be ready
Write-Host "⏳ Waiting for PostgreSQL to be ready..." -ForegroundColor Yellow
$maxAttempts = 30
$attempt = 0
do {
    Start-Sleep -Seconds 2
    $attempt++
    $ready = docker exec callsheets-postgres pg_isready -U callsheets 2>&1
    if ($LASTEXITCODE -eq 0) {
        break
    }
    Write-Host "   Waiting... ($attempt/$maxAttempts)" -ForegroundColor Gray
} while ($attempt -lt $maxAttempts)

if ($attempt -ge $maxAttempts) {
    Write-Host "❌ PostgreSQL failed to start" -ForegroundColor Red
    exit 1
}

Write-Host "✅ PostgreSQL is ready!" -ForegroundColor Green

# Check if .env.local exists
if (-not (Test-Path .env.local)) {
    Write-Host "📝 Creating .env.local from example..." -ForegroundColor Yellow
    Copy-Item .env.local.example .env.local
    Write-Host "⚠️  Please update .env.local with your configuration" -ForegroundColor Yellow
}

# Install dependencies if node_modules doesn't exist
if (-not (Test-Path node_modules)) {
    Write-Host "📦 Installing dependencies..." -ForegroundColor Yellow
    npm install
}

# Generate and run migrations
Write-Host "🗄️  Setting up database schema..." -ForegroundColor Yellow
npm run db:generate
npm run db:push

Write-Host "✅ Setup complete!" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "1. Update .env.local with your configuration" -ForegroundColor White
Write-Host "2. Run 'npm run dev' to start the development server" -ForegroundColor White
Write-Host "3. Access the app at http://localhost:3000" -ForegroundColor White
