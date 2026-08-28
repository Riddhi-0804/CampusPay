/* =========================================================
   CAMPUSPAY AUTH
   ========================================================= */


/* =========================================================
   PASSWORD VISIBILITY
   ========================================================= */

const passwordToggles = document.querySelectorAll(".password-toggle");

passwordToggles.forEach(toggle => {

    toggle.addEventListener("click", () => {

        const targetId = toggle.dataset.target;
        const input = document.getElementById(targetId);
        const icon = toggle.querySelector("i");

        if (input.type === "password") {

            input.type = "text";

            icon.classList.remove("fa-eye");
            icon.classList.add("fa-eye-slash");

            toggle.setAttribute(
                "aria-label",
                "Hide password"
            );

        } else {

            input.type = "password";

            icon.classList.remove("fa-eye-slash");
            icon.classList.add("fa-eye");

            toggle.setAttribute(
                "aria-label",
                "Show password"
            );
        }
    });
});


/* =========================================================
   REGISTER
   ========================================================= */

const registerForm = document.getElementById("registerForm");

if (registerForm) {

    registerForm.addEventListener("submit", async (event) => {

        event.preventDefault();

        console.log("Register form submitted!");

        const button = registerForm.querySelector(".auth-submit");

        const originalText = button.innerHTML;

        button.innerHTML = `
            Creating account
            <i class="fa-solid fa-spinner fa-spin"></i>
        `;

        button.disabled = true;


        const formData = new FormData(registerForm);

        const data = {

            full_name: formData.get("full_name"),
            email: formData.get("email"),
            password: formData.get("password"),
            college_name: formData.get("college_name")

        };


        console.log("Sending registration data:", {
            full_name: data.full_name,
            email: data.email,
            college_name: data.college_name
        });


        try {

            const response = await fetch("/register", {

                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify(data)

            });


            const result = await response.json();


            console.log("Server response:", result);


            if (!response.ok) {

                alert(
                    result.message ||
                    "Registration failed."
                );

                button.innerHTML = originalText;
                button.disabled = false;

                return;
            }


            /* Registration successful */

            alert("Account created successfully!");

            window.location.href = "/login";

        }


        catch (error) {

            console.error(
                "Registration error:",
                error
            );

            alert(
                "Unable to connect to CampusPay. Please try again."
            );

            button.innerHTML = originalText;
            button.disabled = false;

        }

    });
}


/* =========================================================
   LOGIN
   ========================================================= */

const loginForm = document.getElementById("loginForm");

if (loginForm) {

    loginForm.addEventListener("submit", async (event) => {

        event.preventDefault();

        const button = loginForm.querySelector(".auth-submit");

        const originalText = button.innerHTML;

        button.innerHTML = `
            Logging in
            <i class="fa-solid fa-spinner fa-spin"></i>
        `;

        button.disabled = true;


        const formData = new FormData(loginForm);

        const data = {

            email: formData.get("email"),
            password: formData.get("password")

        };


        try {

            const response = await fetch("/login", {

                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify(data)

            });


            const result = await response.json();


            if (!response.ok) {

                alert(
                    result.message ||
                    "Login failed."
                );

                button.innerHTML = originalText;
                button.disabled = false;

                return;
            }


            /* Successful login */

            window.location.href = result.redirect;

        }


        catch (error) {

            console.error(
                "Login error:",
                error
            );

            alert(
                "Unable to connect to CampusPay. Please try again."
            );

            button.innerHTML = originalText;
            button.disabled = false;

        }

    });
}