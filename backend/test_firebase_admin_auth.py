"""
Test Firebase Admin SDK authentication functionality.
"""
import os
import sys
import json
import firebase_admin
from firebase_admin import auth, credentials

def print_header(title):
    """Print a formatted header."""
    print("\n" + "=" * 80)
    print(f" {title} ".center(80, "="))
    print("=" * 80 + "\n")

def initialize_firebase():
    """Initialize Firebase Admin SDK."""
    try:
        # Skip if already initialized
        if firebase_admin._apps:
            print("Firebase Admin SDK already initialized")
            return True
            
        # Get the absolute path to the service account JSON file
        service_account_path = os.path.join(
            os.path.dirname(os.path.abspath(__file__)),
            "assignment3-2865c-dc4d015bc7df.json"
        )
        
        print(f"Using service account: {service_account_path}")
        
        # Check if service account file exists
        if not os.path.exists(service_account_path):
            print(f"❌ Error: Service account file not found at {service_account_path}")
            return False
        
        # Initialize Firebase Admin SDK
        cred = credentials.Certificate(service_account_path)
        firebase_admin.initialize_app(cred)
        print("✅ Firebase Admin SDK initialized successfully")
        return True
        
    except Exception as e:
        print(f"❌ Error initializing Firebase: {str(e)}")
        import traceback
        traceback.print_exc()
        return False

def test_list_users():
    """Test listing users with Firebase Admin SDK."""
    try:
        print("Listing first 10 users:")
        users = list(auth.list_users(max_results=10).iterate_all())
        
        if not users:
            print("No users found in the project.")
            return True
            
        for user in users:
            print(f"- {user.email} (ID: {user.uid}, Verified: {user.email_verified}, Disabled: {user.disabled})")
            
        return True
        
    except Exception as e:
        print(f"❌ Error listing users: {str(e)}")
        import traceback
        traceback.print_exc()
        return False

def test_create_and_delete_user():
    """Test creating and deleting a test user with Firebase Admin SDK."""
    test_email = "test_user@example.com"
    test_password = "TestPass123!"
    test_display_name = "Test User"
    
    try:
        # Delete user if already exists
        try:
            user = auth.get_user_by_email(test_email)
            print(f"Deleting existing test user: {user.uid}")
            auth.delete_user(user.uid)
            print("✅ Deleted existing test user")
        except auth.UserNotFoundError:
            print("No existing test user found")
        except Exception as e:
            print(f"❌ Error deleting existing test user: {str(e)}")
            return False
        
        # Create new test user
        print(f"\nCreating new test user: {test_email}")
        user = auth.create_user(
            email=test_email,
            password=test_password,
            display_name=test_display_name,
            email_verified=True,
            disabled=False
        )
        print(f"✅ Created test user: {user.uid}")
        
        # Verify user was created
        fetched_user = auth.get_user(user.uid)
        print(f"✅ Verified user creation: {fetched_user.email} (Verified: {fetched_user.email_verified}, Disabled: {fetched_user.disabled})")
        
        # Clean up: delete the test user
        print("\nCleaning up: deleting test user")
        auth.delete_user(user.uid)
        print("✅ Deleted test user")
        
        return True
        
    except Exception as e:
        print(f"❌ Error in test_create_and_delete_user: {str(e)}")
        import traceback
        traceback.print_exc()
        return False

def main():
    """Main test function."""
    print_header("FIREBASE ADMIN SDK TEST")
    
    # Initialize Firebase Admin SDK
    if not initialize_firebase():
        print("❌ Exiting due to Firebase initialization error")
        return 1
    
    # Test 1: List users
    print_header("TEST 1: LIST USERS")
    if not test_list_users():
        print("❌ Test 1 failed")
        return 1
    
    # Test 2: Create and delete a test user
    print_header("TEST 2: CREATE AND DELETE USER")
    if not test_create_and_delete_user():
        print("❌ Test 2 failed")
        return 1
    
    print_header("✅ ALL TESTS COMPLETED SUCCESSFULLY")
    return 0

if __name__ == "__main__":
    sys.exit(main())
