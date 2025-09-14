import os
from fastapi import FastAPI, HTTPException, Depends, status, Request, Header, File, UploadFile, Form, Body
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm, HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel
from typing import Optional, List, Dict, Any, Union
import firebase_admin
from firebase_admin import credentials, auth, firestore, storage
import os
from dotenv import load_dotenv
from datetime import datetime, timedelta
import jwt
import uuid
import json
from fastapi.responses import JSONResponse
import uvicorn
from auth_utils import verify_token, get_current_user
import pandas as pd
import datetime
import jwt
from jwt import PyJWTError, ExpiredSignatureError, decode, encode
import hashlib
import secrets
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Initialize Firebase Admin
import os
from pathlib import Path

# Get the absolute path to the service account JSON file
service_account_path = os.path.join(
    os.path.dirname(os.path.abspath(__file__)),
    "assignment3-2865c-dc4d015bc7df.json"
)

# Check if service account file exists
if not os.path.exists(service_account_path):
    raise FileNotFoundError(
        f"Firebase service account file not found at {service_account_path}. "
        "Please make sure the file exists and the path is correct."
    )

try:
    # Initialize Firebase Admin SDK
    cred = credentials.Certificate(service_account_path)
    firebase_admin.initialize_app(cred, {
        'storageBucket': os.getenv('FIREBASE_STORAGE_BUCKET', 'assignment3-2865c.appspot.com')
    })
    db = firestore.client()
    print("Firebase Admin SDK initialized successfully")
except Exception as e:
    print(f"Error initializing Firebase Admin SDK: {str(e)}")
    raise

app = FastAPI()

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",  # Local development
        "https://lucky-moonbeam-f4a2f3.netlify.app"  # Your Netlify URL
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure Firebase Storage bucket
BUCKET_NAME = os.environ.get('FIREBASE_STORAGE_BUCKET', 'assignment3-2865c.appspot.com') # Replace with your default bucket name if different
bucket = storage.bucket(name=BUCKET_NAME)

# JWT Configuration
JWT_SECRET = os.getenv("JWT_SECRET")
if not JWT_SECRET or JWT_SECRET == "your-secret-key-123":
    # Generate a secure random secret key if not set
    JWT_SECRET = secrets.token_urlsafe(32)
    print("WARNING: Using auto-generated JWT_SECRET. For production, set JWT_SECRET in .env file")

JWT_ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30  # 30 minutes
REFRESH_TOKEN_EXPIRE_DAYS = 7  # 7 days

# Security
security = HTTPBearer()

class LeadCreate(BaseModel):
    name: str
    contact: str
    company: Optional[str] = None
    product_interest: Optional[str] = None
    stage: str = "New"
    follow_up_date: Optional[str] = None
    notes: Optional[str] = None
    documents: List[str] = []
    created_at: Optional[str] = None

class LeadUpdateStage(BaseModel):
    stage: str

class Lead(BaseModel):
    id: str
    name: str
    contact: str
    company: Optional[str] = None
    product_interest: Optional[str] = None
    stage: str
    follow_up_date: Optional[str] = None
    notes: Optional[str] = None
    documents: List[str] = []
    created_at: Optional[str] = None

class OrderCreate(BaseModel):
    lead_id: str
    status: str = "Order Received"
    dispatch_date: Optional[str] = None
    tracking_info: Optional[str] = None
    documents: List[str] = []

class OrderUpdateStatus(BaseModel):
    status: str

class Order(BaseModel):
    id: str
    lead_id: str
    status: str
    dispatch_date: Optional[str] = None
    tracking_info: Optional[str] = None
    documents: List[str] = []

# Authentication Models
class UserSignup(BaseModel):
    email: str
    password: str
    full_name: str

class UserLogin(BaseModel):
    email: str
    password: str

class User(BaseModel):
    id: str
    email: str
    full_name: str
    created_at: str

class Comment(BaseModel):
    id: str = None
    entityId: str
    entityType: str
    author: str
    content: str
    created_at: str = None

class TimeEntryCreate(BaseModel):
    task_name: str
    description: Optional[str] = None
    project_id: Optional[str] = None
    start_time: str
    end_time: Optional[str] = None
    duration_minutes: Optional[int] = None
    is_billable: bool = True
    tags: List[str] = []

class TimeEntry(TimeEntryCreate):
    id: str
    user_id: str
    created_at: str
    updated_at: str

# Authentication Helper Functions
def hash_password(password: str) -> str:
    return hashlib.sha256(password.encode()).hexdigest()

def verify_password(password: str, hashed_password: str) -> bool:
    return hash_password(password) == hashed_password

def create_access_token(user_id: str, email: str, email_verified: bool = False, role: str = "user"):
    """
    Create a JWT access token with the given user information
    """
    to_encode = {
        "user_id": user_id,
        "email": email,
        "email_verified": email_verified,
        "role": role,
        "type": "access",
        "exp": datetime.datetime.utcnow() + datetime.timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    }
    return encode(to_encode, JWT_SECRET, algorithm=JWT_ALGORITHM)

