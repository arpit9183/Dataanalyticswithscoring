from sqlalchemy import Column, Integer, String, JSON, DateTime
from datetime import datetime
from app.db import Base

class Batch(Base):
    __tablename__ = "batches"

    id = Column(Integer, primary_key=True, index=True)
    filename = Column(String)
    uploaded_at = Column(DateTime, default=datetime.utcnow)
    profiling_result = Column(JSON)