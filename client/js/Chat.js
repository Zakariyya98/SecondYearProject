$(document).ready(function() {

    //Send information when someone is typing
    $('#textarea').on('keypress', function(){
        socket.emit('typing', username.value);
    });

    // Handle Input
    $('textarea').on('keydown', function(event){
        if(event.which === 13 && event.shiftKey == false){
            // Emit to server input
            socket.emit('input', {
                name:username.value,
                message:textarea.value
            });
            event.preventDefault();
        }
    })

    $('#submit').on('click', function(event) {
        socket.emit('input', {
            name:username.value,
            message:textarea.value
        });
        event.preventDefault();
    });
});

$(window).on('unload', function() {
    alert('chat closed');
});