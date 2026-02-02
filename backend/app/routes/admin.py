"""
Admin-specific routes for platform management.
All routes in this module require admin privileges.
"""

from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.models.user import User
from app.middleware.auth import get_admin_from_header
from app.utils.audit import get_admin_actions
from typing import List, Optional

router = APIRouter()

@router.get("/users")
def get_all_users(
    db: Session = Depends(get_db),
    admin_user: User = Depends(get_admin_from_header)
):
    """
    Get all users with statistics. Admin only.
    
    Args:
        db: Database session
        admin_user: Verified admin user from header
        
    Returns:
        List of all users with their statistics
    """
    from app.models.poll import Poll
    from app.models.vote import Vote
    
    users = db.query(User).all()
    
    user_list = []
    for user in users:
        # Count polls created by this user
        polls_created = db.query(Poll).filter(Poll.creator_id == user.id).count()
        
        # Count total votes cast by this user
        total_votes = db.query(Vote).filter(Vote.user_id == user.id).count()
        
        user_list.append({
            "id": user.id,
            "username": user.username,
            "email": user.email,
            "role": user.role,
            "created_at": user.created_at.isoformat(),
            "polls_created": polls_created,
            "total_votes": total_votes
        })
    
    return user_list

@router.get("/stats")
def get_platform_stats(
    db: Session = Depends(get_db),
    admin_user: User = Depends(get_admin_from_header)
):
    """
    Get platform statistics. Admin only.
    
    Args:
        db: Database session
        admin_user: Verified admin user from header
        
    Returns:
        Platform statistics
    """
    from app.models.poll import Poll
    from app.models.vote import Vote
    
    total_users = db.query(User).count()
    total_polls = db.query(Poll).count()
    total_votes = db.query(Vote).count()
    
    return {
        "total_users": total_users,
        "total_polls": total_polls,
        "total_votes": total_votes
    }


@router.get("/actions")
def get_audit_log(
    limit: int = Query(50, ge=1, le=100),
    offset: int = Query(0, ge=0),
    admin_id: Optional[int] = Query(None),
    db: Session = Depends(get_db),
    admin_user: User = Depends(get_admin_from_header)
):
    """
    Get admin action audit log. Admin only.
    
    Args:
        limit: Maximum number of actions to return (1-100)
        offset: Number of actions to skip
        admin_id: Optional filter by admin user ID
        db: Database session
        admin_user: Verified admin user from header
        
    Returns:
        List of admin actions
    """
    actions = get_admin_actions(db, admin_id=admin_id, limit=limit, offset=offset)
    
    return {
        "actions": [
            {
                "id": action.id,
                "admin_id": action.admin_id,
                "admin_username": action.admin.username if action.admin else None,
                "action_type": action.action_type,
                "target_type": action.target_type,
                "target_id": action.target_id,
                "details": action.details,
                "created_at": action.created_at.isoformat()
            }
            for action in actions
        ],
        "limit": limit,
        "offset": offset
    }
