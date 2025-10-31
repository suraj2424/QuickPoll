from pydantic import BaseModel
from datetime import datetime

class VoteCreate(BaseModel):
    poll_id: int
    option_id: int

class VoteResponse(BaseModel):
    id: int
    user_id: int
    poll_id: int
    option_id: int
    created_at: datetime
    
    class Config:
        from_attributes = True