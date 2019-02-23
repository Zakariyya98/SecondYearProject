const ipc= require('electron').ipcRenderer;

const socket = io('http://localhost:4000');
let s_username = 'Joe';
let connConfirmed = false;
let previousGroup = '';
let groupName = '';
let usersTyping = [];

function createGroup(args) {
    //create new group and group tag
    var group = document.createElement('div');
    var groupName = document.createElement('span');

    //set styling attributes and values
    group.setAttribute('class', 'group');
    group.setAttribute('id', 'group');
    group.setAttribute('groupName', args.groupName);
    // group.setAttribute('style', 'background-color : ' + args.backgroundColor + '; color : ' + args.fontColor + ';');
    group.setAttribute('style', 'background-color : #222222; color : white');
    groupName.innerHTML = String(args.groupName).toUpperCase()[0];
    
    // add elements in correct place in dom
    group.appendChild(groupName);
    $('#addNewGroup').before(group);

    console.log('new group has been added...');
}

function setStatus(s) {
    $('#status').text(s);

    setTimeout(function() {
        $('#status').text('');
    }, 3000);
}

function UpdateUserTyping() {
    var message = '';
    if(usersTyping.length > 1) {
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
        if(usersTyping[index] == user) {
            usersTyping.splice(index, 1);
            break;
        }
    }
}

$(document).ready(function() {
    $('#dynamic-content').load('./Content/Chat.html');

    if(socket !== undefined) {
        socket.on('confirmation', function() {
            // groupName = 'chats';
            
            // socket.emit('group', groupName );
            // socket.emit('refreshChat', groupName);
            connConfirmed = true;
        });

        socket.on('announcement', function(message){
            alert(message);
        });
    
        //Display who is typing
        socket.on('typing', function(data){
            if(!usersTyping.includes(data)) { 
                usersTyping.push(data); 
                UpdateUserTyping();
            }
        });

        socket.on('updateGroups', function(groups) {
            if(groups.length > 0) {
                groups.forEach(group => {
                    var args = {groupName : group, backgroundColor : 'black', fontColor : 'white'};
                    createGroup(args);
                })
            }
        });
     
        //Clear who was typing
        socket.on('clearTyping',function(user){
            //remove user who was typing
            if(usersTyping.length > 1) {
                RemoveUserTyping();
                UpdateUserTyping();
            } else {
                usersTyping = [];
                $('#feedback').text('');
            }
        });
    
        socket.on('output', function(data){
            if(data.length){
                var messages = document.getElementById('messages');
                for(var x = 0;x < data.length;x++){
                    // Build out message div
                    var message = document.createElement('div');
                    var message_content = document.createElement('div');
                    var message_info = document.createElement('div');
    
                    message.setAttribute('class', 'message');
                    message_content.setAttribute('value', data[x].name);
                    message_info.setAttribute('class', 'message-info');
    
                    if(data[x].name === s_username) {
                        message_content.setAttribute('class', 'chat-message self-message');
                    } else {
                        message_content.setAttribute('class', 'chat-message other-message');
    
                    }
                    message_content.textContent = data[x].message;
                    message_info.textContent = data[x].name + ' sent - 5:07pm';
    
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
        // Get Status From Server
        socket.on('status', function(data){
            // get message status
            setStatus((typeof data === 'object')? data.message : data);
        });
    }

    $(document).on('click', '#navigator a', function(e) {
        e.preventDefault();
        $('#dynamic-content').load(e.target.href);
        if(e.target.href.includes('Chat')) {
            socket.emit('refreshChat', groupName);
        }
    })

    $(document).on('click', '#group', function() {
        var group = $(this).attr('groupname');
        previousGroup = groupName;
        groupName = group;

        socket.emit('group', groupName, previousGroup);
        socket.emit('refreshChat', groupName);

        $('#project-name').text(groupName);
       
        try {
            document.getElementById('messages').innerHTML = '';
        } catch (error) {
            console.log(error);
        }
    })

    $('#addNewGroup').on('click', function() {
        ipc.send('createGroupWindow');
    })

    //create a new group
    ipc.on('addNewGroup', (event, args) => {
        createGroup(args);
        //insert group into user
        socket.emit('addUserToGroup', {username: s_username, group: args.groupName});

    })

    //get console updates from app
    ipc.on('update', (event, args) => {
        console.log(args);
    })

});
