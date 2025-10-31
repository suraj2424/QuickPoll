#!/usr/bin/env python3
"""
Simple test script to verify QuickPoll API functionality
Run with: python test_app.py
"""

def test_imports():
    """Test that all modules can be imported successfully"""
    try:
        from app.main import app
        from app.models import User, Poll, Option, Vote, Like
        from app.schemas.user import UserCreate, UserResponse
        from app.schemas.poll import PollCreate, PollResponse
        from app.websocket import manager
        print("✅ All imports successful")
        return True
    except Exception as e:
        print(f"❌ Import error: {e}")
        return False

def test_schemas():
    """Test Pydantic schema validation"""
    try:
        from app.schemas.user import UserCreate
        from app.schemas.poll import PollCreate
        
        # Test user schema
        user_data = {
            "username": "testuser",
            "email": "test@example.com",
            "password": "password123"
        }
        user = UserCreate(**user_data)
        print(f"✅ User schema validation: {user.username}")
        
        # Test poll schema
        poll_data = {
            "title": "Test Poll",
            "description": "A test poll",
            "options": ["Option 1", "Option 2", "Option 3"]
        }
        poll = PollCreate(**poll_data)
        print(f"✅ Poll schema validation: {poll.title}")
        
        return True
    except Exception as e:
        print(f"❌ Schema validation error: {e}")
        return False

if __name__ == "__main__":
    print("🚀 Testing QuickPoll Application...")
    print("-" * 40)
    
    success = True
    success &= test_imports()
    success &= test_schemas()
    
    print("-" * 40)
    if success:
        print("🎉 All tests passed! Your QuickPoll API is ready to run.")
        print("\nTo start the server, run:")
        print("uvicorn app.main:app --reload --host 0.0.0.0 --port 8000")
    else:
        print("❌ Some tests failed. Please check the errors above.")