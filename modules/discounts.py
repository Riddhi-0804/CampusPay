from modules.database import get_db_connection, close_db_connection


def get_discounts():
    connection = get_db_connection()

    try:
        with connection.cursor() as cursor:
            cursor.execute(
                """
                SELECT
                    id,
                    brand_name,
                    category,
                    original_price,
                    student_price,
                    discount_percentage,
                    description,
                    valid_until,
                    created_at
                FROM student_discounts
                ORDER BY discount_percentage DESC, id DESC
                """
            )

            return cursor.fetchall()

    finally:
        close_db_connection(connection)


def get_discounts_by_category(category):
    connection = get_db_connection()

    try:
        with connection.cursor() as cursor:
            cursor.execute(
                """
                SELECT
                    id,
                    brand_name,
                    category,
                    original_price,
                    student_price,
                    discount_percentage,
                    description,
                    valid_until,
                    created_at
                FROM student_discounts
                WHERE category = %s
                ORDER BY discount_percentage DESC, id DESC
                """,
                (category,)
            )

            return cursor.fetchall()

    finally:
        close_db_connection(connection)


def calculate_discount_percentage(original_price, student_price):
    original_price = float(original_price)
    student_price = float(student_price)

    if original_price <= 0:
        return 0.0

    discount_percentage = (
        (original_price - student_price) / original_price
    ) * 100

    return round(max(discount_percentage, 0.0), 2)


def get_recommended_discounts(discounts, spending_categories):
    if not discounts:
        return []

    if not spending_categories:
        return discounts

    normalized_categories = {
        str(category).strip().lower()
        for category in spending_categories
    }

    recommended = []
    others = []

    for discount in discounts:
        category = str(discount["category"]).strip().lower()

        if category in normalized_categories:
            recommended.append(discount)
        else:
            others.append(discount)

    return recommended + others