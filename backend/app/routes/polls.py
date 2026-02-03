from fastapi import (
    APIRouter,
    BackgroundTasks,
    Depends,
    HTTPException,
    Query,
    status,
)
from datetime import datetime, timedelta, timezone
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List, Optional
from app.db.database import get_db
from app.models.poll import Poll
from app.models.option import Option
from app.models.vote import Vote
from app.models.like import Like
from app.models.user import User
from app.schemas.poll import PollCreate, PollResponse, PollUpdate, OptionResponse
from app.websocket import manager

router = APIRouter()

@router.post("/", response_model=PollResponse)
def create_poll(
    poll: PollCreate,
    creator_id: int,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
):
    # Create poll
    closes_at = poll.closes_at
    if poll.duration_minutes is not None and poll.duration_minutes > 0:
        closes_at = datetime.now(timezone.utc) + timedelta(minutes=poll.duration_minutes)

    db_poll = Poll(
        title=poll.title,
        description=poll.description,
        creator_id=creator_id,
        closes_at=closes_at,
        is_active=True,
    )
    db.add(db_poll)
    db.commit()
    db.refresh(db_poll)
    
    # Create options
    for option_text in poll.options:
        db_option = Option(text=option_text, poll_id=db_poll.id)
        db.add(db_option)
    
    db.commit()

    background_tasks.add_task(
        manager.broadcast_all,
        {"type": "poll_updated", "poll_id": db_poll.id},
    )
    background_tasks.add_task(
        manager.broadcast_to_poll,
        {"type": "poll_updated", "poll_id": db_poll.id},
        db_poll.id,
    )

    return get_poll_with_stats(db_poll.id, db, creator_id)

@router.get("/", response_model=List[PollResponse])
def get_polls(
    skip: int = 0, 
    limit: int = 100, 
    user_id: Optional[int] = Query(None),
    db: Session = Depends(get_db)
):
    polls = db.query(Poll).offset(skip).limit(limit).all()
    return [get_poll_with_stats(poll.id, db, user_id) for poll in polls]

@router.get("/{poll_id}", response_model=PollResponse)
def get_poll(poll_id: int, user_id: Optional[int] = Query(None), db: Session = Depends(get_db)):
    return get_poll_with_stats(poll_id, db, user_id)

@router.put("/{poll_id}", response_model=PollResponse)
def update_poll(
    poll_id: int,
    poll_update: PollUpdate,
    user_id: int,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
):
    db_poll = db.query(Poll).filter(Poll.id == poll_id).first()
    if not db_poll:
        raise HTTPException(status_code=404, detail="Poll not found")

    if db_poll.creator_id != user_id:
        raise HTTPException(status_code=403, detail="Not authorized to update this poll")

    if poll_update.title is not None:
        db_poll.title = poll_update.title
    if poll_update.description is not None:
        db_poll.description = poll_update.description
    if poll_update.is_active is not None:
        db_poll.is_active = poll_update.is_active
    if poll_update.closes_at is not None:
        db_poll.closes_at = poll_update.closes_at

    db.commit()
    db.refresh(db_poll)

    background_tasks.add_task(
        manager.broadcast_all,
        {"type": "poll_updated", "poll_id": poll_id},
    )
    background_tasks.add_task(
        manager.broadcast_to_poll,
        {"type": "poll_updated", "poll_id": poll_id},
        poll_id,
    )

    return get_poll_with_stats(poll_id, db, user_id)


@router.post("/{poll_id}/close", response_model=PollResponse)
def close_poll(
    poll_id: int,
    user_id: int,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
):
    db_poll = db.query(Poll).filter(Poll.id == poll_id).first()
    if not db_poll:
        raise HTTPException(status_code=404, detail="Poll not found")

    if db_poll.creator_id != user_id:
        raise HTTPException(status_code=403, detail="Not authorized to close this poll")

    if not db_poll.is_active:
        return get_poll_with_stats(poll_id, db, user_id)

    db_poll.is_active = False
    db.commit()
    db.refresh(db_poll)

    background_tasks.add_task(
        manager.broadcast_all,
        {"type": "poll_closed", "poll_id": poll_id},
    )
    background_tasks.add_task(
        manager.broadcast_to_poll,
        {"type": "poll_closed", "poll_id": poll_id},
        poll_id,
    )

    return get_poll_with_stats(poll_id, db, user_id)

@router.delete("/{poll_id}")
def delete_poll(
    poll_id: int,
    user_id: int,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
):
    db_poll = db.query(Poll).filter(Poll.id == poll_id).first()
    if not db_poll:
        raise HTTPException(status_code=404, detail="Poll not found")
    
    if db_poll.creator_id != user_id:
        raise HTTPException(status_code=403, detail="Not authorized to delete this poll")
    
    db.delete(db_poll)
    db.commit()

    background_tasks.add_task(
        manager.broadcast_all,
        {"type": "poll_deleted", "poll_id": poll_id},
    )
    background_tasks.add_task(
        manager.broadcast_to_poll,
        {"type": "poll_deleted", "poll_id": poll_id},
        poll_id,
    )

    return {"message": "Poll deleted successfully"}

def get_poll_with_stats(poll_id: int, db: Session, user_id: Optional[int] = None):
    # Get poll
    db_poll = db.query(Poll).filter(Poll.id == poll_id).first()
    if not db_poll:
        raise HTTPException(status_code=404, detail="Poll not found")
    
    # Auto-close if past scheduled end
    now = datetime.now(timezone.utc)
    if db_poll.is_active and db_poll.closes_at:
        closes_at = db_poll.closes_at
        # Handle timezone-naive closes_at by assuming UTC
        if closes_at.tzinfo is None:
            closes_at = closes_at.replace(tzinfo=timezone.utc)
        if closes_at <= now:
            db_poll.is_active = False
            db.commit()
            db.refresh(db_poll)

    # Get options with vote counts
    options_with_counts = db.query(
        Option,
        func.count(Vote.id).label('vote_count')
    ).outerjoin(Vote).filter(Option.poll_id == poll_id).group_by(Option.id).all()
    
    options = []
    for option, vote_count in options_with_counts:
        option_dict = {
            "id": option.id,
            "text": option.text,
            "poll_id": option.poll_id,
            "created_at": option.created_at,
            "vote_count": vote_count or 0
        }
        options.append(OptionResponse(**option_dict))
    
    # Get total votes and likes
    total_votes = db.query(Vote).filter(Vote.poll_id == poll_id).count()
    total_likes = db.query(Like).filter(Like.poll_id == poll_id).count()
    
    # Check if user voted/liked
    user_voted = False
    user_liked = False
    if user_id:
        user_voted = db.query(Vote).filter(Vote.poll_id == poll_id, Vote.user_id == user_id).first() is not None
        user_liked = db.query(Like).filter(Like.poll_id == poll_id, Like.user_id == user_id).first() is not None
    
    creator = db.query(User).filter(User.id == db_poll.creator_id).first()

    return PollResponse(
        id=db_poll.id,
        title=db_poll.title,
        description=db_poll.description,
        creator_id=db_poll.creator_id,
        creator_username=creator.username if creator else None,
        created_at=db_poll.created_at,
        updated_at=db_poll.updated_at,
        is_active=db_poll.is_active,
        closes_at=db_poll.closes_at,
        options=options,
        total_votes=total_votes,
        total_likes=total_likes,
        user_voted=user_voted,
        user_liked=user_liked
    )
