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
        var $projectName = $('#groupNameInput');
        var $startDate = $('#projectStartDate');
        var $endDate = $('#projectEndDate');

        //todo
            //check if start date is after end date, fail if so

        if($projectName.val() == '') {
            alert('Please enter a project name!');
        } else if($startDate.val() == '' || $endDate.val() == '') {
            alert('Please enter a start and end date for your project!');
        } else {
            ipc.send('addNewGroup', {
                groupName : $projectName.val(),
                backgroundColor : $backgroundColor.val(),
                fontColor : $fontColor.val(),
                startDate : $startDate.val(),
                endDate : $endDate.val()
            });
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
})

