import os
from dotenv import load_dotenv

# EKSPLICITNO navedi punu putanju do .env fajla
env_path = os.path.join(os.path.dirname(__file__), '.env')
load_dotenv(env_path)

# DEBUG: Proveri sve env varijable
print("🔧 CONFIG DEBUG - Environment variables:")
print(f"📁 .env path: {env_path}")
print(f"📁 .env exists: {os.path.exists(env_path)}")
print(f"🔑 SECRET_KEY: {os.getenv('SECRET_KEY')}")
print(f"🗄️ DATABASE_URL: {os.getenv('DATABASE_URL')}")
print(f"💳 STRIPE_SECRET_KEY: {os.getenv('STRIPE_SECRET_KEY')}")

class Settings:
    DATABASE_URL: str = os.getenv("DATABASE_URL")
    SECRET_KEY: str = os.getenv("SECRET_KEY")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    STRIPE_SECRET_KEY: str = os.getenv("STRIPE_SECRET_KEY")
    STRIPE_WEBHOOK_SECRET: str = os.getenv("STRIPE_WEBHOOK_SECRET")
    DEBUG: bool = True

settings = Settings()