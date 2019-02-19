const mongo = require('mongodb').MongoClient;
const client = require('socket.io').listen(4000).sockets;

var connections = new Map();

// Connect to mongo
mongo.connect('mongodb://127.0.0.1/mongochat', function(err, db){
    if(err){
        throw err;
    }

    console.log('MongoDB connected...');

    // Read from the database and console output
    let cursor = db.collection('Profiles').find();
    cursor.each(function(err, doc) {
        console.log(doc);
    });

    // Connect to Socket.io
    client.on('connection', function(socket){
        //let the user know they are connected
        socket.emit('confirmation');

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

        socket.on('group', function(group){

            if(connections[group]){//if a connection for the group already exists
                if(!connections[group].includes(socket.id)){
                    //adds client to the list of connections
                    connections[group].push(socket.id);
                }
            }else{
                //creates key value pair of group and an array of clients
                connections[group] = [socket.id];
            }


            console.log(socket.client.id);
            console.log(group);

            let chat = db.collection(group);
            // Create function to send status
            sendStatus = function(s){
                socket.emit('status', s);
            }

            // Get chats from mongo collection (limited to 100 documents);
            chat.find().limit(100).sort({_id:1}).toArray(function(err, res){
                if(err){
                    throw err;
                }
                // Tell the client to output the information (chat history)
                socket.emit('output', res);
            });

            // Notifying other clients when someone is typing
            socket.on('typing', function(data){
              socket.broadcast.emit('typing',data)
            });

            // Handle input events
            socket.on('input', function(data){
                let name = data.name;
                let message = data.message;

                console.log(name + ' sent the message: ' + message);

                // Check for name and message
                if(name == '' || message == ''){
                    // Send error status
                    sendStatus('Please enter a name and message');
                } else {
                    // Insert message

                    if(message.substring(0,9) == '!announce'){//announcement

                        connections[group].forEach(function(user){
                            if(user != socket.id){//announce to everyone but the sender
                                client.to(user).emit('announcement', message.substring(9));
                            }
                        });

                    }

                    socket.broadcast.emit('clearTyping');
                    chat.insert({name: name, message: message}, function(){

                        connections[group].forEach(function(user){
                            client.to(user).emit('output', [data]);
                        });
                        //client.to(socket.id).emit('output', [data]);
                        //client.emit('output', [data]);

                        // Send status object
                        sendStatus({
                            message: 'Message sent',
                            clear: true
                        });
                    });
                }
            });

            // Handle clear
            socket.on('clear', function(data){
                // Remove all chats from collection
                chat.remove({}, function(){
                    // Emit cleared
                    socket.emit('cleared');
                });
            });

            socket.on('disconnect', function(){
                //console.log('disconnect');
                //removes individual connection from array
                var index = connections[group].indexOf(socket.id);
                if (index > -1) {
                    connections[group].splice(index, 1);
                }
            });

            socket.on('update-chat', function() {
                socket.emit('output');
            });


        });


    });

});
