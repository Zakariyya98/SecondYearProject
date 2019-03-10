var ipcRenderer = require('electron').ipcRenderer;
var Chart = require('Chart.js');

var ctx = document.getElementById('myChart').getContext('2d');

ipcRenderer.on('createBarChart', (event, graph_data) => {
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: Object.keys(graph_data),
            datasets: [{
                label: "Tasks",
                backgroundColor: "rgba(54, 162, 235, 0.2)",
                data: Object.values(graph_data),
                borderColor: 'rgba(54, 162, 235, 1)',
                borderWidth: 2
            }]
        },
        options: {
            legend: {
                display: false
            },
            title: {
                display: true,
                text: 'Task Distribution'
            },
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                yAxes: [{
                    ticks: {
                        beginAtZero: true,
                        stepSize: 1
                    }
                }]
            }
        }
    });
});

ipcRenderer.on('createLineChart', (event, graph_data) => {
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: Object.keys(graph_data),
            datasets: [{
                label: "Task Submitted",
                backgroundColor: "rgba(54, 162, 235, 0.2)",
                data: Object.values(graph_data),
                borderColor: 'rgba(54, 162, 235, 1)',
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            title: {
                display: true,
                text: 'Task Submission Dates'
            },
            tooltips: {
                callbacks: {
                    label: tooltipItem => `${tooltipItem.yLabel}: ${tooltipItem.xLabel}`,
                    title: () => null,
                }
            },
            hover: {
                mode: 'nearest',
                intersect: true
            },
            scales: {
                xAxes: [{
                    display: true,
                    scaleLabel: {
                        display: true,
                        labelString: 'Date'
                    }
                }],
                yAxes: [{
                    display: true,
                    scaleLabel: {
                        display: true,
                        labelString: 'Number of Submissions'
                    },
                    ticks: {
                        beginAtZero: true,
                        stepSize: 1
                    }
                }]
            }
        }
    });
})

//create the burndown chart
ipcRenderer.on('createBurndownChart', (event, graph_data, target_data) => {
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: Object.keys(graph_data),
            datasets: [{
                    type: 'line',
                    label: 'Target Tasks Remaining',
                    fill: false,
                    backgroundColor: 'rgb(249, 109, 49)',
                    borderColor: 'rgb(249, 109, 49)',
                    data: Object.values(target_data)
                },
                {
                    type: 'bar',
                    label: 'Actual',
                    backgroundColor: "rgba(54, 162, 235, 0.2)",
                    data: Object.values(graph_data),
                    borderColor: 'rgba(54, 162, 235, 1)',
                    borderWidth: 2
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            title: {
                display: true,
                text: 'Burndown Chart'
            },
            tooltips: {
                callbacks: {
                    label: tooltipItem => `${tooltipItem.yLabel}: ${tooltipItem.xLabel}`,
                    title: () => null,
                }
            },
            hover: {
                mode: 'nearest',
                intersect: true
            },
            scales: {
                xAxes: [{
                    display: true,
                    scaleLabel: {
                        display: true,
                        labelString: 'Iteration Timeline(Days)'
                    }
                }],
                yAxes: [{
                    display: true,
                    scaleLabel: {
                        display: true,
                        labelString: 'Sum of Tasks Remaining'
                    },
                    ticks: {
                        beginAtZero: true,
                        stepSize: 1
                    }
                }]
            }
        }
    });
});