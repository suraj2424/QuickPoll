from sqlalchemy import create_engine, MetaData
from sqlalchemy.orm import sessionmaker, declarative_base
from dotenv import load_dotenv
import os

# Load environment variables
load_dotenv()

# Get database URL from .env
DB_CONNECTION_STRING = os.getenv("DATABASE_URL")

# Create engine
engine = create_engine(DB_CONNECTION_STRING, echo=True)

# Base class for models
Base = declarative_base()

# Create metadata
metadata = MetaData()

# Create all tables if they do not exist
def init_db():
    import app.models.poll
    import app.models.option
    import app.models.vote
    import app.models.like
    import app.models.user
    import app.models.admin_action
    Base.metadata.create_all(bind=engine)

# Initialize database
init_db()

# Session factory
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Dependency for FastAPI routes
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()