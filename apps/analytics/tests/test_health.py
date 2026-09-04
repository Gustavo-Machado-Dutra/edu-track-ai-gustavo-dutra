from fastapi.testclient import TestClient

from app.main import app


def test_health_returns_service_status() -> None:
    client = TestClient(app)

    response = client.get("/health")

    assert response.status_code == 200
    assert response.json() == {"data": {"service": "analytics", "status": "ok"}}


def test_metrics_accepts_optional_task_due_date() -> None:
    client = TestClient(app)

    response = client.post(
        "/metrics",
        json={
            "tasks": [{"id": "task-1", "status": "TODO", "difficulty": "EASY"}],
            "sessions": [],
        },
    )

    assert response.status_code == 200
    assert response.json()["data"]["tasks"]["total"] == 1
    assert response.json()["data"]["tasks"]["overdue"] == 0
