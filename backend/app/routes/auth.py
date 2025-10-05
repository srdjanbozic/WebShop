from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.schemas import UserCreate, UserLogin, Token, UserResponse
from app.services.auth_service import AuthService
from app.database import get_db
from app.utils.security import verify_token
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from app.models import User  # DODAJ OVO

router = APIRouter()
security = HTTPBearer()

@router.post("/register", response_model=dict, status_code=status.HTTP_201_CREATED)
def register(user: UserCreate, db: Session = Depends(get_db)):
    try:
        # Sada register_user vraća token direktno
        result = AuthService.register_user(db, user)
        return result
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error creating user"
        )

@router.post("/login", response_model=Token)
def login(user_data: UserLogin, db: Session = Depends(get_db)):
    return AuthService.login_user(db, user_data)

@router.get("/me", response_model=UserResponse)
def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
):
    try:
        print(f"🔐 DEBUG - Received token: {credentials.credentials[:20]}...")
        
        # Verifikuj token
        payload = verify_token(credentials.credentials)
        if not payload:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token"
            )
        
        # Pronađi korisnika po email iz tokena
        email = payload.get("sub")
        user = db.query(User).filter(User.email == email).first()
        
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
            
        print(f"✅ DEBUG - Found user: {user.email}")
        return user
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ DEBUG - Error in /me: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error fetching user data"
        )