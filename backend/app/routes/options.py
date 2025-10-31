from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.models.option import Option
from app.models.poll import Poll
from app.schemas.poll import OptionCreate, OptionResponse

router = APIRouter()

@router.post("/", response_model=OptionResponse)
def create_option(option: OptionCreate, poll_id: int, user_id: int, db: Session = Depends(get_db)):
    # Verify poll exists and user is creator
    db_poll = db.query(Poll).filter(Poll.id == poll_id).first()
    if not db_poll:
        raise HTTPException(status_code=404, detail="Poll not found")
    
    if db_poll.creator_id != user_id:
        raise HTTPException(status_code=403, detail="Not authorized to add options to this poll")
    
    db_option = Option(text=option.text, poll_id=poll_id)
    db.add(db_option)
    db.commit()
    db.refresh(db_option)
    
    return OptionResponse(
        id=db_option.id,
        text=db_option.text,
        poll_id=db_option.poll_id,
        created_at=db_option.created_at,
        vote_count=0
    )

@router.get("/poll/{poll_id}")
def get_poll_options(poll_id: int, db: Session = Depends(get_db)):
    options = db.query(Option).filter(Option.poll_id == poll_id).all()
    return options

@router.delete("/{option_id}")
def delete_option(option_id: int, user_id: int, db: Session = Depends(get_db)):
    db_option = db.query(Option).filter(Option.id == option_id).first()
    if not db_option:
        raise HTTPException(status_code=404, detail="Option not found")
    
    # Check if user is poll creator
    db_poll = db.query(Poll).filter(Poll.id == db_option.poll_id).first()
    if db_poll.creator_id != user_id:
        raise HTTPException(status_code=403, detail="Not authorized to delete this option")
    
    db.delete(db_option)
    db.commit()
    return {"message": "Option deleted successfully"}