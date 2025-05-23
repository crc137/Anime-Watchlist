const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // Log the MongoDB URI (with sensitive information masked)
    const maskedUri = process.env.MONGODB_URI
      ? process.env.MONGODB_URI.replace(/:\/\/(.*?)@/, '://*****:*****@')
      : 'undefined';
    console.log('Attempting to connect to MongoDB with URI:', maskedUri);

    // Parse the MongoDB URI to get the host
    const uri = process.env.MONGODB_URI;
    if (!uri) {
      throw new Error('MONGODB_URI environment variable is not set');
    }

    // Add retryWrites and w=majority options to the connection string if not present
    const uriWithOptions = uri.includes('?') 
      ? `${uri}&retryWrites=true&w=majority` 
      : `${uri}?retryWrites=true&w=majority`;

    const conn = await mongoose.connect(uriWithOptions, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 30000,
      socketTimeoutMS: 45000,
      connectTimeoutMS: 30000,
      // Remove deprecated options
      family: 4 // Force IPv4
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
    console.error(`Error connecting to MongoDB:`, error);
    // Don't exit the process, let it retry
    throw error;
  }
};

module.exports = connectDB;