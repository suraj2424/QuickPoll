from pydantic import BaseModel
from datetime import datetime
from typing import List, Optional

class OptionBase(BaseModel):
    text: str

class OptionCreate(OptionBase):
    pass

class OptionResponse(OptionBase):
    id: int
    poll_id: int
    created_at: datetime
    vote_count: Optional[int] = 0
    
    class Config:
        from_attributes = True

class PollBase(BaseModel):
    title: str
    description: Optional[str] = None

class PollCreate(PollBase):
    options: List[str]  # List of option texts
    duration_minutes: Optional[int] = None
    closes_at: Optional[datetime] = None

class PollUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    is_active: Optional[bool] = None
    closes_at: Optional[datetime] = None

class PollResponse(PollBase):
    id: int
    creator_id: int
    creator_username: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    is_active: bool
    closes_at: Optional[datetime] = None
    options: List[OptionResponse] = []
    total_votes: Optional[int] = 0
    total_likes: Optional[int] = 0
    user_voted: Optional[bool] = False
    user_liked: Optional[bool] = False
    
    class Config:
        from_attributes = True
