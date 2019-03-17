var canvas = document.querySelector('canvas');
var c = canvas.getContext("2d");

var image = new Image();
var uploadFlag = false;

image.onload = function() {
    drawImageScaled();
    if(uploadFlag){
        socket.emit('imageupload', s_email, canvas.toDataURL());
        uploadFlag = false;
        console.log(canvas.toDataURL());
    }
}
image.src = "./resources/defaultemptyprofilepicture.png";

$(document).ready(function() {
    document.getElementById("username").textContent=s_username;
    document.getElementById("email").textContent=s_email;
    if(s_userprofilepic.length > 0){
        document.getElementById("profilepic").src=s_userprofilepic;
        image.src = s_userprofilepic;
        drawImageScaled();
    }
});

//scale and centre image, crop and draw
function drawImageScaled() {
    var hRatio = canvas.width  / image.width;//ratios
    var vRatio =  canvas.height / image.height;
    var ratio  = Math.max ( hRatio, vRatio );//crop
    var centerShift_x = ( canvas.width - image.width*ratio ) / 2;//move around centre
    var centerShift_y = ( canvas.height - image.height*ratio ) / 2;  
    c.clearRect(0,0,canvas.width, canvas.height);

    c.drawImage(image, 0,0, image.width, image.height, centerShift_x,centerShift_y,image.width*ratio, image.height*ratio);              
 }

$("#fileupload").on("change", function() {
    var img = $("#fileupload")[0].files[0];

    s_userprofilepic = URL.createObjectURL(img);
    image.src = s_userprofilepic;
    document.getElementById("profilepic").src=s_userprofilepic;
    drawImageScaled();
    
    uploadFlag = true;
});

$("#changename").click(function() {
    alert("");
});

$("#changeemail").click(function() {
    alert("");
});

$("#changepassword").click(function() {
    alert("");
});

$("#deleteaccount").click(function() {
    alert("");
});