def create_refresh_token(user_id: str):
    """
    Create a JWT refresh token
    """
    to_encode = {
        "user_id": user_id,
        "type": "refresh",
        "exp": datetime.datetime.utcnow() + datetime.timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS)
    }
    return encode(to_encode, JWT_SECRET, algorithm=JWT_ALGORITHM)

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    credentials_exception = HTTPException(
        status_code=401,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        token = credentials.credentials
        if not token:
            raise credentials_exception
            
        payload = decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        user_id = payload.get("user_id")
        email = payload.get("email")
        if user_id is None or email is None:
            raise credentials_exception
            
        return {
            "user_id": user_id, 
            "email": email,
            "email_verified": payload.get("email_verified", False),
            "role": payload.get("role", "user")
        }
        
    except ExpiredSignatureError:
        raise HTTPException(
            status_code=401,
            detail="Token has expired",
            headers={"WWW-Authenticate": "Bearer"},
        )
    except PyJWTError:
        raise credentials_exception

@app.get("/")
def read_root():
    return {"Hello": "World"}

# Authentication Endpoints
@app.post("/auth/signup")
async def signup(user_data: UserSignup):
    try:
        # Input validation
        if not user_data.email or "@" not in user_data.email or "." not in user_data.email:
            raise HTTPException(status_code=400, detail="Invalid email format")
            
        if len(user_data.password) < 8:
            raise HTTPException(
                status_code=400,
                detail="Password must be at least 8 characters long"
            )
            
        if not user_data.full_name or len(user_data.full_name.strip()) < 2:
            raise HTTPException(
                status_code=400,
                detail="Full name is required and must be at least 2 characters long"
            )

        # Check if user already exists in Firestore
        existing_user = db.collection("users").where("email", "==", user_data.email).limit(1).stream()
        if any(existing_user):
            raise HTTPException(
                status_code=400,
                detail="A user with this email already exists"
            )

        try:
            # Create user in Firebase Auth
            user = auth.create_user(
                email=user_data.email,
                password=user_data.password,
                display_name=user_data.full_name,
                email_verified=False,
                disabled=False
            )

            # Create user in Firestore
            user_doc = {
                "email": user_data.email.lower(),
                "full_name": user_data.full_name.strip(),
                "created_at": firestore.SERVER_TIMESTAMP,
                "updated_at": firestore.SERVER_TIMESTAMP,
                "email_verified": False,
                "role": "user",
                "active": True,
                "last_login": None,
                "login_attempts": 0
            }
            
            # Store user in Firestore with UID as document ID
            user_ref = db.collection("users").document(user.uid)
            user_ref.set(user_doc)
            
            # Send email verification
            try:
                verification_link = auth.generate_email_verification_link(user_data.email)
                # TODO: Send verification email with the link
                print(f"Verification email sent to {user_data.email}")
            except Exception as email_error:
                print(f"Error sending verification email: {str(email_error)}")
            
            # Generate JWT token
            token = create_access_token(
                user_id=user.uid,
                email=user_data.email,
                email_verified=False,
                role="user"
            )
            
            return {
                "message": "User created successfully. Please check your email to verify your account.",
                "token": token,
                "user": {
                    "id": user.uid,
                    "email": user_data.email,
                    "full_name": user_data.full_name.strip(),
                    "email_verified": False,
                    "role": "user"
                }
            }
            
        except auth.EmailAlreadyExistsError:
            raise HTTPException(
                status_code=400,
                detail="A user with this email already exists"
            )
        except Exception as e:
            # Clean up if user creation fails
            try:
                auth.delete_user(user.uid)
            except:
                pass
            raise HTTPException(
                status_code=400,
                detail=f"Error creating user: {str(e)}"
            )
            
    except HTTPException as http_exc:
        raise http_exc
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"An unexpected error occurred: {str(e)}"
        )

@app.post("/auth/verify-token")
async def verify_firebase_token(
    authorization: str = Header(..., description="Firebase ID token in Authorization header")
):
    """
    Verify a Firebase ID token.
    This endpoint is used by the frontend to verify the token after client-side authentication.
    """
    try:
        # Extract the token from the Authorization header
        if not authorization.startswith("Bearer "):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid authentication scheme. Use Bearer token.",
                headers={"WWW-Authenticate": "Bearer"},
            )
            
        token = authorization.split(" ")[1]
        
        # Verify the token
        decoded_token = auth.verify_id_token(token, check_revoked=True)
        
        # Get the user's info from Firestore
        user_doc = db.collection("users").document(decoded_token["uid"]).get()
        
        if not user_doc.exists:
            # Create user document if it doesn't exist (this should be handled in signup)
            user_data = {
                "email": decoded_token.get("email"),
                "full_name": decoded_token.get("name", ""),
                "email_verified": decoded_token.get("email_verified", False),
                "role": "user",
                "active": True,
                "created_at": firestore.SERVER_TIMESTAMP,
                "updated_at": firestore.SERVER_TIMESTAMP,
                "last_login": firestore.SERVER_TIMESTAMP,
                "login_attempts": 0
            }
            db.collection("users").document(decoded_token["uid"]).set(user_data)
            user_data_dict = user_data
        else:
            user_data_dict = user_doc.to_dict()
            
            # Update last login time
            db.collection("users").document(decoded_token["uid"]).update({
                "last_login": firestore.SERVER_TIMESTAMP,
                "login_attempts": 0
            })
        
        # Create a custom JWT token for your application
        custom_token = create_access_token(
            user_id=decoded_token["uid"],
            email=decoded_token.get("email"),
            email_verified=decoded_token.get("email_verified", False),
            role=user_data_dict.get("role", "user")
        )
        
        # Return user data and custom token
        return {
            "message": "Token verified successfully",
            "token": custom_token,
            "user": {
                "id": decoded_token["uid"],
                "email": decoded_token.get("email"),
                "full_name": user_data_dict.get("full_name", ""),
                "email_verified": decoded_token.get("email_verified", False),
                "role": user_data_dict.get("role", "user")
            }
        }
        
    except auth.RevokedIdTokenError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token has been revoked. Please log in again.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    except (auth.InvalidIdTokenError, auth.ExpiredIdTokenError):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired authentication token.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    except Exception as e:
        print(f"Token verification error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An error occurred during token verification."
        )

