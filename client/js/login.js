(function(){
  const { ipcRenderer } = require('electron');
  const storage = require('electron-json-storage');
  var $ = require("jquery");

  //Find elements from the html
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
  var gitHubIcon = element('gitHubIcon');

  //Saves the user credentials
  storage.get('LoginDetails', function(error, data) {
    if (error) throw error;
    if ($.isEmptyObject(data))
      console.log('No info');
    else{
      emailInput.value = data.Username;
      passInput.value = data.Password;
      console.log(data.Checkbox);
    }
  });

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

    //Check if the remember me is checked
    if($('#checkBox').is(':checked')) {
      storage.set('LoginDetails', { Username:emailInput.value, Password:passInput.value, Checkbox:'checked' }, function(error) {
      if (error) throw error;
      });
    }else{
      storage.remove('LoginDetails', function(error) {
      if (error) throw error;
      });
    }

    //Send the credentials to the server
    socket.emit('login', {
                          email:emailInput.value,
                          password:passInput.value
                         });
  }
  });

  //Receive an answer from the server if login is successful
  socket.on('login', function(data){
    if(data.Entry == 0){
        incorrect.innerHTML = "User does not exist!";
      incorrect.style.display = "block";
    }else if (data.Entry == 1){
      ipcRenderer.send('switchPage');
      incorrect.style.display = "none";
      ipcRenderer.send('getUserEmail', data.Email);
    }else if (data.Entry == 2){
        incorrect.innerHTML = "Incorrect Email or Password!";
      incorrect.style.display = "block";
    }
  });

  closeBtn.addEventListener('click', function(){
    ipcRenderer.send('closePage');
  });

  gitHubIcon.addEventListener('click',function(){
    ipcRenderer.send('github-oauth');
    //ipcRenderer.send('gitHubLogin');
  });

  ipcRenderer.on('gitHubLogin-reply',(event, arg) => {
    if(arg == 'yes'){
      ipcRenderer.send('switchPage');
    }else{
      ipcRenderer.send('github-oauth', 'getToken');
    }
  });

  ipcRenderer.on('github-oauth-reply', (event, token) => {
   console.log(token);
   });
})();
