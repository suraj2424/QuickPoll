from sqlalchemy import Column, Integer, ForeignKey, DateTime, UniqueConstraint
from datetime import datetime, timezone
from sqlalchemy.orm import relationship
from app.db.database import Base

class Vote(Base):
    __tablename__ = "votes"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    poll_id = Column(Integer, ForeignKey("polls.id"), nullable=False)
    option_id = Column(Integer, ForeignKey("options.id"), nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    # Ensure one vote per user per poll
    __table_args__ = (UniqueConstraint('user_id', 'poll_id', name='unique_user_poll_vote'),)

    # relationships
    user = relationship("User", back_populates="votes")
    poll = relationship("Poll", back_populates="votes")
    option = relationship("Option", back_populates="votes")