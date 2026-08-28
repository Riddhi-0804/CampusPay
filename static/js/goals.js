// =========================================================
// CAMPUSPAY — GOALS
// Page-specific goal logic.
// =========================================================

const goalGrid = document.getElementById("goalGrid");
const emptyGoals = document.getElementById("emptyGoals");
const goalSearch = document.getElementById("goalSearch");
const goalFilter = document.getElementById("goalFilter");

const goalModal = document.getElementById("goalModal");
const goalForm = document.getElementById("goalForm");
const closeGoalModal = document.getElementById("closeGoalModal");
const cancelGoal = document.getElementById("cancelGoal");

const addMoneyModal = document.getElementById("addMoneyModal");
const moneyForm = document.getElementById("moneyForm");
const closeMoneyModal = document.getElementById("closeMoneyModal");
const cancelMoney = document.getElementById("cancelMoney");

const ICONS = {
    laptop: "fa-laptop",
    plane: "fa-plane-departure",
    book: "fa-book",
    gift: "fa-gift",
    phone: "fa-mobile-screen-button",
    heart: "fa-heart",
    piggy: "fa-piggy-bank"
};

const STORAGE_KEY = "campuspayGoals";

let goals = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [
    {
        id: crypto.randomUUID(),
        name: "New Laptop",
        target: 70000,
        saved: 29400,
        icon: "laptop",
        createdAt: Date.now()
    },
    {
        id: crypto.randomUUID(),
        name: "Goa Trip",
        target: 15000,
        saved: 10200,
        icon: "plane",
        createdAt: Date.now()
    }
];

let selectedGoalId = null;

function saveGoals() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(goals));
}

function formatMoney(value) {
    return `₹${Number(value).toLocaleString("en-IN")}`;
}

function getProgress(goal) {
    if (!goal.target) return 0;
    return Math.min(100, Math.round((goal.saved / goal.target) * 100));
}

function isCompleted(goal) {
    return goal.saved >= goal.target;
}

function updateSummary() {
    const totalSaved = goals.reduce((sum, goal) => sum + Number(goal.saved), 0);
    const totalTarget = goals.reduce((sum, goal) => sum + Number(goal.target), 0);
    const active = goals.filter(goal => !isCompleted(goal)).length;
    const completed = goals.filter(isCompleted).length;
    const progress = totalTarget ? Math.min(100, Math.round((totalSaved / totalTarget) * 100)) : 0;

    document.getElementById("totalSaved").textContent = formatMoney(totalSaved);
    document.getElementById("activeGoals").textContent = active;
    document.getElementById("completedGoals").textContent = completed;
    document.getElementById("overallProgress").textContent = `${progress}%`;
}

function renderGoals() {
    const search = goalSearch.value.trim().toLowerCase();
    const filter = goalFilter.value;

    const filtered = goals.filter(goal => {
        const matchesSearch = goal.name.toLowerCase().includes(search);
        const matchesFilter =
            filter === "all" ||
            (filter === "active" && !isCompleted(goal)) ||
            (filter === "completed" && isCompleted(goal));

        return matchesSearch && matchesFilter;
    });

    goalGrid.innerHTML = "";

    filtered.forEach(goal => {
        const progress = getProgress(goal);
        const completed = isCompleted(goal);
        const remaining = Math.max(0, goal.target - goal.saved);

        const card = document.createElement("article");
        card.className = `goal-card ${completed ? "completed" : ""}`;

        card.innerHTML = `
            <div class="goal-card-top">
                <div class="goal-card-title">
                    <div class="goal-card-icon">
                        <i class="fa-solid ${ICONS[goal.icon] || ICONS.piggy}"></i>
                    </div>
                    <div class="goal-card-title-text">
                        <span class="goal-card-name">${escapeHTML(goal.name)}</span>
                        <span class="goal-card-target">${formatMoney(goal.target)} goal</span>
                    </div>
                </div>

                <strong class="goal-percentage">${progress}%</strong>
            </div>

            <div class="goal-progress">
                <div class="goal-progress-fill" style="width: ${progress}%"></div>
            </div>

            <div class="goal-card-meta">
                <span><strong>${formatMoney(goal.saved)}</strong> saved</span>
                <span>${completed ? "Goal reached 🎉" : `${formatMoney(remaining)} to go`}</span>
            </div>

            <div class="goal-card-actions">
                <span class="goal-status ${completed ? "completed" : "active"}">
                    <i class="fa-solid ${completed ? "fa-check" : "fa-clock"}"></i>
                    ${completed ? "Completed" : "In progress"}
                </span>

                <div class="goal-action-buttons">
                    ${completed ? "" : `<button class="goal-action add-money" data-action="add" data-id="${goal.id}">
                        <i class="fa-solid fa-plus"></i> Add money
                    </button>`}
                    <button class="goal-action delete" data-action="delete" data-id="${goal.id}">
                        <i class="fa-regular fa-trash-can"></i>
                    </button>
                </div>
            </div>
        `;

        goalGrid.appendChild(card);
    });

    emptyGoals.hidden = filtered.length !== 0;
    updateSummary();
}

