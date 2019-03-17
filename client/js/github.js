
var ById = function (id) {  
    return document.getElementById(id);
}
var jsonfile = require('jsonfile');  
var favicon = require('favicon-getter').default;  
var path = require('path');  
var uuid = require('uuid');  
var bookmarks = path.join(__dirname, 'bookmarks.json');

var back = ById('back'),  
    forward = ById('forward'),
    refresh = ById('refresh'),
    omni = ById('url'),
    dev = ById('console'),
    fave = ById('fave'),
    list = ById('list'),
    popup = ById('fave-popup'),
    view = ById('view');

    function reloadView () {  
        view.reload();
    }
    
    function backView () {  
        view.goBack();
    }
    
    function forwardView () {  
        view.goForward();
    }

    function updateURL (event) {  
        if (event.keyCode === 13) {
            omni.blur();
            let val = omni.value;
            let https = val.slice(0, 8).toLowerCase();
            let http = val.slice(0, 7).toLowerCase();
            if (https === 'https://') {
                view.loadURL(val);
            } else if (http === 'http://github.coventry.ac.uk') {
                view.loadURL(val);
            } else {
            view.loadURL('http://'+ val);
            }
        }
    }

    /* $(document).on('click', '#navigator a', function (e) {
        e.preventDefault();

        $('#dynamic-content').load(e.target.href);

        if (e.target.href.includes('Chat')) {
            socket.emit('refreshChat', currentGroup);
        } else if (e.target.href.includes('Scrum')) {
            currentSprint = 'product backlog';
            socket.emit('refreshScrum', currentGroup, currentSprint);
        } else if (e.target.href.includes('Kanban')) {
            //socket.emit('refreshKanban', currentGroup);
        } else if (e.target.href.includes('Profile')){
            $("#username").html(" Exercises Solution");
        }
    })*/
//Continue work on this