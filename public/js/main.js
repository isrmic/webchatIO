var userinfo = {
    nickname:''
}
var chat = {
    props:["userinfo", "socket"],
    template:`<div> <div id="chat" class="row"> <div> <ul id="slide-out" data-activates="slide-out" class="side-nav"> <li> <div class="userView"> </div></li><li class=""><a href="#!"><i class="material-icons white-text circle teal lighten-3 col s3 center">perm_identity</i>{{userinfo.nickname}}</a></li><li> <form onsubmit="return false;"> <div class="input-field"> <input id="session" type="search" @keydown.enter="newsession" v-model="sessioninsearch" required> <label class="label-icon" for="session"><i class="material-icons">search</i></label> <i @click="newsession" class="material-icons">done</i> </div></form> </li><li><a class="subheader">Opções de sessão </a></li><li> <a class="waves-effect" @click="createnewsession" href="#"> Criar Nova Sessão </a> </li><li> <a><input v-model = "opensession" type="checkbox" id="opensession"/><label for="opensession">Sessão Aberta</label></a> </li><li><a @click="publicsession" class="waves-effect" href="#!">Iniciar Em Sessão Pública</a></li><li v-if="msgerror.condiction===true"><a class="red-text" href="#">{{msgerror.value}}</a></li></ul> </div><nav> <div class="nav-wrapper teal col s12"> <a href="#" data-activates="slide-out" class="button-collapse nav-s"> <i class="material-icons">menu</i> </a> <ul id="nav-mobile" class="left hide-on-med-and-down"> <li> <a href="#" data-activates="slide-out" class="collapse-navside"><i class="material-icons">menu</i></a></li></ul>  <div class="center" v-if="startSession"> Sua Sessão Atual é : {{sessionName}}</div> <div class="right click"  v-if="startSession" @click = "startSession = false"> <i class = "material-icons black-text">skip_previous</i> </div></div></nav> <div v-if="startSession===false" class="row col s12"> <div class="flow-text center"> Sessões Abertas </div><div class="col s10 offset-s1 collection spc"> <div v-for="sessop in opensessions" class="left"> <a href="#" @click="newsession(sessop)" class="btn transparent teal-text waves-effect waves-teal">{{sessop.name}}</a> </div></div></div> <div v-if="startSession"> <div id="viewmsg"> <div id="showmessages" class="col s12 m12 offset-m1 offset-s1"> <span v-if = "sessionID !== '__public_session__' " class = "">ID : {{sessionID}} </span> <ul class="col s12 m3 "> <div class="col s12"> <span class="flow-text"> Sessões </span> </div><div class="collection"> <li class="" v-for="(sess, index) in sessions"> <div class="collection-item"> <a @click="changesession(sess.id, sess.name)" v-bind:class="[sess.id===sessionID ? 'teal-text': 'purple-text']" class=" click waves-light waves-effect">{{sess.name}}<span v-if="sessionsNews[sess.id].news > 0" class="new badge">{{sessionsNews[sess.id].news}}</span> </a> <a @click="finishsession(sess)" class="right valign click"><i class="material-icons">close</i></a> </div></li></div></ul> <ul id="msgs" class="col s12 m9 right z-depth-1"> <li v-for="(msg, index) in chat" v-bind:class="[msg.user===userinfo.nickname ? 'fadeInLeft' : 'fadeInRight']" class="msgn animated col s12"> <div v-if="msg.type==='message' "> <div v-bind:class="[msg.user===userinfo.nickname ? 'left blue white-text' : 'right black-text']" class="chip expand"> <div class=""> <div v-bind:class="[msg.user===userinfo.nickname ? 'left white-text' : 'right teal-text darken-4']" class="col s12"> <span class="nickuser">{{msg.user}}</span> <div class="right datemsg"><i class="material-icons showdatemessage">query_builder</i>{{msg.date}}</div></div></div></br>{{msg.value}}</div></div><div v-else-if="msg.type==='info' "> <div class="col s12 center"> <div class="chip"> <span v-bind:class="msg.class"> {{msg.enphase}} </span> {{msg.value}} <span class="right"> <i class="material-icons configicon">query_builder</i> {{msg.date}} </span></div></div></div></li></ul> </div></div><div class="col s3" v-if="Sevent.iswritten===true && Sevent.session===sessionID"> <span class="teal-text"> Algo está sendo escrito ... </span> </div><div class="page-footer"> <form> <div class="col s12 m9 right"> <div class="input-field col s11 m11"> <i class="material-icons prefix">textsms</i> <textarea id="message" class="materialize-textarea" @keyup="eventkeyupmessage" @keydown="eventkeydownmessage" v-model="message"></textarea> <label for="message">message</label> </div><div id="sendmsg" class="valign-wrapper"> <a @click="sendMessage" class="waves-light waves-effect teal-text"><i class="material-icons">send</i></a> </div></div></form> </div></div></div> </div>`,

    created () {

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

        this.socket.on("receivemessage", data =>{


              messages = document.querySelector("#msgs");

              this.chatStorage[data.session] !== undefined ? this.chatStorage[data.session].push({type:'message', session:data.session, user:data.user, value:data.msg, date:data.date}) : null;
              this.sessionsNews[data.session] !== undefined ? this.sessionID !== data.session ? this.sessionsNews[data.session].news++ : null : null;
              window.setTimeout(() => {
                  messages.scrollTop = messages.scrollHeight;
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

        }
    },

    computed:{

        mechat () {

            return  this.chat[this.sessionID];
        },

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

            if(this.message !== "" || this.message.length > 0){
                this.socket.emit("sendmessage", {session:this.sessionID, user:this.userinfo.nickname, msg:this.message});
            }
            document.getElementById('message').value = ''; // for clear message field on firefox;
            this.message = '';

        },

        eventkeydownmessage (evt) {

            if(evt.keyCode === 13 && (this.message !== '' || this.message.length > 0))
                this.sendMessage();
            else
                this.socket.emit("written");
        },

        eventkeyupmessage () {

            clearTimeout(this.onstoped);
            this.onstoped = window.setTimeout(() => {

                this.socket.emit("stopedwritten");

            }, 700);

        },

        createnewsession () {

            if(this.sessioninsearch !== ''){
                this.socket.emit("createnewsession", this.sessioninsearch, {opsess:this.opensession});
                this.opensession = false;
            }

            else {

                this.msgerror = { condiction:true, value:'Preencha O Campo Session id' };
            }
''
        },

        newsession () {

            if(arguments.length > 0 && arguments[0].id !== undefined){
                this.socket.emit("newsession", arguments[0].id);
                if(this.sessionsRegister.indexOf(arguments[0].id) >= 0)
                    this.startSession === false ? this.startSession = true : null;
            }

            else if(this.sessioninsearch !== ''){
                this.socket.emit("newsession", this.sessioninsearch);
                if(this.sessionsRegister.indexOf(this.sessioninsearch) >= 0)
                    this.startSession === false ? this.startSession = true : null;
            }

        },

        publicsession () {

            if(this.sessionID !== '__public_session__')
                this.socket.emit("publicsession");
        },

        changesession (id, name) {

            messagedom = document.querySelector('#msgs');
            this.sessionID = id;
            this.sessionName = name;
            this.chat = this.chatStorage[this.sessionID];
            this.sessionsNews[this.sessionID].news > 0 ? this.sessionsNews[this.sessionID].news = 0 : null;
            this.socket.emit("changesession", id);
            window.setTimeout(() => {
              messagedom.scrollTop = messagedom.scrollHeight;
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
        }
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
            viewpage:'login'
        }
    },

    components:{
      login:login,
      chat:chat
      //index:
    }

});
