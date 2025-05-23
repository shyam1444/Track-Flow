# TrackFlow CRM Web App

A web application to manage sales leads and orders, built with FastAPI, React, and Firebase.

## Tech Stack

-   **Backend:** FastAPI
-   **Frontend:** React
-   **Database:** Firebase
-   **Charting:** Chart.js
-   **Hosting:** Vercel

## Project Structure

-   `backend/`: Contains the FastAPI backend application.
-   `frontend/`: Contains the React frontend application.

## Setup

More detailed setup instructions will be added here as the project progresses.

## Database Schema (Firebase Firestore)

We will use two main collections in Firestore:

### `leads` Collection
Each document in this collection represents a lead.

-   `id`: Firebase Document ID (automatically generated)
-   `name`: string
-   `contact`: string
-   `company`: string (optional)
-   `product_interest`: string (optional)
-   `stage`: string (e.g., 'New', 'Contacted', 'Qualified', 'Proposal Sent', 'Won', 'Lost')
-   `follow_up_date`: timestamp or date string (optional)
-   `notes`: string (optional)

### `orders` Collection
Each document in this collection represents an order.

-   `id`: Firebase Document ID (automatically generated)
-   `lead_id`: string (references the ID of the linked lead in the `leads` collection)
-   `status`: string (e.g., 'Order Received', 'In Development', 'Ready to Dispatch', 'Dispatched')
-   `dispatch_date`: timestamp or date string (optional)
-   `tracking_info`: string (optional) 


Website: https://68304a3ef67097c45818a0f2--lucky-moonbeam-f4a2f3.netlify.app/
