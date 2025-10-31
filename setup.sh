#!/bin/bash

# OTT Platform Setup Script
# This script will help you set up the OTT platform quickly

set -e

echo "🎬 OTT Platform Setup Script"
echo "=============================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

# Check if Node.js is installed
check_node() {
    if ! command -v node &> /dev/null; then
        print_error "Node.js is not installed. Please install Node.js v18 or higher."
        print_info "Download from: https://nodejs.org/"
        exit 1
    fi
    
    NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
    if [ "$NODE_VERSION" -lt 18 ]; then
        print_error "Node.js version 18 or higher is required. Current version: $(node -v)"
        exit 1
    fi
    
    print_status "Node.js $(node -v) is installed"
}

# Check if npm is installed
check_npm() {
    if ! command -v npm &> /dev/null; then
        print_error "npm is not installed"
        exit 1
    fi
    
    print_status "npm $(npm -v) is installed"
}

# Check if MongoDB is running
check_mongodb() {
    if ! command -v mongosh &> /dev/null; then
        print_warning "MongoDB is not installed or not in PATH"
        print_info "Please install MongoDB and ensure it's running"
        print_info "macOS: brew install mongodb/brew/mongodb-community"
        print_info "Linux: sudo apt install mongodb"
        print_info "Windows: Download from https://www.mongodb.com/try/download/community"
    else
        if mongosh --eval "db.runCommand('ping')" > /dev/null 2>&1; then
            print_status "MongoDB is running"
        else
            print_warning "MongoDB is installed but not running"
            print_info "Please start MongoDB service"
        fi
    fi
}

# Install backend dependencies
install_backend() {
    print_info "Installing backend dependencies..."
    cd backend
    
    if [ ! -f "package.json" ]; then
        print_error "package.json not found in backend directory"
        exit 1
    fi
    
    npm install
    print_status "Backend dependencies installed"
    cd ..
}

# Install frontend dependencies
install_frontend() {
    print_info "Installing frontend dependencies..."
    cd frontend
    
    if [ ! -f "package.json" ]; then
        print_error "package.json not found in frontend directory"
        exit 1
    fi
    
    npm install
    print_status "Frontend dependencies installed"
    cd ..
}

# Setup environment files
setup_env() {
    print_info "Setting up environment files..."
    
    # Backend .env
    if [ ! -f "backend/.env" ]; then
        if [ -f "backend/.env.example" ]; then
            cp backend/.env.example backend/.env
            print_status "Created backend/.env from example"
        else
            print_warning "backend/.env.example not found"
        fi
    else
        print_info "backend/.env already exists"
    fi
    
    # Frontend .env.local
    if [ ! -f "frontend/.env.local" ]; then
        if [ -f "frontend/.env.example" ]; then
            cp frontend/.env.example frontend/.env.local
            print_status "Created frontend/.env.local from example"
        else
            print_warning "frontend/.env.example not found"
        fi
    else
        print_info "frontend/.env.local already exists"
    fi
}

# Create necessary directories
create_directories() {
    print_info "Creating necessary directories..."
    
    # Backend uploads directory
    mkdir -p backend/uploads/videos
    mkdir -p backend/uploads/thumbnails
    print_status "Created backend upload directories"
    
    # Frontend public directories
    mkdir -p frontend/public/images
    mkdir -p frontend/public/icons
    print_status "Created frontend public directories"
}

# Main setup function
main() {
    echo "Starting OTT Platform setup..."
    echo ""
    
    # Check prerequisites
    print_info "Checking prerequisites..."
    check_node
    check_npm
    check_mongodb
    echo ""
    
    # Install dependencies
    print_info "Installing dependencies..."
    install_backend
    install_frontend
    echo ""
    
    # Setup environment
    setup_env
    echo ""
    
    # Create directories
    create_directories
    echo ""
    
    print_status "Setup completed successfully!"
    echo ""
    echo "🎉 Next steps:"
    echo "1. Configure your environment variables in backend/.env and frontend/.env.local"
    echo "2. Start MongoDB if not already running"
    echo "3. Start the backend server: cd backend && npm run dev"
    echo "4. Start the frontend server: cd frontend && npm run dev"
    echo "5. Open http://localhost:3000 in your browser"
    echo ""
    echo "📚 For detailed setup instructions, see docs/setup-guide.md"
    echo ""
}

# Run main function
main
