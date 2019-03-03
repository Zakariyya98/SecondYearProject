const ipc = require('electron').ipcRenderer;

const socket = io('http://localhost:4000');
let s_username = 'Joe';
let previousGroup = '';
let currentGroup = '';
let usersTyping = [];
let groupMembers = [];

let lastTaskID;

function createGroup(args) {
    //create new group and group tag
    var group = document.createElement('div');
    var groupName = document.createElement('span');

    //set styling attributes and values
    group.setAttribute('class', 'group');
    group.setAttribute('id', 'group');
    group.setAttribute('groupName', args.groupName);
    group.setAttribute('style', 'background-color : ' + args.backgroundColor + '; color : ' + args.fontColor + ';');
    groupName.innerHTML = String(args.groupName).toUpperCase()[0];

    // add elements in correct place in dom
    group.appendChild(groupName);
    $('#addNewGroup').before(group);

    console.log('new group has been added...');
}

//update the scrum task table with a given array of tasks
function updateTaskTable(tasks) {
    let $task_table = $('#task-table'); //get the task table
    let $CLONE = $('#task-table').find('tr.hide');
    //fetch the members for the given group
    tasks.forEach(task => {
        $row = $CLONE.clone(true).removeClass('hide table-line');

        $row.find('#status').text(task.status);
        $row.find('#desc').text(task.desc);

        var $select = $row.find('#assigned').find('select');

        groupMembers.forEach(member => {
            let option = document.createElement('option');
            option.value = member;
            option.innerHTML = member;
            $select.append(option);
        })

        $select.val(task.assigned);

        var $deadline = $row.find('#deadline').find('input');
        var deadline_date = new Date(task.deadline);

        //refactor date provided to make it suitable for project
        var day = ('0' + deadline_date.getDate()).slice(-2);
        var month = ('0' + (deadline_date.getMonth() + 1)).slice(-2);

        deadline_date = deadline_date.getFullYear() + "-" + (day) + "-" + (month);
        $deadline.val(deadline_date);

        var $submitted = $row.find('#submitted').find('input');
        //if task has been delievered, set tickbox and create span tag
        if (task.delivered) {
            $submitted.attr('checked', true);
            //add date delivered span here also
        }

        //apply styling to each row depending on completion
        if(task.status.includes('completed')) {
            $row.addClass('confirmed');
        } else if(task.status.includes('in-progress')) {
            $row.addClass('in-progress');
        }

        $task_table.append($row);
        // //create a new row
        // let tr = document.createElement('tr');
        // tr.value = task.id;
        // //set last task id to current task id
        // lastTaskID = task.id;
        // //create task status field
        // let data_status = document.createElement('td');
        // data_status.appendChild(document.createTextNode(task.status));
        // data_status.setAttribute('id', 'status');

        // //create task description field
        // let data_desc = document.createElement('td');
        // data_desc.appendChild(document.createTextNode(task.desc));
        // data_desc.setAttribute('id', 'desc');

        // //create assigned user field
        // let data_user = document.createElement('td');
        // data_user.setAttribute('id', 'assigned');
        // //create dropdown for users
        // let dropdown = document.createElement('select');
        // dropdown.setAttribute('class', 'table-selector');

        // let defaultOption = document.createElement('option');
        // defaultOption.value = '';
        // defaultOption.innerText = 'Select A Person';
        // dropdown.appendChild(defaultOption);

        // //set options for task assignment to every user in the group
        // groupMembers.forEach(member => {
        //     let option = document.createElement('option');
        //     option.value = member;
        //     option.innerHTML = member;
        //     dropdown.appendChild(option);
        // })
        // dropdown.value = task.assigned;
        // data_user.appendChild(dropdown);

        // //create deadline user field
        // let data_deadline = document.createElement('td');
        // let deadline_date = new Date(task.deadline);
        // data_deadline.setAttribute('id', 'deadline');

        // let datepicker = document.createElement('input');
        // datepicker.setAttribute('class', 'table-selector');
        // datepicker.setAttribute('type', 'date');

        // //refactor date provided to make it suitable for project
        // var day = ('0' + deadline_date.getDate()).slice(-2);
        // var month = ('0' + (deadline_date.getMonth() + 1)).slice(-2);

        // deadline_date = deadline_date.getFullYear() + "-" + (day) + "-" + (month);
        // datepicker.setAttribute('value', deadline_date);
        // datepicker.name = 'deadline-date';

        // data_deadline.appendChild(datepicker);

        // //create date submitted user field
        // let data_delivered = document.createElement('td');
        // //create tickbox
        // let tickbox = document.createElement('input');
        // tickbox.setAttribute('type', 'checkbox');
        // tickbox.name = 'submitted-checkbox';

        // //if task has been delievered, set tickbox and create span tag
        // if (task.delivered) {
        //     tickbox.checked = true;
        //     //add date delivered span here also
        // }

        // data_delivered.setAttribute('id', 'submitted');
        // data_delivered.appendChild(tickbox);

        // //create delete button for row
        // let delete_btn = document.createElement('td');
        // let delete_btn_span = document.createElement('span');

        // delete_btn_span.setAttribute('class', 'table-remove far fa-trash-alt');
        // delete_btn.appendChild(delete_btn_span);

        // //apply styling to each row depending on completion
        // if(task.status.includes('completed')) {
        //     tr.setAttribute('class', 'confirmed');
        // } else if(task.status.includes('in-progress')) {
        //     tr.setAttribute('class', 'in-progress');
        // }

        // //append all data elemts to the row
        // tr.appendChild(data_status);
        // tr.appendChild(data_desc);
        // tr.appendChild(data_user);
        // tr.appendChild(data_deadline);
        // tr.appendChild(data_delivered);
        // tr.appendChild(delete_btn);

        // //append row to table
        // $task_table.append(tr);
    });

}