@app.get("/auth/me", response_model=UserResponse)
async def get_current_user_info(current_user: dict = Depends(get_current_user)):
    """
    Get the current authenticated user's information.
    This endpoint is protected and requires a valid JWT token.
    """
    try:
        user_doc = db.collection("users").document(current_user["uid"]).get()
        
        if not user_doc.exists:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
            
        user_data = user_doc.to_dict()
        
        return {
            "id": current_user["uid"],
            "email": current_user["email"],
            "full_name": user_data.get("full_name", ""),
            "email_verified": current_user["email_verified"],
            "role": user_data.get("role", "user")
        }
        
    except Exception as e:
        print(f"Error getting user info: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An error occurred while fetching user information."
        )

@app.get("/auth/me")
def get_current_user_info(current_user: dict = Depends(get_current_user)):
    user_doc = db.collection("users").document(current_user["user_id"]).get()
    if not user_doc.exists:
        raise HTTPException(status_code=404, detail="User not found")
    
    user_data = user_doc.to_dict()
    return {
        "id": user_doc.id,
        "email": user_data["email"],
        "full_name": user_data["full_name"],
        "created_at": user_data["created_at"]
    }

@app.post("/leads", response_model=Lead)
def create_lead(lead: LeadCreate, current_user: dict = Depends(get_current_user)):
    # Duplicate check: name+contact+company must be unique for this user
    name = lead.name.strip().lower()
    contact = lead.contact.strip().lower()
    company = (lead.company or '').strip().lower()
    existing = db.collection("leads").where("user_id", "==", current_user["user_id"]).where("name", "==", lead.name).where("contact", "==", lead.contact).where("company", "==", lead.company or '').stream()
    if any(existing):
        raise HTTPException(status_code=400, detail="A lead with the same name, contact, and company already exists.")
    lead_dict = lead.model_dump()
    lead_dict.pop('id', None)
    lead_dict['user_id'] = current_user["user_id"]  # Add user_id to associate with current user
    if not lead_dict.get('created_at'):
        lead_dict['created_at'] = datetime.date.today().isoformat()
    doc_ref = db.collection("leads").document()
    doc_ref.set(lead_dict)
    created_lead = lead_dict
    created_lead["id"] = doc_ref.id
    return created_lead

@app.put("/leads/{lead_id}", response_model=Lead)
def update_lead(lead_id: str, lead_update: LeadCreate, current_user: dict = Depends(get_current_user)):
    doc_ref = db.collection("leads").document(lead_id)
    doc = doc_ref.get()
    if not doc.exists:
        raise HTTPException(status_code=404, detail="Lead not found")
    
    # Check if lead belongs to current user
    lead_data = doc.to_dict()
    if lead_data.get("user_id") != current_user["user_id"]:
        raise HTTPException(status_code=403, detail="Access denied")

    # Update the lead with the new data
    update_data = lead_update.model_dump(exclude_unset=True)
    doc_ref.update(update_data)

    # Get the updated document
    updated_doc = doc_ref.get()
    updated_lead_data = updated_doc.to_dict()
    updated_lead_data["id"] = updated_doc.id
    return updated_lead_data

@app.get("/leads", response_model=List[Lead])
def get_leads(stage: Optional[str] = None, follow_up_date: Optional[str] = None, current_user: dict = Depends(get_current_user)):
    leads_ref = db.collection("leads")
    query = leads_ref.where("user_id", "==", current_user["user_id"])  # Filter by user

    if stage:
        query = query.where("stage", "==", stage)
    if follow_up_date:
        # Note: Filtering by date range might require a different approach depending on how date is stored (timestamp vs string)
        # This basic implementation assumes exact string match for simplicity
        query = query.where("follow_up_date", "==", follow_up_date)

    docs = query.stream()
    leads = []
    for doc in docs:
        lead_data = doc.to_dict()
        lead_data["id"] = doc.id
        leads.append(Lead(**lead_data))
    return leads

@app.post("/orders", response_model=Order)
def create_order(order: OrderCreate, current_user: dict = Depends(get_current_user)):
    # Verify that the lead belongs to the current user
    lead_doc = db.collection("leads").document(order.lead_id).get()
    if not lead_doc.exists:
        raise HTTPException(status_code=404, detail="Lead not found")
    
    lead_data = lead_doc.to_dict()
    if lead_data.get("user_id") != current_user["user_id"]:
        raise HTTPException(status_code=403, detail="Access denied")
    
    # Duplicate check: lead_id+status+dispatch_date must be unique for this user
    lead_id = order.lead_id.strip()
    status = order.status.strip().lower()
    dispatch_date = (order.dispatch_date or '').strip()
    existing = db.collection("orders").where("user_id", "==", current_user["user_id"]).where("lead_id", "==", lead_id).where("status", "==", order.status).where("dispatch_date", "==", order.dispatch_date or '').stream()
    if any(existing):
        raise HTTPException(status_code=400, detail="An order with the same lead, status, and dispatch date already exists.")
    order_dict = order.model_dump()
    order_dict['user_id'] = current_user["user_id"]  # Add user_id
    doc_ref = db.collection("orders").document()
    doc_ref.set(order_dict)
    created_order = order_dict
    created_order["id"] = doc_ref.id
    return created_order

