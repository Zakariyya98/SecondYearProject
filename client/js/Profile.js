$(document).ready(function() {
    document.getElementById("username").textContent=s_username;
    if(s_userprofilepic.length > 0){
        document.getElementById("profilepic").src=s_userprofilepic;
    }
});