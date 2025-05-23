require('dotenv').config();
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const connectDB = require('./db');
const User = require('./models/User');

const app = express();
const PORT = process.env.PORT || 3000;

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));

// Serve static files from React build
app.use(express.static(path.join(__dirname, '../src/build')));

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueName = `${uuidv4()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});

const upload = multer({ storage });

// Create uploads directory if it doesn't exist
const fs = require('fs');
if (!fs.existsSync('uploads')) {
  fs.mkdirSync('uploads');
}

// API Routes
app.get('/api/test', (req, res) => {
  res.json({ message: 'API is working!' });
});

// Get user profile
app.get('/api/user/:telegramId', async (req, res) => {
  try {
    const user = await User.findOne({ telegramId: req.params.telegramId });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    console.error('Error in /api/user/:telegramId:', error);
    res.status(500).json({ message: error.message });
  }
});

// Create or update user
app.post('/api/user', async (req, res) => {
  try {
    console.log('Received user data:', req.body);
    const { telegramId, username } = req.body;
    let user = await User.findOne({ telegramId });
    
    if (!user) {
      user = new User({
        telegramId,
        username,
        profileId: uuidv4().substring(0, 8)
      });
    } else {
      user.username = username;
    }
    
    await user.save();
    console.log('Saved user:', user);
    res.json(user);
  } catch (error) {
    console.error('Error in /api/user:', error);
    res.status(500).json({ message: error.message });
  }
});

// Upload avatar
app.post('/api/user/avatar/:telegramId', upload.single('avatar'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }
    
    const user = await User.findOne({ telegramId: req.params.telegramId });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    user.avatar = `/uploads/${req.file.filename}`;
    await user.save();
    res.json(user);
  } catch (error) {
    console.error('Error in avatar upload:', error);
    res.status(500).json({ message: error.message });
  }
});

// Update anime list
app.post('/api/user/anime/:telegramId', async (req, res) => {
  try {
    console.log('Received anime update:', req.body);
    const { title, status } = req.body;
    const user = await User.findOne({ telegramId: req.params.telegramId });
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    const existingAnimeIndex = user.animeList.findIndex(a => a.title === title);
    if (existingAnimeIndex !== -1) {
      user.animeList[existingAnimeIndex].status = status;
    } else {
      user.animeList.push({ title, status });
    }

    user.watchedCount = user.animeList.filter(a => a.status === 'completed').length;
    user.plannedCount = user.animeList.filter(a => a.status === 'planned').length;
    
    await user.save();
    console.log('Updated user anime list:', user.animeList);
    res.json(user);
  } catch (error) {
    console.error('Error in anime update:', error);
    res.status(500).json({ message: error.message });
  }
});

// Get user by profile ID
app.get('/api/profile/:profileId', async (req, res) => {
  try {
    const user = await User.findOne({ profileId: req.params.profileId });
    if (!user) {
      return res.status(404).json({ message: 'Profile not found' });
    }
    res.json(user);
  } catch (error) {
    console.error('Error in profile lookup:', error);
    res.status(500).json({ message: error.message });
  }
});

// Add recommendation
app.post('/api/recommendations/:telegramId', async (req, res) => {
  try {
    const { animeTitle, comment } = req.body;
    const user = await User.findOne({ telegramId: req.params.telegramId });
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    user.recommendations.push({ animeTitle, comment });
    await user.save();
    res.json(user);
  } catch (error) {
    console.error('Error in adding recommendation:', error);
    res.status(500).json({ message: error.message });
  }
});

// Serve React app for all other routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../src/build/index.html'));
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
}); 