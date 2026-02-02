"""
Migration script to create admin_actions table for audit logging.

Run this script once to create the table:
    python migrations/create_admin_actions_table.py
"""

import sqlite3
from pathlib import Path

def migrate():
    # Get database path
    db_path = Path(__file__).parent.parent / "polls.db"
    
    if not db_path.exists():
        print(f"Database not found at {db_path}")
        print("No migration needed - database will be created with admin_actions table.")
        return
    
    # Connect to database
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    # Check if admin_actions table already exists
    cursor.execute("""
        SELECT name FROM sqlite_master 
        WHERE type='table' AND name='admin_actions'
    """)
    
    if cursor.fetchone():
        print("admin_actions table already exists. Migration not needed.")
        conn.close()
        return
    
    try:
        # Create admin_actions table
        print("Creating admin_actions table...")
        cursor.execute("""
            CREATE TABLE admin_actions (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                admin_id INTEGER NOT NULL,
                action_type VARCHAR(50) NOT NULL,
                target_type VARCHAR(50) NOT NULL,
                target_id INTEGER NOT NULL,
                details TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (admin_id) REFERENCES users(id)
            )
        """)
        
        # Create index on admin_id for faster queries
        cursor.execute("""
            CREATE INDEX idx_admin_actions_admin_id ON admin_actions(admin_id)
        """)
        
        # Create index on created_at for faster queries
        cursor.execute("""
            CREATE INDEX idx_admin_actions_created_at ON admin_actions(created_at)
        """)
        
        conn.commit()
        print("Migration completed successfully!")
        print("admin_actions table created with indexes.")
        
    except sqlite3.Error as e:
        print(f"Migration failed: {e}")
        conn.rollback()
        raise
    finally:
        conn.close()

if __name__ == "__main__":
    migrate()
