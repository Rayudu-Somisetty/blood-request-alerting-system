#!/bin/bash
# Prisma Migration Script for Blood Bank Admin

echo "🩸 Blood Bank Admin - Prisma Migration Setup"
echo "============================================="

# Check if database is running
echo "🔍 Checking database connection..."
npx prisma db push --accept-data-loss || {
    echo "❌ Database connection failed"
    echo "📝 Setting up database alternatives..."
    
    # Option 1: Use Railway/Supabase/Neon (free PostgreSQL hosting)
    echo "🌐 Free PostgreSQL hosting options:"
    echo "   1. Railway.app (free tier)"
    echo "   2. Supabase.com (free tier)"  
    echo "   3. Neon.tech (free tier)"
    echo "   4. ElephantSQL (free tier)"
    
    # Option 2: Local PostgreSQL
    echo "🏠 Local PostgreSQL setup:"
    echo "   1. Install PostgreSQL locally"
    echo "   2. Update DATABASE_URL in .env"
    echo "   3. Run: npx prisma db push"
    
    # Option 3: SQLite for development
    echo "💾 Quick SQLite setup (development only):"
    echo "   1. Change provider to 'sqlite' in schema.prisma"
    echo "   2. Set DATABASE_URL='file:./dev.db'"
    echo "   3. Run: npx prisma db push"
    
    exit 1
}

echo "✅ Database connected successfully!"

# Generate Prisma client
echo "🔧 Generating Prisma client..."
npx prisma generate

echo "🌱 Creating initial admin user..."
node -e "
const { PrismaClient } = require('./src/generated/prisma');
const bcrypt = require('bcryptjs');

async function createAdmin() {
    const prisma = new PrismaClient();
    
    try {
        const hashedPassword = await bcrypt.hash('admin123456', 12);
        
        const admin = await prisma.user.create({
            data: {
                firstName: 'Super',
                lastName: 'Admin',
                email: 'admin@gimsr.edu.in',
                phone: '9876543210',
                password: hashedPassword,
                userType: 'admin',
                role: 'super_admin',
                isActive: true,
                isVerified: true
            }
        });
        
        console.log('✅ Super admin created:', admin.email);
    } catch (error) {
        if (error.code === 'P2002') {
            console.log('ℹ️ Admin user already exists');
        } else {
            console.error('❌ Error creating admin:', error.message);
        }
    } finally {
        await prisma.\$disconnect();
    }
}

createAdmin();
"

echo "🎉 Prisma setup completed!"
echo "📧 Admin login: admin@gimsr.edu.in"
echo "🔑 Password: admin123456"
