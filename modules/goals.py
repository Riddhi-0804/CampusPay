from modules.database import get_db_connection, close_db_connection


def create_goal(
    user_id,
    goal_name,
    target_amount,
    current_amount,
    monthly_contribution,
    target_date
):
    connection = get_db_connection()

    try:
        with connection.cursor() as cursor:
            cursor.execute(
                """
                INSERT INTO savings_goals
                (
                    user_id,
                    goal_name,
                    target_amount,
                    current_amount,
                    monthly_contribution,
                    target_date
                )
                VALUES (%s, %s, %s, %s, %s, %s)
                """,
                (
                    user_id,
                    goal_name,
                    target_amount,
                    current_amount,
                    monthly_contribution,
                    target_date
                )
            )

            connection.commit()
            return cursor.lastrowid

    except Exception:
        connection.rollback()
        raise

    finally:
        close_db_connection(connection)


def get_goals(user_id):
    connection = get_db_connection()

    try:
        with connection.cursor() as cursor:
            cursor.execute(
                """
                SELECT
                    id,
                    user_id,
                    goal_name,
                    target_amount,
                    current_amount,
                    monthly_contribution,
                    target_date,
                    created_at
                FROM savings_goals
                WHERE user_id = %s
                ORDER BY target_date ASC, id DESC
                """,
                (user_id,)
            )

            return cursor.fetchall()

    finally:
        close_db_connection(connection)


def update_goal(
    goal_id,
    user_id,
    goal_name,
    target_amount,
    current_amount,
    monthly_contribution,
    target_date
):
    connection = get_db_connection()

    try:
        with connection.cursor() as cursor:
            cursor.execute(
                """
                UPDATE savings_goals
                SET
                    goal_name = %s,
                    target_amount = %s,
                    current_amount = %s,
                    monthly_contribution = %s,
                    target_date = %s
                WHERE id = %s AND user_id = %s
                """,
                (
                    goal_name,
                    target_amount,
                    current_amount,
                    monthly_contribution,
                    target_date,
                    goal_id,
                    user_id
                )
            )

            connection.commit()
            return cursor.rowcount > 0

    except Exception:
        connection.rollback()
        raise

    finally:
        close_db_connection(connection)


def calculate_goal_progress(target_amount, current_amount):
    target_amount = float(target_amount)
    current_amount = float(current_amount)

    if target_amount <= 0:
        return 0.0

    progress = (current_amount / target_amount) * 100

    return min(progress, 100.0)


def calculate_remaining_amount(target_amount, current_amount):
    target_amount = float(target_amount)
    current_amount = float(current_amount)

    return max(target_amount - current_amount, 0.0)


def estimate_completion_months(target_amount, current_amount, monthly_contribution):
    target_amount = float(target_amount)
    current_amount = float(current_amount)
    monthly_contribution = float(monthly_contribution)

    remaining_amount = calculate_remaining_amount(
        target_amount,
        current_amount
    )

    if remaining_amount == 0:
        return 0

    if monthly_contribution <= 0:
        return None

    months = remaining_amount / monthly_contribution

    return int(months) if months.is_integer() else int(months) + 1

def delete_goal(goal_id, user_id):
    connection = get_db_connection()

    try:
        with connection.cursor() as cursor:
            cursor.execute(
                """
                DELETE FROM savings_goals
                WHERE id = %s AND user_id = %s
                """,
                (goal_id, user_id)
            )

            connection.commit()
            return cursor.rowcount > 0

    except Exception:
        connection.rollback()
        raise

    finally:
        close_db_connection(connection)