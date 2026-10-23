import io

import pandas as pd
from fastapi import APIRouter, Depends, File, HTTPException, UploadFile
from sqlalchemy.orm import Session

from app.core.deps import get_optional_user
from app.core.profiling import profile_dataframe
from app.core.scoring import score_dataframe
from app.db import get_db
from app.models.batch import Batch
from app.models.user import User

router = APIRouter(tags=["upload"])


@router.post("/upload")
async def upload(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    user: User | None = Depends(get_optional_user),
):
    name = (file.filename or "").lower()
    content = await file.read()

    try:
        if name.endswith(".csv"):
            df = pd.read_csv(io.BytesIO(content))
        elif name.endswith(".json"):
            df = pd.read_json(io.BytesIO(content))
        else:
            raise HTTPException(status_code=400, detail="Unsupported file type. Use .csv or .json.")
    except HTTPException:
        raise
    except Exception:
        raise HTTPException(status_code=400, detail="Couldn't read this file. Check that it is a valid CSV or JSON table.")

    profiling = profile_dataframe(df)
    scoring = score_dataframe(df)

    # Only signed-in users get their report saved. Only results are kept, never the file.
    batch_id = None
    if user:
        batch = Batch(
            filename=file.filename,
            profiling_result=profiling,
            scoring_result=scoring,
            user_id=user.id,
        )
        db.add(batch)
        db.commit()
        db.refresh(batch)
        batch_id = batch.id

    return {"batch_id": batch_id, "filename": file.filename, "profiling": profiling, "scoring": scoring}
