const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // Get the base URI from environment variable
    const baseUri = process.env.MONGODB_URI;
    if (!baseUri) {
      throw new Error('MONGODB_URI environment variable is not set');
    }

    // Add database name and options if not present
    const uri = new URL(baseUri);
    if (!uri.pathname || uri.pathname === '/') {
      uri.pathname = '/forma_db'; // Set default database name if not provided
    }
    
    // Log the MongoDB URI (with sensitive information masked)
    const maskedUri = uri.toString().replace(/:\/\/(.*?)@/, '://*****:*****@');
    console.log('Attempting to connect to MongoDB with URI:', maskedUri);

    // Add connection options
    const uriWithOptions = `${uri.toString()}?authSource=admin&directConnection=true&retryWrites=true&w=majority`;

    const conn = await mongoose.connect(uriWithOptions, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      connectTimeoutMS: 10000,
      family: 4,
      autoIndex: process.env.NODE_ENV !== 'production',
    });

    console.log(`MongoDB Connected to host: ${conn.connection.host}`);
    console.log(`Database name: ${conn.connection.name}`);
    console.log(`Connection state: ${conn.connection.readyState}`);

    // Handle connection errors
    mongoose.connection.on('error', err => {
      console.error('MongoDB connection error:', err);
      // Try to reconnect
      setTimeout(() => {
        console.log('Attempting to reconnect to MongoDB...');
        mongoose.connect(uriWithOptions).catch(err => {
          console.error('Reconnection attempt failed:', err);
        });
      }, 5000);
    });

    mongoose.connection.on('disconnected', () => {
      console.log('MongoDB disconnected. Attempting to reconnect...');
      // Try to reconnect
      setTimeout(() => {
        console.log('Attempting to reconnect to MongoDB...');
        mongoose.connect(uriWithOptions).catch(err => {
          console.error('Reconnection attempt failed:', err);
        });
      }, 5000);
    });

    mongoose.connection.on('reconnected', () => {
      console.log('MongoDB reconnected successfully');
    });

    return conn;
  } catch (error) {
    console.error(`Error connecting to MongoDB:`, error);
    // Log additional connection details for debugging
    if (process.env.MONGODB_URI) {
      try {
        const uri = new URL(process.env.MONGODB_URI);
        console.error('Connection details:', {
          host: uri.hostname,
          port: uri.port,
          database: uri.pathname.slice(1) || 'none specified'
        });
      } catch (e) {
        console.error('Invalid MongoDB URI format');
      }
    }
    throw error;
  }
};

module.exports = connectDB;