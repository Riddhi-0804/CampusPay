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
// Add / Edit / Delete / Search / Filter / localStorage
// =========================================================

const EXPENSE_STORAGE_KEY = "campusPayExpenses";

let editingExpenseId = null;

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


function getExpenses() {
    try {
        return JSON.parse(localStorage.getItem(EXPENSE_STORAGE_KEY)) || [];
    } catch (error) {
        return [];
    }
}


function saveExpenses(expenses) {
    localStorage.setItem(EXPENSE_STORAGE_KEY, JSON.stringify(expenses));
}


function createDemoExpenses() {
    return [
        {
            id: crypto.randomUUID(),
            name: "College Canteen",
            amount: 180,
            category: "food",
            date: getDateOffset(0)
        },
        {
            id: crypto.randomUUID(),
            name: "Metro Recharge",
            amount: 500,
            category: "transport",
            date: getDateOffset(1)
        },
        {
            id: crypto.randomUUID(),
            name: "Stationery",
            amount: 320,
            category: "education",
            date: getDateOffset(3)
        },
        {
            id: crypto.randomUUID(),
            name: "Campus Café",
            amount: 120,
            category: "food",
            date: getDateOffset(4)
        }
    ];
}


function getDateOffset(daysAgo) {
    const date = new Date();
    date.setDate(date.getDate() - daysAgo);
    return date.toISOString().split("T")[0];
}


function initialiseExpenses() {
    const expenses = getExpenses();

    if (expenses.length === 0) {
        saveExpenses(createDemoExpenses());
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

    const allExpenses = getExpenses();

    const searchText =
        expenseSearch?.value.toLowerCase().trim() || "";

    const selectedCategory =
        categoryFilter?.value || "all";

    const selectedDate =
        dateFilter?.value || "all";


    const filteredExpenses = allExpenses.filter(function (expense) {

        const matchesSearch =
            expense.name.toLowerCase().includes(searchText);

        const matchesCategory =
            selectedCategory === "all" ||
            expense.category === selectedCategory;

        const matchesDate =
            matchesDateFilter(expense.date, selectedDate);

        return matchesSearch &&
               matchesCategory &&
               matchesDate;
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
            expenseList.appendChild(createExpenseElement(expense));
        });
    }


    if (expenseResultText) {
        expenseResultText.textContent =
            `${filteredExpenses.length} expense${filteredExpenses.length === 1 ? "" : "s"} shown`;
    }

    updateStats(allExpenses);
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
                ${escapeHTML(expense.name)}
            </span>

            <span class="expense-category">
                ${categoryLabel(expense.category)} · ${formatDate(expense.date)}
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
                    new Date(expense.date + "T00:00:00");

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
        modalTitle.textContent = "Add Expense";
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
        getExpenses().find(
            item => item.id === id
        );

    if (!expense) return;

    editingExpenseId = id;

    expenseNameInput.value = expense.name;
    expenseAmountInput.value = expense.amount;
    expenseCategoryInput.value = expense.category;
    expenseDateInput.value = expense.date;

    modalTitle.textContent = "Edit Expense";

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


function handleExpenseSubmit(event) {

    event.preventDefault();


    const name =
        expenseNameInput.value.trim();

    const amount =
        Number(expenseAmountInput.value);

    const category =
        expenseCategoryInput.value;

    const date =
        expenseDateInput.value;


    if (
        !name ||
        !amount ||
        amount <= 0 ||
        !category ||
        !date
    ) {
        return;
    }


    const expenses = getExpenses();


    if (editingExpenseId) {

        const index =
            expenses.findIndex(
                expense =>
                    expense.id === editingExpenseId
            );

        if (index !== -1) {

            expenses[index] = {
                ...expenses[index],
                name,
                amount,
                category,
                date
            };

        }

        saveExpenses(expenses);

        showToast("Expense updated successfully.");

    } else {

        expenses.unshift({
            id: crypto.randomUUID(),
            name,
            amount,
            category,
            date
        });

        saveExpenses(expenses);

        showToast("Expense added successfully.");
    }


    closeExpenseModalFunc();

    renderExpenses();
}


function deleteExpense(id) {

    const expenses = getExpenses();

    const updatedExpenses =
        expenses.filter(
            expense => expense.id !== id
        );

    saveExpenses(updatedExpenses);

    renderExpenses();

    showToast("Expense deleted.");
}


function showToast(message) {

    if (!expenseToast) return;

    const text =
        expenseToast.querySelector("span");

    if (text) {
        text.textContent = message;
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
                button.closest(".expense-item");

            if (!item) return;

            const id = item.dataset.id;

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
    initialiseExpenses();
    renderExpenses();
}
