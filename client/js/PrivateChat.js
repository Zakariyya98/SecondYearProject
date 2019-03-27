module.exports = function(io){

    io.on('connection', (socket) => {
        socket.on('join PM', (pm) => {
            socket.join(pm.room1);
            socket.join(pm.room2);
        });

        socket.on('private message', (message, callback) => {
            io.to(message.room).emit('new message', {
                text: message.text,
                sender: message.sender
            });

            io.emit('message display', {});

            callback();
        });

        socket.on('refresh', function(){
            io.emit('new refresh', {});
        });

    });
}

$(document).ready(function(){
    var socket = io();

    var paramOne = $.deparam(window.location.pathname);
    var newParam = paramOne.split('.');

    var username = newParam[0];
    $('#receiver_name').text('@'+username);

    swap(newParam, 0, 1);
    var paramTwo = newParam[0]+'.'+newParam[1];

    socket.on('connect', function(){
        var params = {
           room1: paramOne,
           room2: paramTwo
        }

        socket.emit('join PM', params);

        socket.on('message display', function(){
            $('#reload').load(location.href + ' #reload');
        });

        socket.on('new refresh', function(){
            $('#reload').load(location.href + ' #reload');
        });
    });

    socket.on('new message', function(data){
        var template = $('#message-template').html();
        var message = Mustache.render(template, {
            text: data.text,
            sender: data.sender
        });

        $('#messages').append(message);
    });

    $('#message_form').on('submit', function(e){
        e.preventDefault();

        var msg = $('#msg').val();
        var sender = $('#name-user').val();

        if(msg.trim().length > 0){
            socket.emit('private message', {
                text: msg,
                sender: sender,
                room: paramOne
            }, function(){
                $('#msg').val('');
            });
        }
    });

    $('#send-message').on('click', function(){
        var message = $('#msg').val();

        $.ajax({
            url:'/chat/'+paramOne,
            type: 'POST',
            data: {
                message: message
            },
            success: function(){
                $('#msg').val('');
            }
        })
    });
});

function swap(input, value_1, value_2){
    var temp = input[value_1];
    input[value_1] = input[value_2];
    input[value_2] = temp;
}

module.exports = function(async, Users, Message, FriendResult){
    return {
        SetRouting: function(router){
            router.get('/chat/:name', this.getchatPage);
            router.post('/chat/:name', this.chatPostPage);
        },

        getchatPage: function(req, res){
            async.parallel([
                function(callback){
                    Users.findOne({'username': req.user.username})
                        .populate('request.userId')
                        .exec((err, result) => {
                            callback(err, result);
                        })
                },

                function(callback){
                    const nameRegex = new RegExp("^" + req.user.username.toLowerCase(), "i")
                    Message.aggregate(
                        {$match:{$or:[{"senderName":nameRegex}, {"receiverName":nameRegex}]}},
                        {$sort:{"createdAt":-1}},
                        {
                            $group:{"_id":{
                            "last_message_between":{
                                $cond:[
                                    {
                                        $gt:[
                                        {$substr:["$senderName",0,1]},
                                        {$substr:["$receiverName",0,1]}]
                                    },
                                    {$concat:["$senderName"," and ","$receiverName"]},
                                    {$concat:["$receiverName"," and ","$senderName"]}
                                ]
                            }
                            }, "body": {$first:"$$ROOT"}
                            }
                        }, function(err, newResult){
                            const arr = [
                                {path: 'body.sender', model: 'User'},
                                {path: 'body.receiver', model: 'User'}
                            ];

                            Message.populate(newResult, arr, (err, newResult1) => {
                                callback(err, newResult1);
                            });
                        }
                    )
                },

                function(callback){
                    Message.find({'$or':[{'senderName':req.user.username}, {'receiverName':req.user.username}]})
                        .populate('sender')
                        .populate('receiver')
                        .exec((err, result3) => {
                            callback(err, result3)
                        })
                }
            ], (err, results) => {
                const result1 = results[0];
                const result2 = results[1];
                const result3 = results[2];

                const params = req.params.name.split('.');
                const nameParams = params[0];

                res.render('private/privatechat', {title: 'Footballkik - Private Chat', user:req.user, data: result1, chat: result2, chats:result3, name:nameParams});
            });
        },

        chatPostPage: function(req, res, next){
            const params = req.params.name.split('.');
            const nameParams = params[0];
            const nameRegex = new RegExp("^"+nameParams.toLowerCase(), "i");

            async.waterfall([
                function(callback){
                    if(req.body.message){
                        Users.findOne({'username':{$regex: nameRegex}}, (err, data) => {
                           callback(err, data);
                        });
                    }
                },

                function(data, callback){
                    if(req.body.message){
                        const newMessage = new Message();
                        newMessage.sender = req.user._id;
                        newMessage.receiver = data._id;
                        newMessage.senderName = req.user.username;
                        newMessage.receiverName = data.username;
                        newMessage.message = req.body.message;
                        newMessage.userImage = req.user.UserImage;
                        newMessage.createdAt = new Date();

                        newMessage.save((err, result) => {
                            if(err){
                                return next(err);
                            }
                            callback(err, result);
                        })
                    }
                }
            ], (err, results) => {
                res.redirect('/chat/'+req.params.name);
            });

            FriendResult.PostRequest(req, res, '/chat/'+req.params.name);

        }
    }
}
