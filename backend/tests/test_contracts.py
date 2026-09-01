import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from backend.core.database import Base, get_db
from backend.main import app

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
def auth_client(db_session):
    def override_get_db():
        try:
            yield db_session
        finally:
            pass

    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as client:
        # Register user
        reg = client.post(
            "/api/auth/register",
            json={
                "email": "user@test.com",
                "password": "password123",
                "full_name": "Test User",
            },
        )
        token = reg.json()["access_token"]
        client.headers.update({"Authorization": f"Bearer {token}"})
        yield client
    app.dependency_overrides.clear()


def test_upload_text_contract(auth_client):
    content = "This is a contract between Party A and Party B. " * 5
    res = auth_client.post(
        "/api/contracts/upload/text",
        json={"title": "Test Contract", "content": content},
    )
    assert res.status_code == 201
    data = res.json()
    assert data["title"] == "Test Contract"
    assert data["status"] == "pending"
    assert data["upload_type"] == "text"


def test_list_and_get_contract(auth_client):
    content = "This is a contract between Party A and Party B. " * 5
    upload_res = auth_client.post(
        "/api/contracts/upload/text",
        json={"title": "NDA Agreement", "content": content},
    )
    contract_id = upload_res.json()["id"]

    # List
    list_res = auth_client.get("/api/contracts/")
    assert list_res.status_code == 200
    assert len(list_res.json()) == 1

    # Get
    get_res = auth_client.get(f"/api/contracts/{contract_id}")
    assert get_res.status_code == 200
    assert get_res.json()["title"] == "NDA Agreement"
    assert get_res.json()["content_text"] == content


def test_delete_contract(auth_client):
    content = "This is a contract between Party A and Party B. " * 5
    upload_res = auth_client.post(
        "/api/contracts/upload/text",
        json={"title": "To Delete", "content": content},
    )
    contract_id = upload_res.json()["id"]

    del_res = auth_client.delete(f"/api/contracts/{contract_id}")
    assert del_res.status_code == 204

    get_res = auth_client.get(f"/api/contracts/{contract_id}")
    assert get_res.status_code == 404
