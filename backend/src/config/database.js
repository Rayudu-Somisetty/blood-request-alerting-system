const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(
      process.env.MONGODB_URI || 'mongodb://localhost:27017/gimsr_blood_bank',
      {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
        socketTimeoutMS: 45000, // Close sockets after 45s of inactivity
      }
    );

    console.log(`🍃 MongoDB Connected: ${conn.connection.host}`);
    console.log(`📊 Database: ${conn.connection.name}`);
    
    // Handle connection events
    mongoose.connection.on('connected', () => {
      console.log('📡 Mongoose connected to MongoDB');
    });

    mongoose.connection.on('error', (err) => {
      console.error('❌ Mongoose connection error:', err.message);
      // Don't crash the server on connection errors
    });

    mongoose.connection.on('disconnected', () => {
      console.log('📴 Mongoose disconnected');
    });

  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
    console.log('⚠️ Continuing without database - Demo mode enabled');
    
    // Don't retry automatically, just log and continue
    // setTimeout(connectDB, 5000);
  }
};

// Graceful shutdown (moved outside try-catch)
process.on('SIGINT', async () => {
  try {
    await mongoose.connection.close();
    console.log('🔌 MongoDB connection closed through app termination');
    process.exit(0);
  } catch (err) {
    console.error('Error during database disconnection:', err);
    process.exit(1);
  }
});

module.exports = connectDB;