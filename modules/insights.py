from decimal import Decimal


def calculate_total_spending(expenses):
    return sum(Decimal(str(expense.get("amount", 0))) for expense in expenses)


def calculate_category_spending(expenses):
    category_totals = {}

    for expense in expenses:
        category = expense.get("category", "Other")
        amount = Decimal(str(expense.get("amount", 0)))

        if category not in category_totals:
            category_totals[category] = Decimal("0.00")

        category_totals[category] += amount

    return category_totals


def get_highest_spending_category(expenses):
    category_totals = calculate_category_spending(expenses)

    if not category_totals:
        return None

    return max(category_totals, key=category_totals.get)


def calculate_average_expense(expenses):
    if not expenses:
        return Decimal("0.00")

    total = calculate_total_spending(expenses)
    return (total / len(expenses)).quantize(Decimal("0.01"))


def generate_spending_summary(expenses):
    total = calculate_total_spending(expenses)
    category_totals = calculate_category_spending(expenses)
    highest_category = get_highest_spending_category(expenses)

    return {
        "total_spending": total,
        "category_spending": category_totals,
        "highest_spending_category": highest_category,
        "average_expense": calculate_average_expense(expenses)
    }


def generate_saving_suggestions(expenses, monthly_budget):
    monthly_budget = Decimal(str(monthly_budget))
    total_spending = calculate_total_spending(expenses)
    suggestions = []

    if total_spending > monthly_budget:
        suggestions.append("Your spending is above your monthly budget.")
    elif total_spending >= monthly_budget * Decimal("0.8"):
        suggestions.append("You are close to reaching your monthly budget.")
    else:
        suggestions.append("Your spending is currently within your monthly budget.")

    category_totals = calculate_category_spending(expenses)

    if category_totals:
        highest_category = max(category_totals, key=category_totals.get)
        suggestions.append(
            f"Consider reviewing your spending in the {highest_category} category."
        )

    return suggestions


def generate_financial_insights(expenses, monthly_budget):
    summary = generate_spending_summary(expenses)
    suggestions = generate_saving_suggestions(expenses, monthly_budget)

    return {
        "summary": summary,
        "suggestions": suggestions
    }