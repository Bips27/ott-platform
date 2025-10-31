# OTT Platform Setup Guide

This guide will walk you through setting up the complete OTT platform from scratch. Follow these steps carefully to get your streaming platform up and running.

## 🚀 Prerequisites

Before you begin, make sure you have the following installed on your system:

### Required Software
- **Node.js** (v18 or higher) - [Download here](https://nodejs.org/)
- **MongoDB** (v5 or higher) - [Download here](https://www.mongodb.com/try/download/community)
- **Git** - [Download here](https://git-scm.com/)

### Optional but Recommended
- **VS Code** or any code editor
- **Postman** for API testing
- **MongoDB Compass** for database management

### Cloud Services (for production)
- **AWS Account** (for S3 and CloudFront)
- **Stripe Account** (for payments)
- **PayPal Developer Account** (for payments)

## 📋 Step-by-Step Setup

### Step 1: Clone and Navigate to Project
```bash
# Navigate to your desired directory
cd ~/projects

# Clone the repository (replace with your actual repo URL)
git clone <your-repository-url> ott-platform
cd ott-platform
```

### Step 2: Install Dependencies

#### Backend Dependencies
```bash
cd backend
npm install
```

#### Frontend Dependencies
```bash
cd ../frontend
npm install
```

### Step 3: Database Setup

#### Install MongoDB
1. **macOS (using Homebrew):**
   ```bash
   brew tap mongodb/brew
   brew install mongodb-community
   brew services start mongodb/brew/mongodb-community
   ```

2. **Windows:**
   - Download MongoDB Community Server from the official website
   - Install and start the MongoDB service

3. **Linux (Ubuntu):**
   ```bash
   sudo apt update
   sudo apt install mongodb
   sudo systemctl start mongodb
   sudo systemctl enable mongodb
   ```

#### Create Database
```bash
# Connect to MongoDB
mongosh

# Create database
use ott-platform

# Create initial admin user (optional)
db.users.insertOne({
  email: "admin@ottplatform.com",
  firstName: "Admin",
  lastName: "User",
  role: "admin",
  isActive: true,
  isEmailVerified: true,
  createdAt: new Date(),
  updatedAt: new Date()
})

# Exit MongoDB shell
exit
```

### Step 4: Environment Configuration

#### Backend Environment
```bash
cd backend
cp .env.example .env
```

Edit the `.env` file with your configuration:

```env
# Server Configuration
NODE_ENV=development
PORT=5000
FRONTEND_URL=http://localhost:3000

# Database
MONGODB_URI=mongodb://localhost:27017/ott-platform

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=7d

# AWS Configuration (for production)
AWS_ACCESS_KEY_ID=your-aws-access-key
AWS_SECRET_ACCESS_KEY=your-aws-secret-key
AWS_REGION=us-east-1
AWS_S3_BUCKET=your-ott-platform-bucket
AWS_CLOUDFRONT_DOMAIN=your-cloudfront-domain.cloudfront.net

# Stripe Configuration (for production)
STRIPE_SECRET_KEY=sk_test_your-stripe-secret-key
STRIPE_WEBHOOK_SECRET=whsec_your-stripe-webhook-secret
STRIPE_PRICE_MONTHLY=price_monthly_plan_id
STRIPE_PRICE_YEARLY=price_yearly_plan_id

# PayPal Configuration (for production)
PAYPAL_CLIENT_ID=your-paypal-client-id
PAYPAL_CLIENT_SECRET=your-paypal-client-secret
PAYPAL_MODE=sandbox

# Email Configuration (optional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-email-password

# File Upload Limits
MAX_FILE_SIZE=500000000
MAX_VIDEO_DURATION=7200

# Security
BCRYPT_ROUNDS=12
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

#### Frontend Environment
```bash
cd ../frontend
cp .env.example .env.local
```

Edit the `.env.local` file:

```env
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:5000/api

# Authentication
NEXT_PUBLIC_JWT_STORAGE_KEY=ott_auth_token

# AWS Configuration (for production)
NEXT_PUBLIC_AWS_CLOUDFRONT_DOMAIN=your-cloudfront-domain.cloudfront.net

# Stripe Configuration (for production)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your-stripe-publishable-key

# PayPal Configuration (for production)
NEXT_PUBLIC_PAYPAL_CLIENT_ID=your-paypal-client-id

# Google OAuth (optional)
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-google-client-id

# Facebook OAuth (optional)
NEXT_PUBLIC_FACEBOOK_APP_ID=your-facebook-app-id

# Apple OAuth (optional)
NEXT_PUBLIC_APPLE_CLIENT_ID=your-apple-client-id
```

### Step 5: Start Development Servers

#### Terminal 1 - Backend Server
```bash
cd backend
npm run dev
```

You should see:
```
✅ Connected to MongoDB
🚀 Server running on port 5000
📱 Environment: development
🔗 Health check: http://localhost:5000/api/health
```

#### Terminal 2 - Frontend Server
```bash
cd frontend
npm run dev
```

You should see:
```
- ready started server on 0.0.0.0:3000, url: http://localhost:3000
```

### Step 6: Verify Installation

1. **Backend Health Check:**
   - Open your browser and go to: `http://localhost:5000/api/health`
   - You should see a JSON response with status "OK"

2. **Frontend Application:**
   - Open your browser and go to: `http://localhost:3000`
   - You should see the OTT platform homepage

3. **Database Connection:**
   - The backend console should show "✅ Connected to MongoDB"

## 🔧 Additional Setup

### AWS S3 Setup (for video storage)

1. **Create S3 Bucket:**
   ```bash
   # Install AWS CLI
   pip install awscli

   # Configure AWS credentials
   aws configure
   ```

2. **Create bucket:**
   ```bash
   aws s3 mb s3://your-ott-platform-bucket
   ```

3. **Configure CORS:**
   Create a file `cors.json`:
   ```json
   [
     {
       "AllowedHeaders": ["*"],
       "AllowedMethods": ["GET", "PUT", "POST", "DELETE"],
       "AllowedOrigins": ["*"],
       "ExposeHeaders": []
     }
   ]
   ```

   Apply CORS:
   ```bash
   aws s3api put-bucket-cors --bucket your-ott-platform-bucket --cors-configuration file://cors.json
   ```

### Stripe Setup (for payments)

1. **Create Stripe Account:**
   - Go to [stripe.com](https://stripe.com) and create an account
   - Get your API keys from the dashboard

2. **Create Products and Prices:**
   ```bash
   # Install Stripe CLI
   # Create products and prices in Stripe dashboard
   # Note down the price IDs for monthly and yearly plans
   ```

### PayPal Setup (for payments)

1. **Create PayPal Developer Account:**
   - Go to [developer.paypal.com](https://developer.paypal.com)
   - Create an account and get your client ID and secret

## 🧪 Testing the Setup

### Test User Registration
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "firstName": "Test",
    "lastName": "User"
  }'
```

### Test User Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

## 🚨 Troubleshooting

### Common Issues

1. **MongoDB Connection Error:**
   - Make sure MongoDB is running: `brew services start mongodb/brew/mongodb-community`
   - Check if the port 27017 is available

2. **Port Already in Use:**
   - Change the port in `.env` file
   - Kill the process using the port: `lsof -ti:5000 | xargs kill -9`

3. **Node Modules Issues:**
   - Delete `node_modules` and `package-lock.json`
   - Run `npm install` again

4. **Environment Variables Not Loading:**
   - Make sure the `.env` files are in the correct directories
   - Restart the development servers

### Getting Help

If you encounter issues:

1. Check the console logs for error messages
2. Verify all prerequisites are installed
3. Ensure all environment variables are set correctly
4. Check if all services (MongoDB, Node.js) are running

## 📚 Next Steps

After successful setup:

1. **Explore the Codebase:**
   - Review the folder structure
   - Understand the component hierarchy
   - Check the API endpoints

2. **Add Content:**
   - Upload sample videos
   - Create subscription plans
   - Add user management features

3. **Customize:**
   - Modify the UI/UX
   - Add new features
   - Configure payment methods

4. **Deploy:**
   - Set up production environment
   - Configure domain and SSL
   - Set up monitoring and logging

## 🎉 Congratulations!

You've successfully set up your OTT platform! The application is now running and ready for development. You can start building your streaming platform by:

- Adding more content
- Implementing additional features
- Customizing the design
- Setting up payment processing
- Adding analytics and monitoring

Happy coding! 🚀
