from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import User
from app.utils.security import verify_token

security = HTTPBearer()

def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security), 
                    db: Session = Depends(get_db)):
    print(" DEBUG - get_current_user called")
    print(f" DEBUG - Credentials type: {type(credentials)}")
    print(f" DEBUG - Credentials: {credentials}")
    
    token = credentials.credentials
    print(f" DEBUG - Token received: {token[:50]}...")  # Prvih 50 karaktera
    
    payload = verify_token(token)
    print(f"DEBUG - Payload from verify_token: {payload}")
    
    if not payload:
        print(" DEBUG - Token verification FAILED - payload is None")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials"
        )
    
    email = payload.get("sub")
    print(f" DEBUG - Email from token: {email}")
    
    user = db.query(User).filter(User.email == email).first()
    if not user:
        print(f" DEBUG - User not found in database: {email}")
        raise HTTPException(status_code=404, detail="User not found")
    
    print(f" DEBUG - User authenticated successfully: {user.email} (ID: {user.id}, Role: {user.role}, Active: {user.is_active})")
    return user

def get_current_active_user(current_user: User = Depends(get_current_user)):
    print(f" DEBUG - get_current_active_user called for: {current_user.email}")
    
    if not current_user.is_active:
        print(f" DEBUG - User is inactive: {current_user.email}")
        raise HTTPException(status_code=400, detail="Inactive user")
    
    print(f" DEBUG - User is active: {current_user.email}")
    return current_user

# Role-based dependencies
def require_role(required_role: str):
    def role_dependency(current_user: User = Depends(get_current_active_user)):
        print(f" DEBUG - require_role called - Required: {required_role}, User role: {current_user.role}")
        
        if current_user.role != required_role and current_user.role != "admin":
            print(f" DEBUG - Role check FAILED - User role '{current_user.role}' doesn't match required '{required_role}'")
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Require {required_role} role"
            )
        
        print(f" DEBUG - Role check PASSED - User has required role: {current_user.role}")
        return current_user
    return role_dependency

# Shortcuts
require_admin = require_role("admin")
require_artisan = require_role("artisan")
require_customer = require_role("customer")