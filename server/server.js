const mongo = require('mongodb').MongoClient;
const client = require('socket.io').listen(4000).sockets;

var connections = new Map();

// Connect to mongo
mongo.connect('mongodb://127.0.0.1/mongochat', function(err, db){
    if(err){
        throw err;
    }

    console.log('MongoDB connected...');

    // Connect to Socket.io
    client.on('connection', function(socket){
        //let the user know they are connected
        //console.log(socket.client.id);

        socket.emit('confirmation');

        socket.on('group', function(group){

            if(connections[group]){//if a connection for the group already exists
                //adds client to the list of connections
                connections[group].push(socket.id);
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

            // Handle input events
            socket.on('input', function(data){
                let name = data.name;
                let message = data.message;

                // Check for name and message
                if(name == '' || message == ''){
                    // Send error status
                    sendStatus('Please enter a name and message');
                } else {
                    // Insert message
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


        });


    });

});