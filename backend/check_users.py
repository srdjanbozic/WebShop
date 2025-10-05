# backend/check_users.py
import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.database import SessionLocal
from app.models import User

def check_users():
    db = SessionLocal()
    try:
        users = db.query(User).all()
        print("👥 USERS IN DATABASE:")
        for user in users:
            print(f"📧 {user.email} - {user.role}")
        
        print(f"\n📊 TOTAL: {len(users)} users")
        
        # Proverite specifične korisnike
        test_emails = [
            "customer@example.com",
            "admin@luxurywood.com", 
            "marko.woodcraft@luxurywood.com",
            "ana.furniture@luxurywood.com"
        ]
        
        print("\n🔍 CHECKING TEST USERS:")
        for email in test_emails:
            user = db.query(User).filter(User.email == email).first()
            status = "✅ EXISTS" if user else "❌ MISSING"
            print(f"{status} {email}")
            
    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()
    finally:
        db.close()

if __name__ == "__main__":
    check_users()