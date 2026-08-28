from werkzeug.security import generate_password_hash, check_password_hash

from modules.database import get_db_connection, close_db_connection


# =========================================================
# PASSWORD HELPERS
# =========================================================

def hash_password(password):
    return generate_password_hash(
        password,
        method="pbkdf2:sha256"
    )


def verify_password(password, password_hash):
    return check_password_hash(
        password_hash,
        password
    )


# =========================================================
# REGISTER USER
# =========================================================

def register_user(full_name, email, password, college_name):

    full_name = full_name.strip()
    email = email.strip().lower()
    college_name = college_name.strip()

    connection = get_db_connection()

    try:
        with connection.cursor() as cursor:

            # Check whether email already exists
            cursor.execute(
                "SELECT id FROM users WHERE email = %s",
                (email,)
            )

            if cursor.fetchone():
                return False, "Email already registered"

            # Hash password before storing
            password_hash = hash_password(password)

            cursor.execute(
                """
                INSERT INTO users
                (full_name, email, password_hash, college_name)
                VALUES (%s, %s, %s, %s)
                """,
                (
                    full_name,
                    email,
                    password_hash,
                    college_name
                )
            )

            connection.commit()

            return True, "Registration successful"

    except Exception:
        connection.rollback()
        raise

    finally:
        close_db_connection(connection)


# =========================================================
# LOGIN USER
# =========================================================

def login_user(email, password):

    email = email.strip().lower()

    connection = get_db_connection()

    try:
        with connection.cursor() as cursor:

            cursor.execute(
                """
                SELECT
                    id,
                    full_name,
                    email,
                    password_hash,
                    college_name
                FROM users
                WHERE email = %s
                """,
                (email,)
            )

            user = cursor.fetchone()

            # User does not exist
            if not user:
                return False, "Invalid email or password"

            # Password does not match
            if not verify_password(
                password,
                user["password_hash"]
            ):
                return False, "Invalid email or password"

            return True, user

    finally:
        close_db_connection(connection)