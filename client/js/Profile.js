$(document).ready(function() {

    document.getElementById("username").textContent=s_username;
    document.getElementById("email").textContent=s_email;
    if(s_userprofilepic.length > 0){
        document.getElementById("profilepic").src=s_userprofilepic;
        document.getElementById("profilepic1").src=s_userprofilepic;
    }

});

$("#fileupload").on("change", function() {
    alert("hello");
    var img = $("#fileupload")[0].files[0];
    s_userprofilepic = URL.createObjectURL(img);
    document.getElementById("profilepic").src=s_userprofilepic;

    document.getElementById("profilepic1").src=s_userprofilepic;
    
});