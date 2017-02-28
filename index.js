var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io')(server);
var fs = require('fs');
var onlines = 0;
var connections = [];
var users = {};
var sessions = {};

Object.prototype.indexOf = function (valueSearch) {

    var index = -1;
    var count = 0;
    for(var val in this){
        if(val === valueSearch){
            index = count;
            return index;
        }
        count++;
    }
    return index;
}

sessions["__public_session__"] = [];

app.use(express.static(__dirname + "/public"));

app.get('/', (req, res) => {
    res.sendFile(__dirname + "/index.html");
});

function getDateNow() {

    var datenow = new Date();
    datenow = [`${datenow.getHours()}`, `${datenow.getMinutes()}`, `${datenow.getSeconds()}`];
    return `${datenow[0].length < 2 ? '0' + datenow[0] : datenow[0]} : ${datenow[1].length < 2 ? '0' + datenow[1] : datenow[1]} : ${datenow[2].length < 2 ? '0' + datenow[2] : datenow[2]}`;
}

function sendToSession (type, data) {

    if(sessions[data.session] !== undefined){
        if(type === "s_message"){
            data.msg.date = getDateNow();
            sessions[data.session].forEach(socket => {
                socket.emit("receivemessage", data.msg);
            });
        }

        else if(type === "event_conn"){

            sessions[data.session].forEach(socket => {
                socket.emit("eventclient", {user:data.username, msg:data.msg, session:data.session, date:getDateNow()});
            });
        }

        else if(type === "event_write"){

            if(data.type === "wr"){

                sessions[data.session].forEach(socket => {
                    socket.id !== data.id ? socket.emit("useriswritten", data.session) : null;
                });
            }
            else if(data.type === "stopwr"){

                sessions[data.session].forEach(socket => {
                    socket.id !== data.id ? socket.emit("userstopedwritten", data.session) : null;
                });
            }
        }

        else if(type === "emited_onlines"){

          sessions[data.session].forEach(socket => {
                socket.emit("onlines", sessions[data.session].length);
          });
        }
    }
}

io.sockets.on('connection', socket => {

    // console.log(socket.id)
    // console.log("new client is connected");
    socket.sessions = [];
    socket.on("disconnect", () => {

        if(users[socket.username] !== undefined){

            socket.sessions.forEach(session => {

                if(sessions[session] !== undefined){

                    sendToSession("event_conn", {username:users[socket.username].username, session, msg:"se desconectou"});
                    sessions[session].splice(sessions[session].indexOf(socket), 1);
                    session !== '__public_session__' && sessions[session].length <= 0 ? delete sessions[session] : null
                }


            });

            connections.splice(connections.indexOf(users[socket.username].username), 1);



            delete users[socket.username];

        }

    });

    socket.on("sendmessage", data => {

        sessions[data.session] !== undefined ? sendToSession("s_message", {session:data.session, msg:data} ) : null;

    });

    socket.on("checklogin", userinfo => {

        var user;
        if(users[userinfo.username] === undefined){
            fs.readFile("users/users.json", (err, data) => {
                if(err)
                    throw err;

                user = JSON.parse(data);

                user = user[userinfo.username] !== undefined ? user[userinfo.username] : false;

                if(user !== false && userinfo.pass === user.password){

                    socket.username = userinfo.username;

                    socket.emit('login_ok', userinfo.username);
                    users[userinfo.username] = {id:socket.id, username:userinfo.username, connected:true};
                    connections[userinfo.username] = {id:socket.id};
                    onlines++;
                    io.sockets.emit("onlines", onlines);
                }

                else {
                    socket.emit('login_fail');
                }

            });

        } else {
            socket.emit('userisconnected');
        }


    });

    socket.on("checkloginguest", userinfo => {

          if(users[userinfo.username] === undefined){

            socket.username = userinfo.username;

            socket.emit('login_ok', userinfo.username);

            users[userinfo.username] = {id:socket.id, username:userinfo.username, connected:true};
            connections[userinfo.username] = {id:socket.id};
            onlines++;
            io.sockets.emit("onlines", onlines);
            //socket.broadcast.emit("eventclient", {user:userinfo.username, msg:'acabou de se conectar'});

          } else {
              socket.emit('userisconnected');
          }
    });

    socket.on("createnewsession", session => {

        if(sessions[session] === undefined){
            socket.session = session;
            socket.sessions.push(session);
            sessions[session] = [];
            sessions[session].indexOf(socket) >= 0 ? null : sessions[session].push(socket);

            socket.emit("erroronsession", false);

        }
        else
           socket.emit("erroronsession", "falha ao criar nova sessão , esta sessão já existe !");

    });

    socket.on("newsession", session => {

        if(sessions[session] !== undefined){


            socket.session = session;
            socket.sessions.push(session);

            sessions[session].indexOf(socket) >= 0 ? null : sessions[session].push(socket);

            socket.emit("erroronsession", false);
            sendToSession("event_conn", {username:users[socket.username].username, session, msg:"acabou de se conectar"});


        }
        else
            socket.emit("erroronsession", "falha ao tentar entrar nesta sessão , sessão inexistente !");

    });

    socket.on("publicsession", () => {

        if(sessions["__public_session__"] !== undefined){

            if(users[socket.username] !== undefined){
                socket.session = '__public_session__';
                socket.sessions.push('__public_session__');

                sessions['__public_session__'].indexOf(socket) >= 0 ? null : sessions['__public_session__'].push(socket);

                socket.emit("erroronsession", false, 'public');
                sendToSession("event_conn", {username:users[socket.username].username, session:'__public_session__', msg:"acabou de se conectar"});

            }
        }
        else
            socket.emit("erroronsession", "falha ao tentar entrar nesta sessão , sessão inexistente !");

    });

    socket.on("written", () =>{

        sendToSession("event_write", {id:socket.id, session:socket.session, type:'wr'});

    });

    socket.on("stopedwritten", () => {
        sendToSession("event_write", {id:socket.id, session:socket.session, type:'stopwr'});
    });

    socket.on('finishsession', session => {

        if(users[socket.username] !== undefined){

              socket.sessions.splice(socket.sessions.indexOf(session.id), 1);
              sessions[session.id].splice(sessions[session.id].indexOf(socket), 1);
              sendToSession("event_conn", {username:users[socket.username].username, session:session.id, msg:"se desconectou"});
              //sessions[session.id].length <= 0 ? sessions.splice(sessions.indexOf(session.id), 1) : null;
              session.id !== '__public_session__' ? sessions[session.id].length <= 0 ? delete sessions[session.id] : null : null;
        }

    });

    socket.on("changesession", session => {
        socket.session = session;
    });

});

server.listen(process.env.PORT || 3000, (err) => {
    if(err)
        throw err;
    console.log("server is started");
});
