"""
Utility functions for audit logging.
"""

from sqlalchemy.orm import Session
from app.models.admin_action import AdminAction
from typing import Optional, Dict, Any
from datetime import datetime, timezone

def log_admin_action(
    db: Session,
    admin_id: int,
    action_type: str,
    target_type: str,
    target_id: int,
    details: Optional[Dict[str, Any]] = None
) -> AdminAction:
    """
    Log an admin action to the audit trail.
    
    Args:
        db: Database session
        admin_id: ID of the admin user performing the action
        action_type: Type of action (e.g., 'role_change', 'content_delete', 'poll_close')
        target_type: Type of target entity (e.g., 'user', 'poll')
        target_id: ID of the target entity
        details: Optional dictionary with additional details about the action
        
    Returns:
        Created AdminAction object
        
    Example:
        log_admin_action(
            db=db,
            admin_id=1,
            action_type='role_change',
            target_type='user',
            target_id=5,
            details={'old_role': 'user', 'new_role': 'admin'}
        )
    """
    admin_action = AdminAction(
        admin_id=admin_id,
        action_type=action_type,
        target_type=target_type,
        target_id=target_id,
        details=details,
        created_at=datetime.now(timezone.utc)
    )
    
    db.add(admin_action)
    db.commit()
    db.refresh(admin_action)
    
    return admin_action

def get_admin_actions(
    db: Session,
    admin_id: Optional[int] = None,
    limit: int = 50,
    offset: int = 0
):
    """
    Retrieve admin actions from the audit log.
    
    Args:
        db: Database session
        admin_id: Optional filter by admin user ID
        limit: Maximum number of actions to return
        offset: Number of actions to skip
        
    Returns:
        List of AdminAction objects
    """
    query = db.query(AdminAction)
    
    if admin_id:
        query = query.filter(AdminAction.admin_id == admin_id)
    
    query = query.order_by(AdminAction.created_at.desc())
    query = query.limit(limit).offset(offset)
    
    return query.all()
