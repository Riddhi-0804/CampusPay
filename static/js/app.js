// =========================================================
// SPENDING CHART
// =========================================================

const spendingChart = document.getElementById("spendingChart");

if (spendingChart) {

    new Chart(spendingChart, {

        type: "line",

        data: {

            labels: [
                "Week 1",
                "Week 2",
                "Week 3",
                "Week 4"
            ],

            datasets: [

                {
                    label: "Spending",

                    data: [
                        1850,
                        2340,
                        1960,
                        2430
                    ],

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
                }

            ]

        },

        options: {

            responsive: true,

            maintainAspectRatio: false,

            plugins: {

                legend: {
                    display: false
                },

                tooltip: {

                    backgroundColor: "#29283A",

                    titleFont: {
                        family: "Plus Jakarta Sans",
                        size: 12,
                        weight: "600"
                    },

                    bodyFont: {
                        family: "Plus Jakarta Sans",
                        size: 11
                    },

                    padding: 10,

                    cornerRadius: 8,

                    callbacks: {

                        label: function(context) {

                            return ` ₹${context.parsed.y.toLocaleString("en-IN")}`;

                        }

                    }

                }

            },

            scales: {

                x: {

                    grid: {
                        display: false
                    },

                    border: {
                        display: false
                    },

                    ticks: {

                        color: "#9290A0",

                        font: {
                            family: "Plus Jakarta Sans",
                            size: 10
                        }

                    }

                },

                y: {

                    beginAtZero: true,

                    border: {
                        display: false
                    },

                    grid: {

                        color: "rgba(40, 38, 60, 0.06)"

                    },

                    ticks: {

                        color: "#9290A0",

                        font: {
                            family: "Plus Jakarta Sans",
                            size: 10
                        },

                        callback: function(value) {

                            return "₹" + value.toLocaleString("en-IN");

                        }

                    }

                }

            }

        }

    });

}