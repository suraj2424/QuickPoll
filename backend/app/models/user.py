from sqlalchemy import Column, Integer, String, DateTime, JSON
from datetime import datetime, timezone
from sqlalchemy.orm import relationship
from app.db.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, index=True)
    email = Column(String, unique=True, index=True)
    password = Column(String, nullable=False)
    role = Column(String(20), default="user", nullable=False)
    preferences = Column(JSON, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    # relationships
    polls = relationship("Poll", back_populates="creator")
    votes = relationship("Vote", back_populates="user")
    likes = relationship("Like", back_populates="user")
