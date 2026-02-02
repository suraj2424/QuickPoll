"""
Migration script to add role field to users table.
This script adds a 'role' column with default value 'user' to existing users.

Run this script once to migrate existing database:
    python migrations/add_role_to_users.py
"""

import sqlite3
import os
from pathlib import Path

def migrate():
    # Get database path
    db_path = Path(__file__).parent.parent / "polls.db"
    
    if not db_path.exists():
        print(f"Database not found at {db_path}")
        print("No migration needed - database will be created with role field.")
        return
    
    # Connect to database
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    # Check if role column already exists
    cursor.execute("PRAGMA table_info(users)")
    columns = [column[1] for column in cursor.fetchall()]
    
    if 'role' in columns:
        print("Role column already exists. Migration not needed.")
        conn.close()
        return
    
    try:
        # Add role column with default value
        print("Adding role column to users table...")
        cursor.execute("ALTER TABLE users ADD COLUMN role VARCHAR(20) DEFAULT 'user' NOT NULL")
        
        # Update existing users to have 'user' role
        cursor.execute("UPDATE users SET role = 'user' WHERE role IS NULL")
        
        conn.commit()
        print("Migration completed successfully!")
        print("All existing users have been assigned the 'user' role.")
        
    except sqlite3.Error as e:
        print(f"Migration failed: {e}")
        conn.rollback()
        raise
    finally:
        conn.close()

if __name__ == "__main__":
    migrate()
