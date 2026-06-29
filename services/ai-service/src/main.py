"""
NexaBiz AI Service — MOD-08
Provides: Revenue forecasting (ARIMA+ML), anomaly detection, Natural Language Query (NLQ)
"""
from fastapi import FastAPI, Depends, HTTPException, Header
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from prometheus_client import Counter, Histogram, make_asgi_app
import time

from .api.nlq import router as nlq_router
from .api.forecast import router as forecast_router
from .api.anomaly import router as anomaly_router
from .config import get_settings

settings = get_settings()
app = FastAPI(title="NexaBiz AI Service", version="3.1.0", description="AI Analytics & Intelligence — MOD-08")

# CORS
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])

# Prometheus metrics endpoint
metrics_app = make_asgi_app()
app.mount("/metrics", metrics_app)

# Routers
app.include_router(nlq_router,      prefix="/api/v1/ai",  tags=["NLQ"])
app.include_router(forecast_router, prefix="/api/v1/ai",  tags=["Forecast"])
app.include_router(anomaly_router,  prefix="/api/v1/ai",  tags=["Anomaly"])

@app.get("/health")
async def health():
    return {"status": "ok", "service": "ai-service", "version": "3.1.0"}
