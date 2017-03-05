String.prototype.countOf = function countOf(string) {

    var count = 0;
    var i = this.length;
    while(i--){
        if(this[i] === string)
            count++
    }
    return count;
}
var userinfo = {
    nickname:''
}
var control_head;
var chat = {
    props:["userinfo", "socket"],
    template:`<div> <div id="chat" class="row"> <div> <ul id="slide-out" data-activates="slide-out" class="side-nav"> <li> <div class="userView"> </div></li><li class=""><a href="#"><i class="material-icons white-text circle teal lighten-3 col s3 center">perm_identity</i>{{userinfo.nickname}}</a></li><li> <form onsubmit="return false;"> <div class="input-field z-depth-1"> <input id="session" type="search" placeholder = "sessão ID/Nome" @keydown.enter="newsession" v-model="sessioninsearch" required> <label class="label-icon" for="session"><i class="material-icons">search</i></label> </div></form> </li><div class = "divider"></div><li> <a><div class="switch"> <label> Privado <input id="opensession" v-model="opensession" type="checkbox"> <span class="lever"></span> Publico </label> </div></a> </li><li> <a class="waves-effect" @click="createnewsession" href="#"> Criar Nova Sessão </a> </li><div class = "divider"></div><li><a @click="publicsession" class="waves-effect" href="#">Iniciar Em Sessão Pública</a></li><li v-if = "startSession"> <a href="#" class = "waves-effect" @click = "startSession = false"> Ver Sessões Abertas </a> </li><li v-else-if = "!startSession && sessionsRegister.length > 0"> <a href="#" class = "waves-effect" @click = "startSession = true"> Voltar As Minhas Sessões </a> </li><li v-if="msgerror.condiction===true"><a class="red-text" href="#">{{msgerror.value}}</a></li></ul> </div><nav> <div class="nav-wrapper teal col s12"> <a href="#" data-activates="slide-out" class="button-collapse nav-s"> <i class="material-icons">menu</i> </a> <ul id="nav-mobile" class="left hide-on-med-and-down"> <li> <a href="#" data-activates="slide-out" class="collapse-navside"><i class="material-icons">menu</i></a></li></ul>  <div class="center" v-if="startSession"> Sua Sessão Atual é : {{sessionName}}</div>  </div></nav> <div v-if="startSession===false" class="row col s12"> <div class="flow-text center"> Sessões Abertas </div> <div class="col s10 offset-s1 collection spc"> <div v-for="sessop in opensessions" class="left"> <a href="#" @click="newsession(sessop)" class="btn transparent teal-text waves-effect waves-teal">{{sessop.name}}</a> </div></div></div> <div v-if="startSession"> <div id="viewmsg"> <div id="showmessages" class="col s12 m12 offset-m1 offset-s1"> <span v-if = "sessionID !== '__public_session__' " class = "">ID : {{sessionID}} </span>  <ul class="col s12 m3 "> <div class="col s12"> <span class="flow-text"> Sessões </span> </div><div class="collection"> <li class="" v-for="(sess, index) in sessions"> <div class="collection-item"> <a @click="changesession(sess.id, sess.name)" v-bind:class="[sess.id===sessionID ? 'teal-text': 'purple-text']" class=" click waves-light waves-effect">{{sess.name}}<span v-if="sessionsNews[sess.id].news > 0" class="new badge">{{sessionsNews[sess.id].news}}</span> </a> <a @click="finishsession(sess)" class="right valign click"><i class="material-icons">close</i></a> </div></li></div><send-file v-bind:data="{session:sessionID, nick:userinfo.nickname}"></send-file></ul> <ul id="msgs" class="col s12 m9 right z-depth-1"> <li v-for="(msg, index) in chat" v-bind:class="[msg.user===userinfo.nickname ? 'fadeInRight' : 'fadeInLeft']" class="msgn animated col s12"> <div v-if="msg.type!=='info' "> <div v-bind:class="[msg.user===userinfo.nickname ? 'right blue white-text' : 'left black-text']" class="chipmodified expand"> <div class=""> <div v-bind:class="[msg.user===userinfo.nickname ? 'right white-text' : 'left teal-text darken-4']" class="col s12"> <span class="nickuser">{{msg.user}}</span> <div class="right datemsg"><i class="material-icons showdatemessage">query_builder</i>{{msg.date}}</div></div></div></br><span v-if = "msg.type === 'message'" ><view-msg :msg = "msg.value"></view-msg></span> <div class = "imgmessage" v-else><img width = "250px" @click = "showBigimg=msg.value" :src="'data:image/png;base64,'+msg.value"> </div></div> </div><div v-else-if="msg.type==='info' "> <div class="col s12 center"> <div class="chipmodified"> <span v-bind:class="msg.class"> {{msg.enphase}} </span> {{msg.value}} <span class="right"> <i class="material-icons configicon">query_builder</i>{{msg.date}}</span></div></div></div></li></ul> </div></div><div class="col s3" v-if="Sevent.iswritten===true && Sevent.session===sessionID"> <span class="teal-text"> Algo está sendo escrito ... </span> </div><div class="page-footer"> <form> <div class="col s12 m9 right"> <div class="input-field col s11 m11"> <i class="material-icons prefix">textsms</i> <textarea id="message" class="materialize-textarea" @keyup="eventkeyupmessage" @keypress="eventkeydownmessage" v-model="message"></textarea> <label for="message">message</label> </div><div id="sendmsg" class="valign-wrapper"> <a @click="sendMessage" class="waves-light waves-effect teal-text"><i class="material-icons">send</i></a> </div></div></form> </div></div> </div> <div v-if = "showBigimg!==''" class = "showimg enter valign-wrapper"><div class = "valing viewimg"><img class = "animated fadeInRight show" @click = "showBigimg=''" :src="'data:image/png;base64,'+showBigimg"></div> </div></div>`,

    mounted () {
        appcontrol.$on("registerComand", (commands) =>{
            this.registerComand(commands, "json");
        });
    },

    created () {

        this.loadEmojiJson();

        this.notifysound = new Audio('/audio/notify.mp3');

        window.addEventListener("blur", () => {
            this.notificationSound = true;
        });
        window.addEventListener("focus", () => {
            this.notificationSound = false;
            this.zeronews();
        });

        window.setTimeout(() => {
            // document.getElementById('showmessages').style.height = `${window.innerHeight / 1.7}px`;
            // document.getElementById('appcontrol').style.height = `${window.innerHeight}px`;
            // document.getElementById('sendmessage').style.top = `${window.innerHeight/7}px`;
            $(".collapse-navside").sideNav();
            $(".nav-s").sideNav();


        }, 50);

        var messages;

        this.socket.on("getAllSessionsOpen", opSessions =>{
            this.opensessions = opSessions;
        });

        this.socket.emit("reqAllSessionsOpen");

        // setInterval(() => {
        //   console.log(this.registerComands);
        // });

        this.socket.on("receivemessage", data =>{


              messages = document.querySelector("#msgs");
              if(this.registerComands.onSays.length > 0)
                  if(data.user !== this.userinfo.nickname)
                      this.registerComands.emit("onSays", data.msg);

              this.notificationSound === true ? data.session === this.sessionID ? (this.soundNotification(), control_head.notifications++) : (this.soundNotification(), control_head.secondarynotify++) : null;

              this.chatStorage[data.session] !== undefined ? this.chatStorage[data.session].push({type:data.type, session:data.session, user:data.user, value:data.msg, date:data.date}) : null;
              this.sessionsNews[data.session] !== undefined ? this.sessionID !== data.session ? this.sessionsNews[data.session].news++ : null : null;

              window.setTimeout(() => {
                  messages.scrollTop = messages.scrollHeight;
                  $('.materialboxed').materialbox();
              }, 50);

        });

        this.socket.on('onlines', onlines => {
            this.usersonline = onlines;
        });

        this.socket.on("useriswritten", session => {
            this.Sevent = {iswritten:true, session};
        });

        this.socket.on("userstopedwritten", session => {
            this.Sevent = {iswritten:false, session};
        });

        this.socket.on("eventclient", data => {
            messages = document.querySelector("#msgs");
            this.chatStorage[data.session] !== undefined ? this.chatStorage[data.session].push( {type:'info', enphase:data.user, value:data.msg , date:data.date, class:'cyan-text darken-3'} ) : null;
            messages.scrollTop = messages.scrollHeight;
        });

        this.socket.on("erroronsession", (err, data) => {
            if(err)
                this.msgerror = {condiction:true, value:err}

            else {
                this.startSession = true;
                this.msgerror.condiction = true ? this.msgerror = { condiction:false, value:'' } : null;

                if(data === 'public'){

                    this.sessionID = '__public_session__';

                    if(this.sessionsRegister.indexOf(this.sessionID) === -1){

                        this.sessionName = "Sessão Pública";
                        this.sessionsNews[this.sessionID] = {news:0};
                        this.sessions.push({id:this.sessionID, name:this.sessionName});
                        this.chatStorage[this.sessionID] = [];
                        this.chat = this.chatStorage[this.sessionID];
                        this.sessionsRegister.push(this.sessionID);
                        $('#sidenav-overlay').trigger("click");

                    }

                }
                else {

                    this.sessionID = data.id;
                    if(this.sessionsRegister.indexOf(this.sessionID) === -1){


                        this.sessionName = data.name;
                        this.sessioninsearch = '';
                        this.sessionsNews[this.sessionID] = {news:0};
                        this.sessions.push({id:this.sessionID, name:this.sessionName, open:data.opens});
                        this.chatStorage[this.sessionID] = [];
                        this.chat = this.chatStorage[this.sessionID];
                        this.sessionsRegister.push(this.sessionID);
                        $("#sidenav-overlay").trigger("click");

                    }

                }

            }

        });

    },

    data () {

        return {

            socket:null,
            message:'',
            messagehtml:'',
            canSendMessage:true,
            chatStorage:[],
            chat:[],
            messages:[],
            infos:[],
            usersonline:0,
            Sevent:{},
            onstoped:null,
            startSession:false,
            sessioninsearch:'',
            sessionID:'',
            opensession:false,
            opensessions:[],
            sessions:[],
            sessionsNews:[],
            sessionsRegister:[],
            sessionName:'',
            msgerror:{
                condiction:false,
                value:''
            },
            notificationSound:false,
            showBigimg:'',
            emojiInfo:'',
            registerComands:{
                onSays:[],
                emit (prop, data) {
                    this[prop].forEach(obj => {
                        obj.method(data);
                    });
                },
                registers:[],
            },
        }
    },

    computed:{

        /*
              //
        */
    },

    watch : {

        startSession () {

            if(this.startSession === true){

                window.setTimeout(() => {

                    document.getElementById('msgs').style.height = `${window.innerHeight / 1.7}px`;
                    document.getElementById('appcontrol').style.height = `${window.innerHeight - 20}px`;

                }, 50);
            }
        }
    },

    methods:{

        sendMessage () {

            if(this.message !== '' && this.message !=='\n' && this.canSendMessage == true){
                this.socket.emit("sendmessage", {session:this.sessionID, user:this.userinfo.nickname, msg:this.messagehtml !== '' ? this.messagehtml : this.message});
                this.canSendMessage = false;
                document.getElementById('message').value = '';    // for clear message field on firefox;
                this.message = '';
                this.messagehtml = '';
            }

        },

        eventkeydownmessage (evt) {

            this.verifyIsEmoji();

            if(evt.keyCode === 13 && this.message !== '' && this.canSendMessage === true)
                if(this.message[0] === "@")
                    (this.registerComand(this.message), this.message = '', document.getElementById('message').value = '');
                else
                    this.sendMessage();
            else
                this.socket.emit("written");
        },

        eventkeyupmessage (evt) {

            this.verifyIsEmoji();

            clearTimeout(this.onstoped);
            this.onstoped = window.setTimeout(() => {

                this.socket.emit("stopedwritten");

            }, 700);
            if(this.message.countOf('\n') === this.message.length || this.message.countOf(' ') === this.message.length){

                this.message = '';
                this.canSendMessage = true;
            }
            else {
                this.canSendMessage = true;
            }

        },

        createnewsession () {

            if(this.sessioninsearch !== ''){
                this.socket.emit("createnewsession", this.sessioninsearch, {opsess:this.opensession});
                this.opensession = false;
            }

            else {

                this.msgerror = { condiction:true, value:'Preencha O Campo "Session ID/Nome" ' };
                document.getElementById('session').focus();
            }

        },

        newsession () {

            if(arguments.length > 0 && arguments[0].id !== undefined){
                if(this.sessionsRegister.indexOf(arguments[0].id) >= 0)
                    this.changesession(arguments[0].id, arguments[0].name);
                else
                    this.socket.emit("newsession", arguments[0].id);
            }

            else if(this.sessioninsearch !== ''){
                this.socket.emit("newsession", this.sessioninsearch);
            }
        },

        publicsession () {

            if(this.sessionID !== '__public_session__')
                this.socket.emit("publicsession");
        },

        changesession (id, name) {
            this.startSession === false ? this.startSession = true : null;
            messagedom = document.querySelector('#msgs');
            this.sessionID = id;
            this.sessionName = name;
            this.chat = this.chatStorage[this.sessionID];
            this.zeronews();
            this.socket.emit("changesession", id);
            window.setTimeout(() => {
              messagedom !== null && messagedom !== undefined ? messagedom.scrollTop = messagedom.scrollHeight : null;
            }, 50);
        },

        finishsession (session) {
            if(session !== undefined){
                this.sessionsRegister.splice(this.sessionsRegister.indexOf(session.id), 1);
                this.sessions.splice(this.sessions.indexOf(session), 1);
                this.socket.emit("finishsession", session);
                this.sessionsRegister.length === 0 ? this.startSession = false : null;
                this.sessions[0] !== undefined ? this.changesession(this.sessions[0].id, this.sessions[0].name) : this.sessionID = '';

            }
        },

        zeronews () {

              this.sessionsNews[this.sessionID].news > 0 ? (control_head.secondarynotify -= this.sessionsNews[this.sessionID].news, this.sessionsNews[this.sessionID].news = 0) : null;

              control_head.notifications = 0;
        },

        soundNotification () {
            this.notifysound.play();
        },

        loadEmojiJson () {

            var xhr = new XMLHttpRequest();
            xhr.open("GET", "/emoji.json", true);
            xhr.onload =  () => {
                if(xhr.status === 200){
                    this.emojiInfo = JSON.parse(xhr.responseText);
                }
                else
                    console.log("fail on load emoji Json");
            };
            xhr.send();
        },

        verifyIsEmoji () {

              var emoji = "null";

              this.message.replace(/:(.*?):/gi,  (x, y) => {
                  if(y in this.emojiInfo)
                      emoji = this.emojiInfo[y];
                  else
                      emoji = "null";
              });

              if(!(emoji === "null")){

                // this.messagehtml = this.message.replace(/:(.*?):/gi, (x, y) => {
                //     if(y in this.emojiInfo)
                //         return this.emojiInfo[y];
                //     return x;
                // });

                  this.message = this.message.replace(/:(.*?):/gi, (x, y) => {
                      if(y in this.emojiInfo)
                          return this.emojiInfo[y];
                      return x;
                  });
                  emoji = "null";
             }
        },

          registerComand (command) {
              var commands;
              var socket = this.socket;

              var self = {
                  sessionID:this.sessionID,
                  nick:this.userinfo.nickname,

              };
              if(arguments[1] !== undefined && arguments[1] === "json"){

                  try {

                      commands = JSON.parse(command);

                  }
                  catch (err){

                      console.log(err);
                  }
                  finally{

                      if(this.registerComands.onSays !== undefined){
                          for(msg in commands){
                              if(this.registerComands.registers[msg] === undefined){
                                  this.registerComands.onSays.push({

                                        say:msg,
                                        response:commands[msg],
                                        method (msg) {
                                            if(msg === this.say){
                                                socket.emit("sendmessage", {session:self.sessionID, user:self.nick, msg:this.response});
                                            }
                                        }
                                   });
                                   this.registerComands.registers.push(msg);
                               }
                           }
                      }
                  }
              }
              else {

                  commands = command.split(',').length > 1 ? command.split(',') : [command];

                  for(var j = 0; j < commands.length; j++){

                      command = commands[j].split(":");

                      if(this.registerComands[command[0].substr(1)] !== undefined){

                          this.registerComands[command[0].substr(1)].push({

                                say:command[1],
                                response:command[2],
                                method (msg) {
                                    if(msg === this.say){
                                        socket.emit("sendmessage", {session:self.sessionID, user:self.nick, msg:this.response});
                                    }
                                }
                          });
                      }
                  }
              }
        },
    },
};

