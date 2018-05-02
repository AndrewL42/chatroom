var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var port = process.env.PORT || 1134;

var clients = [];
var clientsId = [];

app.get('/', function(req, res){
  res.sendFile(__dirname + '/client.html');
});

io.on('connection', function(socket){
    socket.on('connect message', function(connect){
        clients.forEach(function(client){
            if(client.username === connect.username) {
                connect.username = connect.username + Math.ceil((Math.random()*100)).toString();
            }
        })
        io.emit('connect message', connect.username);
        socket.username = connect.username;
        clients.push(socket);
        clientsId.push(socket.id);
        socket.on('chat message', function(msg){
            io.emit('chat message', socket.username +": " + msg.dm + " " + msg.message);
        });
        socket.on('disconnect', function(){
            io.emit('chat message', socket.username + ' left')
            clients.splice(clients.indexOf(socket), 1);
            clientsId.splice(clientsId.indexOf(socket), 1);
        })
        socket.on('private message', function(sendTo, msg){
            var sendToIdPos;
            var sentFromIdPos;
            for(var i = 0; i < clients.length; i++) {
                if(clients[i].username === sendTo) {
                    sendToIdPos = i;
                }
                if(clients[i].username === socket.username) {
                    sentFromIdPos = i;
                }
            }
            io.to(clientsId[sentFromIdPos]).emit('chat message', socket.username + ": " + "[@" + msg.dm + "] " + msg.message);
            io.to(clientsId[sendToIdPos]).emit('private message', socket.username + ": " + "[@" + msg.dm + "] " + msg.message);
        })
    })
    
  });

http.listen(port, function(){
  console.log('listening on: ' + port);
});