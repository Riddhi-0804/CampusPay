from flask import Flask, render_template, request, jsonify, session, redirect, url_for

from config import Config

from modules.auth import register_user, login_user

from modules.expenses import (
    add_expense,
    get_expenses,
    update_expense,
    delete_expense,
    calculate_expenses
)

from modules.goals import (
    create_goal,
    get_goals,
    update_goal,
    delete_goal,
    calculate_goal_progress,
    calculate_remaining_amount,
    estimate_completion_months
)

from modules.groups import (
    create_group,
    add_group_member,
    get_group,
    get_group_members,
    get_user_groups
)

from modules.group_expenses import (
    add_group_expense,
    get_group_expenses,
    update_group_expense,
    delete_group_expense
)

from modules.split import (
    calculate_equal_split,
    calculate_unequal_split,
    calculate_percentage_split,
    calculate_item_based_split
)

from modules.discounts import (
    get_discounts,
    get_discounts_by_category,
    calculate_discount_percentage,
    get_recommended_discounts
)

from modules.insights import generate_financial_insights

from modules.ai_finance import (
    generate_financial_insight,
    generate_purchase_advice
)


app = Flask(__name__)
app.config.from_object(Config)

# Needed for Flask sessions
app.secret_key = Config.SECRET_KEY


# =========================================================
# LANDING PAGE
# =========================================================

@app.route("/")
def index():
    return render_template("landing.html")


# =========================================================
# REGISTER
# =========================================================

@app.route("/register", methods=["GET", "POST"])
def register():

    if request.method == "POST":

        # Accept JSON or normal form submission
        data = request.get_json(silent=True)

        if data:
            full_name = data.get("full_name", data.get("name", "")).strip()
            email = data.get("email", "").strip()
            password = data.get("password", "")
            college_name = data.get("college_name", "").strip()

        else:
            full_name = request.form.get(
                "full_name",
                request.form.get("name", "")
            ).strip()

            email = request.form.get("email", "").strip()
            password = request.form.get("password", "")
            college_name = request.form.get("college_name", "").strip()

        # Validate required fields
        if not full_name or not email or not password:
            return jsonify({
                "success": False,
                "message": "Name, email and password are required."
            }), 400

        try:

            success, message = register_user(
                full_name,
                email,
                password,
                college_name
            )

            if not success:
                return jsonify({
                    "success": False,
                    "message": message
                }), 400

            return jsonify({
                "success": True,
                "message": message
            }), 201

        except Exception as error:

            print("REGISTER ERROR:", error)

            return jsonify({
                "success": False,
                "message": "Something went wrong while creating your account."
            }), 500

    return render_template("register.html")


# =========================================================
# LOGIN
# =========================================================

@app.route("/login", methods=["GET", "POST"])
def login():

    if request.method == "POST":

        data = request.get_json(silent=True)

        if data:
            email = data.get("email", "").strip()
            password = data.get("password", "")

        else:
            email = request.form.get("email", "").strip()
            password = request.form.get("password", "")

        # Validate fields
        if not email or not password:
            return jsonify({
                "success": False,
                "message": "Email and password are required."
            }), 400

        try:

            success, result = login_user(
                email,
                password
            )

            if not success:
                return jsonify({
                    "success": False,
                    "message": result
                }), 401

            # Store logged-in user information
            session["user_id"] = result["id"]
            session["user_name"] = result["full_name"]
            session["user_email"] = result["email"]

            return jsonify({
                "success": True,
                "message": "Login successful",
                "redirect": url_for("dashboard")
            }), 200

        except Exception as error:

            print("LOGIN ERROR:", error)

            return jsonify({
                "success": False,
                "message": "Something went wrong while logging in."
            }), 500

    return render_template("login.html")


# =========================================================
# DASHBOARD
# =========================================================

@app.route("/dashboard")
def dashboard():

    # User must be logged in
    if "user_id" not in session:
        return redirect(url_for("login"))

    return render_template(
        "/dashboard",
        user_name=session.get("user_name"),
        user_email=session.get("user_email")
    )


@app.route("/expenses", methods=["GET"])
def expenses_page():
    if "user_id" not in session:
        return redirect(url_for("login"))
    return render_template("expenses.html")


