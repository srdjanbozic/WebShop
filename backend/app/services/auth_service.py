from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from app.models import User
from app.schemas import UserCreate, UserLogin
from app.utils.security import verify_password, get_password_hash, create_access_token

class AuthService:
    @staticmethod
    def register_user(db: Session, user: UserCreate):
        # Check if user already exists
        existing_user = db.query(User).filter(User.email == user.email).first()
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered"
            )
        
        # Create new user
        hashed_password = get_password_hash(user.password)
        db_user = User(
            email=user.email,
            hashed_password=hashed_password,
            full_name=user.full_name,
            role=user.role,
            phone=user.phone,
            address=user.address
        )
        
        db.add(db_user)
        db.commit()
        db.refresh(db_user)
        
        #  Vratite token nakon registracije kao i kod logina
        access_token = create_access_token(data={"sub": user.email})
        return {
            "access_token": access_token, 
            "token_type": "bearer", 
            "user_id": db_user.id,
            "message": "User created successfully"
        }

    @staticmethod
    def authenticate_user(db: Session, email: str, password: str):
        user = db.query(User).filter(User.email == email).first()
        if not user:
            return False
        if not verify_password(password, user.hashed_password):
            return False
        return user

    @staticmethod
    def login_user(db: Session, user_data: UserLogin):
        user = AuthService.authenticate_user(db, user_data.email, user_data.password)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect email or password"
            )
        
        # Create access token
        access_token = create_access_token(data={"sub": user.email})
        return {"access_token": access_token, "token_type": "bearer"}