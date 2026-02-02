"""
Test script for role support functionality.
"""

import requests
import json

BASE_URL = "http://localhost:8000"

def test_register_regular_user():
    """Test registering a regular user without access code."""
    print("\n=== Test 1: Register Regular User ===")
    response = requests.post(
        f"{BASE_URL}/auth/register",
        json={
            "username": "testuser1",
            "email": "testuser1@example.com",
            "password": "password123"
        }
    )
    print(f"Status: {response.status_code}")
    print(f"Response: {json.dumps(response.json(), indent=2)}")
    assert response.status_code == 200
    data = response.json()
    assert data["role"] == "user"
    print("✓ Regular user created with 'user' role")
    return data["id"]

def test_register_admin_user():
    """Test registering an admin user with access code."""
    print("\n=== Test 2: Register Admin User ===")
    response = requests.post(
        f"{BASE_URL}/auth/register",
        json={
            "username": "adminuser1",
            "email": "adminuser1@example.com",
            "password": "password123",
            "access_code": "admin-secret-code-2024"
        }
    )
    print(f"Status: {response.status_code}")
    print(f"Response: {json.dumps(response.json(), indent=2)}")
    assert response.status_code == 200
    data = response.json()
    assert data["role"] == "admin"
    print("✓ Admin user created with 'admin' role")
    return data["id"]

def test_register_with_wrong_code():
    """Test registering with wrong access code."""
    print("\n=== Test 3: Register with Wrong Access Code ===")
    response = requests.post(
        f"{BASE_URL}/auth/register",
        json={
            "username": "testuser2",
            "email": "testuser2@example.com",
            "password": "password123",
            "access_code": "wrong-code"
        }
    )
    print(f"Status: {response.status_code}")
    print(f"Response: {json.dumps(response.json(), indent=2)}")
    assert response.status_code == 200
    data = response.json()
    assert data["role"] == "user"
    print("✓ User created with 'user' role despite wrong access code")
    return data["id"]

def test_login_returns_role():
    """Test that login returns role field."""
    print("\n=== Test 4: Login Returns Role ===")
    response = requests.post(
        f"{BASE_URL}/auth/login",
        json={
            "username": "adminuser1",
            "password": "password123"
        }
    )
    print(f"Status: {response.status_code}")
    print(f"Response: {json.dumps(response.json(), indent=2)}")
    assert response.status_code == 200
    data = response.json()
    assert "role" in data
    assert data["role"] == "admin"
    print("✓ Login returns role field")

def test_change_user_role(admin_id, target_user_id):
    """Test changing a user's role."""
    print("\n=== Test 5: Change User Role ===")
    response = requests.put(
        f"{BASE_URL}/auth/users/{target_user_id}/role",
        json={
            "role": "admin",
            "admin_user_id": admin_id
        }
    )
    print(f"Status: {response.status_code}")
    print(f"Response: {json.dumps(response.json(), indent=2)}")
    assert response.status_code == 200
    data = response.json()
    assert data["role"] == "admin"
    print("✓ User role changed successfully")

def test_non_admin_cannot_change_role(regular_user_id, target_user_id):
    """Test that non-admin cannot change roles."""
    print("\n=== Test 6: Non-Admin Cannot Change Role ===")
    response = requests.put(
        f"{BASE_URL}/auth/users/{target_user_id}/role",
        json={
            "role": "admin",
            "admin_user_id": regular_user_id
        }
    )
    print(f"Status: {response.status_code}")
    print(f"Response: {json.dumps(response.json(), indent=2)}")
    assert response.status_code == 403
    print("✓ Non-admin user correctly denied access")

def test_admin_endpoints(admin_id):
    """Test admin-only endpoints."""
    print("\n=== Test 7: Admin Endpoints ===")
    
    # Test get all users
    response = requests.get(
        f"{BASE_URL}/admin/users",
        headers={"X-User-Id": str(admin_id)}
    )
    print(f"Get Users Status: {response.status_code}")
    assert response.status_code == 200
    print("✓ Admin can access user list")
    
    # Test get platform stats
    response = requests.get(
        f"{BASE_URL}/admin/stats",
        headers={"X-User-Id": str(admin_id)}
    )
    print(f"Get Stats Status: {response.status_code}")
    print(f"Stats: {json.dumps(response.json(), indent=2)}")
    assert response.status_code == 200
    print("✓ Admin can access platform stats")
    
    # Test get audit log
    response = requests.get(
        f"{BASE_URL}/admin/actions",
        headers={"X-User-Id": str(admin_id)}
    )
    print(f"Get Audit Log Status: {response.status_code}")
    print(f"Audit Log: {json.dumps(response.json(), indent=2)}")
    assert response.status_code == 200
    print("✓ Admin can access audit log")

def test_non_admin_cannot_access_admin_endpoints(regular_user_id):
    """Test that non-admin cannot access admin endpoints."""
    print("\n=== Test 8: Non-Admin Cannot Access Admin Endpoints ===")
    
    response = requests.get(
        f"{BASE_URL}/admin/users",
        headers={"X-User-Id": str(regular_user_id)}
    )
    print(f"Status: {response.status_code}")
    assert response.status_code == 403
    print("✓ Non-admin correctly denied access to admin endpoints")

if __name__ == "__main__":
    try:
        print("Starting Role Support Tests...")
        print("=" * 50)
        
        # Test user registration
        regular_user_id = test_register_regular_user()
        admin_user_id = test_register_admin_user()
        user_with_wrong_code_id = test_register_with_wrong_code()
        
        # Test login
        test_login_returns_role()
        
        # Test role changes
        test_change_user_role(admin_user_id, regular_user_id)
        test_non_admin_cannot_change_role(user_with_wrong_code_id, regular_user_id)
        
        # Test admin endpoints
        test_admin_endpoints(admin_user_id)
        test_non_admin_cannot_access_admin_endpoints(user_with_wrong_code_id)
        
        print("\n" + "=" * 50)
        print("✓ All tests passed!")
        print("=" * 50)
        
    except AssertionError as e:
        print(f"\n✗ Test failed: {e}")
    except requests.exceptions.ConnectionError:
        print("\n✗ Could not connect to server. Make sure it's running on port 8000.")
    except Exception as e:
        print(f"\n✗ Unexpected error: {e}")
