import os
import pyodbc

SQL_FILE = os.path.join(os.path.dirname(__file__), "create_database.sql")

def run_sql_script():
    server = os.getenv("SQL_SERVER", "localhost\\SQLEXPRESS")
    driver = os.getenv("SQL_DRIVER", "ODBC Driver 17 for SQL Server")

    conn_str = (
        f"DRIVER={{{driver}}};"
        f"SERVER={server};"
        f"Trusted_Connection=yes;"
    )

    try:
        with pyodbc.connect(conn_str, autocommit=True) as conn:
            cursor = conn.cursor()
            with open(SQL_FILE, "r", encoding="utf-8") as f:
                sql = f.read()
                for statement in sql.split("GO"):
                    if statement.strip():
                        cursor.execute(statement)
            print("✅ Database initialized successfully.")
    except Exception as e:
        print(f"[!] Initialization failed: {e}")

if __name__ == "__main__":
    run_sql_script()
