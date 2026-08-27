from modules.database import get_db_connection, close_db_connection


def add_group_expense(group_id, paid_by, description, amount, expense_date):
    connection = get_db_connection()

    try:
        with connection.cursor() as cursor:
            cursor.execute(
                """
                INSERT INTO group_expenses
                (group_id, paid_by, description, amount, expense_date)
                VALUES (%s, %s, %s, %s, %s)
                """,
                (group_id, paid_by, description, amount, expense_date)
            )

            connection.commit()
            return cursor.lastrowid

    except Exception:
        connection.rollback()
        raise

    finally:
        close_db_connection(connection)


def get_group_expenses(group_id):
    connection = get_db_connection()

    try:
        with connection.cursor() as cursor:
            cursor.execute(
                """
                SELECT
                    id,
                    group_id,
                    paid_by,
                    description,
                    amount,
                    expense_date,
                    created_at
                FROM group_expenses
                WHERE group_id = %s
                ORDER BY expense_date DESC, id DESC
                """,
                (group_id,)
            )

            return cursor.fetchall()

    finally:
        close_db_connection(connection)


def update_group_expense(
    expense_id,
    group_id,
    paid_by,
    description,
    amount,
    expense_date
):
    connection = get_db_connection()

    try:
        with connection.cursor() as cursor:
            cursor.execute(
                """
                UPDATE group_expenses
                SET
                    paid_by = %s,
                    description = %s,
                    amount = %s,
                    expense_date = %s
                WHERE id = %s AND group_id = %s
                """,
                (
                    paid_by,
                    description,
                    amount,
                    expense_date,
                    expense_id,
                    group_id
                )
            )

            connection.commit()
            return cursor.rowcount > 0

    except Exception:
        connection.rollback()
        raise

    finally:
        close_db_connection(connection)


def delete_group_expense(expense_id, group_id):
    connection = get_db_connection()

    try:
        with connection.cursor() as cursor:
            cursor.execute(
                """
                DELETE FROM group_expenses
                WHERE id = %s AND group_id = %s
                """,
                (expense_id, group_id)
            )

            connection.commit()
            return cursor.rowcount > 0

    except Exception:
        connection.rollback()
        raise

    finally:
        close_db_connection(connection)