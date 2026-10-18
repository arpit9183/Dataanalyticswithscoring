from fastapi import FastAPI
from app.db import Base, engine
from app.models.batch import Batch
from app.routers import upload

Base.metadata.create_all(bind=engine)

app = FastAPI(title="DQ Monitor")

app.include_router(upload.router)

@app.get("/")
def root():
    return {"message": "DQ Monitor is running"}