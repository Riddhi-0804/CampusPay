from decimal import Decimal


def calculate_total_spending(expenses):
    return sum(
        Decimal(str(expense["amount"]))
        for expense in expenses
    )


def calculate_category_spending(expenses):
    category_totals = {}

    for expense in expenses:
        category = expense["category"]
        amount = Decimal(str(expense["amount"]))

        category_totals[category] = (
            category_totals.get(category, Decimal("0.00")) + amount
        )

    return category_totals


def get_highest_spending_category(expenses):
    category_totals = calculate_category_spending(expenses)

    if not category_totals:
        return None

    return max(
        category_totals,
        key=category_totals.get
    )


def calculate_available_balance(total_income, total_spending):
    total_income = Decimal(str(total_income))
    total_spending = Decimal(str(total_spending))

    return total_income - total_spending


def can_afford_purchase(available_balance, purchase_amount):
    available_balance = Decimal(str(available_balance))
    purchase_amount = Decimal(str(purchase_amount))

    return available_balance >= purchase_amount


def calculate_savings_needed(
    target_amount,
    current_amount,
    monthly_saving
):
    target_amount = Decimal(str(target_amount))
    current_amount = Decimal(str(current_amount))
    monthly_saving = Decimal(str(monthly_saving))

    remaining_amount = max(
        target_amount - current_amount,
        Decimal("0.00")
    )

    if remaining_amount == Decimal("0.00"):
        return 0

    if monthly_saving <= Decimal("0.00"):
        return None

    months = remaining_amount / monthly_saving

    return int(months) if months == int(months) else int(months) + 1


def generate_financial_insight(expenses):
    if not expenses:
        return "You do not have enough expense data for a spending insight yet."

    total_spending = calculate_total_spending(expenses)
    highest_category = get_highest_spending_category(expenses)

    return (
        f"You have spent ₹{total_spending:.2f} so far. "
        f"Your highest spending category is {highest_category}."
    )


def generate_purchase_advice(available_balance, purchase_amount):
    available_balance = Decimal(str(available_balance))
    purchase_amount = Decimal(str(purchase_amount))

    if can_afford_purchase(available_balance, purchase_amount):
        remaining_balance = available_balance - purchase_amount

        return (
            f"Yes, this purchase fits within your available balance. "
            f"You would have ₹{remaining_balance:.2f} remaining."
        )

    shortage = purchase_amount - available_balance

    return (
        f"This purchase is higher than your available balance "
        f"by ₹{shortage:.2f}."
    )