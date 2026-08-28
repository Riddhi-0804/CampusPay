/* =========================================================
   CAMPUSPAY — SMARTSPLIT
   Page-specific JavaScript
   ========================================================= */

const STORAGE_KEY = "campusPaySmartSplits";

let splits = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [
    {
        id: 1,
        name: "Jaipur Trip",
        members: ["You", "Ananya", "Riya", "Mehak"],
        amount: 2480,
        description: "Trip expenses",
        yourShare: 620,
        balance: 620,
        status: "pending",
        createdAt: "Today"
    },
    {
        id: 2,
        name: "Hostel Supplies",
        members: ["You", "Ananya", "Riya"],
        amount: 1020,
        description: "Room supplies",
        yourShare: 340,
        balance: -340,
        status: "pending",
        createdAt: "Yesterday"
    },
    {
        id: 3,
        name: "Team Dinner",
        members: ["You", "Arjun", "Riya", "Mehak", "Kabir"],
        amount: 1400,
        description: "Dinner",
        yourShare: 280,
        balance: 280,
        status: "pending",
        createdAt: "Aug 23"
    }
];

const $ = (id) => document.getElementById(id);

const splitList = $("splitList");
const emptySplits = $("emptySplits");
const splitModal = $("splitModal");
const detailsModal = $("detailsModal");
const splitForm = $("splitForm");
const splitMethod = $("splitMethod");
const customShareWrap = $("customShareWrap");

function saveSplits() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(splits));
}

function formatMoney(value) {
    return "₹" + Number(value).toLocaleString("en-IN");
}

function escapeHTML(value) {
    return String(value).replace(/[&<>"']/g, (char) => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#039;"
    }[char]));
}

function updateSummary() {
    const receive = splits
        .filter(split => split.status === "pending" && split.balance > 0)
        .reduce((sum, split) => sum + split.balance, 0);

    const owe = splits
        .filter(split => split.status === "pending" && split.balance < 0)
        .reduce((sum, split) => sum + Math.abs(split.balance), 0);

    const active = splits.filter(split => split.status === "pending").length;

    $("receiveTotal").textContent = formatMoney(receive);
    $("oweTotal").textContent = formatMoney(owe);
    $("activeTotal").textContent = active;
}

function renderSplits() {
    const search = $("splitSearch").value.trim().toLowerCase();
    const status = $("statusFilter").value;

    const filtered = splits.filter(split => {
        const matchesSearch =
            split.name.toLowerCase().includes(search) ||
            split.members.join(" ").toLowerCase().includes(search);

        const matchesStatus =
            status === "all" || split.status === status;

        return matchesSearch && matchesStatus;
    });

    splitList.innerHTML = "";

    if (!filtered.length) {
        emptySplits.classList.remove("hidden");
        return;
    }

    emptySplits.classList.add("hidden");

    filtered.forEach(split => {
        const item = document.createElement("div");
        item.className = "smart-split-item";

        let balanceText = "Settled";
        let balanceClass = "settled";

        if (split.status === "pending") {
            if (split.balance > 0) {
                balanceText = `You receive ${formatMoney(split.balance)}`;
                balanceClass = "receive";
            } else if (split.balance < 0) {
                balanceText = `You owe ${formatMoney(Math.abs(split.balance))}`;
                balanceClass = "owe";
            } else {
                balanceText = "Settled";
            }
        }

        item.innerHTML = `
            <div class="split-group-icon">
                <i class="fa-solid ${getGroupIcon(split.name)}"></i>
            </div>

            <div class="smart-split-info">
                <span class="smart-split-name">${escapeHTML(split.name)}</span>
                <span class="smart-split-meta">
                    ${split.members.length} members · ${escapeHTML(split.createdAt)}
                </span>
            </div>

            <div class="smart-split-right">
                <span class="split-balance ${balanceClass}">${balanceText}</span>
                <span class="split-status-pill ${split.status}">
                    ${split.status === "pending" ? "Pending" : "Settled"}
                </span>
            </div>

            <div class="split-item-actions">
                <button class="split-action-btn" title="View details" data-action="view" data-id="${split.id}">
                    <i class="fa-solid fa-eye"></i>
                </button>

                ${split.status === "pending" ? `
                    <button class="split-action-btn" title="Mark settled" data-action="settle" data-id="${split.id}">
                        <i class="fa-solid fa-check"></i>
                    </button>
                ` : ""}

                <button class="split-action-btn danger" title="Delete split" data-action="delete" data-id="${split.id}">
                    <i class="fa-solid fa-trash"></i>
                </button>
            </div>
        `;

        splitList.appendChild(item);
    });

    updateSummary();
}

function getGroupIcon(name) {
    const value = name.toLowerCase();

    if (value.includes("trip") || value.includes("goa") || value.includes("jaipur")) {
        return "fa-plane";
    }

    if (value.includes("food") || value.includes("dinner") || value.includes("lunch")) {
        return "fa-utensils";
    }

    if (value.includes("hostel") || value.includes("room")) {
        return "fa-house";
    }

    return "fa-users";
}

function openCreateModal() {
    splitModal.classList.remove("hidden");
    document.body.style.overflow = "hidden";
    setTimeout(() => $("splitName").focus(), 50);
}

function closeCreateModal() {
    splitModal.classList.add("hidden");
    document.body.style.overflow = "";
    splitForm.reset();
    customShareWrap.classList.add("hidden");
}

