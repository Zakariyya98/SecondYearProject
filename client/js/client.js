const ipc= require('electron').ipcRenderer;

const socket = io('http://localhost:4000');
let s_username = 'joe';
let connConfirmed = false;
let groupName = '';

function createGroup(args) {
    //create new group and group tag
    var group = document.createElement('div');
    var groupName = document.createElement('span');

    //set styling attributes and values
    group.setAttribute('class', 'group');
    group.setAttribute('groupName', args.groupName);
    group.setAttribute('style', 'background-color : ' + args.backgroundColor + '; color : ' + args.fontColor + ';');
    groupName.innerHTML = String(args.groupName).toUpperCase()[0];
    
    // add elements in correct place in dom
    group.appendChild(groupName);
    $('#addNewGroup').before(group);

    console.log('new group has been added...');
}

$(document).ready(function() {
    $('#dynamic-content').load('./Content/Chat.html');

    // var setStatus = function(s){
    //     var statusDefault = status.innerText;
    //     // Set status
    //     status.innerText = statusDefualt;
    //     if(s !== statusDefault){
    //         var delay = setTimeout(function(){
    //             setStatus(s);
    //         }, 4000);
    //     }
    // }

    if(socket !== undefined) {
        socket.on('confirmation', function() {
            groupName = window.location.search;
            if(!groupName){
                groupName = 'chats';
            }else{
                groupName = groupName.substr(1);
            }
            socket.emit('group', groupName );
            connConfirmed = true;
        });

        socket.on('announcement', function(message){
            alert(message);
        });
    
        //Display who is typing
        socket.on('typing', function(data){
            $('#feedback').html = '<p><em>' + data + ' is typing a message...</em></p>';
        });
     
        //Clear who is clearTyping
        socket.on('clearTyping',function(){
            $('#feedback').html = '';
        });
    
        socket.on('output', function(data){
            console.log(data);
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
            socket.emit('group', groupName);
        }
    })

    $(document).on('click', '.group', function() {
        $('#project-name').text($(this).attr('groupname'));
    })


    $('#addNewGroup').on('click', function() {
        ipc.send('createGroupWindow');
    })

    //create a new group
    ipc.on('addNewGroup', (event, args) => {
        createGroup(args);
    })

    //get console updates from app
    ipc.on('update', (event, args) => {
        console.log(args);
    })

});