function setStatus(s) {
    $('#status').text(s);

    setTimeout(function () {
        $('#status').text('');
    }, 3000);
}

function UpdateUserTyping() {
    var message = '';
    if (usersTyping.length > 1) {
        usersTyping.forEach(user => {
            message += user + ', ';
        })
        message += ' are typing';
    } else {
        message = usersTyping[0] + ' is typing a message';
    }
    $('#feedback').text(message);
}

function RemoveUserTyping(user) {
    for (let index = 0; index < usersTyping.length; index++) {
        if (usersTyping[index] == user) {
            usersTyping.splice(index, 1);
            break;
        }
    }
}

$(document).ready(function () {
    //load the chat by default
    $('#dynamic-content').load('./Content/Chat.html');

    if (socket !== undefined) {
        socket.on('confirmation', function () {
            //update the user's groups
            socket.emit('fetchUserGroups', s_username);
        });

        //if the user has emitted an announcement, create alert
        //TODO
        //create custom announcement
        socket.on('announcement', function (message) {
            alert(message);
        });

        //Display who is typing
        socket.on('typing', function (data) {
            if (!usersTyping.includes(data)) {
                usersTyping.push(data);
                UpdateUserTyping();
            }
        });

        //set the user's groups when the connect
        socket.on('updateGroups', function (groups) {
            if (groups.length > 0) {
                //set current group to first group -- maybe change this later to be the 
                //group the user was last in (user settings);
                currentGroup = groups[0].groupName;
                //refresh the chat
                socket.emit('refreshChat', currentGroup);
                //set the user's group to the new current group
                socket.emit('group', currentGroup)
                //fetch an array of users for that group
                socket.emit('fetchUserList', currentGroup, function (members) {
                    if (members.length > 0) {
                        groupMembers = members;
                    }
                })
                groups.forEach(group => {
                    createGroup(group);
                })
            }
        });

        //Clear who was typing
        socket.on('clearTyping', function (user) {
            //remove user who was typing
            if (usersTyping.length > 1) {
                RemoveUserTyping();
                UpdateUserTyping();
            } else {
                usersTyping = [];
                $('#feedback').text('');
            }
        });

        //when receiving a new message in your group
        socket.on('output', function (data) {
            var messages = document.getElementById('messages');
            if (data.length) {
                for (var x = 0; x < data.length; x++) {
                    // Build out message div
                    var message = document.createElement('div');
                    var message_content = document.createElement('div');
                    var message_info = document.createElement('div');

                    message.setAttribute('class', 'message');
                    message_content.setAttribute('value', data[x].name);
                    message_info.setAttribute('class', 'message-info');

                    if (data[x].name === s_username) {
                        message_content.setAttribute('class', 'chat-message self-message');
                    } else {
                        message_content.setAttribute('class', 'chat-message other-message');

                    }
                    message_content.textContent = data[x].message;
                    //add timestamp to message
                    var actualTime = new Date(data[x].timestamp);
                    //if message was not sent on the same day
                    if (actualTime.toLocaleDateString() != new Date(Date.now()).toLocaleDateString()) {
                        //set timestamp to data
                        actualTime = actualTime.toLocaleString();
                    } else {
                        actualTime = "Today, " + actualTime.toLocaleTimeString().substr(0, 5);
                    }
                    message_info.textContent = data[x].name + ' sent - ' + actualTime;

                    message.appendChild(message_content);
                    message_content.appendChild(message_info);
                    messages.appendChild(message);
                    messages.insertBefore(message, messages.lastChild);
                }

                messages.scrollTop = messages.scrollHeight;

            } else {
                var message = document.createElement('div');
                message.setAttribute('class', 'chat-message');
                message.textContent = "Chat history not available";
                messages.appendChild(message);
                messages.insertBefore(message, messages.firstChild);
            }
        });

        //update the frontend scrum table with given task array
        socket.on('updateScrum', function (tasks) {
            updateTaskTable(tasks);
        });

        // Get Status From Server
        socket.on('status', function (data) {
            setStatus((typeof data === 'object') ? data.message : data);
        });
    }

    //dynamically load the content when clicking on a navigation link
    $(document).on('click', '#navigator a', function (e) {
        e.preventDefault();
        $('[id^="dynamic-content"]').load(e.target.href);
        
        if (e.target.href.includes('Chat')) {
            socket.emit('refreshChat', currentGroup);
        } else if (e.target.href.includes('Scrum')) {
            socket.emit('refreshScrum', currentGroup, 'product backlog');
        } else if (e.target.href.includes('Kanban')) {
            //socket.emit('refreshKanban', currentGroup);
        }
    })

    //when you join a group you are part of
    $(document).on('click', '#group', function () {
        var group = $(this).attr('groupname');
        previousGroup = currentGroup;
        currentGroup = group;

        //update group to new group
        socket.emit('group', group, previousGroup, );
        //fetch userlist for new group
        socket.emit('fetchUserList', currentGroup, function (members) {
            if (members.length > 0) {
                groupMembers = members;
            }
        })
        //update group tag
        $('#project-name').text(group);
        
        //load the chat when the user swaps group
        $('#dynamic-content').load('./Content/Chat.html');

        socket.emit('refreshChat', group);

        $('#project-name').text(group);
    })

    //create group creator window when clicking on add new group button
    $('#addNewGroup').on('click', function () {
        $('#page-mask').fadeTo(500, 0.7);
        ipc.send('createGroupWindow');
    })

    //create a new group
    ipc.on('addNewGroup', (event, args) => {
        //only create group if succesfully created
        socket.emit('checkGroupExists', args.groupName, function (data) {
            if (!data) {
                args.username = s_username; //temp
                // create core group data document
                socket.emit('createGroup', args, function (success) {
                    if (success) {
                        //create front end grouping
                        createGroup(args);
                        alert('group succesfully created!');
                    } else {
                        alert('group could not be created!');
                    }
                });
            } else {
                alert('A group with that name already exists!');
            }
        });
    })

    //get console updates from app
    ipc.on('update', (event, args) => {
        console.log(args);
    })

    //fades the background to make popup window more prominent
    ipc.on('fadeMask', (event, args) => {
        $('#page-mask').fadeOut(500);
    })

});