@app.put("/orders/{order_id}", response_model=Order)
def update_order(order_id: str, order_update: OrderCreate): # Use OrderCreate model for incoming data
    doc_ref = db.collection("orders").document(order_id)
    doc = doc_ref.get()
    if not doc.exists:
        raise HTTPException(status_code=404, detail="Order not found")

    # Prepare data for update, excluding the id which is not updatable this way
    update_data = order_update.model_dump(exclude_unset=True) # Use exclude_unset to only update provided fields

    doc_ref.update(update_data)

    # Fetch the updated document to return the full Order object
    updated_doc = doc_ref.get()
    updated_order_data = updated_doc.to_dict()
    updated_order_data["id"] = updated_doc.id

    return updated_order_data

@app.put("/orders/{order_id}/status", response_model=Order)
def update_order_status(order_id: str, status_update: OrderUpdateStatus):
    doc_ref = db.collection("orders").document(order_id)
    doc = doc_ref.get()
    if not doc.exists:
        raise HTTPException(status_code=404, detail="Order not found")

    doc_ref.update({"status": status_update.status})
    updated_order_data = doc.to_dict()
    updated_order_data["status"] = status_update.status # Update locally for response
    updated_order_data["id"] = doc.id
    return updated_order_data

@app.get("/orders", response_model=List[Order])
def get_orders(lead_id: Optional[str] = None, current_user: dict = Depends(get_current_user)):
    orders_ref = db.collection("orders")
    query = orders_ref.where("user_id", "==", current_user["user_id"])  # Filter by user

    if lead_id:
        query = query.where("lead_id", "==", lead_id)

    docs = query.stream()
    orders = []
    for doc in docs:
        order_data = doc.to_dict()
        order_data["id"] = doc.id
        orders.append(Order(**order_data))
    return orders

@app.post("/orders/bulk_delete")
def bulk_delete_orders(order_ids: list = Body(..., embed=True)):
    deleted = 0
    not_found = []
    for order_id in order_ids:
        doc_ref = db.collection("orders").document(order_id)
        doc = doc_ref.get()
        if doc.exists:
            doc_ref.delete()
            deleted += 1
        else:
            not_found.append(order_id)
    return {"deleted": deleted, "not_found": not_found}

@app.get("/metrics/leads")
def get_lead_metrics():
    total_leads = db.collection("leads").stream()
    total_count = sum(1 for _ in total_leads) # Consume iterator to get count

    leads_by_stage = {}
    for stage in ["New", "Contacted", "Qualified", "Proposal Sent", "Won", "Lost"]:
        count = db.collection("leads").where("stage", "==", stage).stream()
        leads_by_stage[stage] = sum(1 for _ in count)

    return {
        "total_leads": total_count,
        "leads_by_stage": leads_by_stage
    }

@app.get("/metrics/orders")
def get_order_metrics():
    total_orders = db.collection("orders").stream()
    total_count = sum(1 for _ in total_orders)  # Consume iterator to get count

    orders_by_status = {}
    for status in ["Order Received", "In Development", "Ready to Dispatch", "Dispatched"]:
        count = db.collection("orders").where("status", "==", status).stream()
        orders_by_status[status] = sum(1 for _ in count)

    return {
        "total_orders": total_count,
        "orders_by_status": orders_by_status
    }

