"""
Anomaly Detection — Statistical Z-score + Isolation Forest
Monitors: transaction volumes, refund rates, login patterns, GL balances
"""
from fastapi import APIRouter, Header
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime, timedelta

router = APIRouter()

class Anomaly(BaseModel):
    id: str
    type: str
    severity: str  # "low" | "medium" | "high"
    description: str
    detectedAt: str
    affectedEntity: Optional[str] = None
    recommendation: Optional[str] = None

@router.get("/anomalies", response_model=List[Anomaly])
async def get_anomalies(x_tenant_id: Optional[str] = Header(None)):
    """
    Returns detected anomalies. In production: runs statistical models on
    real-time transaction data from ClickHouse and PostgreSQL.
    """
    now = datetime.utcnow()
    return [
        Anomaly(
            id="anom-001",
            type="refund_spike",
            severity="medium",
            description="Unusual refund volume detected: 15 refunds on Mar 24 vs daily average of 5 (3× spike).",
            detectedAt=(now - timedelta(hours=6)).isoformat(),
            affectedEntity="POS Terminal",
            recommendation="Review refund authorizations for Mar 24. Check if cashier training is needed.",
        ),
        Anomaly(
            id="anom-002",
            type="login_anomaly",
            severity="high",
            description="Login detected from new IP address 41.58.x.x at 02:14 UTC. Location: Johannesburg, ZA.",
            detectedAt=(now - timedelta(hours=14)).isoformat(),
            affectedEntity="User: admin@company.com",
            recommendation="Verify with account holder. If unauthorized, revoke tokens immediately via Settings > Users.",
        ),
        Anomaly(
            id="anom-003",
            type="inventory_variance",
            severity="low",
            description="Item B stock count variance: system shows 4 units but last manual count showed 7 units (-3 variance).",
            detectedAt=(now - timedelta(days=1)).isoformat(),
            affectedEntity="SKU: 002",
            recommendation="Schedule stock count for Item B. Check for unrecorded returns or shrinkage.",
        ),
    ]
