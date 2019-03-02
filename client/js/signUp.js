(function(){

  var element = function(id){
    return document.getElementById(id);
  }
  // Connect to socket.io
  const socket = io('http://localhost:4000');

  //Initializing hmtl objects
  var nameInput = element('nameInput');
  var nameSignUpForm = element('nameSignUpForm');
  var nameWarn = element('nameWarn');

  var emailSignUpInput = element('emailSignUpInput');
  var emailSignUpForm = element('emailSignUpForm');
  var emailSignUpWarn = element('emailSignUpWarn');

  var passSingUpInput = element('passSignUpInput');
  var passSignUpForm = element('passSignUpForm');
  var passSignUpWarn = element('passSignUpWarn');

  var repeatPassSignUpInput = element('repeatPassSignUpInput');
  var repeatPassSignUpForm = element('repeatPassSignUpForm');

  var incorrect = element('incorrect');
  var signUpButton = element('signUpButton');

  signUpButton.addEventListener('click', function(){
  event.preventDefault();
  event.stopPropagation();
  incorrect.innerHTML = "";

  if(nameInput.value == ""){
    nameForm.classList.add('has-danger');
    nameInput.classList.add('form-control-danger');
    nameWarn.style.display = "block";
  }else{
    nameForm.classList.remove('has-danger');
    nameInput.classList.remove('form-control-danger');
    nameWarn.style.display = "none";
    }

  if(emailSignUpInput.value == ""){
    passSignUpWarn.innerHTML = "Email is required!";
    emailSignUpForm.classList.add('has-danger');
    emailSignUpInput.classList.add('form-control-danger');
    emailSignUpWarn.style.display = "block";
  }else{
    emailSignUpForm.classList.remove('has-danger');
    emailSignUpInput.classList.remove('form-control-danger');
    emailSignUpWarn.style.display = "none";
  }

  if(passSignUpInput.value == ""){
    passSignUpWarn.innerHTML = "Password required!";
    passSignUpForm.classList.add('has-danger');
    passSignUpInput.classList.add('form-control-danger');
    passSignUpWarn.style.display = "block";
  }else{
    passSignUpForm.classList.remove('has-danger');
    passSignUpInput.classList.remove('form-control-danger');
    passSignUpWarn.style.display = "none";
  }

  if(repeatPassSignUpInput.value == ""){
    passSignUpWarn.innerHTML = "Password required!";
    repeatPassSignUpForm.classList.add('has-danger');
    repeatPassSignUpInput.classList.add('form-control-danger');
    passSignUpWarn.style.display = "block";
  }else{
    repeatPassSignUpForm.classList.remove('has-danger');
    repeatPassSignUpInput.classList.remove('form-control-danger');
  }

  if (nameInput.value != "" && emailSignUpInput.value != "" && passSignUpInput.value != "" && repeatPassSignUpInput.value != ""){
    console.log(nameInput.value+"\n"+emailSignUpInput.value+"\n"+passSingUpInput.value);
    if(emailSignUpInput.value.indexOf("@") > -1)
    {
      socket.emit('signUp', {
                            name: nameInput.value,
                            email:emailSignUpInput.value,
                            password:passSignUpInput.value,
                            repeatedPass:repeatPassSignUpInput.value
                            });
    }else{
      emailSignUpWarn.innerHTML = "Invalid Email!";
      emailSignUpForm.classList.add('has-danger');
      emailSignUpInput.classList.add('form-control-danger');
      emailSignUpWarn.style.display = "block";
    }
  }
  });

socket.on('signUp',function(data){
  if(data == 'diffPass'){
    passSignUpForm.classList.add('has-danger');
    repeatPassSignUpForm.classList.add('has-danger');
    passSignUpWarn.innerHTML = "Passwords do not match!"
    passSignUpWarn.style.display = "block";
  }else if(data == 'success'){
    window.location.href = "login.html";
  }else if(data == 'takenEmail')
  incorrect.innerHTML = "Email is already taken!"
  incorrect.style.display = "block";
})

})();
