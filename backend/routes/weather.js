const express = require('express');
const router = express.Router();
const weatherService = require('../services/weatherService');
const auth = require('../middleware/auth');

// Get current weather for user's location
router.get('/current', auth, async (req, res) => {
  try {
    const { lat, lon } = req.query;

    if (!lat || !lon) {
      return res.status(400).json({
        success: false,
        message: 'Latitude and longitude are required'
      });
    }

    const weatherData = await weatherService.getCurrentWeather(lat, lon);
    const recommendations = weatherService.getSafetyRecommendations(weatherData);

    res.json({
      success: true,
      data: {
        ...weatherData,
        safetyRecommendations: recommendations
      }
    });
  } catch (error) {
    console.error('Error fetching current weather:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch weather data'
    });
  }
});

// Get weather alerts for safety
router.get('/alerts', auth, async (req, res) => {
  try {
    const { lat, lon } = req.query;

    if (!lat || !lon) {
      return res.status(400).json({
        success: false,
        message: 'Latitude and longitude are required'
      });
    }

    const alerts = await weatherService.getWeatherAlerts(lat, lon);

    res.json({
      success: true,
      data: alerts
    });
  } catch (error) {
    console.error('Error fetching weather alerts:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch weather alerts'
    });
  }
});

// Get weather forecast
router.get('/forecast', auth, async (req, res) => {
  try {
    const { lat, lon } = req.query;

    if (!lat || !lon) {
      return res.status(400).json({
        success: false,
        message: 'Latitude and longitude are required'
      });
    }

    const forecast = await weatherService.getWeatherForecast(lat, lon);

    res.json({
      success: true,
      data: forecast
    });
  } catch (error) {
    console.error('Error fetching weather forecast:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch weather forecast'
    });
  }
});

// Get comprehensive weather safety report
router.get('/safety-report', auth, async (req, res) => {
  try {
    const { lat, lon } = req.query;

    if (!lat || !lon) {
      return res.status(400).json({
        success: false,
        message: 'Latitude and longitude are required'
      });
    }

    const [currentWeather, alerts] = await Promise.all([
      weatherService.getCurrentWeather(lat, lon),
      weatherService.getWeatherAlerts(lat, lon)
    ]);

    const recommendations = weatherService.getSafetyRecommendations(currentWeather);

    // Calculate safety score (0-100, higher is safer)
    let safetyScore = 100;
    
    if (alerts.some(alert => alert.severity === 'high')) safetyScore -= 30;
    if (alerts.some(alert => alert.severity === 'medium')) safetyScore -= 15;
    if (alerts.some(alert => alert.severity === 'low')) safetyScore -= 5;
    
    if (currentWeather.visibility < 1000) safetyScore -= 10;
    if (currentWeather.windSpeed > 15) safetyScore -= 10;
    if (currentWeather.temperature < 0 || currentWeather.temperature > 35) safetyScore -= 15;

    res.json({
      success: true,
      data: {
        currentWeather,
        alerts,
        forecast: [], // Forecast not available with free API
        safetyScore: Math.max(0, safetyScore),
        recommendations,
        lastUpdated: new Date()
      }
    });
  } catch (error) {
    console.error('Error fetching weather safety report:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch weather safety report'
    });
  }
});

module.exports = router;
