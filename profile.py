from modules.database import get_db_connection, close_db_connection


def get_user_profile(user_id):
    connection = get_db_connection()

    try:
        with connection.cursor() as cursor:
            cursor.execute(
                """
                SELECT
                    id,
                    full_name,
                    email,
                    college_name,
                    monthly_budget,
                    created_at
                FROM users
                WHERE id = %s
                """,
                (user_id,)
            )

            return cursor.fetchone()

    finally:
        close_db_connection(connection)


def update_user_profile(
    user_id,
    full_name,
    email,
    college_name,
    monthly_budget
):
    connection = get_db_connection()

    try:
        with connection.cursor() as cursor:

            # Check whether another account already uses this email
            cursor.execute(
                """
                SELECT id
                FROM users
                WHERE email = %s
                AND id != %s
                """,
                (email, user_id)
            )

            existing_user = cursor.fetchone()

            if existing_user:
                return False, "Email is already registered to another account"

            cursor.execute(
                """
                UPDATE users
                SET
                    full_name = %s,
                    email = %s,
                    college_name = %s,
                    monthly_budget = %s
                WHERE id = %s
                """,
                (
                    full_name,
                    email,
                    college_name,
                    monthly_budget,
                    user_id
                )
            )

            connection.commit()

            return True, "Profile updated successfully"

    except Exception:
        connection.rollback()
        raise

    finally:
        close_db_connection(connection)