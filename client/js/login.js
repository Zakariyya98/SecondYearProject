(function(){
  const { ipcRenderer } = require('electron');

  var element = function(id){
    return document.getElementById(id);
  }
  // Connect to socket.io
  const socket = io('http://localhost:4000');

  //Initializing hmtl objects
  var closeBtn = element('close-btn')
  var login = element('login');
  var emailInput = element('emailInput');
  var emailForm = element('emailForm');
  var passInput = element('passInput');
  var passForm = element('passForm');
  var emailMessage = element('emailWarn');
  var passMessage = element('passWarn');
  var incorrect = element('incorrect');

  //Checks user email and password
  login.addEventListener('click', function(){
  event.preventDefault();
  event.stopPropagation();
  incorrect.innerHTML = "";

  if (emailInput.value == ""){
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
    if(data == 0){
        incorrect.innerHTML = "User does not exist!";
      incorrect.style.display = "block";
    }else if (data == 1){
      ipcRenderer.send('switchPage');
      incorrect.style.display = "none";
    }else if (data == 2){
        incorrect.innerHTML = "Incorrect Email or Password!";
      incorrect.style.display = "block";
    }
  });

  closeBtn.addEventListener('click', function(){
    ipcRenderer.send('closePage');
  });

})();