function openDetails(id) {
    const split = splits.find(item => item.id === id);
    if (!split) return;

    const perPerson = split.yourShare;

    $("detailsContent").innerHTML = `
        <div class="modal-heading details-content-title">
            <div class="modal-icon"><i class="fa-solid ${getGroupIcon(split.name)}"></i></div>
            <div>
                <h2>${escapeHTML(split.name)}</h2>
                <p>${split.members.length} members · ${escapeHTML(split.createdAt)}</p>
            </div>
        </div>

        <div class="details-balance-box">
            <span>Your balance</span>
            <strong class="${split.balance > 0 ? "split-balance receive" : split.balance < 0 ? "split-balance owe" : "split-balance settled"}">
                ${split.balance > 0 ? "+" : ""}${formatMoney(split.balance)}
            </strong>
        </div>

        <div>
            ${split.members.map(member => `
                <div class="member-row">
                    <span>${escapeHTML(member)}</span>
                    <strong>${member === "You" ? formatMoney(perPerson) : "Shared"}</strong>
                </div>
            `).join("")}
        </div>

        <div class="details-actions">
            ${split.status === "pending" ? `
                <button class="btn btn-primary" data-detail-action="settle" data-id="${split.id}">
                    <i class="fa-solid fa-check"></i> Mark settled
                </button>
            ` : ""}
            <button class="btn btn-secondary" data-detail-action="delete" data-id="${split.id}">
                <i class="fa-solid fa-trash"></i> Delete
            </button>
        </div>
    `;

    detailsModal.classList.remove("hidden");
    document.body.style.overflow = "hidden";
}

function closeDetailsModal() {
    detailsModal.classList.add("hidden");
    document.body.style.overflow = "";
}

function settleSplit(id) {
    const split = splits.find(item => item.id === id);
    if (!split) return;

    split.status = "settled";
    split.balance = 0;

    saveSplits();
    renderSplits();
    closeDetailsModal();
    showToast("Split marked as settled ✓");
}

function deleteSplit(id) {
    const split = splits.find(item => item.id === id);
    if (!split) return;

    const confirmed = confirm(`Delete "${split.name}"?`);
    if (!confirmed) return;

    splits = splits.filter(item => item.id !== id);
    saveSplits();
    renderSplits();
    closeDetailsModal();
    showToast("Split deleted");
}

function showToast(message) {
    const toast = $("toast");
    toast.textContent = message;
    toast.classList.add("show");

    clearTimeout(window.toastTimer);
    window.toastTimer = setTimeout(() => {
        toast.classList.remove("show");
    }, 2200);
}

$("openCreateGroup").addEventListener("click", openCreateModal);
$("openCreateGroupMobile").addEventListener("click", openCreateModal);
$("emptyCreateBtn").addEventListener("click", openCreateModal);
$("mobileCreate").addEventListener("click", openCreateModal);

$("closeModal").addEventListener("click", closeCreateModal);
$("closeDetails").addEventListener("click", closeDetailsModal);

splitModal.addEventListener("click", (event) => {
    if (event.target === splitModal) closeCreateModal();
});

detailsModal.addEventListener("click", (event) => {
    if (event.target === detailsModal) closeDetailsModal();
});

document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
        closeCreateModal();
        closeDetailsModal();
    }
});

splitMethod.addEventListener("change", () => {
    customShareWrap.classList.toggle("hidden", splitMethod.value !== "custom");
    $("customShare").required = splitMethod.value === "custom";
});

splitForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const name = $("splitName").value.trim();
    const members = $("splitMembers").value
        .split(",")
        .map(member => member.trim())
        .filter(Boolean);

    const amount = Number($("splitAmount").value);
    const description = $("expenseDescription").value.trim() || "Shared expense";

    if (!name || members.length < 2 || !amount || amount < 0) {
        showToast("Please enter valid split details");
        return;
    }

    if (!members.some(member => member.toLowerCase() === "you")) {
        members.unshift("You");
    }

    let yourShare;

    if (splitMethod.value === "custom") {
        yourShare = Number($("customShare").value);

        if (yourShare < 0 || yourShare > amount) {
            showToast("Your share must be between ₹0 and the total");
            return;
        }
    } else {
        yourShare = amount / members.length;
    }

    const otherMembers = members.length - 1;
    const amountOthersOwe = Math.max(0, amount - yourShare);

    // For the first expense, a positive balance means others owe you
    // when your share is smaller than the total paid by you.
    // This prototype treats the creator as having paid the full expense.
    const balance = Math.round(amountOthersOwe * 100) / 100;

    const newSplit = {
        id: Date.now(),
        name,
        members,
        amount,
        description,
        yourShare,
        balance,
        status: balance === 0 ? "settled" : "pending",
        createdAt: "Just now"
    };

    splits.unshift(newSplit);
    saveSplits();
    renderSplits();
    closeCreateModal();
    showToast("Split created successfully ✓");
});

$("splitSearch").addEventListener("input", renderSplits);
$("statusFilter").addEventListener("change", renderSplits);

splitList.addEventListener("click", (event) => {
    const button = event.target.closest("[data-action]");
    if (!button) return;

    const id = Number(button.dataset.id);
    const action = button.dataset.action;

    if (action === "view") openDetails(id);
    if (action === "settle") settleSplit(id);
    if (action === "delete") deleteSplit(id);
});

$("detailsContent").addEventListener("click", (event) => {
    const button = event.target.closest("[data-detail-action]");
    if (!button) return;

    const id = Number(button.dataset.id);
    const action = button.dataset.detailAction;

    if (action === "settle") settleSplit(id);
    if (action === "delete") deleteSplit(id);
});

renderSplits();
updateSummary();
