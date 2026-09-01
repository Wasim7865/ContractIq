"""Manual backend API test - run this with the backend server running."""
import requests
import sys

BASE_URL = "http://127.0.0.1:8000"


def test_health():
    """Test health endpoint."""
    try:
        res = requests.get(f"{BASE_URL}/api/health", timeout=5)
        assert res.status_code == 200
        print("✓ Health check passed")
        return True
    except Exception as e:
        print(f"✗ Health check failed: {e}")
        return False


def test_registration_and_login():
    """Test user registration and login flow."""
    # Register a new user
    register_data = {
        "email": f"testuser_{int(requests.utils.time.time())}@example.com",
        "password": "securePassword123!",
        "full_name": "Test User"
    }

    try:
        # Register
        res = requests.post(f"{BASE_URL}/api/auth/register", json=register_data, timeout=10)
        if res.status_code != 201:
            print(f"✗ Registration failed: {res.status_code} - {res.text}")
            return False

        data = res.json()
        assert "access_token" in data
        assert "user" in data
        assert data["user"]["email"] == register_data["email"]
        token = data["access_token"]
        print(f"✓ Registration successful: {register_data['email']}")

        # Login with same credentials
        login_data = {
            "email": register_data["email"],
            "password": register_data["password"]
        }
        res = requests.post(f"{BASE_URL}/api/auth/login", json=login_data, timeout=10)
        assert res.status_code == 200
        data = res.json()
        assert "access_token" in data
        print(f"✓ Login successful")

        # Test /me endpoint
        headers = {"Authorization": f"Bearer {token}"}
        res = requests.get(f"{BASE_URL}/api/auth/me", headers=headers, timeout=10)
        assert res.status_code == 200
        assert res.json()["email"] == register_data["email"]
        print(f"✓ /me endpoint works")

        # Test wrong password
        wrong_login = {
            "email": register_data["email"],
            "password": "wrong_password"
        }
        res = requests.post(f"{BASE_URL}/api/auth/login", json=wrong_login, timeout=10)
        assert res.status_code == 401
        print(f"✓ Wrong password rejected")

        return True

    except AssertionError as e:
        print(f"✗ Test assertion failed: {e}")
        return False
    except Exception as e:
        print(f"✗ Test failed: {e}")
        return False


def test_long_password():
    """Test registration with long password (>72 bytes)."""
    long_password = "A" * 150 + "!ComplexPassword123"
    register_data = {
        "email": f"longpass_{int(requests.utils.time.time())}@example.com",
        "password": long_password,
        "full_name": "Long Password User"
    }

    try:
        res = requests.post(f"{BASE_URL}/api/auth/register", json=register_data, timeout=10)
        if res.status_code != 201:
            print(f"✗ Long password registration failed: {res.status_code} - {res.text}")
            return False

        print(f"✓ Long password ({len(long_password)} chars) registration successful")

        # Login with long password
        login_data = {
            "email": register_data["email"],
            "password": long_password
        }
        res = requests.post(f"{BASE_URL}/api/auth/login", json=login_data, timeout=10)
        assert res.status_code == 200
        print(f"✓ Long password login successful")

        return True

    except Exception as e:
        print(f"✗ Long password test failed: {e}")
        return False


if __name__ == "__main__":
    print("=" * 70)
    print("Backend API Manual Test Suite")
    print("=" * 70)
    print("Make sure backend is running: uvicorn backend.main:app --reload")
    print()

    results = []

    print("Testing health endpoint...")
    results.append(test_health())
    print()

    print("Testing registration and login flow...")
    results.append(test_registration_and_login())
    print()

    print("Testing long password support...")
    results.append(test_long_password())
    print()

    print("=" * 70)
    if all(results):
        print("✅ ALL API TESTS PASSED")
        sys.exit(0)
    else:
        print("❌ SOME TESTS FAILED")
        sys.exit(1)
