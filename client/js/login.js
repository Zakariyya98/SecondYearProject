(function(){
  'use strict';
  var crypto = require('crypto');
  const { ipcRenderer } = require('electron');
  // window.$ = window.jQuery = require("jquery");

  var element = function(id){
    return document.getElementById(id);
  }
  // Connect to socket.io
  const socket = io('http://localhost:4000');

  //Initializing hmtl objects
  var login = element('login');
  var emailInput = element('emailInput');
  var emailForm = element('emailForm');
  var passInput = element('passInput');
  var passForm = element('passForm');
  var emailMessage = element('emailWarn');
  var passMessage = element('passWarn');
  var incorrect = element('incorrect');
  var notifyingText = element('notifyingText');
  var signUp = element('signUp');

  //Checks user email and password
  login.addEventListener('click', function(){
  event.preventDefault();
  event.stopPropagation();

  if (emailInput.value == "" || passInput.value == ""){
    emailForm.classList.add('has-danger');
    emailInput.classList.add('form-control-danger');
    emailMessage.style.display = "block";
  }

  if(passInput.value == ""){
    passForm.classList.add('has-danger');
    passInput.classList.add('form-control-danger');
    passMessage.style.display = "block";
  }

  if (emailInput.value != ""){
    emailForm.classList.remove('has-danger');
    emailInput.classList.remove('form-control-danger');
    emailMessage.style.display = "none";
  }

  if (passInput.value != ""){
    passForm.classList.remove('has-danger');
    passInput.classList.remove('form-control-danger');
    passMessage.style.display = "none";
  }

  if (emailInput.value != "" && passInput.value != ""){
    console.log(emailInput.value);
    socket.emit('login', {
                          email:emailInput.value,
                          password:passInput.value
                         });
  }
  });

  socket.on('login', function(data){
    if (data == true){
      ipcRenderer.send('switchPage');
      incorrect.style.display = "none";
    }else{
      incorrect.innerHTML = "User does not exist!"
      incorrect.style.display = "block";
    }
  });
})();
