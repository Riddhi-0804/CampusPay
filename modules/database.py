import pymysql
from pymysql.cursors import DictCursor
from config import Config

def get_db_connection():
    connection = pymysql.connect(
        host=Config.DB_HOST,
        port=Config.DB_PORT,
        user=Config.DB_USER,
        password=Config.DB_PASSWORD,
        database=Config.DB_NAME,
        cursorclass=DictCursor,
        autocommit=False
    )
    return connection

def close_db_connection(connection):
    if connection and connection.open:
        connection.close()

def execute_query(query, params=None):
    connection = None

    try:
        connection = get_db_connection()

        with connection.cursor() as cursor:
            cursor.execute(query, params or ())
            result = cursor.fetchall()

        connection.commit()
        return result

    except Exception:
        if connection:
            connection.rollback()
        raise

    finally:
        close_db_connection(connection)

def execute_write(query, params=None):
    connection = None

    try:
        connection = get_db_connection()

        with connection.cursor() as cursor:
            cursor.execute(query, params or ())
            last_id = cursor.lastrowid

        connection.commit()
        return last_id

    except Exception:
        if connection:
            connection.rollback()
        raise

    finally:
        close_db_connection(connection)

def execute_update(query, params=None):
    connection = None

    try:
        connection = get_db_connection()

        with connection.cursor() as cursor:
            cursor.execute(query, params or ())
            affected_rows = cursor.rowcount

        connection.commit()
        return affected_rows

    except Exception:
        if connection:
            connection.rollback()
        raise

    finally:
        close_db_connection(connection)