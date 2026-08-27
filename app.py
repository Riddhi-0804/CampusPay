from flask import Flask, render_template, request
from config import Config
from modules.auth import register_user, login_user
from modules.expenses import add_expense, get_expenses, update_expense, delete_expense, calculate_expenses
from modules.goals import create_goal, get_goals, update_goal, delete_goal, calculate_goal_progress, calculate_remaining_amount, estimate_completion_months
from modules.groups import create_group, add_group_member, get_group, get_group_members, get_user_groups
from modules.group_expenses import add_group_expense, get_group_expenses, update_group_expense, delete_group_expense
from modules.split import calculate_equal_split, calculate_unequal_split, calculate_percentage_split, calculate_item_based_split
from modules.discounts import get_discounts, get_discounts_by_category, calculate_discount_percentage, get_recommended_discounts
from modules.insights import generate_financial_insights
from modules.ai_finance import generate_financial_insight, generate_purchase_advice
from modules.expenses import get_expenses




app = Flask(__name__)
app.config.from_object(Config)


@app.route("/")
def index():
    return render_template("index.html")


@app.route("/register", methods=["GET", "POST"])
def register():
    if request.method == "POST":
        full_name = request.form.get("full_name", "").strip()
        email = request.form.get("email", "").strip()
        password = request.form.get("password", "")
        college_name = request.form.get("college_name", "").strip()

        if not full_name or not email or not password or not college_name:
            return "All fields are required", 400

        success, message = register_user(
            full_name,
            email,
            password,
            college_name
        )

        if not success:
            return message, 400

        return message

    return render_template("register.html")


@app.route("/login", methods=["GET", "POST"])
def login():
    if request.method == "POST":
        email = request.form.get("email", "").strip()
        password = request.form.get("password", "")

        if not email or not password:
            return "Email and password are required", 400

        success, result = login_user(email, password)

        if not success:
            return result, 401

        return "Login successful"

    return render_template("login.html")

@app.route("/expenses", methods=["POST"])
def create_expense():
    data = request.get_json()

    required_fields = ["user_id", "amount", "category", "description", "expense_date"]

    if not data or any(field not in data for field in required_fields):
        return {"error": "All expense fields are required"}, 400

    expense_id = add_expense(
        data["user_id"],
        data["amount"],
        data["category"],
        data["description"],
        data["expense_date"]
    )

    return {
        "message": "Expense added successfully",
        "expense_id": expense_id
    }, 201


@app.route("/expenses/<int:user_id>", methods=["GET"])
def list_expenses(user_id):
    expenses = get_expenses(user_id)
    summary = calculate_expenses(expenses)

    return {
        "expenses": expenses,
        "summary": summary
    }, 200


@app.route("/expenses/<int:expense_id>", methods=["PUT"])
def edit_expense(expense_id):
    data = request.get_json()

    required_fields = ["user_id", "amount", "category", "description", "expense_date"]

    if not data or any(field not in data for field in required_fields):
        return {"error": "All expense fields are required"}, 400

    updated = update_expense(
        expense_id,
        data["user_id"],
        data["amount"],
        data["category"],
        data["description"],
        data["expense_date"]
    )

    if not updated:
        return {"error": "Expense not found"}, 404

    return {"message": "Expense updated successfully"}, 200


@app.route("/expenses/<int:expense_id>", methods=["DELETE"])
def remove_expense(expense_id):
    data = request.get_json()

    if not data or "user_id" not in data:
        return {"error": "user_id is required"}, 400

    deleted = delete_expense(
        expense_id,
        data["user_id"]
    )

    if not deleted:
        return {"error": "Expense not found"}, 404

    return {"message": "Expense deleted successfully"}, 200

@app.route("/goals", methods=["POST"])
def create_savings_goal():
    data = request.get_json()

    required_fields = [
        "user_id",
        "goal_name",
        "target_amount",
        "current_amount",
        "monthly_contribution",
        "target_date"
    ]

    if not data or any(field not in data for field in required_fields):
        return {"error": "All goal fields are required"}, 400

    goal_id = create_goal(
        data["user_id"],
        data["goal_name"],
        data["target_amount"],
        data["current_amount"],
        data["monthly_contribution"],
        data["target_date"]
    )

    return {
        "message": "Savings goal created successfully",
        "goal_id": goal_id
    }, 201


