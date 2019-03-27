//TODO:
    //export data to file
        //modify table2csv to except input values

//clears the table of all rows
function clearTable(table) {
    table.find('tbody').children().toArray().forEach(row => {
        if(!$(row).hasClass('hide')) {
            $(row).detach();
        }
    })
}

//returns task data
function getTaskInsightData(tasks) {
    data = {
        total : 0,
        complete : 0,
        early : 0,
        late : 0,
        assigned : 0,
        remaining : 0
    }

    Object.values(tasks).forEach(task => {
        data.total++;

        if(task.assigned != '') {
            data.assigned++;

            if(task.status.includes('complete')) {
                data.complete++;

                if(task.status.includes('early')) data.early++;
                else if(task.status.includes('late')) data.late++;
            }
        }
    })
    data.remaining = data.total - data.complete;
    return data;
}

//returns the difference in days between two dates
function calculateDateDifference(d1, d2) {
    let day = 24 * 60 * 60 * 1000;
    let t1 = new Date(d1).getTime();
    let t2 = new Date(d2).getTime();

    let difference = Math.abs(t1 - t2);

    return Math.ceil(difference / day);
}

//advances a given date by length days
function advanceDate(date, length, WFLAG=0) {
    date = new Date(date);
    if(WFLAG) length *= 7;
    new_date = new Date(date.getFullYear(), date.getMonth(), date.getDate() + length);

    return new_date;
}

//gets all row data from table, returns the data ( row_id : row_data)
function getTableData() {
    $TABLE = $('#task-table');
    data = {}
    
    $TABLE.find('tbody').children().toArray().forEach(row => {
        var id = $(row).prop('value');

        if(id != undefined) {
            data[id] = {};
            data[id]['status'] = $(row).find('#status').text();
            data[id]['description'] = $(row).find('#desc').text();
            data[id]['assigned'] = $(row).find('#assigned select').prop('value');
            data[id]['deadline'] = $(row).find('#deadline input').prop('value');
            data[id]['submitted'] = $(row).find('#submitted #submitted-checkbox').prop('checked');

            if(submitted) {
                data[id]['date-submitted'] = $(row).find('#submitted #date-submitted').prop('value');
            }
        }
    })
    return data;
}

//calculate predicted finish date based on average completion
function calculatePredictedFinish() {}

//produce object of members and their task submissions
function fetchMemberSubmissions(data)
{
    memberData = {}

    groupMembers.forEach(member => {
        memberData[member] = {assigned : 0, completed : 0}
    })

    Object.values(data).forEach(row => {
        if(row['assigned'] != '') {
            memberData[row['assigned']].assigned++;

            if(row['submitted']) memberData[row['assigned']].completed++;
        }
    })

    return memberData;
}

function fetchMostActiveMember(data) {
    let mostActive = {
        name : '',
        tasks : 0
    }

    Object.keys(data).forEach(member => {
        if(mostActive.tasks < data[member].completed) {
            mostActive.name = member;
            mostActive.tasks = data[member].completed;
        } 
    })

    return mostActive;
}

function fetchLeastActiveMember(data) {
    let leastActive = {
        name : '',
        tasks : Infinity
    }
    Object.keys(data).forEach(member => {
        if(leastActive.tasks > data[member].completed) {
            leastActive.name = member;
            leastActive.tasks = data[member].completed;
        } 
    })

    return leastActive;
}

//calculates the average task completion over sprint timeline
function calculateAverageTaskRate(task_submissions, len) 
{
    let sum = 0;
    Object.values(task_submissions).forEach(tasks_complete => {
        sum += tasks_complete;
    });
    return (sum / len).toFixed(2);
}

//get average, longest and shortest submission rate
function getTaskCompletionRateDate(task_submissions, startDate, len) {
    data = {
        average : 0,
        longest : 0,
        shortest : Math.pow(10, 1000)
    }
    
    data.average = calculateAverageTaskRate(task_submissions, len);
    let previousDate = startDate;
    //get shortest and longest rates

    Object.keys(task_submissions).forEach(task => {
        timeTaken = calculateDateDifference(previousDate, task);
        if(timeTaken > data.longest) data.longest = timeTaken;
        
        if(timeTaken < data.shortest) data.shortest = timeTaken;

        previousDate = task;
    })

    return data;
}

function getLastSubmissionDate(task_submissions) {
    let last_date;

    Object.keys(task_submissions).forEach(task => {
        let date = new Date(task);

        if(last_date == undefined || last_date < date) last_date = date;
    });
    return last_date;
}

