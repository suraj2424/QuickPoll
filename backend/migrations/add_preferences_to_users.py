"""
Migration script to add preferences field to users table.
This script adds a 'preferences' JSON column to existing users.

Run this script once to migrate existing database:
    python migrations/add_preferences_to_users.py
"""

import sqlite3
import os
from pathlib import Path

def migrate():
    # Get database path
    db_path = Path(__file__).parent.parent / "polls.db"
    
    if not db_path.exists():
        print(f"Database not found at {db_path}")
        print("No migration needed - database will be created with preferences field.")
        return
    
    # Connect to database
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    # Check if preferences column already exists
    cursor.execute("PRAGMA table_info(users)")
    columns = [column[1] for column in cursor.fetchall()]
    
    if 'preferences' in columns:
        print("Preferences column already exists. Migration not needed.")
        conn.close()
        return
    
    try:
        # Add preferences column with NULL default (will be JSON)
        print("Adding preferences column to users table...")
        cursor.execute("ALTER TABLE users ADD COLUMN preferences TEXT")
        
        conn.commit()
        print("Migration completed successfully!")
        print("All existing users have NULL preferences (will default to empty object in application).")
        
    except sqlite3.Error as e:
        print(f"Migration failed: {e}")
        conn.rollback()
        raise
    finally:
        conn.close()

if __name__ == "__main__":
    migrate()
