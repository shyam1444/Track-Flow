# 🚀 Track-Flow - Complete CRM & Project Management Platform

[![FastAPI](https://img.shields.io/badge/FastAPI-005571?style=for-the-badge&logo=fastapi)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Firebase](https://img.shields.io/badge/Firebase-039BE5?style=for-the-badge&logo=Firebase&logoColor=white)](https://firebase.google.com/)

A comprehensive full-stack CRM and project management platform designed for modern businesses. Track-Flow combines lead management, order processing, time tracking, and advanced analytics in one powerful application.

## ✨ Key Features

### 🎯 Lead Management
- **Complete Lead Lifecycle**: Create, update, and manage leads through their entire journey
- **Stage Tracking**: Monitor leads through stages (New → Contacted → Qualified → Proposal Sent → Won/Lost)
- **Smart Follow-ups**: Automated follow-up date tracking and reminders
- **Document Management**: Upload and organize lead-related documents
- **Advanced Filtering**: Filter leads by stage, follow-up dates, and custom criteria
- **Duplicate Prevention**: Intelligent duplicate detection based on name, contact, and company

### 📦 Order Management
- **Order Processing**: Create and track orders linked to leads
- **Status Updates**: Real-time order status tracking (Order Received → In Development → Ready to Dispatch → Dispatched)
- **Document Handling**: Attach invoices, contracts, and delivery documents
- **Bulk Operations**: Bulk delete and update operations for efficiency
- **Order Analytics**: Track completion rates and processing times

### 📊 Advanced Analytics & Reporting
- **Comprehensive Dashboard**: Real-time metrics and KPIs
- **Lead Analytics**: Conversion rates, stage distribution, and performance metrics
- **Order Insights**: Revenue tracking, completion rates, and delivery analytics
- **Cost Analysis**: Cost breakdown, ROI calculations, and budget tracking
- **Team Performance**: Productivity metrics and efficiency tracking
- **Predictive Analytics**: AI-powered predictions for leads and revenue
- **Export Capabilities**: Generate reports in PDF, Excel, and CSV formats

### ⏱️ Time Tracking
- **Real-time Tracking**: Start/stop timer with live duration display
- **Task Management**: Organize time entries by tasks and projects
- **Billable Hours**: Track billable vs non-billable time
- **Time Analytics**: Daily, weekly, and monthly time summaries
- **Project Allocation**: Assign time entries to specific projects
- **Historical Data**: Complete time tracking history with filtering

### 📋 Kanban Board
- **Visual Workflow**: Drag-and-drop Kanban interface for lead management
- **Custom Stages**: Configurable workflow stages
- **Real-time Updates**: Live updates across all users
- **Card Details**: Rich lead information on Kanban cards

### 🔐 Authentication & Security
- **Firebase Authentication**: Secure user registration and login
- **JWT Tokens**: Stateless authentication with refresh tokens
- **Role-based Access**: User roles and permissions
- **Email Verification**: Account verification system
- **Password Security**: Secure password hashing and validation

### 💬 Collaboration Features
- **Comments System**: Add comments to leads and orders
- **Activity Tracking**: Complete audit trail of all actions
- **Team Collaboration**: Multi-user support with real-time updates

## 🛠️ Technology Stack

### Frontend
- **React 18** with TypeScript for type-safe development
- **Material-UI (MUI)** for modern, responsive design
- **React Router** for client-side routing
- **Chart.js** for data visualization and analytics
- **Date-fns** for advanced date manipulation
- **Axios** for HTTP client requests
- **Firebase SDK** for authentication

### Backend
- **FastAPI** - High-performance Python web framework
- **Firebase Admin SDK** - Server-side Firebase integration
- **Firebase Firestore** - NoSQL document database
- **Firebase Storage** - File storage and management
- **PyJWT** - JSON Web Token implementation
- **Pydantic** - Data validation and serialization
- **Uvicorn** - ASGI server for production deployment

### Database & Storage
- **Firebase Firestore** - Scalable NoSQL database
- **Firebase Storage** - Secure file storage
- **Local Storage** - Client-side data persistence

## 📁 Project Architecture

```
Track-Flow/
├── 📁 frontend/                    # React TypeScript Application
│   ├── 📁 public/                 # Static assets
│   │   ├── favicon.ico
│   │   ├── index.html
│   │   └── logo192.png
│   ├── 📁 src/
│   │   ├── 📁 components/         # React Components
│   │   │   ├── auth/              # Authentication components
│   │   │   ├── Dashboard.tsx      # Main dashboard
│   │   │   ├── LeadManagement.tsx # Lead CRUD operations
│   │   │   ├── OrderManagement.tsx# Order processing
│   │   │   ├── TimeTracking.tsx   # Time tracking interface
│   │   │   ├── KanbanBoard.tsx    # Kanban workflow
│   │   │   ├── Reports.tsx        # Analytics & reporting
│   │   │   └── ...
│   │   ├── 📁 contexts/           # React Context providers
│   │   ├── 📁 pages/              # Page components
│   │   ├── App.tsx                # Main application
│   │   └── index.tsx              # Application entry point
│   ├── package.json               # Dependencies & scripts
│   └── tsconfig.json              # TypeScript configuration
│
├── 📁 backend/                     # FastAPI Python Application
│   ├── main.py                    # FastAPI application & routes
│   ├── auth_utils.py              # Authentication utilities
│   ├── requirements.txt           # Python dependencies
│   ├── .env.example               # Environment variables template
│   └── firebase-credentials.json  # Firebase service account (not in repo)
│
├── 📄 README.md                   # Project documentation
├── 📄 .gitignore                  # Git ignore rules
└── 📄 Track_Flow_Test_Cases.xlsx  # Comprehensive test cases
```

## 🚀 Quick Start Guide

### Prerequisites
- **Node.js** (v16 or higher)
- **Python** (v3.8 or higher)
- **Firebase Project** with Firestore and Authentication enabled

### 1. Clone the Repository
```bash
git clone https://github.com/your-username/Track-Flow.git
cd Track-Flow
```

### 2. Backend Setup
```bash
# Navigate to backend directory
cd backend

# Create virtual environment (recommended)
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Set up environment variables
cp .env.example .env
# Edit .env with your configuration

# Add Firebase credentials
# Place your Firebase service account JSON file in the backend directory

# Start the development server
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### 3. Frontend Setup
```bash
# Navigate to frontend directory (new terminal)
cd frontend

# Install dependencies
npm install

# Set up environment variables
# Create .env.local file with your Firebase config

# Start the development server
npm start
```

### 4. Access the Application
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs

## ⚙️ Configuration

### Backend Environment Variables (.env)
```env
# JWT Configuration
JWT_SECRET=your-super-secure-jwt-secret-key-here
JWT_ALGORITHM=HS256

# Firebase Configuration
FIREBASE_STORAGE_BUCKET=your-project.appspot.com

# Optional: Google Generative AI
GOOGLE_API_KEY=your-google-ai-api-key
```

### Frontend Environment Variables (.env.local)
```env
# Backend API
REACT_APP_API_URL=http://localhost:8000

# Firebase Configuration
REACT_APP_FIREBASE_API_KEY=your-api-key
REACT_APP_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=your-project-id
REACT_APP_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=123456789
REACT_APP_FIREBASE_APP_ID=1:123456789:web:abcdef123456
```

## 🚀 Deployment

### Backend Deployment (Render/Railway/Heroku)
```bash
# Build command
pip install -r requirements.txt

# Start command
uvicorn main:app --host 0.0.0.0 --port $PORT
```

### Frontend Deployment (Netlify/Vercel)
```bash
# Build command
npm run build

# Publish directory
build
```

## 📖 API Documentation

The backend provides a comprehensive REST API with the following endpoints:

### Authentication
- `POST /auth/signup` - User registration
- `POST /auth/verify-token` - Token verification
- `GET /auth/me` - Get current user info

### Lead Management
- `GET /leads` - List all leads (with filtering)
- `POST /leads` - Create new lead
- `PUT /leads/{id}` - Update lead
- `DELETE /leads/{id}` - Delete lead
- `GET /leads/followup` - Get follow-up reminders

### Order Management
- `GET /orders` - List all orders
- `POST /orders` - Create new order
- `PUT /orders/{id}` - Update order
- `PUT /orders/{id}/status` - Update order status
- `POST /orders/bulk_delete` - Bulk delete orders

### Analytics & Metrics
- `GET /metrics/leads` - Lead metrics
- `GET /metrics/orders` - Order metrics
- `GET /analytics/comprehensive` - Complete analytics data
- `GET /analytics/export` - Export reports

### Time Tracking
- `GET /time-entries` - List time entries
- `POST /time-entries` - Create time entry
- `PUT /time-entries/{id}` - Update time entry
- `DELETE /time-entries/{id}` - Delete time entry
- `GET /time-summary` - Time tracking summary

Visit `http://localhost:8000/docs` for interactive API documentation.

## 🧪 Testing

The project includes comprehensive test cases covering:
- User authentication and authorization
- Lead management workflows
- Order processing
- Time tracking functionality
- Analytics and reporting
- Error handling and edge cases

Test cases are documented in `Track_Flow_Comprehensive_Test_Cases.xlsx`.

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/amazing-feature`
3. **Make your changes** and add tests if applicable
4. **Commit your changes**: `git commit -m 'Add amazing feature'`
5. **Push to the branch**: `git push origin feature/amazing-feature`
6. **Open a Pull Request**

### Development Guidelines
- Follow TypeScript best practices for frontend
- Use Python type hints for backend code
- Write meaningful commit messages
- Add tests for new features
- Update documentation as needed