Vue.component("menu-app",{

    template:'<div> <div class="card-panel teal lighten-2"> <span class="white-text"> {{message}} </span> </div> </div>',

    data () {
        return {
            message:'this is a prototype of webchat'
        }
    },

});

Vue.component("view-msg", {

    props:["msg"],

    template:'<div><span ref = "span">{{msg}}</span></div>',
    data () {

        return {
            teste:'este é o teste'
        };
    },

});

var login = {

    props:["socket"],
    template:`<div> <div class="container"> <menu-app></menu-app> <div class="row"> <div id = "login" class="col s12 m4 offset-m4 z-depth-1"> <form class="right" onsubmit="return false;"> <div class="input-field col s12"> <input id="username" v-model="username" type="text" class="validate"> <label for="username"> Username </label> </div><div class="input-field col s12"> <input id="password" v-model="password" type="password" class="validate"> <label for="password">Password</label> <button @click="checklogin('1')" class="waves-effect waves-light btn" type="button"> Login </button> <button @click="checklogin('2')" class="waves-effect waves-light btn" type="button"> guest </button> <div class="red-text" v-if="showmessageerror===true">{{errormessage}}</div></div></form> </div></div></div> </div>`,

    created () {

        this.socket.on('login_ok', username => {
            appcontrol.viewpage = 'chat';
            appcontrol.userinfo.nickname = username;

        });

        this.socket.on('login_fail', () => {
              this.showmessageerror = true;
              this.errormessage = "falha ao tentar autenticação";
        });

        this.socket.on('userisconnected', () => {
          this.showmessageerror = true;
          this.errormessage = "Usuário já está conectado";
        });
    },

    data () {
        return {

            username:'',
            password:'',
            showmessageerror:false,
            errormessage:'',
        }
    },

    methods:{
        checklogin () {

            if(arguments[0] === '1'){
                if(this.username === '' || this.password === ''){

                    this.showmessageerror = true;
                    this.errormessage = "Preencha Todos Os Campos";
                }
                else
                    this.socket.emit('checklogin', {username:this.username, pass:this.password});
            }

            else if(arguments[0] === '2'){

                if(this.username === ''){

                    this.showmessageerror = true;
                    this.errormessage = "Escolha um nome de usuário";

                } else {
                    this.socket.emit('checkloginguest', {username:this.username});
                }
            }
        }
    }
}