//returns array of task submission data from table data
function getTaskSubmissions(data) {
    let task_submissions = {};

    //get task submission count
    Object.values(data).forEach(row => {
        //foreach row, if has been submitted
        if(row.submitted) {
            //get date is was submitted
            var row_date = row['date-submitted'];
            //add to task submissions or increase submission count
            task_submissions[row_date] == undefined ? task_submissions[row_date] = 1 : task_submissions[row_date]++;
        }
    });
    // console.log('task submissions:',task_submissions);
    return task_submissions;
    
}

//returns array of task completions across each day
function getTaskCompletionData(task_submissions, task_count) {
    //get number of days between start date and last task date
    let startDate = new Date(SPRINTS[currentSprint].sprintDate);
    let last_date = getLastSubmissionDate(task_submissions);

    let date_difference = calculateDateDifference(startDate, last_date);
    
    // console.log(date_difference);
    let tasks_remaining = [];

    //foreach day
    for(let i = 0; i <= date_difference; i++) 
    {
        let task_date = new Date(startDate.getFullYear(),
        startDate.getMonth(),
        startDate.getDate() + i);

        //format the date into the standard date format for scrum tool
        task_date = FormatDate(task_date);

        if(task_submissions[task_date] != undefined) {
            task_count -= task_submissions[task_date];
        }
        tasks_remaining.push(task_count);
    }
    // console.log('tasks remaining', tasks_remaining);
    return tasks_remaining;
}

//get array of data based on average task completion rate
function getAverageCompletionData(velo, task_count) {
    let average_data = [];
    let test_len = Math.ceil(task_count / velo) + 1;

    for(let i = 0; i < test_len; i++) {
        if(i!=0) {
            if(task_count - velo < 0) task_count = 0;
            else {
                task_count -= velo;
            }
        }
        average_data.push(task_count); 
        if(task_count == 0) break;
    }

    return average_data;
}

//produce array of weekdays in order of task submission frequencies
function fetchTaskSubmissionDays() {}

//calculates the average time taken to complete tasks, longest completion and shortest completion
function calculateTaskCompletionRate(data) 
{
    completion_details = {
        average : 0,
        longest : 0,
        shortest : Infinity
    };

    return completion_details
}

//checks if a given date is in between two given dates
function dateRangeCheck(dc) {
    //get the current sprint dates
    var startDate = new Date(SPRINTS[currentSprint].sprintDate);
    var endDate = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate() + (SPRINTS[currentSprint].sprintLength * 7));
    //get epoch time for each of the given dates
    var startTime = new Date(startDate).getTime();
    var endTime = new Date(endDate).getTime();
    var t = new Date(dc).getTime();

    //check if date to check is inbetween or eqaul to startTime or endTime
    if(t >= startTime && t <= endTime) return true

    return false;
}

//count the completed tasks
function countCompletedTasks() {
    //find all the tasks that have been completed
    var completed = 0;
    var children = $('#task-table').find('tbody').children().toArray();
    children.forEach(element => {
        if(element.children[0].textContent.toLowerCase().includes('completed')) {
            completed++;
        }
    })
    return completed;
}

//update the progress bar
function updateProgress() {
    var TASKS = $('#task-table').find('tr').length - 2;
    var $PROGRESS_BAR = $('#progress-bar');

    if(TASKS != 0) {
        $PROGRESS_BAR.stop();

        var COMPLETED_TASKS = countCompletedTasks();
        var width = $PROGRESS_BAR.width() / $PROGRESS_BAR.parent().width() * 100;
        var target_width = COMPLETED_TASKS / TASKS * 100 ;
        
        if(TASKS == COMPLETED_TASKS) {
            $('#tasks-tooltip').text('You have completed all of your tasks!');
        } else {
            $('#tasks-tooltip').text("You have completed " + COMPLETED_TASKS + " out of " + TASKS + " tasks.");
        }

        if(width > target_width) {
            $PROGRESS_BAR.animate({
                width: '-=' + (width - target_width) + '%'
            }, 2000)
        } else if(width < target_width) {
            $PROGRESS_BAR.animate({
                width: '+=' + (target_width - width) + '%'
            }, 2000)
        }
    } else {
        $('#tasks-tooltip').text('You do not have any tasks to completed');
    }
    
}

