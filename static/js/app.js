// =========================================================
// CAMPUSPAY APP.JS
// =========================================================

// =========================================================
// SPENDING CHART — DASHBOARD
// =========================================================

const spendingChart = document.getElementById("spendingChart");

if (spendingChart && typeof Chart !== "undefined") {
    new Chart(spendingChart, {
        type: "line",
        data: {
            labels: ["Week 1", "Week 2", "Week 3", "Week 4"],
            datasets: [{
                label: "Spending",
                data: [1850, 2340, 1960, 2430],
                borderColor: "#7569C9",
                backgroundColor: "rgba(117, 105, 201, 0.08)",
                borderWidth: 2,
                pointBackgroundColor: "#7569C9",
                pointBorderColor: "#FFFFFF",
                pointBorderWidth: 2,
                pointRadius: 4,
                pointHoverRadius: 6,
                tension: 0.4,
                fill: true
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                tooltip: {
                    backgroundColor: "#29283A",
                    padding: 10,
                    cornerRadius: 8,
                    callbacks: {
                        label: function (context) {
                            return ` ₹${context.parsed.y.toLocaleString("en-IN")}`;
                        }
                    }
                }
            },
            scales: {
                x: {
                    grid: { display: false },
                    border: { display: false }
                },
                y: {
                    beginAtZero: true,
                    border: { display: false },
                    grid: { color: "rgba(40, 38, 60, 0.06)" },
                    ticks: {
                        callback: function (value) {
                            return "₹" + value.toLocaleString("en-IN");
                        }
                    }
                }
            }
        }
    });
}


// =========================================================
// EXPENSE MANAGEMENT
// Add / Edit / Delete / Search / Filter / API
// =========================================================

let editingExpenseId = null;
let expensesData = [];

const expenseModal = document.getElementById("expenseModal");
const expenseForm = document.getElementById("expenseForm");
const expenseList = document.getElementById("expenseList");
const expenseSearch = document.getElementById("expenseSearch");
const categoryFilter = document.getElementById("categoryFilter");
const dateFilter = document.getElementById("dateFilter");

const addExpenseBtn = document.getElementById("addExpenseBtn");
const mobileAddExpense = document.getElementById("mobileAddExpense");
const closeExpenseModal = document.getElementById("closeExpenseModal");
const cancelExpense = document.getElementById("cancelExpense");

const expenseNameInput = document.getElementById("expenseName");
const expenseAmountInput = document.getElementById("expenseAmount");
const expenseCategoryInput = document.getElementById("expenseCategory");
const expenseDateInput = document.getElementById("expenseDate");

const modalTitle = document.getElementById("modalTitle");
const modalSubtitle = document.getElementById("modalSubtitle");
const submitExpense = document.getElementById("submitExpense");

const totalExpenseStat = document.getElementById("totalExpenseStat");
const monthExpenseStat = document.getElementById("monthExpenseStat");
const transactionStat = document.getElementById("transactionStat");
const expenseResultText = document.getElementById("expenseResultText");
const expenseToast = document.getElementById("expenseToast");


async function loadExpenses() {

    try {

        const response = await fetch("/api/expenses");

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || "Failed to load expenses");
        }

        expensesData = data.expenses || [];

        renderExpenses();

    } catch (error) {

        console.error(error);

        showToast("Failed to load expenses.");

    }
}


function formatMoney(amount) {

    return "₹" + Number(amount).toLocaleString("en-IN");

}


function formatDate(dateString) {

    const date = new Date(dateString + "T00:00:00");

    return date.toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric"
    });

}


function categoryLabel(category) {

    return category.charAt(0).toUpperCase() + category.slice(1);

}


function getCategoryVisual(category) {

    const visuals = {

        food: {
            icon: "fa-utensils",
            className: "icon-purple"
        },

        transport: {
            icon: "fa-train-subway",
            className: "icon-mint"
        },

        education: {
            icon: "fa-book",
            className: "icon-pink"
        },

        entertainment: {
            icon: "fa-film",
            className: "icon-peach"
        },

        shopping: {
            icon: "fa-bag-shopping",
            className: "icon-peach"
        },

        hostel: {
            icon: "fa-house",
            className: "icon-purple"
        },

        bills: {
            icon: "fa-file-invoice-dollar",
            className: "icon-mint"
        },

        other: {
            icon: "fa-receipt",
            className: "icon-purple"
        }

    };

    return visuals[category] || visuals.other;

}


