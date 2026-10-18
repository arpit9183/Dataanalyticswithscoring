from fastapi import FastAPI
from app.db import Base, engine
from app.models.batch import Batch
from app.routers import upload
from fastapi.middleware.cors import CORSMiddleware

Base.metadata.create_all(bind=engine)

app = FastAPI(title="DQ Monitor")
   

app.add_middleware(
       CORSMiddleware,
       allow_origins=["http://localhost:5173"],
       allow_methods=["*"],
       allow_headers=["*"],
   )   

app.include_router(upload.router)

@app.get("/")
def root():
    return {"message": "DQ Monitor is running"}