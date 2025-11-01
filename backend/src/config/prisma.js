const { PrismaClient } = require('../generated/prisma');

// Create Prisma client instance
const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'info', 'warn', 'error'] : ['error'],
  errorFormat: 'minimal',
});

// Connection management
const connectDB = async () => {
  try {
    // Test the connection
    await prisma.$connect();
    console.log('🐘 PostgreSQL Connected via Prisma');
    console.log('📊 Database: Ready for queries');
    
    // Optional: Run a simple query to verify connection
    const userCount = await prisma.user.count();
    console.log(`👥 Current users in database: ${userCount}`);
    
  } catch (error) {
    console.error('❌ Prisma connection failed:', error.message);
    console.log('⚠️ Continuing without database - Demo mode enabled');
    
    // Don't exit the process, just log the error
    // This allows the server to run in demo mode
  }
};

// Graceful shutdown
const disconnectDB = async () => {
  try {
    await prisma.$disconnect();
    console.log('🔌 Prisma connection closed gracefully');
  } catch (error) {
    console.error('❌ Error during Prisma disconnection:', error.message);
  }
};

// Handle process termination
process.on('SIGINT', async () => {
  await disconnectDB();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await disconnectDB();
  process.exit(0);
});

// Export both the client and connection function
module.exports = {
  prisma,
  connectDB,
  disconnectDB
};
