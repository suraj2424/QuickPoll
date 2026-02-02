from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.models.user import User
from app.schemas.user import UserCreate, UserLogin, UserResponse, RoleUpdate, PasswordChange, ProfileUpdate, UserPreferences
from app.middleware.auth import verify_admin
from app.utils.audit import log_admin_action
import os

router = APIRouter()

@router.post("/register", response_model=UserResponse)
def register_user(user: UserCreate, db: Session = Depends(get_db)):
    # Check if user already exists
    db_user = db.query(User).filter(
        (User.username == user.username) | (User.email == user.email)
    ).first()
    if db_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username or email already registered"
        )
    
    # Determine user role based on access code
    admin_access_code = os.getenv("ADMIN_ACCESS_CODE")
    user_role = "user"  # Default role
    
    if user.access_code and admin_access_code and user.access_code == admin_access_code:
        user_role = "admin"
    
    # Create new user
    new_user = User(
        username=user.username,
        email=user.email,
        password=user.password,  # In production, hash this password
        role=user_role
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user
    
@router.post("/login")
def login_user(user: UserLogin, db: Session = Depends(get_db)):
    # Authenticate user
    db_user = db.query(User).filter(User.username == user.username).first()
    if not db_user or db_user.password != user.password:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials"
        )
    return {
        "message": "Login successful",
        "user_id": db_user.id,
        "username": db_user.username,
        "email": db_user.email,
        "role": db_user.role
    }

@router.get("/me/{user_id}", response_model=UserResponse)
def get_current_user(user_id: int, db: Session = Depends(get_db)):
    db_user = db.query(User).filter(User.id == user_id).first()
    if not db_user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    return db_user


@router.put("/users/{user_id}/role", response_model=UserResponse)
def change_user_role(
    user_id: int,
    role_update: RoleUpdate,
    db: Session = Depends(get_db)
):
    """
    Change a user's role. Requires admin privileges.
    
    Args:
        user_id: ID of the user whose role should be changed
        role_update: New role information including admin_user_id for verification
        db: Database session
        
    Returns:
        Updated user information
    """
    # Verify admin user
    admin_user = verify_admin(role_update.admin_user_id, db)
    
    # Validate role value
    if role_update.role not in ["user", "admin"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid role. Must be 'user' or 'admin'"
        )
    
    # Get the target user
    target_user = db.query(User).filter(User.id == user_id).first()
    if not target_user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # Store old role for audit log
    old_role = target_user.role
    
    # Update the role
    target_user.role = role_update.role
    db.commit()
    db.refresh(target_user)
    
    # Log the admin action
    log_admin_action(
        db=db,
        admin_id=admin_user.id,
        action_type="role_change",
        target_type="user",
        target_id=user_id,
        details={
            "old_role": old_role,
            "new_role": role_update.role,
            "target_username": target_user.username
        }
    )
    
    return target_user

@router.put("/users/{user_id}/password")
def change_password(
    user_id: int,
    password_change: PasswordChange,
    db: Session = Depends(get_db)
):
    """
    Change a user's password.
    
    Args:
        user_id: ID of the user changing their password
        password_change: Password change data including current and new password
        db: Database session
        
    Returns:
        Success message
    """
    # Get the target user
    target_user = db.query(User).filter(User.id == user_id).first()
    if not target_user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # Verify current password
    if target_user.password != password_change.currentPassword:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Current password is incorrect"
        )
    
    # Update password (in production, hash this password)
    target_user.password = password_change.newPassword
    db.commit()
    
    return {"message": "Password changed successfully"}

@router.put("/users/{user_id}/profile")
def update_user_profile(
    user_id: int,
    profile_update: ProfileUpdate,
    db: Session = Depends(get_db)
):
    """
    Update a user's profile.
    
    Args:
        user_id: ID of the user updating their profile
        profile_update: Profile data including username and email
        db: Database session
        
    Returns:
        Success message
    """
    # Get the target user
    target_user = db.query(User).filter(User.id == user_id).first()
    if not target_user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # Check if username is already taken by another user
    if profile_update.username != target_user.username:
        existing_user = db.query(User).filter(
            User.username == profile_update.username,
            User.id != user_id
        ).first()
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Username already taken"
            )
    
    # Check if email is already taken by another user
    if profile_update.email and profile_update.email != target_user.email:
        existing_user = db.query(User).filter(
            User.email == profile_update.email,
            User.id != user_id
        ).first()
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered"
            )
    
    # Update profile
    target_user.username = profile_update.username
    if profile_update.email:
        target_user.email = profile_update.email
    db.commit()
    
    return {"message": "Profile updated successfully"}

@router.put("/users/{user_id}/preferences")
def update_user_preferences(
    user_id: int,
    preferences: UserPreferences,
    db: Session = Depends(get_db)
):
    """
    Update a user's preferences.
    
    Args:
        user_id: ID of the user updating their preferences
        preferences: Preference data including theme and notifications
        db: Database session
        
    Returns:
        Success message
    """
    # Get the target user
    target_user = db.query(User).filter(User.id == user_id).first()
    if not target_user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # Store preferences in user metadata (would ideally be in a separate preferences table)
    target_user.preferences = preferences.model_dump()
    db.commit()
    
    return {"message": "Preferences updated successfully"}

@router.get("/users/{user_id}/preferences", response_model=UserPreferences)
def get_user_preferences(
    user_id: int,
    db: Session = Depends(get_db)
):
    """
    Get a user's preferences.
    
    Args:
        user_id: ID of the user
        db: Database session
        
    Returns:
        User preferences
    """
    # Get the target user
    target_user = db.query(User).filter(User.id == user_id).first()
    if not target_user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # Return default preferences if none stored
    if target_user.preferences:
        return UserPreferences(**target_user.preferences)
    
    return UserPreferences(
        theme="system",
        emailNotifications=True,
        pollNotifications=True
    )
