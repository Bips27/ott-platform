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

## 🌐 Deploying Frontend to Netlify

This repo includes a `netlify.toml` configured to deploy the Next.js frontend from `frontend/` using the official Netlify Next.js plugin.

Basic steps:
1. Push the repository to GitHub
2. In Netlify, create a new site from Git and select this repo
3. Build settings (auto-detected by `netlify.toml`):
   - Base directory: `frontend`
   - Build command: `npm ci && npm run build`
   - Publish directory: `.next`
4. Set frontend environment variables in Netlify UI:
   - `NEXT_PUBLIC_API_URL` → your backend URL (e.g. `https://api.yourdomain.com/api`)
   - Any other `NEXT_PUBLIC_*` vars as needed

Notes:
- The Express backend is not deployed on Netlify. Host it on a service like Render, Railway, Fly.io, or AWS, and point `NEXT_PUBLIC_API_URL` to it.
- If you prefer proxying API calls via Netlify, add a redirect in `netlify.toml` mapping `/api/*` to your backend URL.

## 📖 Documentation

- [API Documentation](./docs/api.md)
- [Deployment Guide](./docs/deployment.md)
- [Contributing Guidelines](./docs/contributing.md)

## 🔧 Configuration

See [Configuration Guide](./docs/configuration.md) for detailed setup instructions.

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.
# ott-platform
