from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from app.db.database import get_db
from app.models.vote import Vote
from app.models.poll import Poll
from app.models.option import Option
from app.schemas.vote import VoteCreate, VoteResponse
from app.websocket import manager

router = APIRouter()

@router.post("/", response_model=VoteResponse)
def create_vote(
    vote: VoteCreate,
    user_id: int,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
):
    # Verify poll exists and is active
    db_poll = db.query(Poll).filter(Poll.id == vote.poll_id, Poll.is_active == True).first()
    if not db_poll:
        raise HTTPException(status_code=404, detail="Poll not found or inactive")
    
    # Verify option belongs to poll
    db_option = db.query(Option).filter(
        Option.id == vote.option_id, 
        Option.poll_id == vote.poll_id
    ).first()
    if not db_option:
        raise HTTPException(status_code=404, detail="Option not found for this poll")
    
    # Check if user already voted
    existing_vote = db.query(Vote).filter(
        Vote.user_id == user_id,
        Vote.poll_id == vote.poll_id
    ).first()
    
    if existing_vote:
        # Update existing vote
        existing_vote.option_id = vote.option_id
        db.commit()
        db.refresh(existing_vote)
        background_tasks.add_task(
            manager.broadcast_to_poll,
            {"type": "poll_updated", "poll_id": vote.poll_id},
            vote.poll_id,
        )
        background_tasks.add_task(
            manager.broadcast_all,
            {"type": "poll_updated", "poll_id": vote.poll_id},
        )
        return existing_vote
    else:
        # Create new vote
        try:
            db_vote = Vote(
                user_id=user_id,
                poll_id=vote.poll_id,
                option_id=vote.option_id
            )
            db.add(db_vote)
            db.commit()
            db.refresh(db_vote)
            background_tasks.add_task(
                manager.broadcast_to_poll,
                {"type": "poll_updated", "poll_id": vote.poll_id},
                vote.poll_id,
            )
            background_tasks.add_task(
                manager.broadcast_all,
                {"type": "poll_updated", "poll_id": vote.poll_id},
            )
            return db_vote
        except IntegrityError:
            db.rollback()
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Vote already exists"
            )

@router.get("/poll/{poll_id}")
def get_poll_votes(poll_id: int, db: Session = Depends(get_db)):
    votes = db.query(Vote).filter(Vote.poll_id == poll_id).all()
    return votes

@router.delete("/{vote_id}")
def delete_vote(vote_id: int, user_id: int, db: Session = Depends(get_db)):
    db_vote = db.query(Vote).filter(Vote.id == vote_id, Vote.user_id == user_id).first()
    if not db_vote:
        raise HTTPException(status_code=404, detail="Vote not found")
    
    db.delete(db_vote)
    db.commit()
    return {"message": "Vote deleted successfully"}