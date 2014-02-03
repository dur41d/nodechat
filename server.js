//	Customization

var appPort = 8888;

// Librairies

var express = require('express'), app = express();
var http = require('http')
  , server = http.createServer(app)
  , io = require('socket.io').listen(server);


//var jade = require('jade');
// var io = require('socket.io').listen(app);
//var pseudoArray = ['admin']; //block the admin username (you can disable it)

// Views Options

app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.set("view options", { layout: false })

app.configure(function() {
	app.use(express.static(__dirname + '/public'));
});

// Render and send the main page

app.get('/local', function(req, res){
  res.render('local.ejs');
});

app.get('/remote', function(req, res){
  res.render('remote.ejs');
});

server.listen(appPort);
// app.listen(appPort);
console.log("Server listening on port " + appPort);

// Handle the socket.io connections

var users = 0; //count the users

io.sockets.on('connection', function (socket) { // First connection
  incrementUsers(socket)
	reloadUsers(); // Send the count to all the users
	socket.on('message', function (data) { // Broadcast the message to all
			var transmit = {date : new Date().toISOString(), pseudo : socket.handshake.address.address, message : data};
			socket.broadcast.emit('message', transmit);
			console.log("user "+ transmit['pseudo'] +" said \""+data+"\"");

	});
	/*
	socket.on('setPseudo', function (data) { // Assign a name to the user
		if (pseudoArray.indexOf(data) == -1) // Test if the name is already taken
		{
			socket.set('pseudo', data, function(){
				pseudoArray.push(data);
				socket.emit('pseudoStatus', 'ok');
				console.log("user " + data + " connected");
			});
		}
		else
		{
			socket.emit('pseudoStatus', 'error') // Send the error
		}
	});
	*/
	socket.on('disconnect', function () { // Disconnection of the client
		decrementUsers(socket);
    reloadUsers();
		/*
		if (pseudoSet(socket))
		{
			var pseudo;
			socket.get('pseudo', function(err, name) {
				pseudo = name;
			});
			var index = pseudoArray.indexOf(pseudo);
			pseudo.slice(index - 1, 1);
		}*/
	});
});

function reloadUsers() { // Send the count of the users to all
	io.sockets.emit('nbUsers', {"nb": users});
}

function incrementUsers(socket) {
  if (isRemote(socket)) { // don't count the local
    users += 1;
  }
}

function decrementUsers(socket) {
  if (isRemote(socket)) {
    users -= 1;
  }
}

function isRemote(socket) {
  return socket.handshake.headers.referer.indexOf('remote') > 0;
}


/*
function pseudoSet(socket) { // Test if the user has a name
	var test;
	socket.get('pseudo', function(err, name) {
		if (name == null ) test = false;
		else test = true;
	});
	return test;
}
function returnPseudo(socket) { // Return the name of the user
	var pseudo;
	socket.get('pseudo', function(err, name) {
		if (name == null ) pseudo = false;
		else pseudo = name;
	});
	return pseudo;
}
*/
