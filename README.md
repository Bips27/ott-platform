# All-in-One OTT Platform

A comprehensive Over-The-Top (OTT) streaming platform similar to Muvi One, built with modern web technologies.

## 🚀 Features

### User Features
- 🔐 User authentication (Email, Google, Apple, Facebook)
- 👤 User profiles with watch history and saved videos
- 💳 Subscription management (Stripe & PayPal)
- 🔍 Content search, filters, and categories
- 🎬 Advanced video player with subtitles and multiple resolutions
- 📱 Multi-device support (desktop, mobile, tablet)

### Admin Features
- 📊 Admin dashboard for content management
- 💰 Subscription plan management
- 📈 Analytics and reporting
- 👥 User management and role assignment

## 🛠 Tech Stack

- **Frontend**: React with Next.js
- **Backend**: Node.js with Express
- **Database**: MongoDB
- **Video Storage**: AWS S3 + CloudFront CDN
- **Authentication**: JWT
- **Payments**: Stripe & PayPal
- **Styling**: Tailwind CSS

## 📁 Project Structure

```
ott-platform/
├── frontend/          # React Next.js application
├── backend/           # Node.js Express server
├── shared/            # Shared types and utilities
└── docs/              # Documentation
```

## 🚀 Quick Start

### Prerequisites
- Node.js (v18 or higher)
- MongoDB
- AWS Account (for S3 and CloudFront)
- Stripe & PayPal accounts

### Installation

1. **Clone and setup:**
```bash
git clone <your-repo>
cd ott-platform
```

2. **Install dependencies:**
```bash
# Frontend
cd frontend
npm install

# Backend
cd ../backend
npm install
```

3. **Environment setup:**
```bash
# Copy environment files
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env.local
```

4. **Start development servers:**
```bash
# Backend (Terminal 1)
cd backend
npm run dev

# Frontend (Terminal 2)
cd frontend
npm run dev
```

## 📖 Documentation

- [API Documentation](./docs/api.md)
- [Deployment Guide](./docs/deployment.md)
- [Contributing Guidelines](./docs/contributing.md)

## 🔧 Configuration

See [Configuration Guide](./docs/configuration.md) for detailed setup instructions.

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.
# ott-platform
