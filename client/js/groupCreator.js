const remote = require('electron').remote;
const ipc = require('electron').ipcRenderer;

window.$ = require("jquery");

$('#click').on('click', function() {

    ipc.send('addNewGroup');

    var win = remote.getCurrentWindow();
    win.close();
})