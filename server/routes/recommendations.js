const express = require('express');
const router = express.Router();
const Recommendation = require('../models/Recommendation');

// Send a recommendation
router.post('/:userId', async (req, res) => {
  try {
    const { animeTitle, comment } = req.body;
    const fromUserId = req.user.id; // Assuming you have user auth middleware
    const toUserId = req.params.userId;

    const recommendation = new Recommendation({
      fromUserId,
      toUserId,
      animeTitle,
      comment,
    });

    await recommendation.save();

    res.status(201).json({
      success: true,
      message: 'Recommendation sent successfully',
      data: recommendation,
    });
  } catch (error) {
    console.error('Error sending recommendation:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send recommendation',
      error: error.message,
    });
  }
});

// Get recommendations for a user
router.get('/received', async (req, res) => {
  try {
    const userId = req.user.id; // Assuming you have user auth middleware

    const recommendations = await Recommendation.find({
      toUserId: userId,
      status: 'pending',
    })
      .sort({ createdAt: -1 })
      .limit(10);

    res.json({
      success: true,
      data: recommendations,
    });
  } catch (error) {
    console.error('Error getting recommendations:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get recommendations',
      error: error.message,
    });
  }
});

// Update recommendation status
router.patch('/:recommendationId', async (req, res) => {
  try {
    const { status } = req.body;
    const userId = req.user.id; // Assuming you have user auth middleware

    const recommendation = await Recommendation.findOneAndUpdate(
      {
        _id: req.params.recommendationId,
        toUserId: userId,
      },
      { status },
      { new: true }
    );

    if (!recommendation) {
      return res.status(404).json({
        success: false,
        message: 'Recommendation not found',
      });
    }

    res.json({
      success: true,
      message: 'Recommendation status updated',
      data: recommendation,
    });
  } catch (error) {
    console.error('Error updating recommendation:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update recommendation',
      error: error.message,
    });
  }
});

module.exports = router; 