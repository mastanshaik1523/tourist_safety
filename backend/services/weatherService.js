const axios = require('axios');
require('dotenv').config();

class WeatherService {
  constructor() {
    this.apiKey = process.env.WEATHER_API_KEY;
    this.baseUrl = 'https://api.openweathermap.org/data/2.5';
  }

  // Get current weather for a location
  async getCurrentWeather(lat, lon) {
    try {
      const response = await axios.get(`${this.baseUrl}/weather`, {
        params: {
          lat,
          lon,
          appid: this.apiKey,
          units: 'metric'
        }
      });

      return {
        temperature: response.data.main.temp,
        feelsLike: response.data.main.feels_like,
        humidity: response.data.main.humidity,
        pressure: response.data.main.pressure,
        visibility: response.data.visibility,
        windSpeed: response.data.wind.speed,
        windDirection: response.data.wind.deg,
        weather: response.data.weather[0],
        clouds: response.data.clouds.all,
        timestamp: new Date()
      };
    } catch (error) {
      console.error('Error fetching current weather:', error);
      throw new Error('Failed to fetch weather data');
    }
  }

  // Get weather alerts for safety purposes (using free API)
  async getWeatherAlerts(lat, lon) {
    try {
      // Get current weather data to generate alerts
      const currentWeather = await this.getCurrentWeather(lat, lon);
      const alerts = [];

      // Check for severe weather conditions based on current weather
      if (currentWeather.weather.main === 'Thunderstorm') {
        alerts.push({
          type: 'weather_alert',
          severity: 'high',
          title: 'Thunderstorm Warning',
          message: 'Thunderstorm detected in your area. Stay indoors and avoid open areas.',
          icon: 'thunderstorm',
          timestamp: new Date()
        });
      }

      if (currentWeather.windSpeed > 15) {
        alerts.push({
          type: 'weather_alert',
          severity: 'medium',
          title: 'High Wind Warning',
          message: `Strong winds detected (${Math.round(currentWeather.windSpeed)} m/s). Be cautious when driving or walking.`,
          icon: 'wind',
          timestamp: new Date()
        });
      }

      if (currentWeather.visibility < 1000) {
        alerts.push({
          type: 'weather_alert',
          severity: 'medium',
          title: 'Low Visibility Warning',
          message: 'Poor visibility conditions. Drive carefully and use headlights.',
          icon: 'eye-off',
          timestamp: new Date()
        });
      }

      if (currentWeather.temperature < 0) {
        alerts.push({
          type: 'weather_alert',
          severity: 'medium',
          title: 'Freezing Temperature Alert',
          message: 'Freezing temperatures detected. Watch for icy conditions on roads and sidewalks.',
          icon: 'snow',
          timestamp: new Date()
        });
      }

      if (currentWeather.temperature > 35) {
        alerts.push({
          type: 'weather_alert',
          severity: 'medium',
          title: 'Heat Warning',
          message: 'Extreme heat detected. Stay hydrated and avoid prolonged sun exposure.',
          icon: 'sunny',
          timestamp: new Date()
        });
      }

      // Check for rain conditions
      if (currentWeather.weather.main === 'Rain' || currentWeather.weather.main === 'Drizzle') {
        alerts.push({
          type: 'weather_alert',
          severity: 'low',
          title: 'Rain Alert',
          message: 'Rain is currently falling. Consider carrying an umbrella and drive carefully.',
          icon: 'rainy',
          timestamp: new Date()
        });
      }

      // Check for high humidity (comfort/safety concern)
      if (currentWeather.humidity > 80) {
        alerts.push({
          type: 'weather_alert',
          severity: 'low',
          title: 'High Humidity',
          message: 'High humidity detected. Stay hydrated and be aware of heat stress.',
          icon: 'water',
          timestamp: new Date()
        });
      }

      // Check for low pressure (storm indicator)
      if (currentWeather.pressure < 1000) {
        alerts.push({
          type: 'weather_alert',
          severity: 'medium',
          title: 'Low Pressure System',
          message: 'Low atmospheric pressure detected. Weather conditions may change rapidly.',
          icon: 'cloudy',
          timestamp: new Date()
        });
      }

      return alerts;
    } catch (error) {
      console.error('Error fetching weather alerts:', error);
      throw new Error('Failed to fetch weather alerts');
    }
  }

  // Get weather forecast for planning
  async getWeatherForecast(lat, lon) {
    try {
      const response = await axios.get(`${this.baseUrl}/forecast`, {
        params: {
          lat,
          lon,
          appid: this.apiKey,
          units: 'metric'
        }
      });

      return response.data.list.slice(0, 8).map(item => ({
        timestamp: new Date(item.dt * 1000),
        temperature: item.main.temp,
        weather: item.weather[0],
        windSpeed: item.wind.speed,
        humidity: item.main.humidity,
        precipitation: item.rain ? item.rain['3h'] || 0 : 0
      }));
    } catch (error) {
      console.error('Error fetching weather forecast:', error);
      throw new Error('Failed to fetch weather forecast');
    }
  }

  // Get safety recommendations based on weather
  getSafetyRecommendations(weatherData) {
    const recommendations = [];

    if (weatherData.weather.main === 'Thunderstorm') {
      recommendations.push('Stay indoors and avoid open areas');
      recommendations.push('Avoid using electronic devices connected to power');
      recommendations.push('Stay away from windows and doors');
    }

    if (weatherData.windSpeed > 15) {
      recommendations.push('Be cautious when driving, especially on highways');
      recommendations.push('Avoid walking near trees or tall structures');
      recommendations.push('Secure loose objects outdoors');
    }

    if (weatherData.visibility < 1000) {
      recommendations.push('Use headlights and fog lights when driving');
      recommendations.push('Reduce speed and increase following distance');
      recommendations.push('Avoid unnecessary travel if possible');
    }

    if (weatherData.temperature < 0) {
      recommendations.push('Watch for black ice on roads and sidewalks');
      recommendations.push('Dress warmly and cover exposed skin');
      recommendations.push('Check tire pressure and battery condition');
    }

    if (weatherData.temperature > 35) {
      recommendations.push('Stay hydrated and drink plenty of water');
      recommendations.push('Avoid outdoor activities during peak heat hours');
      recommendations.push('Wear light-colored, loose-fitting clothing');
    }

    return recommendations;
  }
}

module.exports = new WeatherService();
