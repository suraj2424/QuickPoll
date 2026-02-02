from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, JSON
from datetime import datetime, timezone
from sqlalchemy.orm import relationship
from app.db.database import Base

class AdminAction(Base):
    __tablename__ = "admin_actions"

    id = Column(Integer, primary_key=True, index=True)
    admin_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    action_type = Column(String(50), nullable=False)  # role_change, content_delete, etc.
    target_type = Column(String(50), nullable=False)  # user, poll, etc.
    target_id = Column(Integer, nullable=False)
    details = Column(JSON, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    # relationships
    admin = relationship("User", foreign_keys=[admin_id])
