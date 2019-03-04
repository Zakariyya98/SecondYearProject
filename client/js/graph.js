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
                        beginAtZero: true
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
                        beginAtZero : true
                    }
                }]
            }
        }
    });
})