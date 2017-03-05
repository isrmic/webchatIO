#Introdução
Este é um simples web chat iniciado para fins de estudo .
Neste web chat foi usado as seguintes tecnologias : socket.io + nodeJS + expressJS + VueJS + Multer + Materialize-css .

Foi criado baseado inicialmente em sessões , com o fim de poder criar livremente sessões e passa-las para outro amigo conectado ao chat
e assim poder se conectar com todos que entraram nesta sessão ou podendo também entrar em uma sessão pública (Universal) aonde todos que estiverem no chat podem entrar .

Um protótipo encontra-se online no seguinte link : [webchat IO](https://webchatio.herokuapp.com) .

#Como Iniciar
Para iniciar é bem simples , primeiramente tenha em sua máquina instalado Nodejs versão acima ou equivalente a 4.4.7 , faça o download ou clone do repositório , acesse a pasta via prompt de comando , e instale as dependências com o seguinte comando : ```npm install```, após instalar as dependências rode o comando : ```"node index"``` , pronto agora é só acessar pelo navegador o seguinte url : "http://localhost:3000".

#Dicas
Para usar o sistema de bot basta criar um arquivo json chamado "bot.json" e configura-lo como deve responder e ao que deve responder,
um exemplo bot.json -> ```{"oi":"olá"}```, isso fará com que assim que alguém disser "oi" automaticamente será enviado uma resposta sua("olá"), assim que feito toda configuração do arquivo da sua vontade basta carrega-lo no webchat , da mesma forma que se carrega a imagem,
lembrando que o nome do arquivo tem de se chamar "bot.json" para funcionar.
Outra forma de se registrar uma resposta é digitando o comando : ```@onSays:"oi"olá``` o resultado seria o mesmo , e caso queira mais de um por vez basta separar por virgula , sem espaço ex : ```@onSays:oi:olá,@onSays:eae:eae, tudo bem ?```, lembrando que é um simples sistema e que foi criado para estudo do mesmo , porem há pretensões de aprimoramento.
