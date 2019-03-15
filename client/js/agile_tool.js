//TODO:
    //export data to file
        //create export data button
        //convert data in table to .csv

//clears the table of all rows
function clearTable(table) {
    table.find('tbody').children().toArray().forEach(row => {
        if(!$(row).hasClass('hide')) {
            $(row).detach();
        }
    })
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

        if(this.checked) {
            var current_date = new Date(); //get the current date

            var dateSubmitted = document.createElement('input');
            $(dateSubmitted).prop('type', 'date');
            $(dateSubmitted).prop('value', FormatDate(current_date));
            $(dateSubmitted).prop('id', 'date-submitted');
            $(dateSubmitted).addClass('table-selector');
            
            $parent.append(dateSubmitted);

            checkSubmissionDate($(dateSubmitted), $TASK.find('#deadline input'), $TASK); //check if submitted before deadline 
        } else if(!this.checked) {
            $parent.parent().find('#status').text('in-progress');
            $parent.find('#date-submitted').remove();
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
        graph_data = {};
        groupMembers.forEach(member => {
            graph_data[member] = 0;
        })

        var $TABLE = $('#task-table');
        $TABLE.find('tbody').children().toArray().forEach(row => {
            var user = $(row).find('#assigned').find('select').val();
            if(user != '') {
                graph_data[user] += 1;
            }
        })
        ipc.send('createGraphWindow', 'task distribution', 'members', graph_data);
    })

    $('#burndown-view').click(function() {
        //get the table
        var $TABLE = $('#task-table');
        //get sprint
        var sprint = SPRINTS[currentSprint];
        //get sprint start date
        var startDate = new Date(sprint.sprintDate);
        //get total task count (real and target)
        var real_task_count = $TABLE.find('tbody').children().length - 1;
        var target_task_count = real_task_count;
        var average_task_count = real_task_count;
        //store task submissions for each date
        var task_submissions = {};
        //store tasks left for each of the sprint days
        var graph_data = { labels : [], values : [], average : []}
        //store target tasks completion data
        var target_data = { values : []};
        //daily task completion rate
        var completion_rate = target_task_count / ((sprint.sprintLength * 7) - 1)
        //last date
        var last_date = 0; 

        var sum = 0;
        var len = 0;
        var velo = 0;

        //get number of tasks submitted and their dates
        $TABLE.find('tbody').children().toArray().forEach(row => {
            var date = $(row).find('#submitted #date-submitted').prop('value');
            date = new Date(date);
            var datestr = date.toLocaleDateString();

            var submitted = $(row).find('#submitted').find('input').prop('checked');

            if(datestr != '' && submitted) {
                task_submissions[datestr] == undefined ? task_submissions[datestr] = 1 : task_submissions[datestr]++;
                if(last_date == undefined || last_date < date) {
                    last_date = date;
                }
            }
        })

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
            
            graph_data.labels.push(datestr);
            if(date > last_date) {
                graph_data.values.push(0);
            } else {
                //update actual data
                if(task_submissions[datestr] != undefined) {
                    real_task_count -= task_submissions[datestr];
                }
                graph_data.values.push(real_task_count);
            }
        }

        Object.values(task_submissions).forEach(tasks_complete => {
            sum += tasks_complete;
        })

        graph_data.values.forEach(value => {
            if(value != 0) {
                len++;
            }
        })
        velo = sum / len;
        
        for(let i = 0; i < graph_data.labels.length; i++) {
            if(i!=0) {
                average_task_count -= velo;
            }

            if(average_task_count <= 0) {
                break;
            }
            graph_data.average.push(average_task_count);
            
            
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

        console.log(Object.keys(graph_data).sort);
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
        console.log(SPRINTS[currentSprint]);
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
    

    

    
