# Prisma Migration Script for Blood Bank Admin
Write-Host "🩸 Blood Bank Admin - Prisma Migration Setup" -ForegroundColor Red
Write-Host "=============================================" -ForegroundColor Yellow

# Check if database is running
Write-Host "🔍 Checking database connection..." -ForegroundColor Blue

try {
    npx prisma db push --accept-data-loss
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Database connected successfully!" -ForegroundColor Green
        
        # Generate Prisma client
        Write-Host "🔧 Generating Prisma client..." -ForegroundColor Blue
        npx prisma generate
        
        Write-Host "🎉 Prisma setup completed!" -ForegroundColor Green
        Write-Host "📧 Ready to create admin users through the API" -ForegroundColor Cyan
        Write-Host "🔑 Default login: admin@gimsr.edu.in / admin123" -ForegroundColor Yellow
    } else {
        throw "Database connection failed"
    }
} catch {
    Write-Host "❌ Database connection failed" -ForegroundColor Red
    Write-Host "📝 Database setup alternatives:" -ForegroundColor Yellow
    
    Write-Host "`n🌐 Free PostgreSQL hosting options:" -ForegroundColor Cyan
    Write-Host "   1. Railway.app (https://railway.app) - Free tier"
    Write-Host "   2. Supabase.com (https://supabase.com) - Free tier"  
    Write-Host "   3. Neon.tech (https://neon.tech) - Free tier"
    Write-Host "   4. ElephantSQL (https://elephantsql.com) - Free tier"
    
    Write-Host "`n🏠 Local PostgreSQL setup:" -ForegroundColor Cyan
    Write-Host "   1. Install PostgreSQL from https://postgresql.org"
    Write-Host "   2. Create database: createdb gimsr_blood_bank"
    Write-Host "   3. Update DATABASE_URL in .env file"
    Write-Host "   4. Run: npx prisma db push"
    
    Write-Host "`n💾 Quick SQLite setup (development only):" -ForegroundColor Cyan
    Write-Host "   1. In schema.prisma, change provider to 'sqlite'"
    Write-Host "   2. Set DATABASE_URL='file:./dev.db' in .env"
    Write-Host "   3. Run: npx prisma db push"
    
    Write-Host "`n📖 See README.md for detailed setup instructions" -ForegroundColor Yellow
}
