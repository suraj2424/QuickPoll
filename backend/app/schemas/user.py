from pydantic import BaseModel, EmailStr
from datetime import datetime
from typing import Optional

class UserBase(BaseModel):
    username: str
    email: EmailStr

class UserCreate(UserBase):
    password: str
    access_code: Optional[str] = None

class UserLogin(BaseModel):
    username: str
    password: str

class UserResponse(UserBase):
    id: int
    role: str
    created_at: datetime
    
    class Config:
        from_attributes = True

class RoleUpdate(BaseModel):
    role: str
    admin_user_id: int

class PasswordChange(BaseModel):
    currentPassword: str
    newPassword: str

class ProfileUpdate(BaseModel):
    username: str
    email: Optional[str] = None

class UserPreferences(BaseModel):
    theme: str = "system"
    emailNotifications: bool = True
    pollNotifications: bool = True