@app.route("/goals/<int:user_id>", methods=["GET"])
def list_goals(user_id):
    goals = get_goals(user_id)

    result = []

    for goal in goals:
        goal["progress_percentage"] = calculate_goal_progress(
            goal["target_amount"],
            goal["current_amount"]
        )

        goal["remaining_amount"] = calculate_remaining_amount(
            goal["target_amount"],
            goal["current_amount"]
        )

        goal["estimated_completion_months"] = estimate_completion_months(
            goal["target_amount"],
            goal["current_amount"],
            goal["monthly_contribution"]
        )

        result.append(goal)

    return {"goals": result}, 200


@app.route("/goals/<int:goal_id>", methods=["PUT"])
def edit_savings_goal(goal_id):
    data = request.get_json()

    required_fields = [
        "user_id",
        "goal_name",
        "target_amount",
        "current_amount",
        "monthly_contribution",
        "target_date"
    ]

    if not data or any(field not in data for field in required_fields):
        return {"error": "All goal fields are required"}, 400

    updated = update_goal(
        goal_id,
        data["user_id"],
        data["goal_name"],
        data["target_amount"],
        data["current_amount"],
        data["monthly_contribution"],
        data["target_date"]
    )

    if not updated:
        return {"error": "Savings goal not found"}, 404

    return {"message": "Savings goal updated successfully"}, 200


@app.route("/goals/<int:goal_id>", methods=["DELETE"])
def remove_savings_goal(goal_id):
    data = request.get_json()

    if not data or "user_id" not in data:
        return {"error": "user_id is required"}, 400

    deleted = delete_goal(
        goal_id,
        data["user_id"]
    )

    if not deleted:
        return {"error": "Savings goal not found"}, 404

    return {"message": "Savings goal deleted successfully"}, 200

@app.route("/groups", methods=["POST"])
def create_new_group():
    data = request.get_json()

    if not data or not data.get("name") or not data.get("created_by"):
        return {"error": "name and created_by are required"}, 400

    group_id = create_group(
        data["name"].strip(),
        data["created_by"]
    )

    return {
        "message": "Group created successfully",
        "group_id": group_id
    }, 201


@app.route("/groups/<int:user_id>", methods=["GET"])
def list_user_groups(user_id):
    groups = get_user_groups(user_id)

    return {
        "groups": groups
    }, 200


@app.route("/groups/<int:group_id>/members", methods=["POST"])
def add_member_to_group(group_id):
    data = request.get_json()

    if not data or not data.get("user_id"):
        return {"error": "user_id is required"}, 400

    added = add_group_member(
        group_id,
        data["user_id"]
    )

    if not added:
        return {"error": "User is already a group member"}, 409

    return {
        "message": "Group member added successfully"
    }, 201


@app.route("/groups/<int:group_id>", methods=["GET"])
def view_group(group_id):
    data = request.args

    if not data.get("user_id"):
        return {"error": "user_id is required"}, 400

    group = get_group(
        group_id,
        int(data["user_id"])
    )

    if not group:
        return {"error": "Group not found"}, 404

    return {
        "group": group
    }, 200


@app.route("/groups/<int:group_id>/members", methods=["GET"])
def list_group_members(group_id):
    members = get_group_members(group_id)

    return {
        "members": members
    }, 200

@app.route("/group-expenses", methods=["POST"])
def create_group_expense():
    data = request.get_json()

    required_fields = [
        "group_id",
        "paid_by",
        "description",
        "amount",
        "expense_date"
    ]

    if not data or any(field not in data for field in required_fields):
        return {"error": "All group expense fields are required"}, 400

    expense_id = add_group_expense(
        data["group_id"],
        data["paid_by"],
        data["description"],
        data["amount"],
        data["expense_date"]
    )

    return {
        "message": "Group expense added successfully",
        "expense_id": expense_id
    }, 201


@app.route("/group-expenses/<int:group_id>", methods=["GET"])
def list_group_expenses(group_id):
    expenses = get_group_expenses(group_id)

    return {
        "expenses": expenses
    }, 200


@app.route("/group-expenses/<int:expense_id>", methods=["PUT"])
def edit_group_expense(expense_id):
    data = request.get_json()

    required_fields = [
        "group_id",
        "paid_by",
        "description",
        "amount",
        "expense_date"
    ]

    if not data or any(field not in data for field in required_fields):
        return {"error": "All group expense fields are required"}, 400

    updated = update_group_expense(
        expense_id,
        data["group_id"],
        data["paid_by"],
        data["description"],
        data["amount"],
        data["expense_date"]
    )

    if not updated:
        return {"error": "Group expense not found"}, 404

    return {
        "message": "Group expense updated successfully"
    }, 200


