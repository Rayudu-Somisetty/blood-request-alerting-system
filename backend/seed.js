// Database seeding script for Blood Alert
const { PrismaClient } = require('./src/generated/prisma');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function seedDatabase() {
  try {
    console.log('🌱 Starting database seeding...');

    // Check if users already exist
    const existingUsers = await prisma.user.count();
    console.log(`📊 Current users in database: ${existingUsers}`);

    if (existingUsers === 0) {
      console.log('🔧 Creating demo users...');

      // Hash passwords
      const adminPassword = await bcrypt.hash('admin123', 12);
      const userPassword = await bcrypt.hash('user123', 12);

      console.log('✅ Database seeded (no demo users created)');

    } else {
      console.log('✨ Database already has users. Skipping seeding.');
    }

    console.log('🎉 Database seeding completed!');

  } catch (error) {
    console.error('❌ Error seeding database:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the seeding if this file is executed directly
if (require.main === module) {
  seedDatabase();
}

module.exports = { seedDatabase };
