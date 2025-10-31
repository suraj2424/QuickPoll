from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from typing import Union
from app.db.database import get_db
from app.models.like import Like
from app.models.poll import Poll
from app.schemas.like import LikeCreate, LikeResponse, LikeToggleMessage
from app.websocket import manager

router = APIRouter()

@router.post("/", response_model=Union[LikeResponse, LikeToggleMessage])
def toggle_like(
    like: LikeCreate,
    user_id: int,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
):

    # Verify poll exists
    db_poll = db.query(Poll).filter(Poll.id == like.poll_id).first()
    if not db_poll:
        raise HTTPException(status_code=404, detail="Poll not found")
    
    # Check if user already liked
    existing_like = db.query(Like).filter(
        Like.user_id == user_id,
        Like.poll_id == like.poll_id
    ).first()
    
    if existing_like:
        # Unlike - remove the like
        poll_id = existing_like.poll_id
        db.delete(existing_like)
        db.commit()
        background_tasks.add_task(
            manager.broadcast_to_poll,
            {"type": "poll_updated", "poll_id": poll_id},
            poll_id,
        )
        return LikeToggleMessage(message="Like removed", liked=False)

    else:
        # Like - add the like
        try:
            db_like = Like(
                user_id=user_id,
                poll_id=like.poll_id
            )
            db.add(db_like)
            db.commit()
            db.refresh(db_like)
            background_tasks.add_task(
                manager.broadcast_to_poll,
                {"type": "poll_updated", "poll_id": db_like.poll_id},
                db_like.poll_id,
            )
            return db_like

        except IntegrityError:
            db.rollback()
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Like already exists"
            )

@router.get("/poll/{poll_id}")
def get_poll_likes(poll_id: int, db: Session = Depends(get_db)):
    likes = db.query(Like).filter(Like.poll_id == poll_id).all()
    return {"poll_id": poll_id, "likes_count": len(likes), "likes": likes}

@router.get("/user/{user_id}")
def get_user_likes(user_id: int, db: Session = Depends(get_db)):
    likes = db.query(Like).filter(Like.user_id == user_id).all()
    return {"user_id": user_id, "likes": likes}