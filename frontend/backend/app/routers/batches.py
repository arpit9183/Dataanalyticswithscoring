from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.deps import get_current_user
from app.db import get_db
from app.models.batch import Batch
from app.models.user import User

router = APIRouter(prefix="/batches", tags=["history"])


def _own_batch(db: Session, user: User, batch_id: int) -> Batch:
    batch = db.get(Batch, batch_id)
    # Someone else's report looks the same as one that doesn't exist.
    if batch is None or batch.user_id != user.id:
        raise HTTPException(status_code=404, detail="Report not found.")
    return batch


@router.get("")
def list_batches(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    rows = db.scalars(
        select(Batch).where(Batch.user_id == user.id).order_by(Batch.uploaded_at.desc()).limit(100)
    ).all()
    return [
        {
            "id": b.id,
            "filename": b.filename,
            "uploaded_at": b.uploaded_at.isoformat(),
            "score": (b.scoring_result or {}).get("score"),
            "row_count": (b.profiling_result or {}).get("row_count"),
            "column_count": (b.profiling_result or {}).get("column_count"),
        }
        for b in rows
    ]


@router.get("/{batch_id}")
def get_batch(batch_id: int, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    b = _own_batch(db, user, batch_id)
    return {
        "batch_id": b.id,
        "filename": b.filename,
        "uploaded_at": b.uploaded_at.isoformat(),
        "profiling": b.profiling_result,
        "scoring": b.scoring_result,
    }


@router.delete("/{batch_id}", status_code=204)
def delete_batch(batch_id: int, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    db.delete(_own_batch(db, user, batch_id))
    db.commit()