Vue.component("send-file", {

    props:["data"],
    template:'<div> <div id = "menuoptchat" class="fixed-action-btn horizontal click-to-toggle right"> <a class="btn-floating btn-large teal"> <i class="material-icons">menu</i> </a> <ul> <li><a class="btn-floating red disabled"><i class="material-icons">insert_chart</i></a></li><li><a class="btn-floating yellow darken-1 disabled"><i class="material-icons">format_quote</i></a></li><li><a class="btn-floating cyan accent-4 disabled" ><i class="material-icons">note_add</i></a></li><li><a @click = "inputfile.click()" class="btn-floating blue"><i class="material-icons">attach_file</i></a></li></ul> </div> <div class = "col s12 center" id = "result" v-html = "result"></div> </div>',

    created () {

        this.inputfile.setAttribute("type", "file");
        this.inputfile.setAttribute("id", "filetemporary");
        this.inputfile.setAttribute("name", "filetemporary");
        this.img.setAttribute("class", "animated fadeInRight imgpreview");

        this.previewimg.setAttribute("class", "showimg");

        this.inputfile.addEventListener("change", this.preparedSendFile);

        this.xhr.upload.addEventListener("progress", this.onProgressXHR,false);


        //this.inputfile.removeEventListener("change", this.preparedSendFile);
    },

    data () {
        return {

            fileIsSend:false,
            filesend:'',
            previewimg : document.createElement("div"),
            inputfile : document.createElement("input"),
            opts : document.createElement("div"),
            xhr : new XMLHttpRequest(),
            fr  : new FileReader(),
            img : new Image(),
            result:'',
            file:'',
        }
    },

    methods:{

        sendfile(fileinput) {

            var _formdata = new FormData();
            _formdata.append('filetemporary', fileinput, fileinput.name);
            _formdata.append('sessionid', this.data.session);
            _formdata.append('username', this.data.nick);

            this.xhr.open("POST", "/sendfileTemporary", true);

            this.xhr.onload = () => {

                // if(xhr.status === 200)

                if(this.xhr.status !== 200)
                    throw "Falha Ao Tentar Upload Do Arquivo";

            }

            this.xhr.onloadstart = () => {

                this.previewimg.innerHTML = '<div class="preloader-wrapper big active Absolute-Center"> <div class="spinner-layer spinner-blue"> <div class="circle-clipper left"> <div class="circle"></div></div><div class="gap-patch"> <div class="circle"></div></div><div class="circle-clipper right"> <div class="circle"></div></div></div><div class="spinner-layer spinner-red"> <div class="circle-clipper left"> <div class="circle"></div></div><div class="gap-patch"> <div class="circle"></div></div><div class="circle-clipper right"> <div class="circle"></div></div></div><div class="spinner-layer spinner-yellow"> <div class="circle-clipper left"> <div class="circle"></div></div><div class="gap-patch"> <div class="circle"></div></div><div class="circle-clipper right"> <div class="circle"></div></div></div><div class="spinner-layer spinner-green"> <div class="circle-clipper left"> <div class="circle"></div></div><div class="gap-patch"> <div class="circle"></div></div><div class="circle-clipper right"> <div class="circle"></div></div></div></div></div><div class="Absolute-Center progress"><div class="determinate" style="width:0%"></div></div>';

            }

            this.xhr.onloadend = () => {

                this.previewimg.innerHTML = "";
                document.body.removeChild(this.previewimg);
            }

            this.xhr.send(_formdata);

        },

        preparedSendFile (evt) {

            this.file = evt.target.files[0];
            var extension;
            this.fr.onload =  () => {

                if(this.file.type === '' || this.file.type.substr(0, 5) !== "image"){
                    extension = this.getFileExtension();
                    if(extension === "json" && this.file.name === "bot.json"){
                        appcontrol.$emit("registerComand", this.fr.result);
                        this.result = '<div class ="green-text col s12">Arquivo Carregado Com Sucesso <i class = "material-icons">done</i></div>';
                    } else {
                        this.result = '<div class ="red-text col s12"> <i class = "material-icons">warning</i> Arquivo Inválido </div>';
                    }
                }

                else if(this.file.type.substr(0, 5) !== "image")
                    this.result = '<span class = "red-text"> Não é uma arquivo/imagem válida !! </span>';

                else if(this.file.type.substr(0, 5) === "image"){

                    this.opts.setAttribute("class", "col s12 aling-center");

                    this.opts.innerHTML = '<button id = "cancel-sendimage" class = "btn waves-red waves-effect red"> <i class = "material-icons">close</i> </button> <button id = "confirm-sendimage" class = "btn waves-teal waves-effect"> <i class = "material-icons">done</i> </button>';

                    this.img.src = this.fr.result;

                    this.previewimg.appendChild(this.img);
                    this.previewimg.appendChild(this.opts);
                    document.body.appendChild(this.previewimg);

                    document.getElementById('confirm-sendimage').addEventListener("click", this.onConfirm, false);

                    document.getElementById('cancel-sendimage').addEventListener("click", this.onCancel, false);

                    this.result = '';
                }
            }

            this.fr.onloadstart = () =>{
                this.result = `<div class="preloader-wrapper big active"> <div class="spinner-layer spinner-blue"> <div class="circle-clipper left"> <div class="circle"></div></div><div class="gap-patch"> <div class="circle"></div></div><div class="circle-clipper right"> <div class="circle"></div></div></div><div class="spinner-layer spinner-red"> <div class="circle-clipper left"> <div class="circle"></div></div><div class="gap-patch"> <div class="circle"></div></div><div class="circle-clipper right"> <div class="circle"></div></div></div><div class="spinner-layer spinner-yellow"> <div class="circle-clipper left"> <div class="circle"></div></div><div class="gap-patch"> <div class="circle"></div></div><div class="circle-clipper right"> <div class="circle"></div></div></div><div class="spinner-layer spinner-green"> <div class="circle-clipper left"> <div class="circle"></div></div><div class="gap-patch"> <div class="circle"></div></div><div class="circle-clipper right"> <div class="circle"></div></div></div></div>`;
            }

            this.file.type === '' ? this.fr.readAsText(this.file, 'utf-8') : this.fr.readAsDataURL(this.file);
        },

        onConfirm () {

            this.sendfile(this.file);
            this.opts.innerHTML = "";
            this.inputfile.value = "";

        },

        onCancel () {

            document.body.removeChild(this.previewimg);
            this.opts.innerHTML = "";
            this.inputfile.value = "";
        },

        onProgressXHR (evt) {

            if(evt.lengthComputable){
                var complete = evt.loaded / evt.total;
                document.querySelector(".determinate").style.width = `${complete * 100}%`;
            }
            else
                console.log("not is possible verify the progress");
        },

        getFileExtension () {
            if(this.file.name.indexOf(".") >= 0)
                return this.file.name.substr(this.file.name.indexOf(".") + 1);
        }

     }
});

var appcontrol = new Vue({

    el:"#appcontrol",

    created() {
        this.socket = io.connect();
    },
    data () {
        return {

            socket:null,

            userinfo:{
                nickname:''
            },

            viewpage:'login',

            opt:false
        }
    },

    components:{
      login:login,
      chat:chat
    }

});

control_head = new Vue({

    el:"#control-head",
    data () {
        return {
            notifications:0,
            secondarynotify:0,
        }
    },

    computed:{
        title () {

            return `webchat.io ${this.notifications + this.secondarynotify > 0 ? this.notifications + this.secondarynotify : ''}`
        }
    }

});