function escapeHTML(text) {
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
}

function openGoalModal() {
    goalForm.reset();
    document.getElementById("goalInitial").value = "0";
    goalModal.classList.add("show");
    document.getElementById("goalName").focus();
}

function closeModal(modal) {
    modal.classList.remove("show");
}

function openMoneyModal(goalId) {
    selectedGoalId = goalId;
    const goal = goals.find(item => item.id === goalId);
    if (!goal) return;

    document.getElementById("moneyGoalLabel").textContent =
        `Add money to “${goal.name}”. Current savings: ${formatMoney(goal.saved)}.`;

    document.getElementById("moneyAmount").value = "";
    addMoneyModal.classList.add("show");
    document.getElementById("moneyAmount").focus();
}

function showToast(message) {
    const toast = document.getElementById("toast");
    toast.textContent = message;
    toast.classList.add("show");

    clearTimeout(showToast.timer);
    showToast.timer = setTimeout(() => {
        toast.classList.remove("show");
    }, 2400);
}

goalForm.addEventListener("submit", event => {
    event.preventDefault();

    const name = document.getElementById("goalName").value.trim();
    const target = Number(document.getElementById("goalTarget").value);
    const initial = Number(document.getElementById("goalInitial").value) || 0;
    const icon = document.getElementById("goalIcon").value;

    if (!name || target <= 0 || initial < 0) return;

    goals.unshift({
        id: crypto.randomUUID(),
        name,
        target,
        saved: Math.min(initial, target),
        icon,
        createdAt: Date.now()
    });

    saveGoals();
    renderGoals();
    closeModal(goalModal);
    showToast("Savings goal created successfully 🎯");
});

moneyForm.addEventListener("submit", event => {
    event.preventDefault();

    const amount = Number(document.getElementById("moneyAmount").value);
    const goal = goals.find(item => item.id === selectedGoalId);

    if (!goal || amount <= 0) return;

    goal.saved = Math.min(goal.target, Number(goal.saved) + amount);

    saveGoals();
    renderGoals();
    closeModal(addMoneyModal);

    if (isCompleted(goal)) {
        showToast(`You reached “${goal.name}”! 🎉`);
    } else {
        showToast(`${formatMoney(amount)} added to your goal.`);
    }
});

goalGrid.addEventListener("click", event => {
    const button = event.target.closest("[data-action]");
    if (!button) return;

    const id = button.dataset.id;
    const action = button.dataset.action;

    if (action === "add") {
        openMoneyModal(id);
    }

    if (action === "delete") {
        const goal = goals.find(item => item.id === id);
        if (!goal) return;

        const shouldDelete = confirm(`Delete the goal “${goal.name}”?`);
        if (!shouldDelete) return;

        goals = goals.filter(item => item.id !== id);
        saveGoals();
        renderGoals();
        showToast("Goal deleted.");
    }
});

goalSearch.addEventListener("input", renderGoals);
goalFilter.addEventListener("change", renderGoals);

document.getElementById("topAddGoal").addEventListener("click", openGoalModal);
document.getElementById("mobileAddGoal").addEventListener("click", openGoalModal);
document.getElementById("emptyAddGoal").addEventListener("click", openGoalModal);

closeGoalModal.addEventListener("click", () => closeModal(goalModal));
cancelGoal.addEventListener("click", () => closeModal(goalModal));

closeMoneyModal.addEventListener("click", () => closeModal(addMoneyModal));
cancelMoney.addEventListener("click", () => closeModal(addMoneyModal));

[goalModal, addMoneyModal].forEach(modal => {
    modal.addEventListener("click", event => {
        if (event.target === modal) closeModal(modal);
    });
});

document.addEventListener("keydown", event => {
    if (event.key === "Escape") {
        closeModal(goalModal);
        closeModal(addMoneyModal);
    }
});

renderGoals();