function renderExpenses() {

    if (!expenseList) return;

    const searchText =
        expenseSearch?.value.toLowerCase().trim() || "";

    const selectedCategory =
        categoryFilter?.value || "all";

    const selectedDate =
        dateFilter?.value || "all";


    const filteredExpenses = expensesData.filter(function (expense) {

        const description =
            expense.description || "";

        const matchesSearch =
            description.toLowerCase().includes(searchText);

        const matchesCategory =
            selectedCategory === "all" ||
            expense.category === selectedCategory;

        const matchesDate =
            matchesDateFilter(
                expense.expense_date,
                selectedDate
            );

        return (
            matchesSearch &&
            matchesCategory &&
            matchesDate
        );

    });


    expenseList.innerHTML = "";


    if (filteredExpenses.length === 0) {

        expenseList.innerHTML = `
            <div class="expense-empty">
                <i class="fa-solid fa-receipt"></i>
                No expenses found.
                <br>
                Try changing your search or filters.
            </div>
        `;

    } else {

        filteredExpenses.forEach(function (expense) {

            expenseList.appendChild(
                createExpenseElement(expense)
            );

        });

    }


    if (expenseResultText) {

        expenseResultText.textContent =
            `${filteredExpenses.length} expense${filteredExpenses.length === 1 ? "" : "s"} shown`;

    }


    updateStats(expensesData);

}


function matchesDateFilter(dateString, filter) {

    if (filter === "all") return true;

    const expenseDate =
        new Date(dateString + "T00:00:00");

    const today = new Date();

    today.setHours(0, 0, 0, 0);


    if (filter === "today") {

        return expenseDate.getTime() === today.getTime();

    }


    if (filter === "week") {

        const sevenDaysAgo = new Date(today);

        sevenDaysAgo.setDate(
            today.getDate() - 6
        );

        return expenseDate >= sevenDaysAgo;

    }


    if (filter === "month") {

        return (
            expenseDate.getMonth() === today.getMonth() &&
            expenseDate.getFullYear() === today.getFullYear()
        );

    }


    return true;

}


function createExpenseElement(expense) {

    const item = document.createElement("div");

    item.className = "expense-item";

    item.dataset.id = expense.id;

    item.dataset.category = expense.category;


    const visual =
        getCategoryVisual(expense.category);


    item.innerHTML = `

        <div class="expense-icon ${visual.className}">
            <i class="fa-solid ${visual.icon}"></i>
        </div>

        <div class="expense-info">

            <span class="expense-name">
                ${escapeHTML(expense.description || "")}
            </span>

            <span class="expense-category">
                ${categoryLabel(expense.category)}
                ·
                ${formatDate(expense.expense_date)}
            </span>

        </div>

        <strong class="expense-amount">
            -${formatMoney(expense.amount)}
        </strong>

        <div class="expense-item-actions">

            <button
                class="expense-action"
                data-action="edit"
                title="Edit expense"
            >
                <i class="fa-solid fa-pen"></i>
            </button>

            <button
                class="expense-action delete"
                data-action="delete"
                title="Delete expense"
            >
                <i class="fa-solid fa-trash"></i>
            </button>

        </div>

    `;


    return item;

}


function escapeHTML(value) {

    const div = document.createElement("div");

    div.textContent = value;

    return div.innerHTML;

}


function updateStats(expenses) {

    const total =
        expenses.reduce(
            (sum, expense) =>
                sum + Number(expense.amount),
            0
        );


    const today = new Date();


    const monthTotal =
        expenses
            .filter(function (expense) {

                const date =
                    new Date(
                        expense.expense_date + "T00:00:00"
                    );

                return (
                    date.getMonth() === today.getMonth() &&
                    date.getFullYear() === today.getFullYear()
                );

            })
            .reduce(
                (sum, expense) =>
                    sum + Number(expense.amount),
                0
            );


    if (totalExpenseStat) {

        totalExpenseStat.textContent =
            formatMoney(total);

    }


    if (monthExpenseStat) {

        monthExpenseStat.textContent =
            formatMoney(monthTotal);

    }


    if (transactionStat) {

        transactionStat.textContent =
            expenses.length;

    }

}


function openExpenseModalForAdd() {

    editingExpenseId = null;

    expenseForm?.reset();


    if (expenseDateInput) {

        expenseDateInput.value =
            new Date().toISOString().split("T")[0];

    }


    if (modalTitle) {

        modalTitle.textContent =
            "Add Expense";

    }


    if (modalSubtitle) {

        modalSubtitle.textContent =
            "Record a new expense";

    }


    if (submitExpense) {

        submitExpense.innerHTML =
            `<i class="fa-solid fa-plus"></i> Add Expense`;

    }


    expenseModal?.classList.add("active");

    expenseNameInput?.focus();

}


