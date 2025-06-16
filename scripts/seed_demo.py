import pyodbc
import os
from datetime import datetime

def seed_data():
    server = os.getenv("SQL_SERVER", "localhost\\SQLEXPRESS")
    database = os.getenv("SQL_DATABASE", "ai_multimedia_suite")
    driver = os.getenv("SQL_DRIVER", "ODBC Driver 17 for SQL Server")

    conn_str = (
        f"DRIVER={{{driver}}};"
        f"SERVER={server};"
        f"DATABASE={database};"
        f"Trusted_Connection=yes;"
    )

    try:
        with pyodbc.connect(conn_str, autocommit=True) as conn:
            cursor = conn.cursor()

            # Insert demo config
            cursor.execute("""
                INSERT INTO system_config (config_key, config_value, description, updated_at)
                VALUES (?, ?, ?, ?)
            """, "demo_mode", '"true"', "Enable demo mode for agents", datetime.now())

            print("🌱 Demo data seeded successfully.")
    except Exception as e:
        print(f"[!] Seeding failed: {e}")

if __name__ == "__main__":
    seed_data()