@app.route("/group-expenses/<int:expense_id>", methods=["DELETE"])
def remove_group_expense(expense_id):
    data = request.get_json()

    if not data or "group_id" not in data:
        return {"error": "group_id is required"}, 400

    deleted = delete_group_expense(
        expense_id,
        data["group_id"]
    )

    if not deleted:
        return {"error": "Group expense not found"}, 404

    return {
        "message": "Group expense deleted successfully"
    }, 200


@app.route("/split/equal", methods=["POST"])
def equal_split():
    data = request.get_json()

    if not data or "total_amount" not in data or "member_count" not in data:
        return {"error": "total_amount and member_count are required"}, 400

    try:
        shares = calculate_equal_split(
            data["total_amount"],
            int(data["member_count"])
        )

        return {
            "shares": [str(share) for share in shares]
        }, 200

    except ValueError as error:
        return {"error": str(error)}, 400


@app.route("/split/unequal", methods=["POST"])
def unequal_split():
    data = request.get_json()

    if not data or "amounts" not in data:
        return {"error": "amounts are required"}, 400

    try:
        shares = calculate_unequal_split(data["amounts"])

        return {
            "shares": [str(share) for share in shares]
        }, 200

    except ValueError as error:
        return {"error": str(error)}, 400


@app.route("/split/percentage", methods=["POST"])
def percentage_split():
    data = request.get_json()

    if not data or "total_amount" not in data or "percentages" not in data:
        return {
            "error": "total_amount and percentages are required"
        }, 400

    try:
        shares = calculate_percentage_split(
            data["total_amount"],
            data["percentages"]
        )

        return {
            "shares": [str(share) for share in shares]
        }, 200

    except ValueError as error:
        return {"error": str(error)}, 400


@app.route("/split/items", methods=["POST"])
def item_split():
    data = request.get_json()

    if not data or "items" not in data:
        return {"error": "items are required"}, 400

    try:
        shares = calculate_item_based_split(data["items"])

        return {
            "shares": {
                str(member_id): str(amount)
                for member_id, amount in shares.items()
            }
        }, 200

    except ValueError as error:
        return {"error": str(error)}, 400

@app.route("/discounts", methods=["GET"])
def discounts():
    discounts = get_discounts()

    return {
        "discounts": discounts
    }, 200


@app.route("/discounts/category/<category>", methods=["GET"])
def discounts_by_category(category):
    discounts = get_discounts_by_category(category)

    return {
        "discounts": discounts
    }, 200


@app.route("/discounts/calculate", methods=["POST"])
def calculate_discount():
    data = request.get_json()

    if not data or "original_price" not in data or "student_price" not in data:
        return {
            "error": "original_price and student_price are required"
        }, 400

    try:
        percentage = calculate_discount_percentage(
            data["original_price"],
            data["student_price"]
        )

        return {
            "discount_percentage": percentage
        }, 200

    except (ValueError, TypeError):
        return {
            "error": "Prices must be valid numbers"
        }, 400

@app.route("/insights/<int:user_id>", methods=["GET"])
def financial_insights(user_id):
    expenses = get_expenses(user_id)

    monthly_budget = request.args.get("monthly_budget")

    if monthly_budget is None:
        return {"error": "monthly_budget is required"}, 400

    try:
        insights = generate_financial_insights(
            expenses,
            monthly_budget
        )

        insights["summary"]["total_spending"] = str(
            insights["summary"]["total_spending"]
        )

        insights["summary"]["average_expense"] = str(
            insights["summary"]["average_expense"]
        )

        insights["summary"]["category_spending"] = {
            category: str(amount)
            for category, amount
            in insights["summary"]["category_spending"].items()
        }

        return insights, 200

    except (ValueError, TypeError):
        return {"error": "monthly_budget must be a valid number"}, 400


@app.route("/ai-finance/<int:user_id>", methods=["GET"])
def ai_finance(user_id):
    expenses = get_expenses(user_id)

    insight = generate_financial_insight(expenses)

    return {
        "insight": insight
    }, 200

@app.route("/ai-finance/purchase-advice", methods=["POST"])
def purchase_advice():
    data = request.get_json()

    if not data or "available_balance" not in data or "purchase_amount" not in data:
        return {
            "error": "available_balance and purchase_amount are required"
        }, 400

    try:
        advice = generate_purchase_advice(
            data["available_balance"],
            data["purchase_amount"]
        )

        return {
            "advice": advice
        }, 200

    except (ValueError, TypeError):
        return {
            "error": "Amounts must be valid numbers"
        }, 400



if __name__ == "__main__":
    app.run(debug=True)