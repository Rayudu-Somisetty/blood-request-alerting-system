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

      // Create admin user
      const adminUser = await prisma.user.create({
        data: {
          firstName: 'Admin',
          lastName: 'User',
          email: 'admin@gimsr.edu.in',
          phone: '+91 891 2524777',
          password: adminPassword,
          userType: 'admin',
          role: 'admin',
          isActive: true,
          bloodGroup: 'AB+',
          age: 35,
          gender: 'male',
          weight: 70.0,
          city: 'Visakhapatnam',
          state: 'Andhra Pradesh',
          country: 'India',
          isVerified: true,
          verificationDate: new Date(),
          isEligibleToDonate: true,
          totalDonations: 5,
          emergencyContactName: 'Emergency Contact',
          emergencyContactPhone: '+91 9999999999',
          emergencyContactRelationship: 'Colleague'
        }
      });

      // Create regular user
      const regularUser = await prisma.user.create({
        data: {
          firstName: 'John',
          lastName: 'Doe',
          email: 'user@example.com',
          phone: '+91 9876543210',
          password: userPassword,
          userType: 'donor',
          role: 'user',
          isActive: true,
          bloodGroup: 'O+',
          age: 28,
          gender: 'male',
          weight: 75.0,
          dateOfBirth: new Date('1996-01-15'),
          city: 'Visakhapatnam',
          state: 'Andhra Pradesh',
          country: 'India',
          isVerified: true,
          verificationDate: new Date(),
          isEligibleToDonate: true,
          totalDonations: 3,
          emergencyContactName: 'Jane Doe',
          emergencyContactPhone: '+91 9876543211',
          emergencyContactRelationship: 'Spouse'
        }
      });

      console.log('✅ Demo users created successfully!');
      console.log(`👑 Admin: ${adminUser.email} (ID: ${adminUser.id})`);
      console.log(`👤 User: ${regularUser.email} (ID: ${regularUser.id})`);

      // Create some sample donations
      const donation1 = await prisma.donation.create({
        data: {
          donorId: regularUser.id,
          donorName: `${regularUser.firstName} ${regularUser.lastName}`,
          donorBloodGroup: regularUser.bloodGroup,
          donorAge: regularUser.age,
          donorWeight: regularUser.weight,
          donorPhone: regularUser.phone,
          donorEmail: regularUser.email,
          donationType: 'whole_blood',
          donationStatus: 'completed',
          volumeCollected: 450,
          bagNumber: 'BB001',
          bloodGroupVerified: regularUser.bloodGroup,
          hivResult: 'negative',
          hepatitisBResult: 'negative',
          hepatitisCResult: 'negative',
          syphilisResult: 'negative',
          malariaResult: 'negative',
          testingCompleted: true,
          testingDate: new Date(),
          overallTestResult: 'negative'
        }
      });

      console.log(`🩸 Sample donation created: ${donation1.id}`);

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
