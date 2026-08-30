from modules.database import get_db_connection, close_db_connection

def create_group(name, created_by):
    connection = get_db_connection()

    try:
        with connection.cursor() as cursor:
            cursor.execute(
                """
                INSERT INTO `groups`
                (name, created_by)
                VALUES (%s, %s)
                """,
                (name, created_by)
            )

            group_id = cursor.lastrowid

            cursor.execute(
                """
                INSERT INTO group_members
                (group_id, user_id)
                VALUES (%s, %s)
                """,
                (group_id, created_by)
            )

            connection.commit()
            return group_id

    except Exception:
        connection.rollback()
        raise

    finally:
        close_db_connection(connection)


def add_group_member(group_id, user_id):
    connection = get_db_connection()

    try:
        with connection.cursor() as cursor:
            cursor.execute(
                """
                SELECT id
                FROM group_members
                WHERE group_id = %s
                AND user_id = %s
                """,
                (group_id, user_id)
            )

            if cursor.fetchone():
                return False

            cursor.execute(
                """
                INSERT INTO group_members
                (group_id, user_id)
                VALUES (%s, %s)
                """,
                (group_id, user_id)
            )

            connection.commit()
            return True

    except Exception:
        connection.rollback()
        raise

    finally:
        close_db_connection(connection)


def get_group(group_id, user_id):
    connection = get_db_connection()

    try:
        with connection.cursor() as cursor:
            cursor.execute(
                """
                SELECT
                    g.id,
                    g.name,
                    g.created_by,
                    g.created_at
                FROM `groups` g
                INNER JOIN group_members gm
                    ON g.id = gm.group_id
                WHERE g.id = %s
                AND gm.user_id = %s
                """,
                (group_id, user_id)
            )

            return cursor.fetchone()

    finally:
        close_db_connection(connection)


def get_group_members(group_id):
    connection = get_db_connection()

    try:
        with connection.cursor() as cursor:
            cursor.execute(
                """
                SELECT
                    u.id,
                    u.full_name,
                    u.email
                FROM users u
                INNER JOIN group_members gm
                    ON u.id = gm.user_id
                WHERE gm.group_id = %s
                ORDER BY u.full_name ASC
                """,
                (group_id,)
            )

            return cursor.fetchall()

    finally:
        close_db_connection(connection)


def get_user_groups(user_id):
    connection = get_db_connection()

    try:
        with connection.cursor() as cursor:
            cursor.execute(
                """
                SELECT
                    g.id,
                    g.name,
                    g.created_by,
                    g.created_at
                FROM `groups` g
                INNER JOIN group_members gm
                    ON g.id = gm.group_id
                WHERE gm.user_id = %s
                ORDER BY g.created_at DESC
                """,
                (user_id,)
            )

            return cursor.fetchall()

    finally:
        close_db_connection(connection)

