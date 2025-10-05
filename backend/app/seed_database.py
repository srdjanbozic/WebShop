# backend/app/seed_database.py
import sys
import os

# ✅ DODAJTE OVO: Fix Python path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy.orm import Session
from app.database import SessionLocal
from app.models import User, Product

def hash_password_simple(password: str) -> str:
    """Simplified password hashing for development"""
    return f"hashed_{password}"

def get_password_hash_wrapper(password: str) -> str:
    """Wrapper function that uses proper hash if available, otherwise simple hash"""
    try:
        from app.utils.security import get_password_hash
        return get_password_hash(password)
    except ImportError:
        return hash_password_simple(password)

def seed_database():
    """Seed the database with initial data"""
    db = SessionLocal()
    
    try:
        print("🌱 Starting database seeding...")
        
        # Check if we already have users
        existing_users = db.query(User).count()
        if existing_users >= 4:
            print(f"👥 Database already has {existing_users} users. Skipping seeding.")
            return
        
        print("🆕 Creating initial users with proper password hashing...")
        
        # ✅ KREIRAJTE KORISNIKE SA PRAVIM PASSWORD HASH-OM
        customer_user = User(
            email="customer@example.com",
            hashed_password=get_password_hash_wrapper("customer123"),
            full_name="Test Customer",
            role="customer",
            phone="+381641234570",
            address="Belgrade, Serbia"
        )
        db.add(customer_user)
        
        # Create admin user
        admin_user = User(
            email="admin@luxurywood.com",
            hashed_password=get_password_hash_wrapper("admin123"),
            full_name="Admin User",
            role="admin",
            phone="+381601234567",
            address="Belgrade, Serbia"
        )
        db.add(admin_user)
        
        # Create artisan users
        artisan1 = User(
            email="marko.woodcraft@luxurywood.com",
            hashed_password=get_password_hash_wrapper("artisan123"),
            full_name="Marko Petrović",
            role="artisan",
            phone="+381641234568",
            address="Novi Sad, Serbia"
        )
        db.add(artisan1)
        
        artisan2 = User(
            email="ana.furniture@luxurywood.com", 
            hashed_password=get_password_hash_wrapper("artisan123"),
            full_name="Ana Jovanović",
            role="artisan", 
            phone="+381641234569",
            address="Belgrade, Serbia"
        )
        db.add(artisan2)
        
        db.commit()
        db.refresh(customer_user)
        db.refresh(admin_user)
        db.refresh(artisan1) 
        db.refresh(artisan2)
        
        print("✅ Users created successfully!")
        print("👥 User emails available for login:")
        print(f"   📧 Customer: customer@example.com / customer123")
        print(f"   📧 Admin: admin@luxurywood.com / admin123") 
        print(f"   📧 Artisan 1: marko.woodcraft@luxurywood.com / artisan123")
        print(f"   📧 Artisan 2: ana.furniture@luxurywood.com / artisan123")
        
        print("🪑 Creating luxury wood furniture products...")
        
        # Luxury Wood Furniture Products
        products_data = [
            {
                "name": "Hrastov Dvorski Sto",
                "description": "Raskošan hrastov sto za trpezariju ručne izrade",
                "price": 1299.99,
                "stock": 3,
                "category": "table",
                "material": "oak",
                "dimensions": "220x100x75 cm",
                "weight": 85.5,
                "is_customizable": True,
                "artisan_id": artisan1.id,
                "image_url": "/images/oak-dining-table.jpg"
            },
            {
                "name": "Moderni Orman od Orahovine", 
                "description": "Elegantan orman od premium orahovine sa soft-close mehanizmom",
                "price": 2499.99,
                "stock": 2,
                "category": "wardrobe",
                "material": "walnut", 
                "dimensions": "200x60x220 cm",
                "weight": 120.0,
                "is_customizable": True,
                "artisan_id": artisan2.id,
                "image_url": "/images/walnut-wardrobe.jpg"
            },
            {
                "name": "Kraljevski Krevet od Bukvine",
                "description": "Raskošan bračni krevet od masivne bukovine sa uklesanim detaljima",
                "price": 1899.99, 
                "stock": 4,
                "category": "bed",
                "material": "beech",
                "dimensions": "180x200x110 cm", 
                "weight": 95.0,
                "is_customizable": True,
                "artisan_id": artisan1.id,
                "image_url": "/images/beech-bed.jpg"
            },
            {
                "name": "Designerska Stolica 'Elegance'",
                "description": "Ergonomska stolica od obrađene hrastovine sa udobnim sedištem",
                "price": 349.99,
                "stock": 12, 
                "category": "chair",
                "material": "oak",
                "dimensions": "45x55x85 cm",
                "weight": 8.5,
                "is_customizable": False,
                "artisan_id": artisan2.id,
                "image_url": "/images/oak-chair.jpg"
            },
            {
                "name": "Drveni Komad Nameštaja 'Heritage'",
                "description": "Višenamenski komad nameštaja koji kombinuje policu i ormarić",
                "price": 899.99,
                "stock": 5,
                "category": "shelf", 
                "material": "oak",
                "dimensions": "120x40x180 cm",
                "weight": 45.0,
                "is_customizable": True,
                "artisan_id": artisan1.id,
                "image_url": "/images/heritage-cabinet.jpg"
            },
            {
                "name": "Konferencijski Sto od Masivnog Hrasta",
                "description": "Impresivan konferencijski sto za poslovne prostorije",
                "price": 2199.99,
                "stock": 2,
                "category": "table",
                "material": "oak",
                "dimensions": "300x100x75 cm",
                "weight": 150.0,
                "is_customizable": True,
                "artisan_id": artisan2.id,
                "image_url": "/images/oak-dining-table.jpg"
            }
        ]
        
        # Create products
        for product_data in products_data:
            product = Product(**product_data)
            db.add(product)
        
        db.commit()
        print(f"Successfully created {len(products_data)} luxury furniture products!")
        print("Database seeding completed successfully!")
        
        # Print summary
        print(f"\nSEEDING SUMMARY:")
        print(f"Total users: {db.query(User).count()}")
        print(f"Total products: {db.query(Product).count()}")
        print(f"Test credentials are printed above ↑")
        
    except Exception as e:
        db.rollback()
        print(f"Error during seeding: {e}")
        import traceback
        traceback.print_exc()
        raise
    finally:
        db.close()

if __name__ == "__main__":
    seed_database()