@app.get("/analytics/comprehensive")
def get_comprehensive_analytics():
    """Get comprehensive analytics data for reports"""
    try:
        # Get all leads and orders
        leads_docs = list(db.collection("leads").stream())
        orders_docs = list(db.collection("orders").stream())
        
        # Calculate lead metrics
        total_leads = len(leads_docs)
        leads_by_stage = {}
        for stage in ["New", "Contacted", "Qualified", "Proposal Sent", "Won", "Lost"]:
            leads_by_stage[stage] = sum(1 for lead in leads_docs if lead.to_dict().get("stage") == stage)
        
        # Calculate conversion rate (Won / Total)
        conversion_rate = (leads_by_stage.get("Won", 0) / total_leads * 100) if total_leads > 0 else 0
        
        # Calculate order metrics
        total_orders = len(orders_docs)
        orders_by_status = {}
        for status in ["Order Received", "In Development", "Ready to Dispatch", "Dispatched"]:
            orders_by_status[status] = sum(1 for order in orders_docs if order.to_dict().get("status") == status)
        
        # Calculate completion rate (Dispatched / Total)
        completion_rate = (orders_by_status.get("Dispatched", 0) / total_orders * 100) if total_orders > 0 else 0
        
        # Calculate cost metrics (mock data for now)
        total_costs = 50000  # Mock total costs
        cost_breakdown = {
            "development": 20000,
            "marketing": 15000,
            "operations": 10000,
            "overhead": 5000
        }
        cost_per_lead = total_costs / total_leads if total_leads > 0 else 0
        cost_per_order = total_costs / total_orders if total_orders > 0 else 0
        
        # Mock revenue calculation (assuming each order generates $2000 revenue)
        total_revenue = total_orders * 2000
        roi = ((total_revenue - total_costs) / total_costs * 100) if total_costs > 0 else 0
        
        # Generate monthly data for the last 6 months
        import datetime
        monthly_data = []
        for i in range(6):
            date = datetime.date.today() - datetime.timedelta(days=30*i)
            month = date.strftime("%Y-%m")
            monthly_data.append({
                "month": month,
                "leads": max(0, total_leads // 6 + (i * 5)),  # Mock growth
                "orders": max(0, total_orders // 6 + (i * 3)),  # Mock growth
                "revenue": max(0, total_revenue // 6 + (i * 6000)),  # Mock growth
                "costs": max(0, total_costs // 6 + (i * 2000))  # Mock growth
            })
        
        # Top companies (mock data)
        top_companies = [
            {"company": "TechCorp", "count": 15},
            {"company": "InnovateLabs", "count": 12},
            {"company": "FutureSystems", "count": 10},
            {"company": "DigitalFlow", "count": 8},
            {"company": "SmartTech", "count": 6}
        ]
        
        # Performance metrics (mock data)
        team_productivity = [
            {"member": "John Doe", "leadsHandled": 45, "ordersCompleted": 23, "efficiency": 85},
            {"member": "Jane Smith", "leadsHandled": 38, "ordersCompleted": 19, "efficiency": 78},
            {"member": "Mike Johnson", "leadsHandled": 52, "ordersCompleted": 28, "efficiency": 92}
        ]
        
        response_time = {
            "avgFirstResponse": 2.5,  # hours
            "avgFollowUp": 24,  # hours
            "slaCompliance": 95  # percentage
        }
        
        quality_metrics = {
            "customerSatisfaction": 4.2,  # out of 5
            "orderAccuracy": 98,  # percentage
            "deliveryOnTime": 94  # percentage
        }
        
        # Predictions (mock data)
        predictions = {
            "nextMonthLeads": int(total_leads * 1.15),  # 15% growth
            "nextMonthOrders": int(total_orders * 1.12),  # 12% growth
            "nextMonthRevenue": int(total_revenue * 1.12),  # 12% growth
            "churnRisk": [
                {"leadId": "lead1", "risk": "high", "reason": "No follow-up for 30 days"},
                {"leadId": "lead2", "risk": "medium", "reason": "Multiple price objections"},
                {"leadId": "lead3", "risk": "low", "reason": "Regular engagement"}
            ]
        }
        
        return {
            "leads": {
                "total": total_leads,
                "byStage": leads_by_stage,
                "conversionRate": round(conversion_rate, 2),
                "avgTimeInStage": {"New": 3, "Contacted": 7, "Qualified": 14, "Proposal Sent": 21, "Won": 30, "Lost": 5},
                "monthlyGrowth": [{"month": item["month"], "count": item["leads"]} for item in monthly_data],
                "topCompanies": top_companies,
                "leadSources": [
                    {"source": "Website", "count": 35},
                    {"source": "Referral", "count": 25},
                    {"source": "Social Media", "count": 20},
                    {"source": "Cold Call", "count": 15},
                    {"source": "Trade Show", "count": 5}
                ]
            },
            "orders": {
                "total": total_orders,
                "byStatus": orders_by_status,
                "completionRate": round(completion_rate, 2),
                "avgProcessingTime": 12,  # days
                "monthlyRevenue": [{"month": item["month"], "revenue": item["revenue"]} for item in monthly_data],
                "topProducts": [
                    {"product": "Custom Software", "count": 25},
                    {"product": "Mobile App", "count": 18},
                    {"product": "Web Platform", "count": 15},
                    {"product": "API Integration", "count": 12},
                    {"product": "Consulting", "count": 8}
                ]
            },
            "costs": {
                "totalCosts": total_costs,
                "costBreakdown": cost_breakdown,
                "costPerLead": round(cost_per_lead, 2),
                "costPerOrder": round(cost_per_order, 2),
                "roi": round(roi, 2),
                "monthlyCosts": [{"month": item["month"], "cost": item["costs"]} for item in monthly_data],
                "costTrends": [
                    {"period": "Q1", "cost": 45000, "trend": "up"},
                    {"period": "Q2", "cost": 48000, "trend": "up"},
                    {"period": "Q3", "cost": 52000, "trend": "up"},
                    {"period": "Q4", "cost": 50000, "trend": "down"}
                ]
            },
            "performance": {
                "teamProductivity": team_productivity,
                "responseTime": response_time,
                "qualityMetrics": quality_metrics
            },
            "predictions": predictions
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating analytics: {str(e)}")

@app.get("/analytics/export")
def export_analytics_report(format: str = "pdf", include_charts: bool = True, include_details: bool = True):
    """Export analytics report in various formats"""
    try:
        analytics_data = get_comprehensive_analytics()
        
        # Mock export functionality
        if format.lower() == "pdf":
            return {"message": "PDF report generated successfully", "download_url": "/reports/analytics_report.pdf"}
        elif format.lower() == "excel":
            return {"message": "Excel report generated successfully", "download_url": "/reports/analytics_report.xlsx"}
        elif format.lower() == "csv":
            return {"message": "CSV report generated successfully", "download_url": "/reports/analytics_report.csv"}
        else:
            raise HTTPException(status_code=400, detail="Unsupported format")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error exporting report: {str(e)}")

@app.get("/leads/followup", response_model=List[Lead])
def get_leads_for_followup():
    # This currently returns all leads with a follow_up_date set.
    # More advanced filtering (e.g., overdue dates) would require date comparison logic.
    leads_ref = db.collection("leads")
    query = leads_ref.where("follow_up_date", "!=", None)

    docs = query.stream()
    followup_leads = []
    for doc in docs:
        lead_data = doc.to_dict()
        lead_data["id"] = doc.id
        followup_leads.append(Lead(**lead_data))
    return followup_leads

@app.delete("/leads/{lead_id}")
def delete_lead(lead_id: str):
    doc_ref = db.collection("leads").document(lead_id)
    doc = doc_ref.get()
    if not doc.exists:
        raise HTTPException(status_code=404, detail="Lead not found")

    # Cascade delete: delete all orders with this lead_id
    orders_query = db.collection("orders").where("lead_id", "==", lead_id).stream()
    deleted_orders = 0
    for order_doc in orders_query:
        db.collection("orders").document(order_doc.id).delete()
        deleted_orders += 1

    doc_ref.delete()
    return {"message": f"Lead with ID {lead_id} deleted successfully, and {deleted_orders} related orders deleted."}

@app.delete("/orders/{order_id}")
def delete_order(order_id: str):
    doc_ref = db.collection("orders").document(order_id)
    doc = doc_ref.get()
    if not doc.exists:
        raise HTTPException(status_code=404, detail="Order not found")

    doc_ref.delete()
    return {"message": f"Order with ID {order_id} deleted successfully"}

@app.post("/upload_document")
async def upload_document(
    file: UploadFile = File(...),
    document_type: str = Form(...),
    document_id: str = Form(...)
):
    try:
        # Create a unique filename
        file_extension = os.path.splitext(file.filename)[1]
        unique_filename = f"{document_type}/{document_id}/{file.filename}"

        # Upload to Firebase Storage
        blob = bucket.blob(unique_filename)
        blob.upload_from_file(file.file)

        # Get the public URL
        blob.make_public()
        file_url = blob.public_url

        # Update the document in Firestore
        if document_type == "lead":
            doc_ref = db.collection("leads").document(document_id)
        elif document_type == "order":
            doc_ref = db.collection("orders").document(document_id)
        else:
            raise HTTPException(status_code=400, detail="Invalid document type")

        doc = doc_ref.get()
        if not doc.exists:
            raise HTTPException(status_code=404, detail=f"{document_type.capitalize()} not found")

        # Update the documents array
        current_data = doc.to_dict()
        documents = current_data.get("documents", [])
        documents.append(file_url)
        doc_ref.update({"documents": documents})

        return {"message": "File uploaded successfully", "file_url": file_url}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.delete("/delete_document")
async def delete_document(document_type: str, document_id: str, file_path: str):
    try:
        # Delete from Firebase Storage
        blob = bucket.blob(file_path)
        blob.delete()

        # Update the document in Firestore
        if document_type == "lead":
            doc_ref = db.collection("leads").document(document_id)
        elif document_type == "order":
            doc_ref = db.collection("orders").document(document_id)
        else:
            raise HTTPException(status_code=400, detail="Invalid document type")

        doc = doc_ref.get()
        if not doc.exists:
            raise HTTPException(status_code=404, detail=f"{document_type.capitalize()} not found")

        # Update the documents array
        current_data = doc.to_dict()
        documents = current_data.get("documents", [])
        documents = [doc for doc in documents if doc != file_path]
        doc_ref.update({"documents": documents})

        return {"message": "File deleted successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.put("/leads/{lead_id}/stage", response_model=Lead)
def update_lead_stage(lead_id: str, stage_update: LeadUpdateStage):
    doc_ref = db.collection("leads").document(lead_id)
    doc = doc_ref.get()
    if not doc.exists:
        raise HTTPException(status_code=404, detail="Lead not found")

    doc_ref.update({"stage": stage_update.stage})

    # If the lead stage is updated to "Won", create a new order
    if stage_update.stage == "Won":
        order_data = {
            "lead_id": lead_id,
            "status": "Order Received"  # Default status for a new order from a won lead
        }
        db.collection("orders").document().set(order_data)

    updated_lead_data = doc.to_dict()
    updated_lead_data["stage"] = stage_update.stage  # Update locally for response
    updated_lead_data["id"] = doc.id
    return updated_lead_data

@app.post("/import/leads")
async def import_leads(file: UploadFile = File(...)):
    if not (file.filename.endswith('.csv') or file.filename.endswith('.xlsx')):
        return JSONResponse(status_code=400, content={"error": "Only CSV or Excel files are accepted."})
    try:
        if file.filename.endswith('.csv'):
            df = pd.read_csv(file.file)
        else:
            df = pd.read_excel(file.file)
        imported = 0
        skipped = 0
        duplicate = 0
        required_fields = ['name', 'contact', 'company', 'stage', 'follow_up_date', 'notes']
        for _, row in df.iterrows():
            if not all(str(row.get(field, '')).strip() for field in required_fields):
                skipped += 1
                continue
            name = str(row.get('name', '')).strip().lower()
            contact = str(row.get('contact', '')).strip().lower()
            company = str(row.get('company', '')).strip().lower()
            existing = db.collection("leads").where("name", "==", row.get('name', '')).where("contact", "==", row.get('contact', '')).where("company", "==", row.get('company', '')).stream()
            if any(existing):
                duplicate += 1
                continue
            lead_data = {
                'name': str(row.get('name', '')),
                'contact': str(row.get('contact', '')),
                'company': str(row.get('company', '')),
                'product_interest': str(row.get('product_interest', '')) if 'product_interest' in row else '',
                'stage': str(row.get('stage', 'New')),
                'follow_up_date': str(row.get('follow_up_date', '')),
                'notes': str(row.get('notes', '')),
                'created_at': datetime.date.today().isoformat(),
                'documents': []
            }
            db.collection("leads").document().set(lead_data)
            imported += 1
        return {"imported": imported, "skipped": skipped, "duplicate": duplicate}
    except Exception as e:
        return JSONResponse(status_code=500, content={"error": str(e)})

@app.post("/import/orders")
async def import_orders(file: UploadFile = File(...)):
    if not (file.filename.endswith('.csv') or file.filename.endswith('.xlsx')):
        return JSONResponse(status_code=400, content={"error": "Only CSV or Excel files are accepted."})
    try:
        if file.filename.endswith('.csv'):
            df = pd.read_csv(file.file)
        else:
            df = pd.read_excel(file.file)
        imported = 0
        skipped = 0
        duplicate = 0
        required_fields = ['lead_id', 'status']
        for idx, row in df.iterrows():
            if not all(str(row.get(field, '')).strip() for field in required_fields):
                skipped += 1
                continue
            lead_id = str(row.get('lead_id', '')).strip()
            status = str(row.get('status', 'Order Received')).strip().lower()
            dispatch_date = str(row.get('dispatch_date', '')).strip() if 'dispatch_date' in row else ''
            existing = db.collection("orders").where("lead_id", "==", row.get('lead_id', '')).where("status", "==", row.get('status', '')).where("dispatch_date", "==", row.get('dispatch_date', '')).stream()
            if any(existing):
                duplicate += 1
                continue
            order_data = {
                'lead_id': row.get('lead_id', ''),
                'status': row.get('status', 'Order Received'),
                'dispatch_date': row.get('dispatch_date', None) if pd.notnull(row.get('dispatch_date', None)) else None,
                'tracking_info': row.get('tracking_info', '') if pd.notnull(row.get('tracking_info', '')) else '',
                'documents': []
            }
            db.collection("orders").document().set(order_data)
            imported += 1
        return {"imported": imported, "skipped": skipped, "duplicate": duplicate}
    except Exception as e:
        return JSONResponse(status_code=500, content={"error": str(e)})

@app.get("/api/comments")
def get_comments(entityId: str, entityType: str):
    comments_ref = db.collection("comments")
    query = comments_ref.where("entityId", "==", entityId).where("entityType", "==", entityType).order_by("created_at", direction=firestore.Query.DESCENDING)
    docs = query.stream()
    comments = []
    for doc in docs:
        data = doc.to_dict()
        data["id"] = doc.id
        comments.append(data)
    return {"comments": comments}

@app.post("/api/comments")
def post_comment(comment: Comment):
    import datetime
    comment_data = comment.dict(exclude={"id", "created_at"})
    comment_data["created_at"] = datetime.datetime.utcnow().isoformat()
    doc_ref = db.collection("comments").document()
    doc_ref.set(comment_data)
    comment_data["id"] = doc_ref.id
    return comment_data

@app.delete("/api/comments/{comment_id}")
def delete_comment(comment_id: str):
    doc_ref = db.collection("comments").document(comment_id)
    doc = doc_ref.get()
    if not doc.exists:
        raise HTTPException(status_code=404, detail="Comment not found")
    doc_ref.delete()
    return {"message": f"Comment with ID {comment_id} deleted successfully"}

@app.put("/api/comments/{comment_id}")
async def update_comment(comment_id: str, update: dict):
    doc_ref = db.collection("comments").document(comment_id)
    doc = doc_ref.get()
    if not doc.exists:
        raise HTTPException(status_code=404, detail="Comment not found")
    # Only allow updating content
    content = update.get("content")
    if not content or not isinstance(content, str):
        raise HTTPException(status_code=400, detail="Content is required and must be a string")
    doc_ref.update({"content": content})
    updated_doc = doc_ref.get()
    updated_comment = updated_doc.to_dict()
    updated_comment["id"] = updated_doc.id
    return updated_comment

# Time Tracking Endpoints
@app.post("/api/time-entries", response_model=TimeEntry)
async def create_time_entry(
    entry: TimeEntryCreate,
    current_user: dict = Depends(get_current_user)
):
    """Create a new time entry"""
    entry_data = entry.dict()
    entry_data['user_id'] = current_user['uid']
    entry_data['created_at'] = datetime.datetime.utcnow().isoformat()
    entry_data['updated_at'] = datetime.datetime.utcnow().isoformat()
    
    # Calculate duration if end_time is provided
    if entry_data.get('end_time'):
        start = datetime.datetime.fromisoformat(entry_data['start_time'])
        end = datetime.datetime.fromisoformat(entry_data['end_time'])
        entry_data['duration_minutes'] = int((end - start).total_seconds() / 60)
    
    doc_ref = db.collection("time_entries").document()
    doc_ref.set(entry_data)
    created_entry = doc_ref.get().to_dict()
    created_entry['id'] = doc_ref.id
    return created_entry

@app.get("/api/time-entries", response_model=List[TimeEntry])
async def get_time_entries(
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    project_id: Optional[str] = None,
    current_user: dict = Depends(get_current_user)
):
    """Get time entries with optional filtering"""
    query = db.collection("time_entries").where("user_id", "==", current_user['uid'])
    
    if start_date:
        query = query.where("start_time", ">=", start_date)
    if end_date:
        query = query.where("start_time", "<=", end_date)
    if project_id:
        query = query.where("project_id", "==", project_id)
    
    entries = []
    for doc in query.stream():
        entry = doc.to_dict()
        entry['id'] = doc.id
        entries.append(entry)
    
    return entries

@app.get("/api/time-entries/{entry_id}", response_model=TimeEntry)
async def get_time_entry(entry_id: str, current_user: dict = Depends(get_current_user)):
    """Get a specific time entry by ID"""
    doc_ref = db.collection("time_entries").document(entry_id)
    doc = doc_ref.get()
    
    if not doc.exists:
        raise HTTPException(status_code=404, detail="Time entry not found")
    
    entry = doc.to_dict()
    if entry['user_id'] != current_user['uid']:
        raise HTTPException(status_code=403, detail="Not authorized to access this time entry")
    
    entry['id'] = doc.id
    return entry

@app.put("/api/time-entries/{entry_id}", response_model=TimeEntry)
async def update_time_entry(
    entry_id: str,
    entry_update: TimeEntryCreate,
    current_user: dict = Depends(get_current_user)
):
    """Update a time entry"""
    doc_ref = db.collection("time_entries").document(entry_id)
    doc = doc_ref.get()
    
    if not doc.exists:
        raise HTTPException(status_code=404, detail="Time entry not found")
    
    entry = doc.to_dict()
    if entry['user_id'] != current_user['uid']:
        raise HTTPException(status_code=403, detail="Not authorized to update this time entry")
    
    update_data = entry_update.dict(exclude_unset=True)
    update_data['updated_at'] = datetime.datetime.utcnow().isoformat()
    
    # Recalculate duration if end_time is being updated
    if 'end_time' in update_data and update_data['end_time']:
        start = datetime.datetime.fromisoformat(update_data.get('start_time', entry['start_time']))
        end = datetime.datetime.fromisoformat(update_data['end_time'])
        update_data['duration_minutes'] = int((end - start).total_seconds() / 60)
    
    doc_ref.update(update_data)
    updated_entry = doc_ref.get().to_dict()
    updated_entry['id'] = doc_ref.id
    return updated_entry

@app.delete("/api/time-entries/{entry_id}")
async def delete_time_entry(entry_id: str, current_user: dict = Depends(get_current_user)):
    """Delete a time entry"""
    doc_ref = db.collection("time_entries").document(entry_id)
    doc = doc_ref.get()
    
    if not doc.exists:
        raise HTTPException(status_code=404, detail="Time entry not found")
    
    entry = doc.to_dict()
    if entry['user_id'] != current_user['uid']:
        raise HTTPException(status_code=403, detail="Not authorized to delete this time entry")
    
    doc_ref.delete()
    return {"status": "success", "message": "Time entry deleted successfully"}

@app.get("/api/time-entries/summary")
async def get_time_summary(
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    project_id: Optional[str] = None,
    current_user: dict = Depends(get_current_user)
):
    try:
        # Convert date strings to datetime objects if provided
        start = datetime.fromisoformat(start_date) if start_date else None
        end = datetime.fromisoformat(end_date) if end_date else None
        
        # Get all time entries for the user
        entries = await get_time_entries(start_date, end_date, project_id, current_user)
        
        # Calculate summary statistics
        total_minutes = 0
        billable_minutes = 0
        projects = {}
        
        for entry in entries:
            duration = entry.get('duration_minutes', 0)
            if not duration and entry.get('start_time') and entry.get('end_time'):
                start_time = datetime.fromisoformat(entry['start_time'])
                end_time = datetime.fromisoformat(entry['end_time'])
                duration = (end_time - start_time).total_seconds() / 60
            
            total_minutes += duration
            if entry.get('is_billable', False):
                billable_minutes += duration
            
            project_id = entry.get('project_id', 'Uncategorized')
            projects[project_id] = projects.get(project_id, 0) + duration
        
        return {
            "total_hours": round(total_minutes / 60, 2),
            "billable_hours": round(billable_minutes / 60, 2),
            "non_billable_hours": round((total_minutes - billable_minutes) / 60, 2),
            "projects": [{"project_id": k, "hours": round(v / 60, 2)} for k, v in projects.items()],
            "model": "gemini-pro",
            "tokens_used": 0,
            "safety_ratings": {}
        }
    except Exception as e:
        error_id = secrets.token_hex(8)
        print(f"Error ID: {error_id}, Error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error processing time summary request. Reference: {error_id}"
        )

@app.get("/api/chat/models", response_model=Dict[str, Any])
async def get_available_models():
    """
    Get available Gemini models and their capabilities
    
    Returns:
        Dict containing available models and their metadata
    """
    models = [
        {
            "id": "gemini-pro",
            "name": "Gemini Pro",
            "description": "Google's most capable model for text generation tasks",
            "capabilities": ["text", "code", "reasoning", "creative"],
            "max_tokens": 30720,
            "languages": ["English", "Multilingual"],
            "context_window": 30720
        },
        {
            "id": "gemini-pro-vision",
            "name": "Gemini Pro Vision",
            "description": "Multimodal model that supports both text and image inputs",
            "capabilities": ["text", "vision", "image_analysis"],
            "max_tokens": 12288,
            "languages": ["English", "Multilingual"],
            "context_window": 12288
        }
    ]
    
    return {
        "models": models,
        "default": "gemini-pro",
        "rate_limit": {
            "requests_per_minute": RATE_LIMIT,
            "window_seconds": RATE_LIMIT_WINDOW
        },
        "last_updated": datetime.utcnow().isoformat(),
        "provider": "Google AI"
    }