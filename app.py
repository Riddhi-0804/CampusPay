from flask import Flask, render_template, request
from config import Config
from modules.auth import register_user

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

if __name__ == "__main__":
    app.run(debug=True)