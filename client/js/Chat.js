$(document).ready(function() {

    //Send information when someone is typing
    $('#textarea').on('keypress', function(){
        if($(this).val() === '') {
            RemoveUserTyping();
        } else {
            socket.emit('typing', username.value);
        }
        
    });

    // Handle Input -- user text message
    $('#textarea').on('keydown', function(event){
        if(event.which === 13 && event.shiftKey == false){
            // Emit to server input
            socket.emit('input', {
                name:username.value,
                message:textarea.value,
                timestamp:Date.now(),
                group:currentGroup
            });
            event.preventDefault();
            $(this).val('');
        }
    })

    $('#submit').on('click', function(event) {
        socket.emit('input', {
            name:username.value,
            message:textarea.value,
            group:groupName
        });
        event.preventDefault();
        $('#textarea').val('');
    });
});