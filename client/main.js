// Modules to control application life and create native browser window
const {
  app,
  BrowserWindow,
  session
} = require('electron')
const ipc = require('electron').ipcMain;
const electronOauth2 = require('electron-oauth2');
const oauthConfig = require('./config').oauth;

const windowParams = {
  alwaysOnTop: true,
  autoHideMenuBar: true,
  webPreferences: {
    nodeIntegration: false
  }
};
const githubOAuth = electronOauth2(oauthConfig, windowParams);


// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let win
//let signUpWindow

var windows = new Map();


function createGroupWindow() {
  let groupWindow = new BrowserWindow({
    width: 600,
    height: 580,
    parent: win,
    center: true,
    title: 'Create a new Group',
    resizable: false
  });
  groupWindow.loadFile('./groupCreator.html');

  groupWindow.on('close', function () {
    groupWindow = null;
    win.webContents.send('fadeMask');
  })
}

function createSprintWindow(name, data) {
  if(windows.get(name) == undefined) {
    let window = new BrowserWindow({
      width : 600,
      height : 600,
      parent : win,
      center : true,
      resizable : false
    })
    windows.set(name, window);
    window.loadFile('./sprintCreator.html');

    window.webContents.on('did-finish-;oad', () => {
      //do stuff
    })

    window.on('closed', () => {
      window = null;
      windows.set(name, undefined);
    })
  }
}

function createGraphWindow(name, graph_type, graph_data, target_data) {
  if (windows.get(name) == undefined) {
    let window = new BrowserWindow({
      width: 700,
      height: 400,
      parent: win,
      center: true,
      title: 'Create a graph'
    });
    window.webContents.on('did-finish-load', () => {
      switch(graph_type) {
        case 'members':
          window.webContents.send('createMembersChart', graph_data);
          break;
        case 'day':
          window.webContents.send('createDayFrequencyChart', graph_data);
          break;
        case 'burndown':
          window.webContents.send('createBurndownChart', graph_data, target_data);
        default:
          break;
      }
    })
    // window.webContents.openDevTools();
    window.on('closed', () => {
      window = null;
      windows.set(name, undefined);
    })

    window.loadFile('./graph.html');
    window.show();

    windows.set(name, window);
  } else {
    console.log('window with that name is already open!');
  }


}

function createWindow() {
  // Create the browser window.
  win = new BrowserWindow({
    width: 1200,
    height: 800,
    minHeight: 600,
    minWidth: 900,
    frame: false,
    show:false,
    title: "Collaborative Work Platform"
  })
   signUpWindow = new BrowserWindow({width:400,height:400,modal:true,frame:false})

  // and load the index.html of the app.
  win.loadFile('./index.html')
   signUpWindow.loadFile('./Login Content/login.html')

  // Open the DevTools.
  //win.webContents.openDevTools()

  //Displaying the index page and hidding the login page
  ipc.on('switchPage', function() {
      win.show()
      signUpWindow.close()
  })

  ipc.on('getUserEmail', (event, data) => {
    win.webContents.send('getUserEmail', data);
  })  

  ipc.on('closePage', function () {
    win.close()
    signUpWindow.close()
  })

  // Emitted when the window is closed.
  win.on('closed', function () {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    win = null
  })
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow)

// Quit when all windows are closed.
app.on('window-all-closed', function () {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('session-created', (event, session) => {
  console.log(session);
})

app.on('activate', function () {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (win === null) {
    createWindow()
  }

})


// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.

ipc.on('gitHubLogin', (event, arg) => {
  session.defaultSession.cookies.get({ name: 'logged_in',  domain: '.github.coventry.ac.uk'}, (error, cookies) => {
    event.sender.send('gitHubLogin-reply', cookies[0].value)
  });
});

ipc.on('github-oauth', (event, arg) => {
  githubOAuth.getAccessToken({})
    .then(token => {
      //event.sender.send('github-oauth-reply', token);
      githubOAuth.refreshToken(token.refreshToken)
        .then(newToken => {

        });
    });
});

/*session.defaultSession.cookies.get({}, (error, cookies) => {
  console.log(error, cookies)
})*/

ipc.on('createGroupWindow', (event, arg) => {
  createGroupWindow();
  event.sender.send('update', 'Window created...');
})

ipc.on('addNewGroup', (event, args) => {
  win.webContents.send('addNewGroup', args);
})

ipc.on('addNewSprint', (event, data) => {
  win.webContents.send('addNewSprint', data);
})

ipc.on('createGraphWindow', (event, name, graph_type, graph_data, target_data) => {
  createGraphWindow(name, graph_type, graph_data, target_data);
})

ipc.on('createSprintWindow', (event, name, data) => {
  createSprintWindow(name, data);
})
