var ipcRenderer = require('electron').ipcRenderer;
var Chart = require('chart.js');

var ctx = document.getElementById('myChart').getContext('2d');

ipcRenderer.on('createBarChart', (event, graph_data) => {
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: Object.keys(graph_data),
            datasets: [{
                label: "Tasks",
                backgroundColor: ["#3e95cd", "#8e5ea2", "#3cba9f", "#e8c3b9", "#c45850"],
                data: Object.values(graph_data)
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
                        stepSize : 1
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
                fill: false,
                backgroundColor: 'rgba(244, 143, 66, 0.7)',
                borderColor: 'rgba(244, 143, 66, 0.7)',
                data: Object.values(graph_data)
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio : false,
            title: {
                display: true,
                text: 'Task Submission Dates'
            },
            tooltips: {
                mode: 'index',
                intersect: false,
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
                    ticks : {
                        beginAtZero : true,
                        stepSize : 1
                    }
                }]
            }
        }
    });
})

//create the burndown chart
ipcRenderer.on('createBurndownChart', (event, graph_data) => {
    new Chart(ctx, {
        type: 'line',
        data: {
            labels : [5, 4, 3, 2, 1],
            datasets: [{
                label : 'Real Tasks Remaining',
                fill: false,
                backgroundColor: 'rgba(84, 201, 133,0.8)',
                borderColor: 'rgba(84, 201, 133,0.8)',
                data: [4,4,4,3,2]
            }, {
                label : 'Ideal Tasks Remaining',
                fill: false,
                backgroundColor: 'rgba(90, 124, 153, 0.8)',
                borderColor: 'rgba(90, 124, 153, 0.8)',
                data: [4,3,2,1,0]
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio : false,
            title: {
                display: true,
                text: 'Burndown Chart for Sprint Product Backlog'
            },
            tooltips: {
                mode: 'index',
                intersect: false,
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
                    ticks : {
                        beginAtZero : true,
                        stepSize : 1
                    }
                }]
            }
        }
    });
});