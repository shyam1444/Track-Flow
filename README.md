# Track Flow - Lead and Order Management System

A full-stack application for managing leads and orders with a modern UI and real-time updates.

## Features

- Lead Management
  - Create, update, and delete leads
  - Track lead stages (New, Contacted, Qualified, Proposal Sent, Won, Lost)
  - Document upload and management
  - Follow-up date tracking

- Order Management
  - Create and track orders
  - Update order status
  - Document management
  - Link orders to leads

- Analytics Dashboard
  - Lead stage metrics
  - Order status metrics
  - Follow-up reminders

## Tech Stack

### Frontend
- React.js
- TypeScript
- Material-UI
- Firebase Authentication
- Axios for API calls

### Backend
- FastAPI (Python)
- Firebase Admin SDK
- Firebase Firestore
- Firebase Storage

## Project Structure

```
track-flow/
├── frontend/               # React frontend application
│   ├── public/            # Static files
│   ├── src/               # Source files
│   │   ├── components/    # React components
│   │   ├── services/      # API services
│   │   └── App.tsx        # Main application component
│   ├── package.json       # Frontend dependencies
│   └── tsconfig.json      # TypeScript configuration
│
├── backend/               # FastAPI backend application
│   ├── main.py           # Main application file
│   ├── requirements.txt   # Python dependencies
│   └── assignment3-2865c-63775c0b75a2.json  # Firebase credentials
│
├── .gitignore            # Git ignore file
├── netlify.toml          # Netlify configuration
└── README.md             # Project documentation
```

## Setup Instructions

### Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
3. Run the server:
   ```bash
   uvicorn main:app --reload
   ```

### Frontend Setup
1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm start
   ```

## Environment Variables

### Backend
- `FIREBASE_CREDENTIALS`: Firebase service account credentials

### Frontend
- `REACT_APP_API_URL`: Backend API URL
- `REACT_APP_FIREBASE_API_KEY`: Firebase API key
- `REACT_APP_FIREBASE_AUTH_DOMAIN`: Firebase auth domain
- `REACT_APP_FIREBASE_PROJECT_ID`: Firebase project ID
- `REACT_APP_FIREBASE_STORAGE_BUCKET`: Firebase storage bucket
- `REACT_APP_FIREBASE_MESSAGING_SENDER_ID`: Firebase messaging sender ID
- `REACT_APP_FIREBASE_APP_ID`: Firebase app ID

## Deployment

### Backend Deployment
The backend is deployed on Render.com with the following configuration:
- Build Command: `pip install -r requirements.txt`
- Start Command: `uvicorn main:app --host 0.0.0.0 --port $PORT`

### Frontend Deployment
The frontend is deployed on Netlify with the following configuration:
- Build Command: `npm run build`
- Publish Directory: `build`

## API Documentation

The API documentation is available at `http://localhost:8000/docs` when running the backend locally.

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a new Pull Request
