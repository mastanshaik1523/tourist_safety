#!/bin/bash

# Smart Tourist App Startup Script

echo "🚀 Starting Smart Tourist App..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

# Install frontend dependencies
echo "📦 Installing frontend dependencies..."
npm install

# Install backend dependencies
echo "📦 Installing backend dependencies..."
cd backend
npm install
cd ..

# Check if MongoDB connection string is set
if [ ! -f "backend/config.env" ]; then
    echo "⚠️  Backend config file not found. Creating from template..."
    cp backend/config.env.example backend/config.env 2>/dev/null || echo "Please create backend/config.env file manually"
fi

# Seed the database
echo "🌱 Seeding database..."
cd backend
node seed.js
cd ..

echo "✅ Setup complete!"
echo ""
echo "To start the application:"
echo "1. Start backend: cd backend && npm start"
echo "2. Start frontend: npm start"
echo "3. Or run both: npm run dev"
echo ""
echo "📱 Test account:"
echo "Email: john.doe@example.com"
echo "Password: password123"
echo ""
echo "🔑 Don't forget to:"
echo "- Add your Google Maps API key to app.json"
echo "- Update API_BASE_URL in src/services/api.js"
echo "- Configure your MongoDB connection string"
