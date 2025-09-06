#!/bin/bash

# CloutPrint Frontend Setup Script
echo "🚀 Setting up CloutPrint Frontend..."

# Check if we're in the right directory
if [ ! -d "frontend" ]; then
    echo "❌ Error: frontend directory not found. Please run this script from the CloutPrint root directory."
    exit 1
fi

cd frontend

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Error: Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Error: Node.js version 18+ is required. Current version: $(node -v)"
    exit 1
fi

echo "✅ Node.js version: $(node -v)"

# Install dependencies
echo "📦 Installing dependencies..."
npm install --legacy-peer-deps

if [ $? -ne 0 ]; then
    echo "❌ Error: Failed to install dependencies"
    exit 1
fi

# Create environment file if it doesn't exist
if [ ! -f ".env.local" ]; then
    echo "📝 Creating .env.local from template..."
    cp env.example .env.local
    echo "✅ Created .env.local - please update with your Solace credentials"
else
    echo "✅ .env.local already exists"
fi

# Check if Solace Agent Mesh is running
echo "🔍 Checking Solace Agent Mesh connection..."
if curl -s http://localhost:8000 > /dev/null 2>&1; then
    echo "✅ Solace Agent Mesh appears to be running on localhost:8000"
else
    echo "⚠️  Warning: Solace Agent Mesh doesn't appear to be running on localhost:8000"
    echo "   Please start SAM first: cd .. && sam run"
fi

echo ""
echo "🎉 Frontend setup complete!"
echo ""
echo "Next steps:"
echo "1. Update .env.local with your Solace credentials (when available)"
echo "2. Start the development server: npm run dev"
echo "3. Open http://localhost:3000 in your browser"
echo ""
echo "For more information, see frontend/README.md"
