import io
import pandas as pd
from fastapi import APIRouter, UploadFile, File, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db import get_db
from app.models.batch import Batch
from app.core.profiling import profile_dataframe
from app.core.scoring import score_dataframe

router = APIRouter()

@router.post("/upload")
async def upload_file(file: UploadFile = File(...), db: Session = Depends(get_db)):
    contents = await file.read()

    if file.filename.endswith(".csv"):
        df = pd.read_csv(io.BytesIO(contents))
    elif file.filename.endswith(".json"):
        df = pd.read_json(io.BytesIO(contents))
    else:
        raise HTTPException(status_code=400, detail="Only CSV or JSON files are supported")

    result = profile_dataframe(df)

    batch = Batch(filename=file.filename, profiling_result=result)
    db.add(batch)
    db.commit()
    db.refresh(batch)

    return {"batch_id": batch.id, "filename": batch.filename, "profiling": result, "scoring": score_dataframe(df)}