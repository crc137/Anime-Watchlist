const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // Log the MongoDB URI (with sensitive information masked)
    const maskedUri = process.env.MONGODB_URI
      ? process.env.MONGODB_URI.replace(/:\/\/(.*?)@/, '://*****:*****@')
      : 'undefined';
    console.log('Attempting to connect to MongoDB with URI:', maskedUri);

    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 30000, // Timeout after 30 seconds
      socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
      connectTimeoutMS: 30000, // Give up initial connection after 30 seconds
      keepAlive: true,
      keepAliveInitialDelay: 300000 // Send keepAlive signal every 5 minutes
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);

    // Handle connection errors
    mongoose.connection.on('error', err => {
      console.error('MongoDB connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      console.log('MongoDB disconnected. Attempting to reconnect...');
    });

    mongoose.connection.on('reconnected', () => {
      console.log('MongoDB reconnected');
    });

  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB; 