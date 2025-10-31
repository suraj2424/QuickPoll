from sqlalchemy import Column, Integer, ForeignKey, DateTime, UniqueConstraint
from datetime import datetime
from sqlalchemy.orm import relationship
from app.db.database import Base

class Like(Base):
    __tablename__ = "likes"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    poll_id = Column(Integer, ForeignKey("polls.id"), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Ensure one like per user per poll
    __table_args__ = (UniqueConstraint('user_id', 'poll_id', name='unique_user_poll_like'),)

    # relationships
    user = relationship("User", back_populates="likes")
    poll = relationship("Poll", back_populates="likes")