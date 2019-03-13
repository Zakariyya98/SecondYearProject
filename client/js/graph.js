var ipcRenderer = require('electron').ipcRenderer;
var Chart = require('Chart.js');

var ctx = document.getElementById('myChart').getContext('2d');

ipcRenderer.on('createMembersChart', (event, graph_data) => {
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

ipcRenderer.on('createDayFrequencyChart', (event, graph_data) => {
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: graph_data.labels,
            datasets: [{
                label: "Tasks",
                backgroundColor: "rgba(54, 162, 235, 0.2)",
                data: graph_data.values,
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

//create the burndown chart
ipcRenderer.on('createBurndownChart', (event, graph_data, target_data) => {

    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: graph_data.labels,
            datasets: [{
                    type: 'line',
                    label: 'Target Tasks Remaining',
                    fill: false,
                    backgroundColor: 'rgba(244, 66, 92, 0.6)',
                    borderColor: 'rgba(244, 66, 92, 0.6)',
                    data: target_data.values.map(value => value.toFixed(2))
                },
                {
                    type: 'bar',
                    label: 'Actual',
                    data: graph_data.values,
                    borderColor: 'rgba(54, 162, 235, 1)',
                    borderWidth: 2,
                    fill : false
                },
                {
                    type: 'line',
                    label: 'Average Tasks Completion',
                    fill: false,
                    backgroundColor: 'rgba(255, 196, 102, 0.6)',
                    borderColor: 'rgba(255, 196, 102, 0.6)',
                    data: graph_data.average.map(value => value.toFixed(2))
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