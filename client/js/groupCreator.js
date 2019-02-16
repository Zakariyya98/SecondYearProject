const remote = require('electron').remote;
const ipc = require('electron').ipcRenderer;

window.$ = require("jquery");

let $template = $('#group-template');
let $backgroundColor = $('#backgroundColorInput');
let $fontColor = $('#fontColorInput');

$(document).ready(function() {

    $backgroundColor.val('#f1f2f2');
    $fontColor.val('#222222');

    $('#createGroupButton').on('click', function() {
        var $groupName = $('#groupNameInput');
        console.log($groupName);
        if($groupName.val() == '') {
            alert('Please enter a group name');
        } else {
            ipc.send('addNewGroup', {groupName : $groupName.val(), backgroundColor : $backgroundColor.val(), fontColor : $fontColor.val()});
    
            var win = remote.getCurrentWindow();
            win.close();
        }
        
    })
    
    $('#groupNameInput').change(function() {
        $template.find('span').text(String($(this).val()).toUpperCase()[0]);
    })

    $('#backgroundColorInput').change(function() {
        //update the templace background color
        $template.css('background-color', $(this).val());
    })
    
    $('#fontColorInput').change(function() {
        //update the templace background color
        $template.css('color', $(this).val());
    })
    
    $('input').focus(function() {
        $(this).parent().find('.label-text').addClass('label-active');
    })
    
    $('input').focusout(function() {
        if($(this).val() == ''){ 
            $(this).parent().find('.label-text').removeClass('label-active');
        }
        
    })
})

