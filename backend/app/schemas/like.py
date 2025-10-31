from pydantic import BaseModel
from datetime import datetime

class LikeCreate(BaseModel):
    poll_id: int

class LikeResponse(BaseModel):
    id: int
    user_id: int
    poll_id: int
    created_at: datetime
    
    class Config:
        from_attributes = True

class LikeToggleMessage(BaseModel):
    message: str
    liked: bool