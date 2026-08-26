from modules.database import get_db_connection, close_db_connection

def add_expense(user_id, amount, category, description, expense_date):
    connection = get_db_connection()

    try:
        with connection.cursor() as cursor:
            cursor.execute(
                """
                INSERT INTO expenses
                (user_id, amount, category, description, expense_date)
                VALUES (%s, %s, %s, %s, %s)
                """,
                (user_id, amount, category, description, expense_date)
            )

            connection.commit()
            return cursor.lastrowid

    except Exception:
        connection.rollback()
        raise

    finally:
        close_db_connection(connection)


def get_expenses(user_id):
    connection = get_db_connection()

    try:
        with connection.cursor() as cursor:
            cursor.execute(
                """
                SELECT
                    id,
                    user_id,
                    amount,
                    category,
                    description,
                    expense_date,
                    created_at
                FROM expenses
                WHERE user_id = %s
                ORDER BY expense_date DESC, id DESC
                """,
                (user_id,)
            )

            return cursor.fetchall()

    finally:
        close_db_connection(connection)


def update_expense(expense_id, user_id, amount, category, description, expense_date):
    connection = get_db_connection()

    try:
        with connection.cursor() as cursor:
            cursor.execute(
                """
                UPDATE expenses
                SET
                    amount = %s,
                    category = %s,
                    description = %s,
                    expense_date = %s
                WHERE id = %s AND user_id = %s
                """,
                (
                    amount,
                    category,
                    description,
                    expense_date,
                    expense_id,
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


def delete_expense(expense_id, user_id):
    connection = get_db_connection()

    try:
        with connection.cursor() as cursor:
            cursor.execute(
                """
                DELETE FROM expenses
                WHERE id = %s AND user_id = %s
                """,
                (expense_id, user_id)
            )

            connection.commit()
            return cursor.rowcount > 0

    except Exception:
        connection.rollback()
        raise

    finally:
        close_db_connection(connection)


def calculate_expenses(expenses):
    total_amount = sum(float(expense["amount"]) for expense in expenses)

    category_totals = {}

    for expense in expenses:
        category = expense["category"]
        amount = float(expense["amount"])
        category_totals[category] = category_totals.get(category, 0) + amount

    return {
        "total_amount": total_amount,
        "category_totals": category_totals
    }