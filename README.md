# 🌶️ SpiceLush - E-Commerce Platform

A full-stack e-commerce platform built with Django REST Framework and React, specializing in spice and food product sales with comprehensive admin management features.

## 📋 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Running the Application](#running-the-application)
- [Project Structure](#project-structure)
- [API Documentation](#api-documentation)
- [Features Breakdown](#features-breakdown)

## ✨ Features

### User Features
- 🔐 User Authentication (Email, Google OAuth, OTP verification)
- 🛍️ Product Browsing with Search & Filters
- 🛒 Shopping Cart & Wishlist
- 💰 Multiple Payment Methods (Razorpay)
- 📦 Order Management & Tracking
- ⭐ Product Reviews & Ratings
- 💳 User Wallet System
- 💬 Real-time Chat Support
- 📊 Order History & Invoice Download
- 🔄 Product Return & Refund Management

### Admin Features
- 👥 User Management
- 📦 Product & Category Management
- 🎫 Coupon & Offer Management
- 📊 Sales Reports with PDF/Excel Export
- 📈 Dashboard with Analytics
- 🛎️ Order Management (Track, Update, Return Processing)
- 💬 Admin Chat Support
- 🖼️ Banner Management

## 🛠️ Tech Stack

### Backend
- **Framework**: Django 5.1.4 + Django REST Framework
- **Database**: PostgreSQL
- **Authentication**: JWT, Google OAuth2
- **Real-time**: Django Channels, WebSocket
- **Cache**: Redis
- **Payment**: Razorpay
- **Others**: Pillow, Pandas, OpenPyXL

### Frontend
- **Framework**: React 18.3.1
- **Build Tool**: Vite 6.0.5
- **State Management**: Redux Toolkit + RTK Query
- **UI Library**: Bootstrap 5.3.3, TailwindCSS
- **Routing**: React Router DOM v7
- **Forms**: React Hook Form
- **Charts**: Recharts
- **PDF Export**: jsPDF
- **Others**: Axios, React Query, SweetAlert2

## 📦 Prerequisites

- Python 3.8+
- Node.js 18+
- PostgreSQL 12+
- Redis Server
- Virtual Environment (Python)

## 🚀 Installation

### 1. Clone the Repository

```bash
git clone <repository-url>
cd Project
```

### 2. Backend Setup

```bash
# Navigate to BackEnd directory
cd BackEnd

# Create and activate virtual environment
python -m venv venv
# Windows
venv\Scripts\activate
# Linux/Mac
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Create .env file in BackEnd directory
# Add the following variables:
# SECRET_KEY=your-secret-key
# DEBUG=True
# DATABASE_NAME=your-db-name
# DATABASE_USER=your-db-user
# DATABASE_PASSWORD=your-db-password
# DATABASE_HOST=localhost
# DATABASE_PORT=5432

# Run migrations
python manage.py makemigrations
python manage.py migrate

# Create superuser
python manage.py createsuperuser
```

### 3. Frontend Setup

```bash
# Navigate to FrontEnd directory
cd FrontEnd

# Install dependencies
npm install

# Create .env file in FrontEnd directory
# Add the following variables:
# VITE_API_URL=http://localhost:8000/api
# VITE_GOOGLE_CLIENT_ID=your-google-client-id
```

## ⚙️ Configuration

### Backend Configuration

Update `BackEnd/UrbanBalcony/settings.py` with your configuration:

```python
# Database Configuration
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': config('DATABASE_NAME'),
        'USER': config('DATABASE_USER'),
        'PASSWORD': config('DATABASE_PASSWORD'),
        'HOST': config('DATABASE_HOST'),
        'PORT': config('DATABASE_PORT'),
    }
}

# Redis Configuration for Channels
CHANNEL_LAYERS = {
    'default': {
        'BACKEND': 'channels_redis.core.RedisChannelLayer',
        'CONFIG': {
            "hosts": [('127.0.0.1', 6379)],
        },
    },
}
```

### Payment Gateway (Razorpay)

Configure Razorpay credentials in your environment:

```python
RAZORPAY_KEY_ID = config('RAZORPAY_KEY_ID')
RAZORPAY_KEY_SECRET = config('RAZORPAY_KEY_SECRET')
```

## 🏃 Running the Application

### Start Redis Server

```bash
redis-server
```

### Start Backend Server

```bash
cd BackEnd
python manage.py runserver
# Backend will run on http://localhost:8000
```

### Start Frontend Server

```bash
cd FrontEnd
npm run dev
# Frontend will run on http://localhost:5173
```

### Start WebSocket Server (Daphne)

```bash
cd BackEnd
daphne -b 0.0.0.0 -p 8001 UrbanBalcony.asgi:application
```

## 📁 Project Structure

```
Project/
├── BackEnd/                      # Django Backend
│   ├── AdminPanel/              # Admin management app
│   │   ├── views.py            # Admin views
│   │   ├── serializer.py       # Admin serializers
│   │   └── urls.py             # Admin URLs
│   ├── User/                    # User management app
│   │   ├── views.py            # User views
│   │   ├── models.py           # User models
│   │   └── serializer.py       # User serializers
│   ├── chat/                    # WebSocket chat app
│   │   ├── consumers.py        # WebSocket consumers
│   │   └── routing.py          # WebSocket routing
│   ├── UrbanBalcony/           # Project settings
│   │   ├── settings.py         # Django settings
│   │   ├── urls.py             # Main URLs
│   │   └── asgi.py             # ASGI configuration
│   └── manage.py
│
├── FrontEnd/                     # React Frontend
│   ├── src/
│   │   ├── Components/         # Reusable components
│   │   ├── Pages/              # Page components
│   │   │   ├── Admin/         # Admin pages
│   │   │   └── User/          # User pages
│   │   ├── store/             # Redux store
│   │   ├── App.jsx            # Main App component
│   │   └── main.jsx           # Entry point
│   ├── package.json
│   └── vite.config.js
│
└── README.md
```

## 📡 API Documentation

### Base URL
- Development: `http://localhost:8000/api`
- Production: `https://api.spicelush.com/api`

### Key Endpoints

#### User Endpoints
- `POST /api/user/userLogin` - User login
- `POST /api/user/userSignup` - User registration
- `GET /api/user/userDetails/<id>` - Get user details
- `GET /api/user/userCart` - Get user cart

#### Admin Endpoints
- `GET /api/adminPanel/usermanage` - Get all users
- `GET /api/adminPanel/productmanage` - Get all products
- `GET /api/adminPanel/orderManagement` - Get all orders
- `GET /api/adminPanel/salesReportView` - Get sales report

## 🎯 Features Breakdown

### Authentication & Authorization
- JWT-based authentication
- Google OAuth integration
- OTP verification for password reset
- Role-based access control (Admin/User)

### Product Management
- CRUD operations for products
- Product variants (size, color, etc.)
- Category management
- Image upload and management
- Product search and filtering

### Order Management
- Order placement and tracking
- Multiple payment methods
- Order status updates
- Return and refund processing
- Invoice generation

### Admin Dashboard
- Sales analytics and reports
- User management
- Product and category management
- Coupon and offer management
- Export reports (PDF/Excel)

### Real-time Features
- Live chat support using WebSockets
- Real-time notifications
- Order status updates

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License.

## 👨‍💻 Author

**UrbanBalcony Team**

## 📧 Support

For support, email support@spicelush.com or contact through the application's chat feature.

---

**Note**: Make sure to configure all environment variables and secrets before deploying to production.
