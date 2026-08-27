from config import Config
import pymysql

connection = pymysql.connect(
    host=Config.DB_HOST,
    port=Config.DB_PORT,
    user=Config.DB_USER,
    password=Config.DB_PASSWORD,
    database=Config.DB_NAME
)

print("MySQL connection successful!")

connection.close()