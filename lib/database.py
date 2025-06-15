import pyodbc
import os

def get_connection():
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
        conn = pyodbc.connect(conn_str, autocommit=True)
        return conn
    except Exception as e:
        print(f"[!] Database connection failed: {e}")
        return None
