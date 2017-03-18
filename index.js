var express = require('express');
var app = express();
app.use(express.static(__dirname + "/public"));
var server = require('http').createServer(app);
var io = require('socket.io')(server);
var fs = require('fs');
var crypto = require('crypto').createHmac;
var multer = require('multer');
var secret = new String("prototype of a webchat").split("").reverse().join("");
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
sessions.__public_session__._namefilesTemporary = [];


app.get('/', (req, res) => {
    res.sendFile(__dirname + "/index.html");
});

var storagefile = multer.diskStorage({
    destination (request, file, callB) {
        callB(null, `temporaryfiles/`);

    },

    filename (request, file, callB) {
        callB(null, file.fieldname + Date.now() + ".png");
    }

});

function deleteTemporaryFiles (session){
    var unlink = require('fs').unlink
    sessions[session]._namefilesTemporary.forEach(filepath => {
        unlink(filepath);
    });
}

var uploadfile = multer({

    storage:storagefile,

     fileFilter (req, file, callB) {

        if(file.mimetype.substr(0, 5) === "image")
            callB(null, true);
        else
            callB("fail: uploadfile invalid");
    }

}).single("filetemporary");

app.post('/sendfileTemporary', (req, res) => {

    uploadfile(req, res, (err) => {

        if(err)
            console.log(err);
        else {

            var readF = require('fs').readFile;
            var session = req.body.sessionid;
            var user = req.body.username;
            var filepath = "temporaryfiles/" + req.file.filename;
            readF(filepath, "base64",  (err, data) => {

                if(err)
                    console.log(err);

                data.type = 'image';
                sessions[session] !== undefined ? (sessions[session]._namefilesTemporary.push(filepath), sendToSession("s_message", {session, msg:{session, user, msg:data} } )) : null;
                res.send("file upload is ok");
            });
         }
    });
});

function getDateNow() {

    var datenow = new Date();
    datenow = [`${datenow.getHours()}`, `${datenow.getMinutes()}`, `${datenow.getSeconds()}`];
    return `${datenow[0].length < 2 ? '0' + datenow[0] : datenow[0]} : ${datenow[1].length < 2 ? '0' + datenow[1] : datenow[1]} : ${datenow[2].length < 2 ? '0' + datenow[2] : datenow[2]}`;
}

function returnOpenSessions () {

    var valueReturn = [];

    for(session in sessions)
        if(sessions[session].isOpen === true)
            valueReturn.push({name:sessions[session].name, id:session});

    return valueReturn;
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

                    sessions[session].isOpen === true ? io.sockets.emit("getAllSessionsOpen", returnOpenSessions()) : null;
                    sendToSession("event_conn", {username:users[socket.username].username, session, msg:"se desconectou"});
                    sessions[session].splice(sessions[session].indexOf(socket), 1);
                    session === '__public_session__' && sessions[session].length <= 0 ? (deleteTemporaryFiles(session), sessions[session]._namefilesTemporary = []) : null;
                    session !== '__public_session__' && sessions[session].length <= 0 ? (deleteTemporaryFiles(session), delete sessions[session]) : null;

                }


            });

            connections.splice(connections.indexOf(users[socket.username].username), 1);

            delete users[socket.username];

        }

    });

    socket.on("sendmessage", data => {
        data.type = 'message';
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

    socket.on("createnewsession", (session, options) => {

        var sessionhash = crypto('sha256', secret).update(session).digest('hex');

        if(sessions[sessionhash] === undefined && socket.sessions.indexOf(session) === -1){

            socket.sessionName = session;
            socket.session = sessionhash;
            socket.sessions.push(sessionhash);
            sessions[sessionhash] = [];
            sessions[sessionhash].indexOf(socket) >= 0 ? null : sessions[sessionhash].push(socket);
            sessions[sessionhash].isOpen = options.opsess;
            sessions[sessionhash].name = session;
            sessions[sessionhash]._namefilesTemporary = [];
            // option.opsess == true ? opensessions.push({id:sessionhash, name:session}) : null;
            options.opsess === true ? io.sockets.emit("getAllSessionsOpen", returnOpenSessions()) : null;
            socket.emit("erroronsession", false, {id:sessionhash, name:session, opens:options.opsess});

        }
        else
           socket.emit("erroronsession", "falha ao criar nova sessão , esta sessão já existe !");

    });

    socket.on("newsession", session => {

        if(sessions[session] !== undefined && socket.sessions.indexOf(session) === -1){

            socket.session = session;
            socket.sessions.push(session);


            sessions[session].indexOf(socket) >= 0 ? null : sessions[session].push(socket);

            socket.emit("erroronsession", false, {id:session, name:sessions[session].name, opens:sessions[session].isOpen});
            sendToSession("event_conn", {username:users[socket.username].username, session, msg:"acabou de se conectar"});


        }
        else
            socket.emit("erroronsession", "falha ao tentar entrar nesta sessão , sessão inexistente !");

    });

    socket.on("publicsession", () => {

        if(sessions["__public_session__"] !== undefined && socket.sessions.indexOf('__public_session__') === -1){

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
              if(session.id !== '__public_session__' && sessions[session.id].length <= 0){
                  deleteTemporaryFiles(session.id);
                  delete sessions[session.id];
                  io.sockets.emit("getAllSessionsOpen", returnOpenSessions());
              }
              else {
                  sessions[session.id].length <= 0 ? (deleteTemporaryFiles(session.id), sessions[session.id]._namefilesTemporary = []) : null;
              }

        }

    });

    socket.on("changesession", session => {
        socket.session = session;
        sessions[session] !== undefined ? socket.sessionName = sessions[session].name : null;
    });

    socket.on("reqAllSessionsOpen", () =>{
        socket.emit("getAllSessionsOpen", returnOpenSessions());
    });

});

server.listen(process.env.PORT || 3000, (err) => {
    if(err)
        throw err;
    console.log("server is started");
});
