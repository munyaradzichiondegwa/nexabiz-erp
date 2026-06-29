"""Tests for NLQ endpoint"""
from fastapi.testclient import TestClient
from src.main import app

client = TestClient(app)

def test_health():
    res = client.get("/health")
    assert res.status_code == 200
    assert res.json()["status"] == "ok"

def test_nlq_returns_answer():
    res = client.post("/api/v1/ai/nlq", json={"question": "What are the top products?"})
    assert res.status_code == 200
    data = res.json()
    assert "answer" in data
    assert len(data["answer"]) > 0

def test_nlq_empty_question_fails():
    res = client.post("/api/v1/ai/nlq", json={"question": ""})
    assert res.status_code == 400

def test_forecast_returns_30_days():
    res = client.get("/api/v1/ai/forecast?days=30")
    assert res.status_code == 200
    data = res.json()
    assert data["days"] == 30
    assert len(data["forecast"]) == 30

def test_anomalies_returns_list():
    res = client.get("/api/v1/ai/anomalies")
    assert res.status_code == 200
    assert isinstance(res.json(), list)