@app.route("/goals", methods=["GET"])
def goals_page():
    if "user_id" not in session:
        return redirect(url_for("login"))
    return render_template("goals.html")


@app.route("/smartsplit")
def smartsplit_page():
    if "user_id" not in session:
        return redirect(url_for("login"))
    return render_template("smartsplit.html")


@app.route("/ai-finance")
def ai_finance_page():
    if "user_id" not in session:
        return redirect(url_for("login"))
    return render_template("ai_finance.html")


@app.route("/discounts")
def discounts_page():
    if "user_id" not in session:
        return redirect(url_for("login"))
    return render_template("discounts.html")


@app.route("/analytics")
def analytics_page():
    if "user_id" not in session:
        return redirect(url_for("login"))
    return render_template("analytics.html")


# =========================================================
# LOGOUT
# =========================================================

@app.route("/logout")
def logout():

    session.clear()

    return redirect(url_for("index"))


# =========================================================
# CURRENT USER
# =========================================================

@app.route("/api/current-user")
def current_user():

    if "user_id" not in session:
        return jsonify({
            "logged_in": False
        }), 401

    return jsonify({
        "logged_in": True,
        "user": {
            "id": session["user_id"],
            "full_name": session.get("user_name"),
            "email": session.get("user_email")
        }
    })


# =========================================================
# TEMPORARY / HEALTH CHECK
# =========================================================

@app.route("/api/health")
def health_check():

    return jsonify({
        "status": "ok",
        "message": "CampusPay backend is running."
    })


# =========================================================
# EXPENSES
# =========================================================

@app.route("/api/expenses", methods=["POST"])
def create_expense():

    if "user_id" not in session:
        return {"error": "Authentication required"}, 401

    data = request.get_json()

    required_fields = [
        "amount",
        "category",
        "description",
        "expense_date"
    ]

    if not data or any(field not in data for field in required_fields):
        return {"error": "All expense fields are required"}, 400

    expense_id = add_expense(
        session["user_id"],
        data["amount"],
        data["category"],
        data["description"],
        data["expense_date"]
    )

    return {
        "message": "Expense added successfully",
        "expense_id": expense_id
    }, 201


@app.route("/api/expenses", methods=["GET"])
def list_expenses():

    if "user_id" not in session:
        return {"error": "Authentication required"}, 401

    user_id = session["user_id"]

    expenses = get_expenses(user_id)
    summary = calculate_expenses(expenses)

    return {
        "expenses": expenses,
        "summary": summary
    }, 200


@app.route("/api/expenses/<int:expense_id>", methods=["PUT"])
def edit_expense(expense_id):

    if "user_id" not in session:
        return {"error": "Authentication required"}, 401

    data = request.get_json()

    required_fields = [
        "amount",
        "category",
        "description",
        "expense_date"
    ]

    if not data or any(field not in data for field in required_fields):
        return {"error": "All expense fields are required"}, 400

    updated = update_expense(
        expense_id,
        session["user_id"],
        data["amount"],
        data["category"],
        data["description"],
        data["expense_date"]
    )

    if not updated:
        return {"error": "Expense not found"}, 404

    return {
        "message": "Expense updated successfully"
    }, 200


@app.route("/api/expenses/<int:expense_id>", methods=["DELETE"])
def remove_expense(expense_id):

    if "user_id" not in session:
        return {"error": "Authentication required"}, 401

    deleted = delete_expense(
        expense_id,
        session["user_id"]
    )

    if not deleted:
        return {"error": "Expense not found"}, 404

    return {
        "message": "Expense deleted successfully"
    }, 200



# =========================================================
# GOALS
# =========================================================

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

    return {
        "goals": result
    }, 200


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

    return {
        "message": "Savings goal updated successfully"
    }, 200


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

    return {
        "message": "Savings goal deleted successfully"
    }, 200


# =========================================================
# GROUPS
# =========================================================

@app.route("/groups", methods=["POST"])
def create_new_group():

    data = request.get_json()

    if not data or not data.get("name") or not data.get("created_by"):
        return {
            "error": "name and created_by are required"
        }, 400

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
        return {
            "error": "user_id is required"
        }, 400

    added = add_group_member(
        group_id,
        data["user_id"]
    )

    if not added:
        return {
            "error": "User is already a group member"
        }, 409

    return {
        "message": "Group member added successfully"
    }, 201