function openExpenseModalForEdit(id) {

    const expense =
        expensesData.find(
            item => Number(item.id) === Number(id)
        );


    if (!expense) return;


    editingExpenseId = expense.id;


    expenseNameInput.value =
        expense.description || "";

    expenseAmountInput.value =
        expense.amount;

    expenseCategoryInput.value =
        expense.category;

    expenseDateInput.value =
        expense.expense_date;


    modalTitle.textContent =
        "Edit Expense";

    modalSubtitle.textContent =
        "Update your expense details";


    submitExpense.innerHTML =
        `<i class="fa-solid fa-check"></i> Save Changes`;


    expenseModal.classList.add("active");

    expenseNameInput.focus();

}


function closeExpenseModalFunc() {

    expenseModal?.classList.remove("active");

    editingExpenseId = null;

    expenseForm?.reset();

}


async function handleExpenseSubmit(event) {

    event.preventDefault();


    const description =
        expenseNameInput.value.trim();

    const amount =
        Number(expenseAmountInput.value);

    const category =
        expenseCategoryInput.value;

    const expense_date =
        expenseDateInput.value;


    if (
        !description ||
        !amount ||
        amount <= 0 ||
        !category ||
        !expense_date
    ) {

        return;

    }


    const expenseData = {

        amount: amount,

        category: category,

        description: description,

        expense_date: expense_date

    };


    try {

        let response;


        if (editingExpenseId) {

            response = await fetch(
                `/api/expenses/${editingExpenseId}`,
                {
                    method: "PUT",

                    headers: {
                        "Content-Type": "application/json"
                    },

                    body: JSON.stringify(expenseData)
                }
            );

        } else {

            response = await fetch(
                "/api/expenses",
                {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json"
                    },

                    body: JSON.stringify(expenseData)
                }
            );

        }


        const data = await response.json();


        if (!response.ok) {

            throw new Error(
                data.error || "Expense request failed"
            );

        }


        closeExpenseModalFunc();

        await loadExpenses();


        if (editingExpenseId) {

            showToast(
                "Expense updated successfully."
            );

        } else {

            showToast(
                "Expense added successfully."
            );

        }


    } catch (error) {

        console.error(error);

        showToast(error.message);

    }

}


async function deleteExpense(id) {

    try {

        const response =
            await fetch(
                `/api/expenses/${id}`,
                {
                    method: "DELETE"
                }
            );


        const data =
            await response.json();


        if (!response.ok) {

            throw new Error(
                data.error || "Failed to delete expense"
            );

        }


        await loadExpenses();

        showToast("Expense deleted.");

    } catch (error) {

        console.error(error);

        showToast(error.message);

    }

}


function showToast(message) {

    if (!expenseToast) return;


    const text =
        expenseToast.querySelector("span");


    if (text) {

        text.textContent =
            message;

    }


    expenseToast.classList.add("show");


    setTimeout(function () {

        expenseToast.classList.remove("show");

    }, 2200);

}


// =========================================================
// EVENT LISTENERS
// =========================================================

if (expenseSearch) {

    expenseSearch.addEventListener(
        "input",
        renderExpenses
    );

}


if (categoryFilter) {

    categoryFilter.addEventListener(
        "change",
        renderExpenses
    );

}


if (dateFilter) {

    dateFilter.addEventListener(
        "change",
        renderExpenses
    );

}


if (addExpenseBtn) {

    addExpenseBtn.addEventListener(
        "click",
        openExpenseModalForAdd
    );

}


if (mobileAddExpense) {

    mobileAddExpense.addEventListener(
        "click",
        openExpenseModalForAdd
    );

}


if (closeExpenseModal) {

    closeExpenseModal.addEventListener(
        "click",
        closeExpenseModalFunc
    );

}


if (cancelExpense) {

    cancelExpense.addEventListener(
        "click",
        closeExpenseModalFunc
    );

}


if (expenseModal) {

    expenseModal.addEventListener(
        "click",
        function (event) {

            if (event.target === expenseModal) {

                closeExpenseModalFunc();

            }

        }
    );

}


if (expenseForm) {

    expenseForm.addEventListener(
        "submit",
        handleExpenseSubmit
    );

}


if (expenseList) {

    expenseList.addEventListener(
        "click",
        function (event) {

            const button =
                event.target.closest(
                    ".expense-action"
                );


            if (!button) return;


            const item =
                button.closest(
                    ".expense-item"
                );


            if (!item) return;


            const id =
                item.dataset.id;


            const action =
                button.dataset.action;


            if (action === "edit") {

                openExpenseModalForEdit(id);

            }


            if (action === "delete") {

                deleteExpense(id);

            }

        }
    );

}


// =========================================================
// INITIALISE
// =========================================================

if (expenseList) {

    loadExpenses();

}