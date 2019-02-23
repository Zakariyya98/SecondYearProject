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

        //check for user groups
        let cursor = db.collection('Profiles');
        cursor.findOne({username: "Joe"}, function(err, doc) {
            if(err) throw err;
            
            socket.emit('updateGroups', doc.groups);
        })
        //let the user know they are connected
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
                msg.log('removing user : ' + socket.id + ' from group ' + group);
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
            let group = data.group;
            let chat = db.collection(group);

            msg.log(name + ' sent the message: ' + message + '::' + group);

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
                chat.insert({name: name, message: message}, function(){
                    client.to(group).emit('output', [data]);
                    
                    sendStatus("Messagae succesfully sent.");
                });
            }
        });

        socket.on('addUserToGroup', function(data) {
            //add group to user's group list.
            let cursor = db.collection('Profiles');
            cursor.update({username:data.username}, {$addToSet : {groups : data.group}});
        });

        socket.on('checkGroupExists', function(group, fn) {
            //check if a group exists
            db.listCollections().toArray(function(err, collections) {
                if (err) return cb(err);
                
                collections.forEach(collection => {
                    if(collection.name == group){
                        fn(true);
                    }
                })
                fn(false);
              });
        });
    });
});
