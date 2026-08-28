// =========================================================
// CAMPUSPAY — AI FINANCE
// Stage 1: Frontend chatbot prototype
// =========================================================


const chatMessages = document.getElementById("chatMessages");
const chatInput = document.getElementById("chatInput");
const sendBtn = document.getElementById("sendBtn");
const typingIndicator = document.getElementById("typingIndicator");
const clearChatBtn = document.getElementById("clearChatBtn");
const suggestions = document.getElementById("suggestions");


// =========================================================
// TEMPORARY AI RESPONSES
// Stage 2 will replace this with a real AI API.
// =========================================================

function getAIResponse(message) {

    const text = message.toLowerCase();

    if (
        text.includes("spending") ||
        text.includes("spend") ||
        text.includes("where")
    ) {

        return `
            Based on your current CampusPay data, food is your biggest
            spending category this month at around ₹3,240.
            <br><br>
            Transport comes next at ₹1,860. If you want to reduce spending,
            food and small daily purchases would be the easiest places to
            start.
        `;

    }


    if (
        text.includes("save") ||
        text.includes("saving")
    ) {

        return `
            A simple approach would be to set aside a small amount whenever
            you receive your monthly budget.
            <br><br>
            You could also create a specific savings goal and track your
            progress through CampusPay. Small, consistent amounts can make
            the goal feel much easier to manage.
        `;

    }


    if (
        text.includes("budget") ||
        text.includes("within")
    ) {

        return `
            Your current monthly budget is ₹12,000 and your dashboard shows
            ₹8,580 spent.
            <br><br>
            That leaves approximately ₹3,420 for the rest of the month.
            Keep an eye on your food and miscellaneous spending so you don't
            run through the remaining amount too quickly.
        `;

    }


    if (
        text.includes("tip") ||
        text.includes("advice")
    ) {

        return `
            💡 Student money tip:
            try separating your spending into needs, wants, and savings.
            <br><br>
            Even a quick check before making a purchase can help you become
            more intentional with your budget.
        `;

    }


    return `
        I can help you understand your spending, budget and savings goals.
        <br><br>
        Try asking something like:
        <br>
        “Where am I spending the most?”
        <br>
        “How can I save more?”
        <br>
        “Am I within my budget?”
    `;
}


// =========================================================
// ADD MESSAGE
// =========================================================

function addMessage(text, sender) {

    const row = document.createElement("div");

    row.className =
        sender === "user"
            ? "message-row user-row"
            : "message-row ai-row";


    if (sender === "user") {

        row.innerHTML = `
            <div class="message-content">

                <span class="message-name">
                    You
                </span>

                <div class="message-bubble user-bubble">
                    ${escapeHTML(text)}
                </div>

            </div>

            <div class="message-avatar user-avatar-chat">
                <i class="fa-solid fa-user"></i>
            </div>
        `;

    } else {

        row.innerHTML = `
            <div class="message-avatar ai-avatar">
                <i class="fa-solid fa-wand-magic-sparkles"></i>
            </div>

            <div class="message-content">

                <span class="message-name">
                    CampusPay AI
                </span>

                <div class="message-bubble ai-bubble">
                    ${text}
                </div>

            </div>
        `;

    }


    chatMessages.appendChild(row);

    scrollToBottom();
}


// =========================================================
// ESCAPE USER TEXT
// =========================================================

function escapeHTML(text) {

    const div = document.createElement("div");

    div.textContent = text;

    return div.innerHTML;
}


// =========================================================
// SCROLL
// =========================================================

function scrollToBottom() {

    chatMessages.scrollTop =
        chatMessages.scrollHeight;

}


// =========================================================
// SEND MESSAGE
// =========================================================

function sendMessage() {

    const message =
        chatInput.value.trim();

    if (!message) {
        return;
    }


    addMessage(message, "user");

    chatInput.value = "";

    chatInput.style.height = "auto";


    // Hide suggestions after first message

    if (suggestions) {
        suggestions.style.display = "none";
    }


    // Show typing indicator

    typingIndicator.classList.add("show");

    scrollToBottom();


    // Temporary simulated AI response

    setTimeout(() => {

        typingIndicator.classList.remove("show");

        const response =
            getAIResponse(message);

        addMessage(response, "ai");

    }, 900);

}


// =========================================================
// SEND BUTTON
// =========================================================

sendBtn.addEventListener(
    "click",
    sendMessage
);


// =========================================================
// ENTER TO SEND
// SHIFT + ENTER = NEW LINE
// =========================================================

chatInput.addEventListener(
    "keydown",
    function (event) {

        if (
            event.key === "Enter" &&
            !event.shiftKey
        ) {

            event.preventDefault();

            sendMessage();

        }

    }
);


// =========================================================
// AUTO RESIZE TEXTAREA
// =========================================================

chatInput.addEventListener(
    "input",
    function () {

        this.style.height = "auto";

        this.style.height =
            Math.min(this.scrollHeight, 110) + "px";

    }
);


// =========================================================
// SUGGESTION BUTTONS
// =========================================================

document
    .querySelectorAll(".suggestion-btn")
    .forEach(button => {

        button.addEventListener(
            "click",
            function () {

                chatInput.value =
                    this.textContent.trim();

                sendMessage();

            }
        );

    });


// =========================================================
// NEW CHAT
// =========================================================

clearChatBtn.addEventListener(
    "click",
    function () {

        chatMessages.innerHTML = `

            <div class="message-row ai-row">

                <div class="message-avatar ai-avatar">
                    <i class="fa-solid fa-wand-magic-sparkles"></i>
                </div>

                <div class="message-content">

                    <span class="message-name">
                        CampusPay AI
                    </span>

                    <div class="message-bubble ai-bubble">

                        Hey Divya! 👋
                        <br><br>

                        I'm your CampusPay finance assistant.
                        What would you like to know about your money?

                    </div>

                </div>

            </div>

        `;


        chatMessages.appendChild(suggestions);

        suggestions.style.display = "flex";

        chatInput.value = "";

        chatInput.focus();

    }
);
// =========================================================
// AI FINANCE CHAT
// =========================================================

const chatForm = document.getElementById("chatForm");
if (chatForm && chatInput && chatMessages) {

    chatForm.addEventListener("submit", async function (event) {

        event.preventDefault();

        const message = chatInput.value.trim();

        if (!message) {
            return;
        }

        // Show user's message
        addChatMessage(message, "user");

        // Clear input
        chatInput.value = "";

        try {

            const response = await fetch("/ai-finance/chat", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    message: message
                })
            });

            const data = await response.json();

            if (!response.ok) {
                addChatMessage(
                    data.error || "Something went wrong.",
                    "ai"
                );
                return;
            }

            // Show AI response
            addChatMessage(data.response, "ai");

        } catch (error) {

            console.error("AI Finance error:", error);

            addChatMessage(
                "Sorry, I couldn't connect to CampusPay right now.",
                "ai"
            );
        }
    });
}


// =========================================================
// ADD CHAT MESSAGE
// =========================================================

function addChatMessage(message, sender) {

    const messageElement = document.createElement("div");

    messageElement.classList.add(
        "chat-message",
        sender
    );

    messageElement.textContent = message;

    chatMessages.appendChild(messageElement);

    // Scroll to latest message
    chatMessages.scrollTop = chatMessages.scrollHeight;
}