function checkSubmissionDate($submitted, $deadline, $task) {
    var submitted_date = new Date($submitted.prop('value'));
    var deadline_date = new Date($deadline.prop('value'));

    $task.removeClass($task.prop('class'));

    //check if the submission date is equal to the deadline 
    if(submitted_date < deadline_date) {
        //task was submitted before deadline
        $task.find('#status').text('completed (early)');
        $task.addClass('confirmed');
    } else if(submitted_date > deadline_date) {
        //task was submitted after deadlien
        $task.find('#status').text('completed (late)');
        $task.addClass('failed');
    } else {
        //task was submitted on time
        $task.find('#status').text('completed');
        $task.addClass('confirmed');
    }
    updateProgress();
}

$(document).ready(function() {
    window.setTimeout(updateProgress, 1500); //call the updateProgress 1.5s after load
    
    $('#deleteSprint').prop('disabled', true);


    var $TABLE = $('#task-table');
    var $CLONE = $TABLE.find('tr.hide');

    
    socket.emit('fetchSprints', currentGroup, function(sprints) {
        sprints.forEach(sprint => {
            SPRINTS[sprint.sprintName] = sprint;
            var option = document.createElement('option');
            option.value = sprint.sprintName;
            option.innerHTML = CapitalizeWords(sprint.sprintName);
            $(option).prop('id', 'sprint');
            $('#sprintList').append(option);
        })
        $('.section-header').parent().find('#sprint-date').text('Start Date : ' + SPRINTS[currentSprint].sprintDate);
    })

    

    //update clone dropdown for each member in the group
    groupMembers.forEach(member => {
        var option = document.createElement('option');
        option.value = member;
        option.innerHTML = member;
        $CLONE.find('#assigned').find('select').append(option);
    })

    $('tr').find('#submitted #submitted-checkbox').change(function() {
        var $parent = $(this).parent();
        var $TASK = $parent.parent();
        var $date_submitted = $parent.find('#date-submitted');

        if(this.checked) {
            var current_date = new Date(); //get the current date
            
            $date_submitted.removeClass('hide');
            $date_submitted.prop('value', FormatDate(current_date));

            checkSubmissionDate($date_submitted, $TASK.find('#deadline input'), $TASK); //check if submitted before deadline 
        } else if(!this.checked) {
            $parent.parent().find('#status').text('in-progress');
            $date_submitted.addClass('hide');
            $parent.parent().removeClass('confirmed failed');
            $parent.parent().addClass('in-progress');
            updateProgress();
        }

        id = $TASK.prop('value');
        delivered = $(this).prop('checked');
        status = $TASK.find('#status').text();
        submitted = $(this).parent().find('#date-submitted').prop('value');

        var query = { 
            sprintName : currentSprint,
            "tasks.id" : id,
        };
        var values = { $set : { "tasks.$.delivered" : delivered,
        "tasks.$.status" : status,
        "tasks.$.submitted" : submitted}};

        //upload change to server
        socket.emit('updateTask', currentGroup, currentSprint, query, values)
    });
    $('tr').find('#submitted #date-submitted').change(function() {
        var $parent = $(this).parent();
        var $TASK = $parent.parent();

        var new_date = $(this).prop('value');

        //update task status
        checkSubmissionDate($(this), $TASK.find('#deadline input'), $TASK); //check if submitted before deadline  

        if(dateRangeCheck(new_date)) {
            var id = $parent.parent().prop('value');
            var status = $TASK.find('#status').text();

            var query = { 
                sprintName : currentSprint,
                "tasks.id" : id,
            };
            var values = { $set : { "tasks.$.submitted" : new_date,
            "tasks.$.status" : status}};
    
            //upload change to server
            socket.emit('updateTask', currentGroup, currentSprint, query, values)

            
        } else {
            alert('please enter a valid date for the given sprint');
            $(this).prop('value', '');
        }
    })

    $('tr').find('#assigned select').change(function() {
        var text = $(this).text();
        var status = $(this).parent().parent().find('#status');

        if(text.toLowerCase() !== 'select a person' && !status.parent().hasClass('confirmed')) {
            status.text('in-progress');
            status.parent().removeClass('confirmed');
            status.parent().addClass('in-progress');   
        } else if(text.toLowerCase() === 'select a person'){
            status.text('not started');
            status.parent().removeClass('in-progress');
        }

        //get task
        var $TASK = $(this).parent().parent();
        var otask = {};

        otask.id = $TASK.prop('value');
        otask.assigned = $(this).prop('value');
        otask.status = $TASK.find('#status').text();

        var query = { 
            sprintName : currentSprint,
            "tasks.id" : otask.id,
        };
        var values = { $set : { "tasks.$.assigned" : otask.assigned, "tasks.$.status" : otask.status}};

        //upload change to server
        socket.emit('updateTask', currentGroup, currentSprint, query, values)
    })

    $('tr').find('#deadline input').change(function () {
        var deadline_date = $(this).prop('value');
        //check if selected date is valid
        if (dateRangeCheck(deadline_date)) {
            //get task
            var $TASK = $(this).parent().parent();
            var otask = {};

            otask.id = $TASK.prop('value');
            otask.deadline = $(this).prop('value');

            var query = {
                sprintName: currentSprint,
                "tasks.id": otask.id,
            };
            var values = {
                $set: {
                    "tasks.$.deadline": otask.deadline
                }
            };

            //upload change to server
            socket.emit('updateTask', currentGroup, currentSprint, query, values)
        } else {
            alert('please enter a valid date for the given sprint');
            $(this).prop('value', '');
        }
    })

    //add a new row to the table when add table button is clicked
    $('.table-add').on('click', function () {
        var $clone = $CLONE.clone(true).removeClass('hide table-line');

        //update task ID
        lastTaskID++;
        //set value to equal new id
        $clone.prop('value', lastTaskID)
        //add new row to table
        $TABLE.append($clone);
        //update progress bar
        updateProgress();

        var task = { 
            status : 'not started',
            desc : 'task description',
            assigned : '',
            deadline : new Date(),
            submitted : new Date(),
            delivered : false,
            id : lastTaskID
        }
        socket.emit('addTask', currentGroup, currentSprint, task);
    });

    //remove the corresponding row from the table when remove button is pressed (move to clone functions??)
    $('.table-remove').on('click', function () {
        var row_id = $(this).parents('tr').val();
        
        socket.emit('removeTask', currentGroup, currentSprint, row_id);
        $(this).parents('tr').detach();
        //update progress bar after a row is deleted
        updateProgress();
    });

    $('#member-tasks-view').click(function() {
        //get task count for each member
        let data = getTableData();
        let graph_data = fetchMemberSubmissions(data);

        ipc.send('createGraphWindow', 'task distribution', 'members', graph_data);
    })

    $('#burndown-view').click(function() {
        //get the table
        let $TABLE = $('#task-table');
        //get table data 
        let data = getTableData();
        //get sprint
        let sprint = SPRINTS[currentSprint];
        //get sprint start date
        let startDate = new Date(sprint.sprintDate);
        //get total task count (real and target)
        let task_count = Object.values(data).length;
        let target_task_count = task_count;
        let average_task_count = task_count;
        //store tasks left for each of the sprint days
        let graph_data = { labels : [], values : [], average : []}
        //store target tasks completion data
        let target_data = { values : []};
        //daily task completion rate
        let completion_rate = target_task_count / ((sprint.sprintLength * 7) - 1)

        let task_submissions = getTaskSubmissions(data);
        graph_data.values = getTaskCompletionData(task_submissions, task_count);

        for(let i = 0; i < sprint.sprintLength * 7; i++ ){
            date = (new Date(startDate.getFullYear(),
            startDate.getMonth(),
            startDate.getDate() + i));
            datestr = date.toLocaleDateString();

            //update target data
            if(i != 0) {
                target_task_count -= completion_rate;
                if(target_task_count <= 0) target_task_count = 0;
            }
            target_data.values.push(target_task_count);
            
            graph_data.labels.push(FormatDate(date));
        }
        let len = 0;
        graph_data.values.forEach(value => {
            if(value != 0) {
                len++;
            }
        })
        let velo = calculateAverageTaskRate(task_submissions, len);

        graph_data.average = getAverageCompletionData(velo, average_task_count);
        //check if the average data exceeds the current sprint length
        let diff = graph_data.average.length - graph_data.labels.length;
        if(diff > 0) {
            let last_date = new Date(graph_data.labels[graph_data.labels.length - 1]);
            for(let i = 0; i < diff; i++) {
                let date = new Date(last_date.getFullYear(),
                last_date.getMonth(),
                last_date.getDate() + i + 1);

                graph_data.labels.push(FormatDate(date));
            }
        }
        ipc.send('createGraphWindow', 'burndown chart', 'burndown', graph_data, target_data);
    })

    $('#submission-frequency-view').click(function() {
        graph_data = {
            labels : ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
            values : [0, 0, 0, 0, 0, 0, 0]
        }

        var $TABLE = $('#task-table');
        $TABLE.find('tbody').children().toArray().forEach(row => {
            var date = $(row).find('#submitted #date-submitted').prop('value');
            var submitted = $(row).find('#submitted').find('input').prop('checked');

            if((date != '' || date != undefined) && submitted) {
                var day = new Date(date).getDay();
                graph_data.values[day]++;
            }
        })
        ipc.send('createGraphWindow', 'date task distribution', 'day', graph_data);
    })

    $('#createSprint').click(function(){
        ipc.send('createSprintWindow', 'sprint creator', {});
    })

    $('#sprintList').change(function() {
        //remove all rows that are not the main clone
        clearTable($TABLE);
        //update current sprint
        currentSprint = $(this).prop('value');

        //disable delete button if product backlog
        currentSprint == 'product backlog' ? $('#deleteSprint').prop('disabled', true) : $('#deleteSprint').prop('disabled', false);
        //refresh table with new sprint data
        socket.emit('refreshScrum', currentGroup, currentSprint);

        $('.section-header').text(CapitalizeWords(currentSprint) + ' Progress');
        $('.section-header').parent().find('#sprint-date').text('Start Date : ' + SPRINTS[currentSprint].sprintDate);

        setTimeout(updateProgress, 1000);
    })

    //get the details for the current sprint
    $('#sprint-details').click(function() {
        let data = getTableData();
        let submissions = getTaskSubmissions(data);
        let taskInsight = getTaskInsightData(data);
        let last_date = getLastSubmissionDate(submissions);
        let sprint = {}

        //basic task data
        sprint.name = SPRINTS[currentSprint].sprintName; //name
        sprint.length = SPRINTS[currentSprint].sprintLength; //length
        sprint.startDate = SPRINTS[currentSprint].sprintDate; //startDate
        sprint.endDate = FormatDate(advanceDate(sprint.startDate, sprint.length, 1)); //endDate
        sprint.lastSubmissionDate = FormatDate(last_date);

        //task insight data
        sprint.taskCount = taskInsight.total; //task count
        sprint.tasksAssigned = taskInsight.assigned; //tasks assigned
        sprint.tasksCompleted = taskInsight.complete; //tasks completed
        sprint.tasksCompletedEarly = taskInsight.early; //tasks remaining
        sprint.tasksCompletedLate = taskInsight.late; //tasks late
        sprint.tasksRemaining = taskInsight.remaining; //tasks early

        //get completion data
        let completionData = getTaskCompletionRateDate(submissions, sprint.startDate, calculateDateDifference(sprint.startDate, sprint.lastSubmissionDate));

        //task completion data
        sprint.averageCompletionRate = completionData.average;
        sprint.averageCompletionTime = (sprint.tasksCompleted) / calculateDateDifference(sprint.startDate, sprint.lastSubmissionDate);
        sprint.longestCompletionRate = completionData.longest;
        sprint.shortestCompletionRate = completionData.shortest;

        //task predicted finish date
        let averageData = getAverageCompletionData(sprint.averageCompletionRate, sprint.taskCount)
        sprint.predictedFinishDate = FormatDate(advanceDate(sprint.startDate, averageData.length));
        
        //member task submissions
        let memberTasks = fetchMemberSubmissions(data);
        sprint.mostActiveMember = fetchMostActiveMember(memberTasks);
        sprint.leastActiveMember = fetchLeastActiveMember(memberTasks);

        // console.log(sprint);
        ipc.send('displaySprintDetails', sprint);
    })

    //bugged atm, need to fix non text inputs
    $('#exportSprint').click(function() {
        var csv = $('#task-table').table2CSV({
            delivery: 'value'
        });
        window.location.href = 'data:text/csv;charset=UTF-8,' 
        + encodeURIComponent(csv);
    })

    $('#deleteSprint').click(function() {
        socket.emit('deleteSprint', currentGroup, currentSprint, function(success) {
            if(success) {
                $('#sprintList').children().toArray().forEach(option => {
                    if($(option).prop('value') == currentSprint) {
                        $(option).detach();
                        currentSprint = 'product backlog';
                    }
                })
                clearTable($TABLE);
                socket.emit('refreshScrum', currentGroup, currentSprint);
            }
        })
    })
})