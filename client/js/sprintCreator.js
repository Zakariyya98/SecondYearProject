const remote = require('electron').remote;
const ipc = require('electron').ipcRenderer;

window.$ = require("jquery");

$(document).ready(function() {
    $('#createSprintButton').on('click', function() {
        //get sprint data inputs
        var $sprintName = $('#sprintNameInput');
        var $sprintDate = $('#sprintDateInput');
        var $sprintLength = $('#sprintLengthInput');
    
        //todo
            //check if sprint date is valid date (inbetween start and end date)
    
        if($sprintName.prop('value') == '') {
            alert('Please enter a name for your sprint!');
        } else if($sprintDate.prop('value') == '') {
            alert('Please enter a date for your sprint!');
        } else {
            ipc.send('addNewSprint', {
                sprintName : $sprintName.prop('value'),
                sprintDate : $sprintDate.prop('value'),
                sprintLength : $sprintLength.prop('value')
            });
            var win = remote.getCurrentWindow();
            win.close();
        }
        
    })
})

