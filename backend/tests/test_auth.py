import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from backend.core.database import Base, get_db
from backend.main import app

# In-memory test DB
SQLALCHEMY_DATABASE_URL = "sqlite:///:memory:"
engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


@pytest.fixture(scope="function")
def db_session():
    Base.metadata.create_all(bind=engine)
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()
        Base.metadata.drop_all(bind=engine)


@pytest.fixture(scope="function")
def client(db_session):
    def override_get_db():
        try:
            yield db_session
        finally:
            pass

    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()


def test_register_and_login(client):
    # Register
    res = client.post(
        "/api/auth/register",
        json={
            "email": "test@example.com",
            "password": "password123",
            "full_name": "Test User",
        },
    )
    assert res.status_code == 201
    data = res.json()
    assert "access_token" in data
    assert data["user"]["email"] == "test@example.com"

    # Duplicate registration
    res2 = client.post(
        "/api/auth/register",
        json={
            "email": "test@example.com",
            "password": "password123",
            "full_name": "Test User",
        },
    )
    assert res2.status_code == 409

    # Login
    res3 = client.post(
        "/api/auth/login",
        json={"email": "test@example.com", "password": "password123"},
    )
    assert res3.status_code == 200
    assert "access_token" in res3.json()

    # Login with wrong password
    res4 = client.post(
        "/api/auth/login",
        json={"email": "test@example.com", "password": "wrongpassword"},
    )
    assert res4.status_code == 401


def test_me_endpoint(client):
    # Register and get token
    reg = client.post(
        "/api/auth/register",
        json={
            "email": "me@example.com",
            "password": "password123",
            "full_name": "Me User",
        },
    )
    token = reg.json()["access_token"]

    # Call /me with token
    res = client.get("/api/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert res.status_code == 200
    assert res.json()["email"] == "me@example.com"

    # Call /me without token
    res2 = client.get("/api/auth/me")
    assert res2.status_code == 401


def test_long_password_registration_and_login(client):
    # Passwords longer than 72 bytes should work fine without truncation or crashing
    long_password = "A" * 150 + "!ComplexPassword123"
    res = client.post(
        "/api/auth/register",
        json={
            "email": "longpass@example.com",
            "password": long_password,
            "full_name": "Long Password User",
        },
    )
    assert res.status_code == 201
    assert "access_token" in res.json()

    # Login with the exact long password
    login_res = client.post(
        "/api/auth/login",
        json={"email": "longpass@example.com", "password": long_password},
    )
    assert login_res.status_code == 200

    # Login with a different long password should fail
    wrong_login = client.post(
        "/api/auth/login",
        json={"email": "longpass@example.com", "password": long_password + "extra"},
    )
    assert wrong_login.status_code == 401
