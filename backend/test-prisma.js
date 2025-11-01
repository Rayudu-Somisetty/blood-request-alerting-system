// Test Prisma Setup - Create Admin User
const { PrismaClient } = require('./src/generated/prisma');
const bcrypt = require('bcryptjs');

async function testPrismaSetup() {
    const prisma = new PrismaClient();
    
    try {
        console.log('🔍 Testing Prisma connection...');
        
        // Test connection
        await prisma.$connect();
        console.log('✅ Prisma connected successfully!');
        
        // Check current users
        const userCount = await prisma.user.count();
        console.log(`👥 Current users in database: ${userCount}`);
        
        // Create admin user if none exists
        if (userCount === 0) {
            console.log('🌱 Creating initial admin user...');
            
            const hashedPassword = await bcrypt.hash('admin123', 12);
            
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
            
            console.log('✅ Admin user created:');
            console.log(`📧 Email: ${admin.email}`);
            console.log(`🔑 Password: admin123`);
            console.log(`👤 Role: ${admin.role}`);
        } else {
            console.log('ℹ️ Users already exist in database');
        }
        
        // Test some queries
        console.log('\n📊 Database Statistics:');
        const stats = {
            totalUsers: await prisma.user.count(),
            adminUsers: await prisma.user.count({ where: { userType: 'admin' } }),
            donors: await prisma.user.count({ where: { userType: 'donor' } }),
            donations: await prisma.donation.count(),
            documents: await prisma.document.count()
        };
        
        console.table(stats);
        
        console.log('\n🎉 Prisma setup test completed successfully!');
        console.log('🚀 Your Blood Bank Admin Portal is ready to use Prisma!');
        
    } catch (error) {
        console.error('❌ Prisma test failed:', error.message);
        
        if (error.code) {
            console.error(`Error code: ${error.code}`);
        }
    } finally {
        await prisma.$disconnect();
    }
}

// Run the test
testPrismaSetup().catch(console.error);
