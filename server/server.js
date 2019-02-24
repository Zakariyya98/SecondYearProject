const mongo = require('mongodb').MongoClient;
const client = require('socket.io').listen(4000).sockets;

var msg = require('./log.js'); //server status library created by Joe
// var connections = new Map();

// Connect to mongo
mongo.connect('mongodb://127.0.0.1/mongochat', function(err, db){
    if(err){
        throw err;
    }

    msg.important("mongodb_connected");

    // Read from the database and console output
    let cursor = db.collection('Profiles');
    cursor.find().toArray(function(err, docs) {
        if(docs.length == 0) {
            msg.log("There are currently no documents available.");
        } else if(docs.length >= 1) {
            msg.list(docs);
        }
    })
    

    // Connect to Socket.io
    client.on('connection', function(socket){
        msg.important("user_connected");
        socket.emit('confirmation');

        // Create function to send status
        sendStatus = function(s){
            socket.emit('status', s);
        }

        //Check user email and password
        socket.on('login', function(data){
          let email = data.email;
          let password = data.password;
          var userDetails = {Email: email, Password: password};
          let cursor = db.collection('Profiles');
          cursor.findOne(userDetails,function(err,result){
            var success = true;
            if (err) throw err;
              //console.log(result== null)
            else if(result == null){
              success = false;
              socket.emit('login', success);
            }else{
              socket.emit('login', success);
            }
          });
        });

        socket.on('group', function(group, previousGroup){
            //if the user was part of a previous group, remove from the current group
            if(previousGroup != undefined) {
                socket.leave(previousGroup);
                msg.log('removing user : ' + socket.id + ' from group ' + previousGroup);
            }
            
            //add user to the desired group (creates a group if doesn't exist)
            msg.log('attempting to add user ' + socket.id + ' to group ' + group);
            socket.join(group);
            //send message to user saying which group they are connected to (status)
            socket.emit('status', 'you are now connected to group ' + group);
        });

        socket.on('refreshChat', function(group) {
            //updates the chat for the user
            let chat = db.collection(group);
            // Get chats from mongo collection (limited to 100 documents);
            chat.find().limit(100).sort({_id:1}).toArray(function(err, res){
                if(err){
                    throw err;
                }
                // Tell the client to output the information (chat history)
                socket.emit('output', res);
            });
        })
        
        // Notifying other clients when someone is typing
        // socket.on('typing', function(data){
        //     connections[group].forEach(function(user){
        //         if(user != socket.id){//announce to everyone but the sender
        //             client.to(user).emit('typing', data);
        //         }
        //     });
        // });

        // Handle input events
        socket.on('input', function(data){
            let name = data.name;
            let message = data.message;
            //get the current epoch time for timestamp
            let timestamp = data.timestamp;
            let group = data.group;
            let chat = db.collection(group);

            msg.log(name + ' sent the message: ' + message + '::' + group + '::' + timestamp);

            // Check for name and message
            if(name == '' || message == '' || group == ''){
                // Send error status
                sendStatus('Please enter a name and message and make sure you are connected to a group');
            } else {
                // Insert message
                if(message.substring(0,9) == '!announce'){//announcement
                    client.to(group).emit('announcement', message.substring(9));
                }

                // socket.broadcast.emit('clearTyping', name);
                chat.insert({name: name, message: message, timestamp : timestamp}, function(){
                    client.to(group).emit('output', [data]);
                    
                    sendStatus("Message succesfully sent.");
                });
            }
        });

        //fetch all groups the user is a member of 
        socket.on('fetchUserGroups', function(username) {
            //open group data collection
            let groups = db.collection('GroupData'); 
            //search for groups contain the user
            groups.find({members : [username]}).toArray(function(err, res) {
                socket.emit('updateGroups', res);
            });
        })

        socket.on('createGroup', function(data, fn) {
            //get the groupdata collection
            let groupdata = db.collection('GroupData');
            //add the user who created the group to the memberslist
            data.members = [data.username];
            //create the group data document
            groupdata.insert(data, function() {
                msg.important('group created :: ' + data.groupName);
                fn(true);
            })
        })

        socket.on('checkGroupExists', function(group, fn) {
            //check if a group exists
            db.collection('GroupData').findOne({groupName : group}, function(err, res){
                if(err) throw err;
                //if it didnt find the group, return false
                if(res == null) {
                    fn(false);
                } else {
                    fn(true);
                }
            })
        });
    });
});
