import os

from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.db import Base, engine
from app.models import batch, user  # noqa: F401  (importing registers the tables)
from app.routers import auth, batches, upload

load_dotenv()

Base.metadata.create_all(bind=engine)

app = FastAPI(title="DQ Monitor")

# The cookie only travels if the browser is told this page may send credentials,
# which means naming the exact address. "*" is not allowed here.
origins = [o.strip() for o in os.getenv("FRONTEND_ORIGIN", "http://localhost:5173").split(",")]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(upload.router)
app.include_router(batches.router)


@app.get("/")
def health():
    return {"status": "ok"}