@app.route("/groups/<int:group_id>", methods=["GET"])
def view_group(group_id):

    data = request.args

    if not data.get("user_id"):
        return {
            "error": "user_id is required"
        }, 400

    group = get_group(
        group_id,
        int(data["user_id"])
    )

    if not group:
        return {
            "error": "Group not found"
        }, 404

    return {
        "group": group
    }, 200


@app.route("/groups/<int:group_id>/members", methods=["GET"])
def list_group_members(group_id):

    members = get_group_members(group_id)

    return {
        "members": members
    }, 200


# =========================================================
# GROUP EXPENSES
# =========================================================

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
        return {
            "error": "All group expense fields are required"
        }, 400

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
        return {
            "error": "All group expense fields are required"
        }, 400

    updated = update_group_expense(
        expense_id,
        data["group_id"],
        data["paid_by"],
        data["description"],
        data["amount"],
        data["expense_date"]
    )

    if not updated:
        return {
            "error": "Group expense not found"
        }, 404

    return {
        "message": "Group expense updated successfully"
    }, 200


@app.route("/group-expenses/<int:expense_id>", methods=["DELETE"])
def remove_group_expense(expense_id):

    data = request.get_json()

    if not data or "group_id" not in data:
        return {
            "error": "group_id is required"
        }, 400

    deleted = delete_group_expense(
        expense_id,
        data["group_id"]
    )

    if not deleted:
        return {
            "error": "Group expense not found"
        }, 404

    return {
        "message": "Group expense deleted successfully"
    }, 200


# =========================================================
# SPLITS
# =========================================================

@app.route("/split/equal", methods=["POST"])
def equal_split():

    data = request.get_json()

    if not data or "total_amount" not in data or "member_count" not in data:
        return {
            "error": "total_amount and member_count are required"
        }, 400

    try:

        shares = calculate_equal_split(
            data["total_amount"],
            int(data["member_count"])
        )

        return {
            "shares": [str(share) for share in shares]
        }, 200

    except ValueError as error:

        return {
            "error": str(error)
        }, 400


@app.route("/split/unequal", methods=["POST"])
def unequal_split():

    data = request.get_json()

    if not data or "amounts" not in data:
        return {
            "error": "amounts are required"
        }, 400

    try:

        shares = calculate_unequal_split(data["amounts"])

        return {
            "shares": [str(share) for share in shares]
        }, 200

    except ValueError as error:

        return {
            "error": str(error)
        }, 400


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

        return {
            "error": str(error)
        }, 400


@app.route("/split/items", methods=["POST"])
def item_split():

    data = request.get_json()

    if not data or "items" not in data:
        return {
            "error": "items are required"
        }, 400

    try:

        shares = calculate_item_based_split(data["items"])

        return {
            "shares": {
                str(member_id): str(amount)
                for member_id, amount in shares.items()
            }
        }, 200

    except ValueError as error:

        return {
            "error": str(error)
        }, 400


# =========================================================
# DISCOUNTS
# =========================================================

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


# =========================================================
# FINANCIAL INSIGHTS
# =========================================================

@app.route("/insights/<int:user_id>", methods=["GET"])
def financial_insights(user_id):

    expenses = get_expenses(user_id)

    monthly_budget = request.args.get("monthly_budget")

    if monthly_budget is None:
        return {
            "error": "monthly_budget is required"
        }, 400

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

        return {
            "error": "monthly_budget must be a valid number"
        }, 400


# =========================================================
# AI FINANCE
# =========================================================

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

# =========================================================
# AI FINANCE CHAT
# =========================================================

@app.route("/ai-finance/chat", methods=["POST"])
def ai_finance_chat():

    # User must be logged in
    if "user_id" not in session:
        return jsonify({
            "error": "Please log in first."
        }), 401

    data = request.get_json()

    if not data or not data.get("message"):
        return jsonify({
            "error": "Message is required."
        }), 400

    user_message = data["message"].strip()

    # Get the current user's expenses
    expenses = get_expenses(session["user_id"])

    # For now, use our existing financial logic
    insight = generate_financial_insight(expenses)

    return jsonify({
        "message": user_message,
        "response": insight
    }), 200
# =========================================================
# RUN APP
# =========================================================

if __name__ == "__main__":
    app.run(debug=True)