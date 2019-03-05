const mongo = require('mongodb').MongoClient;
const client = require('socket.io').listen(4000).sockets;
'use strict';
const crypto = require('crypto');
const async = require('async');
const nodemailer = require("nodemailer");
var express = require('express');
var app = express();
const path = require('path');
var router  = express.Router();
var bodyParser = require("body-parser");


app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
//Creating HTTP Server on port 3000
app.listen(3000, function () {
    console.log('HTTP server started on port 3000 ....')
});
//Send index page to the server
app.use('/', router);

var msg = require('./log.js'); //server status library created by Joe

// Connect to mongo
mongo.connect('mongodb://127.0.0.1/mongochat', function(err, db){
    if(err){
        throw err;
    }

    msg.important("mongodb_connected");

    //When user click on the sent link in his email account checks wether the token is expired
    router.get('/reset/:token', function(req, res) {
        let cursor = db.collection('Profiles');
        cursor.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, function(err, user) {
          if (!user) {
          res.send('Password reset token is invalid or has expired.');
        }else{ //if the token is valid redirects the user to the reset password page
            res.sendFile(path.join(__dirname+'/../client/reset.html'));
          }
        });
    });

    //When the user clicks reset button it checks wether the token is valid and if so it sends an email Notifying the user
    router.post('/reset/:token', function(req, res) {
      async.waterfall([
        function(done) {
          let cursor = db.collection('Profiles');
          cursor.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, function(err, user) {
            if (!user) {
            res.send('Password reset token is invalid or has expired.');
            }
            //Hash and Salt the new password passed by the user
            if(req.body.password === req.body.repeatPassword) {
              var salt = genRandomString(16);
              var passwordData = sha512(req.body.password, salt);
              var tokenQuery = { resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } };
              var newValues = { $set: { resetPasswordToken: undefined,
                                        resetPasswordExpires: undefined,
                                        Password: passwordData.passwordHash,
                                        Salt: passwordData.salt } };
              db.collection("Profiles").updateOne(tokenQuery, newValues, function (err, res) {
                    done(err, user);
              });
            }else { //Notifying the user that password are not the same
              console.log('Passwords do not match!');
              res.send('Passwords do not match use the link again!');

            }
          });
        },
        //When user has typed a new password it sends and email
        function(user, done) {
          let transporter = nodemailer.createTransport({
              service: 'Gmail',
              auth: {
                  user: 'chatappelectron@gmail.com', // generated ethereal user
                  pass: 'H@$hAnd$a!t.' // generated ethereal password
              },
          });

        var mailOptions = {
          from: '"Chat App" <chatappelectron@gmail.com>', // sender address
          to: user.Email, // list of receivers
          subject: 'Your password has been changed',
          text: 'Hello ,'+ user.Name +'\n\n' +
            'This is a confirmation that the password for your account '+ user.Email +' has just been changed.\n'
          };
          //this pack all of the information above and sends it to the given email
          let info = transporter.sendMail(mailOptions, function(err) {
            res.send('Password Reset');
            console.log('Password successfully reset!');
            done(err);
          });
        }
      ], function (err) {
          if (err) return next(err);
      });
    });

    // Read from the database and console output
    let cursor = db.collection('Profiles');
    cursor.find().toArray(function(err, docs) {
        if(docs.length == 0) {
            msg.log("There are currently no documents available.");
        } else if(docs.length >= 1) {
            msg.list(docs);
        }
    });

    //Create a random string for hash and salt
    var genRandomString = function(length){
    return crypto.randomBytes(Math.ceil(length/2))
            .toString('hex') /** convert to hexadecimal format */
            .slice(0,length);   /** return required number of characters */
          };

    var sha512 = function(password, salt){
      var hash = crypto.createHmac('sha512', salt); /** Hashing algorithm sha512 */
      hash.update(password);
      var value = hash.digest('hex');
      return {
        salt:salt,
        passwordHash:value
      };
    };

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
          var userEmail = {Email: email};
          let cursor = db.collection('Profiles');

          //Search the database for match
          cursor.findOne(userEmail,function(err,result){
            var success = 1;
            if (err) throw err;
            else if(result == null){
              success = 0;
              socket.emit('login', success);
            //If email match is found but the passwords don't match
            }else{
              var userSalt = result.Salt;
              var userHashSalt = sha512(password, userSalt);
              var userDetails = {Email: email, Password: userHashSalt.passwordHash};

              cursor.findOne(userDetails,function(err,result){
                if (err) throw err;
                else if(result == null){
                  success = 2;
                  socket.emit('login', success);
                }else{
                  socket.emit('login', success);
                }
              });
            }
          });
        });
        // forgot password
        socket.on('forgotPass', function(emailResetInput){
            async.waterfall([
                function (done) {
                    crypto.randomBytes(20, function (err, buf) {
                        var token = buf.toString('hex');
                        done(err, token);
                    });
                },
                function (token, done) {
                    let cursor = db.collection('Profiles');
                    var emailQuery = { Email: emailResetInput };
                    var newValues = { $set: { resetPasswordToken: token, resetPasswordExpires: Date.now() + 3600000 } };
                    cursor.findOne(emailQuery, function (err, result) {
                        if (result != null) {
                            db.collection("Profiles").updateOne(emailQuery, newValues, function (err, res) {
                                if (err) throw err;
                                done(err, token, result);
                            });
                        }else {
                        socket.emit('forgotPass', 'notFound');
                        console.log("No Entry");
                      }
                    });
                },
                function (token, result, done) {
                    let transporter = nodemailer.createTransport({
                        service: 'Gmail',
                        auth: {
                            user: 'chatappelectron@gmail.com', // generated ethereal user
                            pass: 'H@$hAnd$a!t.' // generated ethereal password
                        },
                    });

                    // setup email data with unicode symbols
                    let mailOptions = {
                        from: '"Chat App" <chatappelectron@gmail.com>', // sender address
                        to: emailResetInput, // list of receivers
                        subject: "Forgotten Password", // Subject line
                        text: 'You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n' +
                            'Please click on the following link, or paste this into your browser to complete the process:\n\n' +
                            'http://localhost:3000' + '/reset/' + token + '\n\n' +
                            'If you did not request this, please ignore this email and your password will remain unchanged.\n'
                    };
                    // send mail with defined transport object
                    let info = transporter.sendMail(mailOptions);
                    socket.emit('forgotPass', 'sent');
                }
            ], function (err) {
                if (err) return next(err);
                console.log('problem');
            });
        });

        //Get the user sign up fills for register into the database
        socket.on('signUp', function(data){
          let name = data.name;
          let email = data.email;
          let password = data.password;
          let repeatedPass = data.repeatedPass;
          var userEmail = {Email: email};
          var output;
          //Check is the passwords are the same
          if(password == repeatedPass){
            let cursor = db.collection('Profiles');
            //Check is the email is taken
            cursor.findOne(userEmail,function(err,result){
              if(result == null){
                var salt = genRandomString(16);
                var passwordData = sha512(password, salt);
                db.collection('Profiles').insertOne({
                    Name: name,
                    Email: email,
                    Password: passwordData.passwordHash,
                    Salt: passwordData.salt
                });
                output = "success";
                socket.emit('signUp', output);
              }
              else{
                output = "takenEmail";
                socket.emit('signUp', output);
              }
            });
          }else{
            output = "diffPass";
            socket.emit('signUp',output);
          }
        });

        //swapping groups / joining a group
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

        //update the chat for a given socket
        socket.on('refreshChat', function(group) {
            //updates the chat for the user
            let chat = db.collection(group);
            // Get chats from mongo collection (limited to 100 documents);
            chat.find({type : 'msg'}).limit(100).sort({_id:1}).toArray(function(err, res){
                if(err){
                    throw err;
                }
                // Tell the client to output the information (chat history)
                socket.emit('output', res);
            });
        })

        //refresh the scurm tasks for a given socket
        socket.on('refreshScrum', function(group, sprint) {
            //fetch the tasks for a given group
            db.collection(group).findOne({sprintName : sprint}, function(err, res) {
                if(err) throw err;

                //tell client to update scrum board -- pass array of tasks to client
                if(res != undefined) {
                    socket.emit('updateScrum', sprint, res.tasks);
                }
            })
        });
        
        //fetch the array of users for a given group
        socket.on('fetchUserList', function(group, fn) {
            db.collection('GroupData').findOne({groupName : group}, function(err, res) {
                if(err) throw err;
                //return the array of members back to the user
                if(res != undefined ){ 
                    fn(res.members);
                }
                
            })
        });

        //add task to collection for a given group & sprint
        socket.on('addTask', function(group, sprint, task) {
            msg.log('adding task...');
            db.collection(group).updateOne({
                sprintName : sprint
            }, {
                $push : {
                    tasks : task
                }
            })
        });

        //remove task from collection for a given sprint and task id
        socket.on('removeTask', function(group, sprint, task_id) {
            msg.log('removing task_id : ' + task_id + ' from group ' + group + ' for sprint ' + sprint);
            db.collection(group).updateOne({
                sprintName : sprint
            }, {
                $pull : { tasks : {
                    id : task_id
                    }  
                }
            })
        })

        //updates a given task in the db
        socket.on('updateTask', function(group, sprint, task, query, values) {
            msg.log('updating task ' + task.id + ' for group ' + group + ' for sprint ' + sprint);

            db.collection(group).update(query, values, function(err, res) {
                if(err) throw err;

                console.log('updated...');
            })
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
                    client.to(group).emit('announcement', message.substring(9), name);
                }

                // socket.broadcast.emit('clearTyping', name);
                chat.insert({type : 'msg', name: name, message: message, timestamp : timestamp}, function(){
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
            groups.find({members : username}).toArray(function(err, res) {
                socket.emit('updateGroups', res);
            });
        })

        socket.on('createGroup', function(data, fn) {
            //add the user who created the group to the memberslist
            data.members = [data.username];
            //create the group data document
            db.collection('GroupData').insert(data, function() {
                var pbdata = { sprintName : 'product backlog', tasks : []};
                db.collection(data.groupName).insert(pbdata);
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
