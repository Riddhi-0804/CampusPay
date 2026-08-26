from werkzeug.security import generate_password_hash
from modules.database import get_db_connection, close_db_connection

def hash_password(password):
    return generate_password_hash(password)

def register_user(full_name, email, password, college_name):
    connection = get_db_connection()

    try:
        with connection.cursor() as cursor:
            cursor.execute(
                "SELECT id FROM users WHERE email = %s",
                (email,)
            )

            if cursor.fetchone():
                return False, "Email already registered"

            password_hash = hash_password(password)

            cursor.execute(
                """
                INSERT INTO users
                (full_name, email, password_hash, college_name)
                VALUES (%s, %s, %s, %s)
                """,
                (full_name, email, password_hash, college_name)
            )

            connection.commit()
            return True, "Registration successful"

    except Exception:
        connection.rollback()
        raise

    finally:
        close_db_connection(connection)