//TODO:
    //build editable table
        //set task to be in-progress when group member has been assigned
    //build task progress bar
        //
    //build sprint selecter
        //build sprint feedback
    //export data to file
        //create export data button
        //convert data in table to .csv or json file potentially
    //build burndown chart
        //include chartjs
        //extract data from table
        //decide what type of graph to do
        //display data on graph
    //build submission frequency chart
        //extract submitted date data from table for each task
        //build bar chart showing submission data for each day of the week
    //build group member task counter  
        //extra task count from table for each user
    //style

//fetch an element
var element = function(id) {
    return document.getElementById(id);
}

// function updateTaskTable() {
//     var task_table = element('task-table'); //get the task table element's body

//     tasklist.forEach(element => {
//         let tr = document.createElement('tr'); //create a new row
        
//         let data_id = document.createElement('td'); //create id field
//         data_id.appendChild(document.createTextNode(element.id));
    
//         let data_status = document.createElement('td'); //create task status field
//         data_status.appendChild(document.createTextNode(element.status));
    
//         let data_desc = document.createElement('td'); //create task description field
//         data_desc.appendChild(document.createTextNode(element.desc));
    
//         //TODO
//             //Drop down of all users involved in group
//         let data_user = document.createElement('td'); //create assigned user field
//         data_user.appendChild(document.createTextNode(element.user));
    
//         let data_deadline = document.createElement('td'); //create deadline user field
//         data_deadline.appendChild(document.createTextNode(element.deadline));
    
//         let data_submitted = document.createElement('td'); //create date submitted user field
//         data_submitted.appendChild(document.createTextNode(element.submitted));
    
//         let delete_btn = document.createElement('td'); //create row delete button
//         let delete_btn_span = document.createElement('span');
//         //replace this with trash icon
//         delete_btn_span.setAttribute('class', 'table-remove far fa-trash-alt');
//         delete_btn.appendChild(delete_btn_span);

//         tr.appendChild(data_id);
//         tr.appendChild(data_status);
//         tr.appendChild(data_desc);
//         tr.appendChild(data_user);
//         tr.appendChild(data_deadline);
//         tr.appendChild(data_submitted);
//         tr.appendChild(delete_btn);
    
//         task_table.appendChild(tr);
//     });
// }

function countCompletedTasks() {
    //find all the tasks that have been completed
    var completed = 0;
    var children = document.querySelector('#task-table').querySelectorAll('tr');
    var childrenList = Array.from(children); //make an array from the children
    childrenList.forEach(element => {
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

function checkSubmissionDate($submitted, $deadline, $parent) {
    var submitted_date = new Date(parseInt($submitted.attr('date-submitted'))).toLocaleDateString();
    var deadline_date = new Date($deadline.val()).toLocaleDateString();

    $parent.removeClass('in-progress');

    //check if the submission date is equal to the deadline 
    if(submitted_date === deadline_date) {
        //task was submitted on time
        $parent.find('#status').text('completed');
        $parent.addClass('confirmed');
    } else if(submitted_date < deadline_date) {
        //task was submitted before deadline
        $parent.find('#status').text('completed (early)');
        $parent.addClass('confirmed');
    } else if(submitted_date > deadline_date) {
        //task was submitted after deadlien
        $parent.find('#status').text('completed (late)');
        $parent.addClass('failed');
    }
    $parent.prop('disabled', true);
    updateProgress();
}

$(document).ready(function() {
    let $PROGRESS_BAR = $('#progress-bar');

    //updateTaskTable(); //add fields to the table
    
    window.setTimeout(updateProgress, 1500); //call the updateProgress 1.5s after load

    var $TABLE = $('#task-table');
    var $CLONE = $TABLE.find('tr.hide');

    $CLONE.find('#submitted input').change(function() {
        var $parent = $(this).parent();
        if(this.checked) {
            var current_date = new Date(); //get the current date
            var date_element = document.createElement('span'); //create date DOM
            date_element.innerText = current_date.toLocaleDateString(); //set DOM text
            
            $parent.append(date_element);
            $parent.attr('date-submitted', Date.now());

            checkSubmissionDate($parent, $parent.parent().find('#deadline input'), $parent.parent()); //check if submitted before deadline 
        } else if(!this.checked) {
            $parent.parent().find('#status').text('in-progress');
            $parent.find('span').remove();
            $parent.parent().removeClass('confirmed failed');
            $parent.parent().addClass('in-progress');
            updateProgress();
        }
    })

    $CLONE.find('#assigned select').change(function() {
        var text = $(this).text();
        var status = $(this).parent().parent().find('#status');

        if(text.toLowerCase() !== 'select a person' && !status.parent().hasClass('confirmed')) {
            status.text('in-progress');
            status.parent().addClass('in-progress');   
        } else if(text.toLowerCase() === 'select a person'){
            console.log('test');
            status.text('not started');
            status.parent().removeClass('in-progress');
        }
    })

    //add a new row to the table when add table button is clicked
    $('.table-add').click(function () {
        var $clone = $CLONE.clone(true).removeClass('hide table-line');
        $TABLE.append($clone);

        updateProgress();
      });

    //remove the corresponding row from the table when remove button is pressed (move to clone functions??)
    $('.table-remove').click(function () {
        $(this).parents('tr').detach();
        //update progress bar after a row is deleted
        updateProgress();
    });

})
    

    

    

    
