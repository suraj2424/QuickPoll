from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text, Boolean
from datetime import datetime, timezone
from sqlalchemy.orm import relationship
from app.db.database import Base

class Poll(Base):
    __tablename__ = "polls"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(200), nullable=False)
    description = Column(Text, nullable=True)
    creator_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))
    is_active = Column(Boolean, default=True)
    closes_at = Column(DateTime, nullable=True)

    # relationships
    creator = relationship("User", back_populates="polls")
    options = relationship("Option", back_populates="poll", cascade="all, delete-orphan")
    votes = relationship("Vote", back_populates="poll", cascade="all, delete-orphan")
    likes = relationship("Like", back_populates="poll", cascade="all, delete-orphan")