(function () {
    var element = function (id) {
        return document.getElementById(id);
    }
    // Connect to socket.io
    const socket = io('http://localhost:4000');
    var $ = require("jquery");

    var incorrect = element('incorrect');
    var emailResetForm = element('emailResetForm');
    var emailResetInput = element('emailResetInput');
    var emailResetWarn = element('emailSignUpWarn');
    var resetButton = element('resetButton');

    resetButton.addEventListener('click', function () {
        event.preventDefault();
        event.stopPropagation();
        $("#emailSent").slideUp();
        incorrect.style.display = "none";
        if (emailResetInput.value != "") {
            emailResetForm.classList.remove('has-danger');
            emailResetInput.classList.remove('form-control-danger');
            emailResetWarn.style.display = "none";
            socket.emit('forgotPass', emailResetInput.value);
        } else {
            incorrect.style.display = "none";
            emailResetForm.classList.add('has-danger');
            emailResetInput.classList.add('form-control-danger');
            emailResetWarn.style.display = "block";
        }
    });

    socket.on('forgotPass', function (data) {
        event.preventDefault();
        event.stopPropagation();
        if (data == 'notFound') {
            incorrect.innerHTML = 'Email not found!';
            incorrect.style.display = "block";
        }else if(data == 'sent'){
          $("#emailSent").slideDown("slow");
        }
    });
})();
