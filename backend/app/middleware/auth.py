"""
Authentication and authorization middleware for admin routes.
"""

from fastapi import HTTPException, status, Depends, Header
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.models.user import User
from typing import Optional

def verify_admin(
    admin_user_id: int,
    db: Session = Depends(get_db)
) -> User:
    """
    Dependency to verify that the requesting user has admin role.
    
    Args:
        admin_user_id: The ID of the user making the request (from request body)
        db: Database session
        
    Returns:
        User object if user is admin
        
    Raises:
        HTTPException: 403 Forbidden if user is not admin or not found
    """
    user = db.query(User).filter(User.id == admin_user_id).first()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    if user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required"
        )
    
    return user

def get_admin_from_header(
    x_user_id: Optional[int] = Header(None),
    db: Session = Depends(get_db)
) -> User:
    """
    Dependency to verify admin from header.
    
    Args:
        x_user_id: User ID from request header
        db: Database session
        
    Returns:
        User object if user is admin
        
    Raises:
        HTTPException: 401 if no user ID, 403 if not admin
    """
    if not x_user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User ID required in X-User-Id header"
        )
    
    return verify_admin(x_user_id, db)

